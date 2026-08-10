import React, { useState, useEffect, useCallback, useRef } from 'react';
import toast from '../../utils/toast';
import { Link, useNavigate } from 'react-router-dom';
import { Share2, Globe, Book as BookIcon, FileText, Loader2, ChevronRight, Search, ChevronLeft, Heart, X, ShoppingCart } from 'lucide-react';
import Swal from 'sweetalert2';
import url, { BACKEND_UPLOAD_URL, getImageUrl } from '../../url';
import { fetchWishlist, addToWishlist, removeFromWishlist } from '../../utils/wishlistApi';
import { getUserRole, getCartKey } from '../../utils/global_auth';
import './BooksArea.css';
import '../courses/CoursesArea.css';
import '../common/SkeletonLoader.css';

import StylishEmptyState from '../common/StylishEmptyState';
import ImgWithFallback from '../common/ImgWithFallback';


interface Category { _id: string; name: string; }
interface Book {
  _id: string; id: string; title: string; author: string;
  category: Category | null; coverImage: string; language: string;
  isPopular: boolean; isFeatured: boolean;
  physicalPrice?: number; physicalDiscountPercentage?: number;
  digitalPrice?: number; digitalDiscountPercentage?: number;
  finalPrice?: number;
}



const getFinalPrice = (price: number, discount?: number) =>
  !discount || discount <= 0 ? price : Math.round(price - (price * discount) / 100);

const hasPrice = (price?: number) => typeof price === 'number' && price > 0;

/* ================= AUTH CHECK ================= */
// getAuthStatus moved to global_auth.ts helper


/* ================= CART LOGIC ================= */

const addBookToCart = (book: Book, format: "digital" | "physical") => {
  const role = getUserRole();
  if (role === "TEACHER" || role === "ADMIN") {
    return Swal.fire({
      title: "Action Restricted",
      text: `As a ${role.toLowerCase()}, you are not permitted to add items to the cart. This feature is reserved for students.`,
      icon: "warning",
    });
  }
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
      addedAt: new Date().toISOString(),
    });
  }

  localStorage.setItem(cartKey, JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-updated'));
  toast.success('Added to cart');
};

/* ================= MAIN COMPONENT ================= */

export default function BooksArea() {
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Exams');
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [wishlistLoading, setWishlistLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  //  Category Slider 
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

  //  Data Fetching 

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, bookRes] = await Promise.all([
        fetch(`${url}/books/categories/all`),
        fetch(`${url}/books/approved?page=1&limit=1000`),
      ]);
      const catData = await catRes.json();
      const bookData = await bookRes.json();
      setCategories(catData.categories || catData.data?.categories || []);
      setAllBooks(bookData.books || []);
      setBooks(bookData.books || []);
    } catch (err) {
      console.error('Error fetching marketplace data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const loadWishlist = async () => {
      if (getUserRole() !== 'STUDENT') return;
      try {
        const items = await fetchWishlist();
        const ids = new Set<string>(
          items.filter((i: any) => i.item_type === 'book').map((i: any) => String(i.item_id))
        );
        setWishlistIds(ids);
      } catch { /* silent */ }
    };
    loadWishlist();
  }, []);

  useEffect(() => {
    let filtered = [...allBooks];
    if (selectedCategory !== 'All Exams')
      filtered = filtered.filter(b => b.category?.name === selectedCategory);
    if (searchQuery.trim())
      filtered = filtered.filter(b =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    setBooks(filtered);
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, allBooks]);

  //  Handlers 

  const handleShare = async (e: React.MouseEvent, book: Book) => {
    e.preventDefault(); e.stopPropagation();
    const shareData = {
      title: book.title,
      text: `Check out"${book.title}" by ${book.author} on My Edudocs!`,
      url: `${window.location.origin}/book-details/${book._id}`,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(shareData.url); toast.success('Link copied to clipboard!'); }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') toast.error('Sharing failed. Please try again.');
    }
  };

  const toggleWishlist = async (book: Book, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (wishlistLoading) return;
    const role = getUserRole();

    if (role === 'GUEST') {
      Swal.fire({ title: 'Login Required', text: 'Please login as a student to use wishlist', icon: 'info', showCancelButton: true, confirmButtonText: 'Login Now' })
        .then(res => { if (res.isConfirmed) navigate('/student-login'); });
      return;
    }
    if (role !== 'STUDENT') {
      toast.error(`Access Denied: As a ${role.toLowerCase()}, you are not permitted to use the wishlist. This feature is reserved for students.`);
      return;
    }

    const wishlisted = wishlistIds.has(book._id);
    try {
      setWishlistLoading(book._id);
      if (wishlisted) {
        const res = await removeFromWishlist({ item_type: 'book', item_id: book._id });
        if (res?.success) {
          setWishlistIds(prev => { const s = new Set(prev); s.delete(book._id); return s; });
          toast.success('Removed from wishlist');
        }
      } else {
        const res = await addToWishlist({
          item_type: 'book', item_id: book._id,
          snapshot: { title: book.title, author: book.author, coverImage: book.coverImage, price: book.digitalPrice || book.physicalPrice || 0 },
        });
        if (res?.success || res?.message === 'Already in wishlist') {
          setWishlistIds(prev => new Set(prev).add(book._id));
          toast.success('Added to wishlist');
        }
      }
    } catch (err) { console.error(err); toast.error('Wishlist action failed'); }
    finally { setWishlistLoading(null); }
  };

  const paginate = (page: number) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  //  Pagination 

  //  Pagination removed - show all books
  const currentBooks = books;

  //  Render 

  return (
    <main className="explore-courses-page-new">
      <div className="container">

        {/* BREADCRUMB */}
        <nav className="breadcrumb-nav-new">
          <Link to="/">Home</Link> <ChevronRight size={14} /> <span className="active">Books</span>
        </nav>

        {/* HEADER */}
        <div className="courses-header-wrapper">
          <div className="courses-header-new">
            <div className="title-area-new">
              {/* <h1 className="section-main-title-new">Explore Books</h1> */}
              {/* <p className="section-sub-text-new">Grab our highly insightful latest edition books.</p> */}
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
                  className={`cat-chip${selectedCategory === 'All Exams' ? ' active' : ''}`}
                  onClick={() => setSelectedCategory('All Exams')}
                >
                  All Exams
                </button>
                {categories.map((c: any, i: number) => (
                  <button
                    key={c._id}
                    className={`cat-chip${selectedCategory === c.name ? ' active' : ''}`}
                    onClick={() => setSelectedCategory(c.name)}
                  >
                    {c.name}
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
              <Search className="search-icon-new" size={18} />
              <input
                type="text"
                className="course-search-input-new"
                placeholder="Search books..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-search-btn-new" onClick={() => setSearchQuery('')}>
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* GRID / EMPTY / LOADING */}
        {loading ? (
          <div className="sk-books-grid">
            {[...Array(12)].map((_, i) => (
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
        ) : currentBooks.length > 0 ? (
          <div className="books-grid-marketplace">
            {currentBooks.map(book => (
              <BookCard
                key={book._id}
                book={book}
                wishlistIds={wishlistIds}
                wishlistLoading={wishlistLoading}
                onShare={handleShare}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        ) : (
          <StylishEmptyState
            title="No Books Found"
            description="We couldn't find any books matching your search or category filter. Try clearing the filters or searching for something else."
            actionText={searchQuery ? "Clear Search" : "Show All Books"}
            onAction={() => {
              if (searchQuery) setSearchQuery('');
              else setSelectedCategory('All Exams');
            }}
            showBack={false}
          />
        )}

      </div>
    </main>
  );
}

/* ================= BookCard Sub-component ================= */

interface BookCardProps {
  book: Book;
  wishlistIds: Set<string>;
  wishlistLoading: string | null;
  onShare: (e: React.MouseEvent, book: Book) => void;
  onToggleWishlist: (book: Book, e: React.MouseEvent) => void;
}

function BookCard({ book, wishlistIds, wishlistLoading, onShare, onToggleWishlist }: BookCardProps) {
  const hasDigital = hasPrice(book.digitalPrice);
  const hasPhysical = hasPrice(book.physicalPrice);
  const wishlisted = wishlistIds.has(book._id);

  const [selectedFormat, setSelectedFormat] = useState<'physical' | 'digital'>(() => {
    if (hasPhysical) return 'physical';
    if (hasDigital) return 'digital';
    return 'digital';
  });

  return (
    <div className="book-card-premium">
      <div className="card-hero" style={{ backgroundColor: '#f1f5f9' }}>
        {book.isPopular && <span className="badge best-seller">BEST SELLER</span>}
        {!book.isPopular && book.isFeatured && <span className="badge new-edition">NEW EDITION</span>}

        <div className="card-actions-overlay">
          <button className="share-overlay-btn" onClick={e => onShare(e, book)}><Share2 size={16} /></button>
          <button
            className={`wishlist-overlay-btn ${wishlisted ? 'active' : ''} ${wishlistLoading === book._id ? 'loading' : ''}`}
            onClick={e => onToggleWishlist(book, e)}
            disabled={wishlistLoading === book._id}
          >
            <Heart size={16} stroke="#ef4444" fill={wishlisted ? '#ef4444' : 'none'} />
          </button>
        </div>

        <div className="book-cover-container">
          <ImgWithFallback
            src={getImageUrl(book.coverImage)}
            alt={book.title}
            className="main-cover"
          />
        </div>
      </div>

      <div className="card-body-books">
        <div className="meta-top-row">
          <span className="cat-tag">{book.category?.name || 'General'}</span>
          <span className="lang-tag"><Globe size={12} /> {book.language}</span>
        </div>
        <h3 className="book-name-title">{book.title}</h3>
        <p className="book-author-text">Author: {book.author}</p>

        <div className="card-footer-sticky">
          <div className={`pricing-grid-dual ${hasDigital && hasPhysical ? 'dual' : 'single'}`}>

            {hasDigital && (
              <div onClick={() => setSelectedFormat('digital')}>
                <PriceBox
                  label="Ebook"
                  icon={<FileText size={14} />}
                  price={book.digitalPrice!}
                  discount={book.digitalDiscountPercentage}
                  active={selectedFormat === 'digital'}
                />
              </div>
            )}

            {hasPhysical && (
              <div onClick={() => setSelectedFormat('physical')}>
                <PriceBox
                  label="Paperback"
                  icon={<BookIcon size={14} />}
                  price={book.physicalPrice!}
                  discount={book.physicalDiscountPercentage}
                  active={selectedFormat === 'physical'}
                />
              </div>
            )}

          </div>

          {/* Buy Now + Add to Cart */}
          <div className="card-actions-grid">
            <button
              className="buy-now-marketplace-btn"
              style={{ marginBottom: 0 }}
              disabled={!hasDigital && !hasPhysical}
              onClick={() => window.location.href = `/book-details/${book._id}`}
            >
              Buy Now
            </button>

            <button
              className="buy-now-marketplace-btn"
              style={{
                marginBottom: 0,
                background: 'rgba(226, 231, 255, 1)',
                color: '#374151',
                border: '1.5px solid #e5e7eb',
                padding: '10px 14px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
              disabled={!hasPhysical}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!book.physicalPrice) {
                  toast.warning('Paperback not available for this book');
                  return;
                }
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

          <Link to={`/book-details/${book._id}`} className="details-link-text">View Details</Link>
        </div>
      </div>
    </div>
  );
}

/* ================= PriceBox Sub-component ================= */

function PriceBox({ label, icon, price, discount, active }: { label: string; icon: React.ReactNode; price: number; discount?: number; active?: boolean }) {
  const final = getFinalPrice(price, discount);
  return (
    <div className={`price-box ${active ? 'active' : ''}`} style={{ cursor: 'pointer' }}>
      <div className="box-label">{icon} {label}</div>
      <div className="box-values">
        <span className="final">{final}</span>
        {discount ? <span className="old">{price}</span> : null}
      </div>
      {discount ? <div className="disc-pill">{discount}% OFF</div> : null}
    </div>
  );
}