

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Row, Col, Tag, Button, Space, Typography, Spin,
  Divider, Rate, Progress, Image, message
} from 'antd';
import MyBreadcrumb from "../common/Breadcrumb";
import {
  ShoppingCart,
  ChevronRight,
  BookOpen,
  Globe,
  CheckCircle2,
  FileText,
  Zap,
  Target,
  Map,
  Star,
  Plus,
  Lock,
  Download
} from 'lucide-react';
import uri, { getImageUrl } from "../../url";
import "./BookDetails.css";
import Swal from "sweetalert2";
import { Heart } from "lucide-react";
import {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist
} from "../../utils/wishlistApi";
import { getUserRole, getStoredUser, isAuthenticated, getCartKey } from "../../utils/global_auth";
import BookReviewModal from "./BookReviewModal";
import StylishEmptyState from "../common/StylishEmptyState";
import moment from "moment";
import SEO from "../common/SEO";
const { Title, Text, Paragraph } = Typography;
const COIN_VALUE = 0.10;
const MIN_COINS = 100;
export default function BookDetailsArea() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState<any>(null);

  const [selectedType, setSelectedType] = useState<'ebook' | 'hardcover'>('ebook');
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [comboBooks, setComboBooks] = useState<any[]>([]);
  const [isPurchased, setIsPurchased] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [coinsToUse, setCoinsToUse] = useState(0);
  const [visibleReviews, setVisibleReviews] = useState(3);
  /* ================= AUTH ================= */
  // getAuthStatus moved to global_auth.ts helper

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const user = getStoredUser();
        if (!user || !user.token) return;

        const res = await fetch(`${uri}/student/wallet`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setWalletBalance(data.wallet.balance || 0);
        }

      } catch (err) {
        console.error("Wallet load failed");
      }
    };

    fetchWallet();
  }, []);
  const toggleWishlist = async () => {
    if (wishlistLoading) return;

    const role = getUserRole();

    if (role === "GUEST") {
      Swal.fire({
        title: "Login Required",
        text: "Please login as a student to use wishlist",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Login Now",
      }).then(res => {
        if (res.isConfirmed) navigate("/student-login");
      });
      return;
    }

    if (role !== "STUDENT") {
      message.error(`Access Denied: As a ${role.toLowerCase()}, you are not permitted to use the wishlist. This feature is reserved for students.`);
      return;
    }

    try {
      setWishlistLoading(true);

      if (isWishlisted) {
        const res = await removeFromWishlist({
          item_type: "book",
          item_id: book._id,
        });

        if (res?.success) {
          setIsWishlisted(false);
          message.success("Removed from wishlist");
        }
      } else {
        const res = await addToWishlist({
          item_type: "book",
          item_id: book._id,
          snapshot: {
            title: book.title,
            author: book.author,
            coverImage: book.coverImage,
            price: book.digitalPrice || book.physicalPrice || 0,
          },
        });

        if (res?.success || res?.message === "Already in wishlist") {
          setIsWishlisted(true);
          message.success("Added to wishlist");
        }
      }
    } catch (err) {
      console.error(err);
      message.error("Wishlist action failed");
    } finally {
      setWishlistLoading(false);
    }
  };



  useEffect(() => {
    if (!book?._id) return;

    const fetchComboBooks = async () => {
      try {
        const res = await fetch(`${uri}/books/approved?page=1&limit=1000`);
        const data = await res.json();

        const all = data.books || [];

        // remove current book
        const filtered = all.filter((b: any) => b._id !== book._id);

        // shuffle
        const shuffled = filtered.sort(() => 0.5 - Math.random());

        // pick first 2
        setComboBooks(shuffled.slice(0, 2));

      } catch (err) {
        console.error("Combo fetch failed");
      }
    };

    fetchComboBooks();
  }, [book]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${uri}/books/${id}`);
      const data = await response.json();
      setBook(data.book);

      // Fetch Reviews
      const revRes = await fetch(`${uri}/books/review/book/${id}/reviews`);
      const revData = await revRes.json();
      setReviews(revData.reviews || []);
      setStats(revData.stats || { averageRating: 4, totalReviews: 1240 });
    } catch (error) {
      message.error("Error loading book details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const loadWishlistStatus = async () => {
      if (getUserRole() !== "STUDENT" || !book?._id) return;

      try {
        const items = await fetchWishlist();

        const exists = items.some(
          (i: any) =>
            i.item_type === "book" &&
            String(i.item_id) === String(book._id)
        );

        setIsWishlisted(exists);
      } catch (err) {
        console.error("Wishlist preload failed", err);
      }
    };

    loadWishlistStatus();
  }, [book]);

  useEffect(() => {
    const checkPurchase = async () => {
      const user = getStoredUser();
      if (!user || !user.token || !book?._id) return;

      const res = await fetch(
        `${uri}/students/books/payment/check-purchase/${book._id}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success && data.purchased) {
        setIsPurchased(true);
      }
    };

    checkPurchase();
  }, [book]);

  const hasDigital =
    typeof book?.digitalPrice === "number" && book.digitalPrice > 0;

  const hasPhysical =
    typeof book?.physicalPrice === "number" && book.physicalPrice > 0;


  const resolvedPurchaseType =
    selectedType === "ebook" ? "pdftype" : "paperback";
  useEffect(() => {
    if (hasPhysical) {
      setSelectedType("hardcover");   //  DEFAULT
    } else if (hasDigital) {
      setSelectedType("ebook");
    }
  }, [hasPhysical, hasDigital]);

  if (loading) return <div className="loader-box"><Spin size="large" /></div>;

  if (!book) {
    return (
      <StylishEmptyState
        title="Book Not Found"
        description="The book you are looking for might have been removed or the link is incorrect."
        actionText="Back to Books"
        actionPath="/all-books"
        icon={BookOpen}
        showBack={true}
      />
    );
  }



  const getFinalPrice = (price: number, discount?: number) => {
    if (!discount || discount <= 0) return price;
    return Math.round(price - (price * discount) / 100);
  };

  const bundleBasePrice = hasDigital
    ? getFinalPrice(book.digitalPrice, book.digitalDiscountPercentage)
    : hasPhysical
      ? getFinalPrice(book.physicalPrice, book.physicalDiscountPercentage)
      : 0;
  const coinDiscount =
    coinsToUse >= MIN_COINS
      ? Math.floor(coinsToUse * COIN_VALUE)
      : 0;
  const basePrice = getFinalPrice(
    book.digitalPrice,
    book.digitalDiscountPercentage
  );

  const finalPriceAfterCoins =
    coinsToUse >= MIN_COINS
      ? Math.max(basePrice - coinDiscount, 0)
      : basePrice;


  const addBookToCart = (book: any) => {
    const role = getUserRole();
    if (role === "TEACHER" || role === "ADMIN") {
      return Swal.fire({
        title: "Action Restricted",
        text: `As a ${role.toLowerCase()}, you are not permitted to add items to the cart. This feature is reserved for students.`,
        icon: "warning",
      });
    }

    const cartKey = getCartKey();

    const isEbook = selectedType === "ebook";

    //  BACKEND-COMPATIBLE BOOK TYPE
    const bookType = isEbook ? "pdftype" : "paperback";
    //  CORRECT PRICE SOURCE
    const basePrice = isEbook ? book.digitalPrice : book.physicalPrice;
    const discount = isEbook
      ? book.digitalDiscountPercentage
      : book.physicalDiscountPercentage;

    if (!basePrice || basePrice <= 0) {
      message.error("Invalid book price");
      return;
    }

    const finalPrice = getFinalPrice(basePrice, discount);

    let cart: any[] = [];
    try {
      cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    } catch {
      cart = [];
    }

    //  UNIQUE BY book + type
    const existing = cart.find(
      i => i.bookId === book._id && i.bookType === bookType
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        cartItemId: `${book._id}-${bookType}-${Date.now()}`,

        //  REQUIRED FOR BACKEND
        book_id: book._id,
        bookId: book._id, // keep for frontend
        bookType,         //"pdftype" |"physical"

        //  DISPLAY DATA
        title: book.title,
        author: book.author,
        coverImage: book.coverImage,

        //  PRICE DATA (DO NOT CHANGE NAMES)
        basePrice,
        discountPercentage: discount || 0,
        finalPrice,

        quantity: 1,
        addedAt: new Date().toISOString()
      });
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-updated"));
    message.success("Added to cart");
  };



  const openRazorpayForEbook = async () => {
    try {
      const role = getUserRole();
      if (role === "TEACHER" || role === "ADMIN") {
        return Swal.fire({
          title: "Action Restricted",
          text: `As a ${role.toLowerCase()}, you are not permitted to purchase books. This feature is reserved for students.`,
          icon: "warning",
        });
      }

      setPurchaseLoading(true);

      const user = getStoredUser();
      if (!isAuthenticated()) {
        message.warning("Please login to continue");
        navigate("/student-login");
        return;
      }

      // STEP 1: Create order (ebook)
      const orderRes = await fetch(`${uri}/students/books/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          book_id: book._id,
          purchase_type: "pdftype",
          coins_used: coinsToUse
        }),
      });


      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error(orderData.message || "Order creation failed");
      }

      // STEP 2: Open Razorpay
      const rzp = new (window as any).Razorpay({
        key: import.meta.env.VITE_RAZORPAY_LIVE_KEY,
        order_id: orderData.orderId,
        amount: orderData.amount,
        currency: "INR",
        name: "Draa",
        description: book.title,

        handler: async (response: any) => {
          // STEP 3: Verify payment
          const verifyRes = await fetch(
            `${uri}/students/books/payment/verify-payment`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
              },
              body: JSON.stringify({
                book_id: book._id,
                purchase_type: "pdftype",
                coins_used: coinsToUse,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),

            }
          );

          const verifyData = await verifyRes.json();
          if (!verifyData.success) {
            message.error("Payment verification failed");
            return;
          }

          setIsPurchased(true);
          message.success(
            "Purchase successful! Access from Student Portal  My Books"
          );
        },

        theme: { color: "#1677ff" },
      });

      rzp.open();

    } catch (err: any) {
      message.error(err.message || "Payment failed");
    } finally {
      setPurchaseLoading(false);
    }
  };





  const handleBuyNow = () => {
    if (resolvedPurchaseType === "pdftype") {
      if (isPurchased) {
        message.info("You already own this ebook.");
        return;
      }
      openRazorpayForEbook();
    } else {
      addBookToCart(book);
      navigate("/cart");
    }
  };


  const handleWriteReviewClick = () => {
    if (!isAuthenticated()) {
      message.warning("Please login to write a review");
      navigate("/student-login");
      return;
    }

    if (!isPurchased) {
      const role = getUserRole();
      if (role !== "STUDENT") {
        return message.error("Only students can write reviews.");
      }
      message.info("Purchase this book to write a review");
      return;
    }

    //  Purchased  open review modal
    setReviewModalVisible(true);
  };



  return (
    <div className="book-details-page">
      <SEO
        title={book.title}
        description={book.description?.slice(0, 155)}
        ogImage={book.coverImage ? getImageUrl(book.coverImage) : undefined}
      />
      <div className="custom-container">

        {/* <MyBreadcrumb 
          title={book.title} 
          subtitle={book.description?.slice(0, 150) +"..."} 
          category="Books"
          paths={[
            { pathName:"Books", url:"/books" },
            { pathName: book.title }
          ]}
        /> */}

        <Row gutter={[40, 40]}>
          {/* LEFT COLUMN: Gallery & Sidebar */}
          <Col xs={24} lg={8}>
            <div className="sticky-sidebar">
              <div className="main-image-card">
                {book.isPopular && <span className="best-seller-badge">BEST SELLER</span>}
                <Image
                  src={getImageUrl(book.coverImage)}
                  className="book-main-img"
                  preview={false}
                />
              </div>

              <div className="thumbnail-row">
                <Image.PreviewGroup>
                  <Image src={getImageUrl(book.coverImage)} className="thumb" />
                  {book.addOnImages?.map((img: string, i: number) => (
                    <Image key={i} src={getImageUrl(img)} className="thumb" />
                  ))}
                </Image.PreviewGroup>
              </div>

              {/*"What's Inside" Section */}
              <div className="specs-card">
                <div className="specs-header">
                  <Space><BookOpen size={18} /> <Text strong>What's Inside</Text></Space>
                  <Tag className="specs-tag">SPECS</Tag>
                </div>
                <div className="spec-item">
                  <Text type="secondary">PAGE COUNT</Text>
                  <Text strong>{book.pages} Pages</Text>
                </div>
                <div className="spec-item">
                  <Text type="secondary">SUBJECT</Text>
                  <Text strong>{book.category?.name || "General"}</Text>
                </div>
                <div className="spec-item">
                  <Text type="secondary">LANGUAGE</Text>
                  <Text strong>{book.language}</Text>
                </div>
                <div className="spec-item">
                  <Text type="secondary">PUBLISHER</Text>
                  <Text strong>{book.publicationName || "Draa"}</Text>
                </div>
              </div>
            </div>
          </Col>

          {/* RIGHT COLUMN: Details & Purchases */}
          <Col xs={24} lg={16}>
            <header className="book-info-header">
              <Title level={1}>{book.title}</Title>
              <div className="author-row">
                <Text type="secondary">By <span className="author-name">{book.author}</span></Text>
                <Divider type="vertical" />
                <Space className="lang-indicator"><Globe size={14} /> {book.language}</Space>
              </div>

              <div className="rating-row">
                <Tag color="#2ecc71" className="rating-tag">
                  {reviews.length
                    ? (
                      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                    ).toFixed(1)
                    : "0"}
                </Tag>

                <Text type="secondary">
                  {reviews.length} Ratings & Reviews
                </Text>
              </div>
            </header>

            {/* Price Selection Area */}
            <div className="price-selection-container">

              {/* Price Boxes */}
              {hasDigital && (
                <div
                  className={`price-type-box ${selectedType === 'ebook' ? 'active' : ''}`}
                  onClick={() => setSelectedType('ebook')}
                >
                  <div className="type-label">EBOOK</div>
                  <div className="type-price">
                    {finalPriceAfterCoins.toFixed(2)}
                  </div>
                  {book.digitalDiscountPercentage ? (
                    <div className="type-old-price">
                      {book.digitalPrice.toFixed(2)} ({book.digitalDiscountPercentage}% OFF)
                    </div>
                  ) : null}
                  <Text type="success" className="type-meta">
                    Get Instant Access
                  </Text>
                </div>
              )}

              {hasPhysical && (
                <div
                  className={`price-type-box ${selectedType === 'hardcover' ? 'active' : ''}`}
                  onClick={() => setSelectedType('hardcover')}
                >
                  <div className="type-label">HARDCOVER</div>
                  <div className="type-price">
                    {getFinalPrice(book.physicalPrice, book.physicalDiscountPercentage).toFixed(2)}
                  </div>
                  {book.physicalDiscountPercentage ? (
                    <div className="type-old-price">
                      {book.physicalPrice.toFixed(2)} ({book.physicalDiscountPercentage}% OFF)
                    </div>
                  ) : null}
                  <Text type="secondary" className="type-meta">
                    Order now and get delivery by<br />Wed, Oct 24
                  </Text>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="cta-buttons">
                {!(isPurchased && selectedType === "ebook") && (
                  <Button
                    type="primary"
                    size="large"
                    className="buy-now-btn"
                    block
                    loading={purchaseLoading}
                    onClick={handleBuyNow}
                  >
                    {selectedType === "ebook" ? "Buy Book Now" : "Buy Book Now"}
                  </Button>
                )}

                {selectedType === "hardcover" && (
                  <Button
                    size="large"
                    icon={<ShoppingCart size={18} />}
                    className="add-cart-btn"
                    block
                    onClick={() => addBookToCart(book)}
                  >
                    Add to Cart
                  </Button>
                )}
              </div>

              {/* Wishlist Button */}
              <Button
                size="large"
                block
                className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
                loading={wishlistLoading}
                onClick={toggleWishlist}
                style={{ gridColumn: '1 / -1' }}
              >
                <Heart
                  size={18}
                  style={{ marginRight: 8 }}
                  fill={isWishlisted ? "#ef4444" : "none"}
                  stroke="#ef4444"
                />
                {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
              </Button>

              {/* Coins Section */}
              <div className="coins-section">
                <Text strong>Use Coins</Text>
                <div style={{ display: "flex", gap: 10, marginTop: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    type="number"
                    min={0}
                    max={walletBalance}
                    value={coinsToUse}
                    onChange={(e) => {
                      let val = Number(e.target.value);
                      if (val > walletBalance) {
                        message.warning("Not enough coins");
                        val = walletBalance;
                      }
                      if (val < 0) val = 0;
                      if (val > 0 && val < MIN_COINS) {
                        message.info("Minimum 100 coins required to apply discount");
                      }
                      setCoinsToUse(val);
                    }}
                  />
                  <Button size="small" onClick={() => setCoinsToUse(walletBalance)}>
                    Use Max
                  </Button>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Balance: {walletBalance} coins
                  </Text>
                </div>

                {coinsToUse >= MIN_COINS && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="success">Coin Discount: {coinDiscount}</Text>
                    <div style={{ marginTop: 4 }}>
                      <Text strong>Final Price: {finalPriceAfterCoins}</Text>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Purchased Info  Digital Book Only */}
            {isPurchased && selectedType === "ebook" && (
              <div className="purchased-banner" style={{ marginTop: 16 }}>
                <Tag color="green" style={{ fontSize: 14, padding: "6px 14px" }}>
                  Purchased
                </Tag>
                <Paragraph style={{ marginTop: 8 }}>
                  You can access this book from <b>Student Portal  My Books</b>
                </Paragraph>
              </div>
            )}


            {/* Detailed Overview */}
            <section className="detail-section">
              <Title level={4}>Detailed Overview</Title>
              <Paragraph className="overview-p">{book.description}</Paragraph>
            </section>

            {/* Feature Boxes */}
            <div className="feature-grid">
              <div className="feature-box">
                <div className="f-icon-box"><Zap size={20} /></div>
                <div>
                  <Text strong>Latest Content</Text>
                  <p>Updated 2024 content with latest amendments.</p>
                </div>
              </div>
              <div className="feature-box">
                <div className="f-icon-box blue"><FileText size={20} /></div>
                <div>
                  <Text strong>Previous Year Qs</Text>
                  <p>Includes 10 Years PYQs with detailed solutions.</p>
                </div>
              </div>
              <div className="feature-box">
                <div className="f-icon-box purple"><Target size={20} /></div>
                <div>
                  <Text strong>Practice MCQs</Text>
                  <p>Chapter-wise MCQ for thorough practice.</p>
                </div>
              </div>
              <div className="feature-box">
                <div className="f-icon-box orange"><Map size={20} /></div>
                <div>
                  <Text strong>Mind Maps</Text>
                  <p>Quick revision mind maps included at the end.</p>
                </div>
              </div>
            </div>

            {/* Frequently Bought Together */}
            <div className="bundle-section">
              <Title level={4}><Space><ShoppingCart size={20} /> Frequently Bought Together</Space></Title>
              <div className="bundle-card">
                <div className="bundle-imgs">

                  <img src={getImageUrl(book.coverImage)}  alt={book.title || "Book Cover"} />

                  {comboBooks.map((cb: any) => (
                    <img
                      key={cb._id}
                      src={getImageUrl(cb.coverImage)}
                      alt={cb.title || "Combo Book Cover"} />
                  ))}

                </div>

                <div className="bundle-info">
                  <Text strong className="bundle-title">Polity + History Combo</Text>
                  <Paragraph type="secondary">Complete your GS preparation with this curated bundle.</Paragraph>
                  <div className="bundle-pricing">
                    <Text className="b-final">{bundleBasePrice + 160}</Text>
                    <Text delete className="b-old">{bundleBasePrice + 200}</Text>

                    <Tag color="green">SAVE 40%</Tag>
                  </div>
                  <Button
                    className="bundle-btn"
                    onClick={() => {
                      addBookToCart(book);          // main book
                      comboBooks.forEach(cb => addBookToCart(cb)); // combo
                    }}
                  >
                    Add Bundle to Cart
                  </Button>

                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <section className="reviews-section">
              <div className="reviews-header">
                <Title level={3} className="rev-section-title">
                  Customer Reviews <span className="rev-count-pill">{reviews.length}</span>
                </Title>
                <Button
                  type="primary"
                  className="write-review-btn-new"
                  onClick={handleWriteReviewClick}
                  icon={<Plus size={16} />}
                >
                  Write a review
                </Button>
              </div>

              <div className="feedback-summary-box">
                <div className="feedback-avg-col">
                  <div className="avg-num">{Number(stats?.averageRating || 0).toFixed(1)}</div>
                  <Rate disabled allowHalf value={Number(stats?.averageRating || 0)} />
                  <div className="avg-total-text">Based on {reviews.length} reviews</div>
                </div>

                <div className="feedback-bars-col">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = stats?.distribution?.[star] || 0;
                    const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                    return (
                      <div className="feedback-bar-row" key={star}>
                        <div className="bar-label">{star} </div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${pct}%` }}></div>
                        </div>
                        <div className="bar-pct">{pct}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="reviews-list-premium">
                {reviews.length > 0 ? (
                  reviews.slice(0, visibleReviews).map((rev: any, i: number) => (
                    <div className="review-card-premium" key={i}>
                      <div className="rev-header">
                        <div className="rev-user-meta">
                          <div className="rev-avatar-circle">
                            {rev.studentName?.substring(0, 2).toUpperCase() || "ST"}
                          </div>
                          <div className="rev-user-details">
                            <Text strong className="rev-name">{rev.studentName}</Text>
                            <div className="rev-stars-row">
                              <Rate disabled value={rev.rating} style={{ fontSize: 12 }} />
                              {rev.verified && (
                                <Tag color="gold" className="verified-badge-mini">
                                  <CheckCircle2 size={10} style={{ marginRight: 4 }} /> Verified Purchase
                                </Tag>
                              )}
                            </div>
                          </div>
                        </div>
                        <Text className="rev-date">
                          {rev.createdAt ? moment(rev.createdAt).fromNow() : "Just now"}
                        </Text>
                      </div>
                      <Title level={5} className="rev-title-text">{rev.title}</Title>
                      <Paragraph className="rev-comment-text">"{rev.review}"</Paragraph>
                    </div>
                  ))
                ) : (
                  <div className="empty-reviews-state">
                    <Text type="secondary">No reviews yet. Be the first to share your thoughts!</Text>
                  </div>
                )}
              </div>

              {reviews.length > visibleReviews && (
                <div className="text-center mt-4">
                  <Button
                    className="view-all-rev-btn-premium"
                    onClick={() => setVisibleReviews(prev => prev + 5)}
                  >
                    View More Reviews
                  </Button>
                </div>
              )}
            </section>
          </Col>
        </Row>
      </div>
      {reviewModalVisible && book?._id && (
        <BookReviewModal
          bookId={book._id}
          onClose={() => setReviewModalVisible(false)}
        />
      )}
    </div>
  );
}