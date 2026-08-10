import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Share2,
  Globe,
  Book as BookIcon,
  FileText,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Search,
  X,
  Check,
  Heart,
  ShoppingCart,
  BookOpen
} from 'lucide-react';
import Swal from 'sweetalert2';
import url, { BACKEND_UPLOAD_URL, getImageUrl } from '../../url';
import '../homes/home/PopularBooks.css';
import '../courses/CoursesArea.css';
import StylishEmptyState from '../common/StylishEmptyState';
import ImgWithFallback from '../common/ImgWithFallback';
import '../common/SkeletonLoader.css';

import {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist } from '../../utils/wishlistApi';
import { getUserRole, getCartKey } from '../../utils/global_auth';
import toast from '../../utils/toast';

/* ================= TYPES ================= */

interface Category {
  _id: string;
  name: string;
  description?: string;
  slug: string;
}

interface Book {
  _id: string;
  title: string;
  author: string;
  coverImage: string;
  category?: Category | null;

  digitalPrice?: number;
  digitalDiscountPercentage?: number;

  physicalPrice?: number;
  physicalDiscountPercentage?: number;

  language: string;
  isPopular: boolean;
  isFeatured: boolean;
}

/* ================= COMPONENT ================= */

export default function BooksCategoryPage() {
  const { name } = useParams();
  const navigate = useNavigate();

  const [books, setBooks] = useState<Book[]>([]);
  const [allBooksInCategory, setAllBooksInCategory] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Wishlist
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [wishlistLoading, setWishlistLoading] = useState<string | null>(null);

  // Category Slider
  const catSliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateCatScroll = () => {
    if (!catSliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = catSliderRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  const scrollCatSlider = (dir: 'left' | 'right') => {
    if (!catSliderRef.current) return;
    catSliderRef.current.scrollBy({ left: dir === 'right' ? 240 : -240, behavior: 'smooth' });
  };

  // Share
  const [shareStates, setShareStates] = useState<Record<string, boolean>>({});

  // Format selection per book (digital or physical)
  const [selectedFormats, setSelectedFormats] = useState<
    Record<string, "digital" | "physical">
  >({});

  /* ================= AUTH ================= */

  /* ================= AUTH ================= */
  // getAuthStatus moved to global_auth.ts helper


  /* ================= FETCH DATA ================= */

  useEffect(() => {
    if (!name) return;

    const load = async () => {
      setLoading(true);
      try {
        const [catListRes, booksRes] = await Promise.all([
          fetch(`${url}/books/categories/all`),
          fetch(`${url}/books/category/${name}?page=1&limit=100`)
        ]);

        const catListData = await catListRes.json();
        const booksData = await booksRes.json();

        if (booksData.success) {
          const bookList = booksData.books || [];
          setAllBooksInCategory(bookList);
          setBooks(bookList);
          setCategoryInfo(booksData.category);
          setCategories(catListData.categories || catListData.data?.categories || []);

          // Set default format for each book
          const map: Record<string, "digital" | "physical"> = {};
          bookList.forEach((b: Book) => {
            if (typeof b.physicalPrice === 'number' && b.physicalPrice > 0) {
              map[b._id] = 'physical';
            } else if (typeof b.digitalPrice === 'number' && b.digitalPrice > 0) {
              map[b._id] = 'digital';
            } else {
              map[b._id] = 'digital';
            }
          });
          setSelectedFormats(map);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [name]);

  // Reset search on category change
  useEffect(() => {
    setSearchQuery('');
  }, [name]);

  // Search filter
  useEffect(() => {
    let filtered = [...allBooksInCategory];
    if (searchQuery.trim()) {
      filtered = filtered.filter(b =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setBooks(filtered);
  }, [searchQuery, allBooksInCategory]);

  /* ================= PRICE HELPERS ================= */

  const getFinalPrice = (price?: number, discount?: number) => {
    if (!price || price <= 0) return 0;
    if (!discount || discount <= 0) return price;
    return Math.round(price - (price * discount) / 100);
  };

  /* ================= CART LOGIC ================= */

  const addBookToCart = (book: Book, format: "digital" | "physical") => {
    const cartKey = getCartKey();
    const isEbook = format === 'digital';
    const bookType = isEbook ? 'pdftype' : 'paperback';
    const basePrice = isEbook ? book.digitalPrice : book.physicalPrice;
    const discount = isEbook ? book.digitalDiscountPercentage : book.physicalDiscountPercentage;

    if (!basePrice || basePrice <= 0) {
      toast.error('Invalid book price');
      return;
    }

    const finalPrice = getFinalPrice(basePrice, discount);

    let cart: any[] = [];
    try {
      cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    } catch {
      cart = [];
    }

    const existing = cart.find(
      (i: any) => i.bookId === book._id && i.bookType === bookType
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        cartItemId: `${book._id}-${bookType}-${Date.now()}`,
        book_id: book._id,
        bookId: book._id,
        bookType,
        title: book.title,
        author: book.author,
        coverImage: book.coverImage,
        basePrice,
        discountPercentage: discount || 0,
        finalPrice,
        quantity: 1,
        addedAt: new Date().toISOString() });
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    toast.success('Added to cart');
  };

  /* ================= WISHLIST ================= */

  useEffect(() => {
    if (getUserRole() === "GUEST") return;
    const loadWishlist = async () => {
      try {
        const items = await fetchWishlist();
        const ids = new Set<string>();
        items.forEach((i: any) => {
          if (i.item_type === 'book') ids.add(String(i.item_id));
        });
        setWishlistIds(ids);
      } catch {
        // silent
      }
    };
    loadWishlist();
  }, []);


  const toggleWishlist = async (book: Book, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlistLoading) return;
    const role = getUserRole();
    if (role === "GUEST") {
      toast.error("Please login to use wishlist");
      return;
    }

    if (role !== "STUDENT") {
      toast.error("Only students can use wishlist");
      return;
    }
    const alreadyWishlisted = wishlistIds.has(book._id);
    try {
      setWishlistLoading(book._id);
      if (alreadyWishlisted) {
        const res = await removeFromWishlist({ item_type: 'book', item_id: book._id });
        if (res?.success) {
          setWishlistIds((prev) => {
            const s = new Set(prev);
            s.delete(book._id);
            return s;
          });
          toast.success('Removed from wishlist');
        }
      } else {
        const res = await addToWishlist({
          item_type: 'book',
          item_id: book._id,
          snapshot: {
            title: book.title,
            author: book.author,
            coverImage: book.coverImage,
            price: book.digitalPrice || book.physicalPrice || 0 } });
        if (res?.success || res?.message === 'Already in wishlist') {
          setWishlistIds((prev) => new Set(prev).add(book._id));
          toast.success('Added to wishlist');
        }
      }
    } catch (err) {
      console.error('Wishlist error:', err);
      toast.error('Wishlist action failed');
    } finally {
      setWishlistLoading(null);
    }
  };

  /* ================= SHARE ================= */

  const handleShare = async (book: Book) => {
    const shareUrl = `${window.location.origin}/book-details/${book._id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${book.title} by ${book.author}`,
          text: `Check out"${book.title}" on Draa`,
          url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareStates((prev) => ({ ...prev, [book._id]: true }));
        setTimeout(() => setShareStates((prev) => ({ ...prev, [book._id]: false })), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(shareUrl);
      setShareStates((prev) => ({ ...prev, [book._id]: true }));
      setTimeout(() => setShareStates((prev) => ({ ...prev, [book._id]: false })), 2000);
    }
  };

  /* ================= RENDER ================= */

  return (
    <main className="explore-courses-page-new">
      <div className="container">

        {/* BREADCRUMB */}
        <nav className="breadcrumb-nav-new">
          <Link to="/">Home</Link> <ChevronRight size={14} />
          <Link to="/all-books">Books</Link> <ChevronRight size={14} />
          <span className="active">{categoryInfo?.name || 'Category'}</span>
        </nav>

        {/* HEADER */}
        <div className="courses-header-wrapper">
          <div className="courses-header-new">
            <div className="title-area-new">
              <h1 className="section-main-title-new">
                <span className="gradient-text">{categoryInfo?.name}</span> Books
              </h1>
              <p className="section-sub-text-new">
                {categoryInfo?.description || 'Comprehensive study guides curated by experts for your success.'}
              </p>
            </div>
            <div className="showing-courses-text">Showing <strong>{books.length}</strong> books</div>
          </div>

          {/* FILTER BAR */}
          <div className="filters-row-new">
            {/* CATEGORY SLIDER */}
            <div className="cat-chip-slider-wrapper">
              <button
                className={`cat-chip-arrow cat-chip-left${canScrollLeft ? ' visible' : ''}`}
                onClick={() => scrollCatSlider('left')}
              >
                <ChevronLeft size={18} />
              </button>

              <div className="cat-chip-slider" ref={catSliderRef} onScroll={updateCatScroll}>
                <button
                  key="all"
                  className={`cat-chip${name === 'all' || !name ? ' active' : ''}`}
                  onClick={() => navigate('/all-books')}
                >
                  <span className="cat-chip-icon"><BookOpen size={14} /></span>
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat._id}
                    className={`cat-chip${cat.slug === name ? ' active' : ''}`}
                    onClick={() => navigate(`/books/category/${cat.slug}`)}
                  >
                    <span className="cat-chip-icon"><BookOpen size={14} /></span>
                    {cat.name}
                  </button>
                ))}
              </div>

              <button
                className={`cat-chip-arrow cat-chip-right${canScrollRight ? ' visible' : ''}`}
                onClick={() => scrollCatSlider('right')}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* SEARCH */}
            <div className="search-input-wrapper-new">
              <Search className="search-icon-new" size={16} />
              <input
                type="text"
                className="course-search-input-new"
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-search-btn-new" onClick={() => setSearchQuery('')}>
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* GRID */}
        {loading ? (
          <div className="sk-books-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="sk-book-card">
                <div className="sk-book-cover sk-shimmer" />
                <div className="sk-book-body">
                  <div className="sk-book-tag sk-shimmer" />
                  <div className="sk-book-title sk-shimmer" />
                  <div className="sk-book-author sk-shimmer" />
                  <div className="sk-book-price sk-shimmer" />
                  <div className="sk-book-btn sk-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : books.length > 0 ? (
          <div className="pb-grid">
            {books.map((book) => {
              const isCopied = shareStates[book._id];
              const isWishlisted = wishlistIds.has(book._id);
              const isProcessing = wishlistLoading === book._id;

              return (
                <div key={book._id} className="pb-card">

                  {/* Hero: book cover + badge + actions */}
                  <div className="pb-card-hero">
                    {book.isPopular && (
                      <span className="pb-badge best-seller">BEST SELLER</span>
                    )}
                    {book.isFeatured && !book.isPopular && (
                      <span className="pb-badge new-edition">NEW EDITION</span>
                    )}

                    {/* Actions top-right */}
                    <div className="pb-card-actions">
                      <button
                        className="pb-share-btn"
                        onClick={() => handleShare(book)}
                        disabled={isCopied}
                        title="Share"
                      >
                        {isCopied ? <Check size={14} /> : <Share2 size={14} />}
                      </button>
                      <button
                        className={`pb-wishlist-btn${isWishlisted ? ' active' : ''}`}
                        onClick={(e) => toggleWishlist(book, e)}
                        disabled={isProcessing}
                        title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <Heart
                          size={14}
                          stroke={isWishlisted ? '#ef4444' : '#9ca3af'}
                          fill={isWishlisted ? '#ef4444' : 'none'}
                        />
                      </button>
                    </div>

                    {/* Book cover */}
                    <div className="pb-book-image-container">
                      <ImgWithFallback
                        src={getImageUrl(book.coverImage)}
                        alt={book.title}
                        className="pb-cover-img"
                        size="md"
                      />
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="pb-card-body">

                    {/* Category + Language */}
                    <div className="pb-meta-top">
                      <span className="pb-cat-tag">
                        {(book.category as any)?.name || categoryInfo?.name || 'General'}
                      </span>
                      <div className="pb-lang-wrapper">
                        <Globe size={12} />
                        <span>{book.language}</span>
                      </div>
                    </div>

                    {/* Title + Author */}
                    <h3 className="pb-book-title">{book.title}</h3>
                    <p className="pb-author">Author: {book.author}</p>

                    {/* Sticky footer */}
                    <div className="pb-sticky-footer">

                      {/* Price boxes */}
                      <div className="pb-pricing-row">
                        {/* Ebook */}
                        <div
                          className={`pb-price-box ${selectedFormats[book._id] === 'digital' ? 'active' : ''} ${!book.digitalPrice ? 'disabled' : ''}`}
                          onClick={() => {
                            if (!book.digitalPrice) return;
                            setSelectedFormats((prev) => ({ ...prev, [book._id]: 'digital' }));
                          }}
                        >
                          <div className="pb-box-label"><FileText size={12} /> Ebook</div>
                          {book.digitalPrice ? (
                            <>
                              <div className="pb-box-pricing">
                                <span className="pb-final">{getFinalPrice(book.digitalPrice, book.digitalDiscountPercentage)}</span>
                                {book.digitalDiscountPercentage ? (
                                  <span className="pb-old">{book.digitalPrice}</span>
                                ) : null}
                              </div>
                              {book.digitalDiscountPercentage ? (
                                <span className="pb-discount-badge">{book.digitalDiscountPercentage}% OFF</span>
                              ) : null}
                            </>
                          ) : (
                            <div className="pb-box-pricing"><span className="pb-final">N/A</span></div>
                          )}
                        </div>

                        {/* Hardcover */}
                        <div
                          className={`pb-price-box ${selectedFormats[book._id] === 'physical' ? 'active' : ''} ${!book.physicalPrice ? 'disabled' : ''}`}
                          onClick={() => {
                            if (!book.physicalPrice) return;
                            setSelectedFormats((prev) => ({ ...prev, [book._id]: 'physical' }));
                          }}
                        >
                          <div className="pb-box-label"><BookIcon size={12} /> Paperback</div>
                          {book.physicalPrice ? (
                            <>
                              <div className="pb-box-pricing">
                                <span className="pb-final">{getFinalPrice(book.physicalPrice, book.physicalDiscountPercentage)}</span>
                                {book.physicalDiscountPercentage ? (
                                  <span className="pb-old">{book.physicalPrice}</span>
                                ) : null}
                              </div>
                              {book.physicalDiscountPercentage ? (
                                <span className="pb-discount-badge">{book.physicalDiscountPercentage}% OFF</span>
                              ) : null}
                            </>
                          ) : (
                            <div className="pb-box-pricing"><span className="pb-final">N/A</span></div>
                          )}
                        </div>
                      </div>

                      {/* Buy Now + Add to Cart */}
                      <div className="pb-buy-row">
                        <button
                          className="pb-buy-now-btn"
                          onClick={() => navigate(`/book-details/${book._id}`)}
                        >
                          Buy Now
                        </button>

                        <button
                          className="pb-add-btn"
                          disabled={!book.physicalPrice}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!book.physicalPrice) {
                              toast.warning('Paperback not available for this book');
                              return;
                            }
                            const selectedFormat = selectedFormats[book._id];
                            if (selectedFormat !== 'physical') {
                              toast.warning('Please select Paperback to add to cart');
                              return;
                            }
                            addBookToCart(book, 'physical');
                          }}
                        >
                          Add <ShoppingCart size={14} />
                        </button>
                      </div>

                      {/* View Details */}
                      <Link to={`/book-details/${book._id}`} className="pb-details-link">
                        View Details
                      </Link>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '60px 0' }}>
            <StylishEmptyState
              title={searchQuery ? `No matches for"${searchQuery}"` : `No Books in ${categoryInfo?.name || 'this category'}`}
              description={searchQuery ? "We couldn't find any books matching your search. Try different keywords or browse our top categories." : "We are currently curating the best books for this category. Stay tuned or explore other available subjects!"}
              actionText={searchQuery ? "Clear Search" : "Explore All Books"}
              onAction={searchQuery ? () => setSearchQuery('') : undefined}
              actionPath={searchQuery ? undefined : "/all-books"}
              showBack={false}
            />
          </div>
        )}
      </div>
    </main>
  );
}
