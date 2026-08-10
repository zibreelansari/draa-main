import React, { useState, useEffect, useRef, useMemo } from"react";
import toast from '../../../utils/toast';
import { Link, useNavigate } from"react-router-dom";
import {
  Share2,
  Globe,
  Book,
  FileText,
  Check,
  Heart,
  ShoppingCart,
  ChevronRight,
  ChevronLeft,
} from"lucide-react";
import Swal from"sweetalert2";
import url, { getImageUrl } from"../../../url";
import"./PopularBooks.css";
import StylishEmptyState from"../../common/StylishEmptyState";
import ImgWithFallback from"../../common/ImgWithFallback";


import {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
} from"../../../utils/wishlistApi";
import { getUserRole, getCartKey } from"../../../utils/global_auth";

/* ================= UTILS ================= */

const getFinalPrice = (price?: number, discount?: number) => {
  if (!price || price <= 0) return 0;
  if (!discount || discount <= 0) return price;
  return Math.round(price - (price * discount) / 100);
};

/* ================= TYPES ================= */

interface Category {
  _id: string;
  name: string;
}

interface BookItem {
  _id: string;
  title: string;
  author: string;
  category: Category | null;
  coverImage: string;
  digitalPrice?: number;
  digitalDiscountPercentage?: number;
  physicalPrice?: number;
  physicalDiscountPercentage?: number;
  language: string;
  isFeatured: boolean;
  isPopular: boolean;
}

export default function PopularBooks() {
  const navigate = useNavigate();

  const [books, setBooks] = useState<BookItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [loading, setLoading] = useState(true);
  const [shareStates, setShareStates] = useState<Record<string, boolean>>({});
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [wishlistLoading, setWishlistLoading] = useState<string | null>(null);
  const [selectedFormats, setSelectedFormats] = useState<
    Record<string,"digital" |"physical">
  >({});
  const catSliderRef = useRef<HTMLDivElement>(null);
  const bookSliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [bookScrollLeft, setBookScrollLeft] = useState(false);
  const [bookScrollRight, setBookScrollRight] = useState(true);

  const updateCatScrollBtns = () => {
    if (!catSliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = catSliderRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  const updateBookScrollBtns = () => {
    if (!bookSliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = bookSliderRef.current;
    setBookScrollLeft(scrollLeft > 5);
    setBookScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  const scrollSlider = (dir:"left" |"right") => {
    if (!catSliderRef.current) return;
    const amount = 240;
    catSliderRef.current.scrollBy({
      left: dir ==="right" ? amount : -amount,
      behavior:"smooth",
    });
  };

  const scrollBooks = (dir:"left" |"right") => {
    if (!bookSliderRef.current) return;
    const cardWidth = bookSliderRef.current.querySelector(".pb-card")?.clientWidth || 320;
    const amount = cardWidth + 20;
    bookSliderRef.current.scrollBy({
      left: dir ==="right" ? amount : -amount,
      behavior:"smooth",
    });
  };

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    const fetchMarketplaceData = async () => {
      try {
        setLoading(true);
        const [catRes, bookRes] = await Promise.all([
          fetch(`${url}/books/categories/all`),
          fetch(`${url}/books/approved?page=1&limit=100`),
        ]);
        const catData = await catRes.json();
        const bookData = await bookRes.json();
        setCategories(catData.categories || []);
        const allBooks: BookItem[] = bookData.books || [];
        const popularBooks = allBooks.filter((b) => b.isPopular);
        const finalList = (popularBooks.length ? popularBooks : allBooks)
          .slice(0, 20);
        setBooks(finalList);
        setSelectedFormats(() => {
          const map: Record<string,"digital" |"physical"> = {};
          finalList.forEach((b) => {
            if (typeof b.physicalPrice ==="number" && b.physicalPrice > 0) {
              map[b._id] ="physical";
            } else {
              map[b._id] ="digital";
            }
          });
          return map;
        });
      } catch (err) {
        console.error("Marketplace fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketplaceData();
  }, []);

  const filteredBooks = useMemo(() => {
    return books.filter(
      (b) =>
        selectedCategory ==="All Categories" ||
        b.category?.name === selectedCategory
    );
  }, [books, selectedCategory]);

  /* ================= CART ACTIONS ================= */

  const addBookToCart = (book: BookItem, format:"digital" |"physical") => {
    const role = getUserRole();
    if (role ==="TEACHER" || role ==="ADMIN") {
      return Swal.fire({
        title:"Action Restricted",
        text: `As a ${role.toLowerCase()}, you are not permitted to add items to the cart. This feature is reserved for students.`,
        icon:"warning",
      });
    }
    const cartKey = getCartKey();
    const isEbook = format ==="digital";
    const bookType = isEbook ?"pdftype" :"paperback";
    const basePrice = isEbook ? book.digitalPrice : book.physicalPrice;
    const discount = isEbook
      ? book.digitalDiscountPercentage
      : book.physicalDiscountPercentage;

    if (!basePrice || basePrice <= 0) {
      toast.error("Invalid book price");
      return;
    }

    const finalPrice = getFinalPrice(basePrice, discount);

    let cart: any[] = [];
    try {
      cart = JSON.parse(localStorage.getItem(cartKey) ||"[]");
    } catch {
      cart = [];
    }

    const existing = cart.find(
      (i) => i.bookId === book._id && i.bookType === bookType
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
    window.dispatchEvent(new Event("cart-updated"));
    toast.success("Added to cart");
  };

  /* ================= WISHLIST ACTIONS ================= */

  useEffect(() => {
    if (getUserRole() ==="GUEST") return;
    const loadWishlist = async () => {
      try {
        const items = await fetchWishlist();
        const ids = new Set<string>();
        items.forEach((i: any) => {
          if (i.item_type ==="book") ids.add(String(i.item_id));
        });
        setWishlistIds(ids);
      } catch {
        // silent
      }
    };
    loadWishlist();
  }, []);

  const toggleWishlist = async (book: BookItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlistLoading) return;
    const role = getUserRole();
    if (role ==="GUEST") {
      Swal.fire({
        title:"Login Required",
        text:"Please login as a student to use wishlist",
        icon:"info",
        showCancelButton: true,
        confirmButtonText:"Login Now",
      }).then((res) => {
        if (res.isConfirmed) navigate("/login");
      });
      return;
    }
    if (role !=="STUDENT") {
      toast.error(`Access Denied: As a ${role.toLowerCase()}, you are not permitted to use the wishlist. This feature is reserved for students.`);
      return;
    }

    const alreadyWishlisted = wishlistIds.has(book._id);
    try {
      setWishlistLoading(book._id);
      if (alreadyWishlisted) {
        const res = await removeFromWishlist({
          item_type:"book",
          item_id: book._id,
        });
        if (res?.success) {
          setWishlistIds((prev) => {
            const s = new Set(prev);
            s.delete(book._id);
            return s;
          });
          toast.success("Removed from wishlist");
        }
      } else {
        const res = await addToWishlist({
          item_type:"book",
          item_id: book._id,
          snapshot: {
            title: book.title,
            author: book.author,
            coverImage: book.coverImage,
            price: book.digitalPrice || book.physicalPrice || 0,
          },
        });
        if (res?.success || res?.message ==="Already in wishlist") {
          setWishlistIds((prev) => new Set(prev).add(book._id));
          toast.success("Added to wishlist");
        }
      }
    } catch (err) {
      console.error("Wishlist error:", err);
      toast.error("Wishlist action failed");
    } finally {
      setWishlistLoading(null);
    }
  };

  /* ================= HELPERS ================= */

  const handleShare = async (book: BookItem) => {
    const shareUrl = `${window.location.origin}/book-details/${book._id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${book.title} by ${book.author}`,
          text: `Check out "${book.title}" on Draa`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareStates((prev) => ({ ...prev, [book._id]: true }));
        setTimeout(
          () => setShareStates((prev) => ({ ...prev, [book._id]: false })),
          2000
        );
      }
    } catch {
      await navigator.clipboard.writeText(shareUrl);
      setShareStates((prev) => ({ ...prev, [book._id]: true }));
      setTimeout(
        () => setShareStates((prev) => ({ ...prev, [book._id]: false })),
        2000
      );
    }
  };


  /* ================= RENDER ================= */

  if (loading) {
    return (
      <section className="popular-books-section">
        <div className="container">
          <div className="pb-header">
            <div className="pb-title-group">
              <h2 className="pb-main-title">Popular Exam Preparation Books</h2>
              <p className="pb-sub-text">Comprehensive study guides curated by experts for your success.</p>
            </div>
          </div>
          <div className="pb-books-slider-wrapper">
            <div className="pb-books-track">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="pb-card pb-skeleton-card">
                  <div className="pb-card-hero">
                    <div className="skeleton pb-img-skel" />
                    <div className="pb-card-actions-skel">
                      <div className="skeleton skel-icon" />
                      <div className="skeleton skel-icon" />
                    </div>
                  </div>
                  <div className="pb-card-body">
                    <div className="skeleton skel-line short" />
                    <div className="skeleton skel-line" />
                    <div className="skeleton skel-line medium" />
                    <div className="skeleton skel-btn" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="popular-books-section">
      <div className="container">
        {/*  HEADER  */}
        <div className="pb-header">
          <div className="pb-title-group">
            <h2 className="pb-main-title">Popular Books</h2>
            <p className="pb-sub-text">Top-rated study materials for your preparation.</p>
          </div>
          <Link to="/all-books" className="pb-browse-btn">
            Browse Books
          </Link>
        </div>

        {/*  CATEGORY SLIDER  */}
        <div className="pb-slider-wrapper">
          <button
            className={`pb-slider-btn pb-slider-left${canScrollLeft ?" visible" :""}`}
            onClick={() => scrollSlider("left")}
          >
            <ChevronLeft size={18} />
          </button>

          <div className="pb-cat-slider" ref={catSliderRef} onScroll={updateCatScrollBtns}>
            <button
              className={`pb-cat-chip${selectedCategory ==="All Categories" ?" active" :""}`}
              onClick={() => setSelectedCategory("All Categories")}
            >
              <span className="pb-chip-icon"><Book size={14} /></span>
              All Categories
            </button>
            {categories.slice(0, 12).map((cat) => (
              <button
                key={cat._id}
                className={`pb-cat-chip${selectedCategory === cat.name ?" active" :""}`}
                onClick={() => setSelectedCategory(cat.name)}
              >
                <span className="pb-chip-icon"><Book size={14} /></span>
                {cat.name}
              </button>
            ))}
          </div>

          <button
            className={`pb-slider-btn pb-slider-right${canScrollRight ?" visible" :""}`}
            onClick={() => scrollSlider("right")}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/*  BOOKS SLIDER  */}
        <div className="pb-books-slider-wrapper">
          <button
            className={`pb-books-slider-btn pb-books-left${bookScrollLeft ?" visible" :""}`}
            onClick={() => scrollBooks("left")}
          >
            <ChevronLeft size={22} />
          </button>

          <div
            className="pb-books-track"
            ref={bookSliderRef}
            onScroll={updateBookScrollBtns}
          >
            {filteredBooks.length === 0 ? (
              <div style={{ width:"100%", maxWidth:"1000px", margin:"40px auto" }}>
                <StylishEmptyState
                  title={`No Books in ${selectedCategory}`}
                  description="We are currently updating our collection for this category. Please check back soon or explore other categories!"
                  actionText="Browse All Books"
                  actionPath="/all-books"
                  showBack={false}
                />
              </div>
            ) : (
              filteredBooks.map((book) => {
                const isCopied = shareStates[book._id];
                const isWishlisted = wishlistIds.has(book._id);
                const isProcessing = wishlistLoading === book._id;
                return (
                  <div key={book._id} className="pb-card">
                    <div className="pb-card-hero">
                      {book.isPopular && <span className="pb-badge best-seller">BEST SELLER</span>}
                      {book.isFeatured && !book.isPopular && <span className="pb-badge new-edition">NEW EDITION</span>}

                      <div className="pb-card-actions">
                        <button className="pb-share-btn" onClick={() => handleShare(book)} disabled={isCopied}>
                          {isCopied ? <Check size={14} /> : <Share2 size={14} />}
                        </button>
                        <button
                          className={`pb-wishlist-btn${isWishlisted ?" active" :""}`}
                          onClick={(e) => toggleWishlist(book, e)}
                          disabled={isProcessing}
                        >
                          <Heart size={14} stroke={isWishlisted ?"#ef4444" :"#9ca3af"} fill={isWishlisted ?"#ef4444" :"none"} />
                        </button>
                      </div>

                      <div className="pb-book-image-container">
                        <ImgWithFallback
                          src={getImageUrl(book.coverImage)}
                          alt={book.title}
                          className="pb-cover-img"
                          showShareBtn={true}
                          onShare={() => handleShare(book)}
                        />
                      </div>
                    </div>

                    <div className="pb-card-body">
                      <div className="pb-meta-top">
                        <span className="pb-cat-tag">{book.category?.name ||"General"}</span>
                        <div className="pb-lang-wrapper"><Globe size={12} /><span>{book.language}</span></div>
                      </div>
                      <h3 className="pb-book-title">{book.title}</h3>
                      <p className="pb-author">Author: {book.author}</p>

                      <div className="pb-sticky-footer">
                        <div className="pb-pricing-row">
                          <div
                            className={`pb-price-box ${selectedFormats[book._id] ==="digital" ?"active" :""} ${!book.digitalPrice ?"disabled" :""}`}
                            onClick={() => book.digitalPrice && setSelectedFormats(p => ({ ...p, [book._id]:"digital" }))}
                          >
                            <div className="pb-box-label"><FileText size={12} /> Ebook</div>
                            <div className="pb-box-pricing">
                              <span className="pb-final">{getFinalPrice(book.digitalPrice, book.digitalDiscountPercentage)}</span>
                              {book.digitalDiscountPercentage && <span className="pb-old">{book.digitalPrice}</span>}
                            </div>
                          </div>

                          <div
                            className={`pb-price-box ${selectedFormats[book._id] ==="physical" ?"active" :""} ${!book.physicalPrice ?"disabled" :""}`}
                            onClick={() => book.physicalPrice && setSelectedFormats(p => ({ ...p, [book._id]:"physical" }))}
                          >
                            <div className="pb-box-label"><Book size={12} /> Paperback</div>
                            <div className="pb-box-pricing">
                              <span className="pb-final">{getFinalPrice(book.physicalPrice, book.physicalDiscountPercentage)}</span>
                              {book.physicalDiscountPercentage && <span className="pb-old">{book.physicalPrice}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="pb-buy-row">
                          <button className="pb-buy-now-btn" onClick={() => navigate(`/book-details/${book._id}`)}>Buy Now</button>
                          <button
                            className="pb-add-btn"
                            disabled={!book.physicalPrice || selectedFormats[book._id] !=="physical"}
                            onClick={() => addBookToCart(book,"physical")}
                          >
                            Add <ShoppingCart size={14} />
                          </button>
                        </div>
                        <Link to={`/book-details/${book._id}`} className="pb-details-link">View Details</Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <button
            className={`pb-books-slider-btn pb-books-right${bookScrollRight ?" visible" :""}`}
            onClick={() => scrollBooks("right")}
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
    </section>
  );
}
