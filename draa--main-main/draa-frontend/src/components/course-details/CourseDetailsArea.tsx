import { useEffect, useState } from"react";
import toast from '../../utils/toast';
import { useParams, useNavigate } from"react-router-dom";
import {
  Card, Row, Col, Tabs, Typography, Avatar, Tag, Rate, Button, Space,
  Divider, Spin, Alert, Collapse, Modal, Empty} from'antd';
import MyBreadcrumb from"../common/Breadcrumb";
import {
  UserOutlined, ClockCircleOutlined, BookOutlined, GlobalOutlined,
  DownloadOutlined, PlayCircleOutlined, LockOutlined, HeartOutlined,
  CheckCircleOutlined, VideoCameraOutlined, FilePdfOutlined, TeamOutlined, CalendarOutlined,
  ShareAltOutlined, VerifiedOutlined, StarFilled, FacebookFilled,
  TwitterOutlined, LinkedinFilled, PhoneOutlined, FileTextOutlined,
  PlusOutlined
} from'@ant-design/icons';
import ReactPlayer from'react-player';
import url, { getImageUrl } from"../../url";
import'./courseDetailsarea.css';
import DownloadPopupModal from"../jobs/DownloadPopupModal";
import { fetchWishlist, addToWishlist, removeFromWishlist } from"../../utils/wishlistApi";
import SEO from "../common/SEO";
import { getStoredUser, getUserRole, isAuthenticated } from"../../utils/global_auth";
import moment from"moment";
import StylishEmptyState from"../common/StylishEmptyState";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const GST_RATE = 0.18;

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Teacher {
  _id: string;
  tname: string;
  temail: string;
  tspecialization: string;
  tprofile: string;
}

interface Chapter {
  _id: string;
  chapter_name: string;
  youtube_video?: string;
  study_material?: string;
  practice_set?: string;
  other_materials?: string[];
}

interface CourseDetails {
  _id: string;
  title: string;
  short_desc: string;
  long_desc: string;
  price: number;
  actual_price?: number;
  discounted_price?: number;
  discount_percentage?: number;
  duration: number;
  teacher_id: Teacher;
  coverphoto: string;
  syllabus?: string;
  language: string;
  skill_level: string;
  chapters: Chapter[];
  updatedAt: string;
  who_this_course_is_for?: { text: string }[];
  what_you_will_learn?: { text: string }[];
  course_features?: { text: string }[];
  course_faqs?: {
    question: string;
    answer: string;
  }[];
}

const DashboardAccessMessage = () => (
  <Alert
    type="info"
    showIcon
    message="Course access is available in your dashboard"
    description={
      <>
        You have successfully purchased this course.
        <br />
        Please go to{""}
        <Text strong>Student Dashboard  My Courses</Text>{""}
        to watch videos, download notes, and access practice sets.
      </>
    }
    style={{
      marginTop: 16,
      borderRadius: 8,
    }}
  />
);

export default function CourseDetailsPage() {
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [canReview, setCanReview] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState("0");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [coinsToUse, setCoinsToUse] = useState(0);
  const [visibleReviews, setVisibleReviews] = useState(3);

  // Download Modal State
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [downloadTarget, setDownloadTarget] = useState('');
  const [downloadTitle, setDownloadTitle] = useState('');

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const calculatePricing = (basePrice: number) => {
    const gstAmount = basePrice * GST_RATE;
    const totalAmount = basePrice + gstAmount;
    return { basePrice, gstAmount, totalAmount };
  };

  const handleDownloadTrigger = (fileUrl: string, fileName: string) => {
    setDownloadTarget(fileUrl);
    setDownloadTitle(fileName);
    setDownloadModalOpen(true);
  };

  const COIN_VALUE = 0.10; // 1 coin = 0.10
  const MIN_COINS = 100;

  const calculateCoinDiscount = () => coinsToUse * COIN_VALUE;

  const getAuthHeaders = (): Record<string, string> => {
    const user = getStoredUser();
    if (!user || !user.token) return {'Content-Type':'application/json' };
    return {
'Content-Type':'application/json',
'Authorization': `Bearer ${user.token}`
    };
  };

  const fetchWallet = async () => {
    try {
      const res = await fetch(`${url}/student/wallet`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setWalletBalance(data.wallet.balance || 0);
      }
    } catch {
      console.log("Wallet fetch failed");
    }
  };

  useEffect(() => {
    const loadRazorpayScript = () => {
      if (window.Razorpay) {
        setRazorpayLoaded(true);
        return;
      }
      const script = document.createElement('script');
      script.src ='https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => setRazorpayLoaded(true);
      document.body.appendChild(script);
    };
    loadRazorpayScript();
  }, []);

  useEffect(() => {
    const parsedData = getStoredUser();
    if (parsedData && parsedData.token && parsedData.id && id) {
      setIsLoggedIn(true);
      setStudentData(parsedData);
      checkPurchaseStatus(parsedData.id, id);
      fetchWallet();
    } else {
      setIsLoggedIn(false);
    }
  }, [id]);

  const checkPurchaseStatus = async (studentId: string, courseId: string) => {
    try {
      const response = await fetch(`${url}/students/course/payment/check-purchase/${courseId}?student_id=${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setIsPurchased(data.purchased || false);
        setCanReview(data.purchased || false);
      }
    } catch (error) {
      console.error('Error checking purchase status:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${url}/course/review/${id}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
        setAvgRating(data.averageRating);
      }
    } catch {
      toast.error("Failed to load reviews");
    }
  };

  const submitReview = async () => {
    const role = getUserRole();
    if (role !=="STUDENT") {
      return toast.error("Only students can submit reviews");
    }
    if (!reviewRating || !reviewText.trim()) {
      return toast.warning("Please add rating and review");
    }
    setReviewLoading(true);
    try {
      const res = await fetch(`${url}/course/review/submit`, {
        method:"POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          course_id: id,
          rating: reviewRating,
          comment: reviewText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Review submitted");
        setReviewText("");
        setReviewRating(0);
        fetchReviews();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Submission failed");
    } finally {
      setReviewLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${url}/course/courseDetails/${id}`);
        if (!response.ok) throw new Error('Failed to fetch course details');
        const data = await response.json();
        setCourseDetails(data.course);
        fetchReviews();
      } catch (error) {
        setError('Error fetching course details');
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetails();
  }, [id]);

  useEffect(() => {
    if (!courseDetails?._id) return;
    const loadWishlistStatus = async () => {
      try {
        const raw = localStorage.getItem("edudocs");
        if (!raw) return;
        const user = JSON.parse(raw);
        if (!user?.token) return;
        const items = await fetchWishlist();
        const exists = items.some(
          (i: any) => i.item_type ==="course" && i.item_id === courseDetails._id
        );
        setIsWishlisted(exists);
      } catch (err) {
        console.error("Wishlist check failed", err);
      }
    };
    loadWishlistStatus();
  }, [courseDetails]);

  const handleWishlistToggle = async () => {
    if (wishlistLoading) return;

    const role = getUserRole();

    if (role ==="GUEST") {
      Modal.confirm({
        title:"Login Required",
        content:"Please login as a student to use wishlist",
        okText:"Login",
        onOk: () => navigate("/student-login"),
      });
      return;
    }

    if (role !=="STUDENT") {
      toast.error("Only students can use wishlist");
      return;
    }

    try {
      setWishlistLoading(true);
      if (isWishlisted) {
        const res = await removeFromWishlist({
          item_type:"course",
          item_id: courseDetails!._id,
        });
        if (res?.success) {
          setIsWishlisted(false);
          toast.success("Removed from wishlist");
        }
      } else {
        const res = await addToWishlist({
          item_type:"course",
          item_id: courseDetails!._id,
          snapshot: {
            title: courseDetails!.title,
            price: courseDetails!.price,
            coverphoto: courseDetails!.coverphoto,
            teacher: courseDetails!.teacher_id?.tname,
          },
        });
        if (res?.success || res?.message ==="Already in wishlist") {
          setIsWishlisted(true);
          toast.success("Added to wishlist");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Wishlist action failed");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handlePurchaseCourse = async () => {
    const role = getUserRole();
    if (role ==="TEACHER" || role ==="ADMIN") {
      return Modal.warning({
        title:"Action Restricted",
        content: `As a ${role.toLowerCase()}, you are not permitted to purchase courses. This feature is reserved for students.`,
      });
    }

    if (!razorpayLoaded || !window.Razorpay) {
      toast.error("Payment system is still loading. Please try again.");
      return;
    }
    // Real-time auth check to prevent stale state issues
    if (!isAuthenticated()) {
      Modal.confirm({
        title:"Login Required",
        content:"Please login to purchase this course.",
        okText:"Go to Login",
        onOk: () => navigate("/student-login")
      });
      return;
    }
    if (!courseDetails) return;

    const coinDiscount = coinsToUse * COIN_VALUE;
    if (coinsToUse > 0 && coinsToUse < MIN_COINS) {
      return toast.warning("Minimum 100 coins required");
    }
    if (coinsToUse > walletBalance) {
      return toast.error("You don't have enough coins");
    }

    const finalAmount = pricing.totalAmount - coinDiscount;

    try {
      if (finalAmount <= 0) {
        const res = await fetch(`${url}/student/wallet/purchase-course`, {
          method:"POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            course_id: courseDetails._id,
            coins_used: coinsToUse,
            amount_paid: 0
          })
        });

        // Handle authentication errors
        if (res.status === 401) {
          toast.error("Your session has expired. Please login again.");
          navigate("/student-login", { replace: true });
          return;
        }

        const data = await res.json();
        if (data.success) {
          toast.success("Course purchased using coins!");
          setIsPurchased(true);
          fetchWallet();
        } else {
          toast.error(data.message ||"Purchase failed");
        }
        return;
      }

      setPaymentLoading(true);
      const orderResponse = await fetch(`${url}/students/course/payment/create-order`, {
        method:"POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          course_id: courseDetails._id,
          coins_used: coinsToUse,
          amount_after_discount: finalAmount,
          student_data: {
            id: studentData.id,
            name: studentData.name,
            email: studentData.email,
            phone: studentData.phone ||''
          }
        })
      });

      // Handle authentication errors
      if (orderResponse.status === 401) {
        toast.error("Your session has expired. Please login again.");
        navigate("/student-login", { replace: true });
        setPaymentLoading(false);
        return;
      }

      if (!orderResponse.ok) {
        toast.error("Failed to create order. Please try again.");
        setPaymentLoading(false);
        return;
      }

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        toast.error(orderData.message ||"Order creation failed");
        setPaymentLoading(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_LIVE_KEY,
        amount: orderData.amount,
        currency:"INR",
        name:"DRAA",
        description: courseDetails.title,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          const verify = await fetch(`${url}/students/course/payment/verify-payment`, {
            method:"POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              course_id: courseDetails._id,
              coins_used: coinsToUse,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              student_data: {
                id: studentData.id,
                name: studentData.name,
                email: studentData.email,
                phone: studentData.phone ||""
              }
            })
          });

          // Handle verification auth errors
          if (verify.status === 401) {
            toast.error("Your session expired during payment. Please login and try again.");
            navigate("/student-login", { replace: true });
            setPaymentLoading(false);
            return;
          }

          const data = await verify.json();
          if (data.success) {
            toast.success("Course purchased successfully!");
            setIsPurchased(true);
            fetchWallet();
          } else {
            toast.error(data.message ||"Payment verification failed");
          }
          setPaymentLoading(false);
        }
      };
      new window.Razorpay(options).open();
    } catch (error) {
      console.error("Purchase error:", error);
      setPaymentLoading(false);
      toast.error("Purchase failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign:'center', padding:'100px 0', background:'#FAFAFA' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !courseDetails) {
    return (
      <StylishEmptyState 
        title="Course Not Found"
        description={error ||"The course you are looking for is no longer available or the link is broken."}
        actionText="Back to Courses"
        actionPath="/courses"
        icon={BookOutlined}
        showBack={true}
      />
    );
  }

  const courseShareUrl = window.location.href;
  const courseShareText = encodeURIComponent(`Check out this amazing course: ${courseDetails?.title}`);
  const handleWhatsAppShare = () => window.open(`https://wa.me/?text=${courseShareText}%20${courseShareUrl}`,"_blank");
  const handleFacebookShare = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${courseShareUrl}`,"_blank");
  const handleTwitterShare = () => window.open(`https://twitter.com/intent/tweet?text=${courseShareText}&url=${courseShareUrl}`,"_blank");
  const handleLinkedInShare = () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${courseShareUrl}`,"_blank");
  const handleCopyLink = () => {
    navigator.clipboard.writeText(courseShareUrl);
    toast.success("Course link copied!");
  };

  const pricing = calculatePricing(courseDetails.price);

  // Support optional actual_price mapping, fallback to courseDetails.price
  const displayActualPrice = courseDetails.actual_price || pricing.basePrice;
  const displayDiscountedPrice = courseDetails.discounted_price || courseDetails.price;
  const calculatedPricing = calculatePricing(displayDiscountedPrice); // This is what user ultimately pays (before coins)
  const actualCalculated = calculatePricing(displayActualPrice);

  const discountPercentageDisplay = courseDetails.discount_percentage ||
    (displayActualPrice > displayDiscountedPrice
      ? Math.round(((displayActualPrice - displayDiscountedPrice) / displayActualPrice) * 100)
      : 0);

  // Review Distribution Logic
  const getRatingDistribution = (reviewsArray: any[]) => {
    const defaultDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (!reviewsArray || reviewsArray.length === 0) return defaultDist;

    const counts: any = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsArray.forEach(rev => {
      const r = Math.round(rev.rating);
      if (counts[r] !== undefined) counts[r]++;
    });

    const total = reviewsArray.length;
    return {
      5: Math.round((counts[5] / total) * 100),
      4: Math.round((counts[4] / total) * 100),
      3: Math.round((counts[3] / total) * 100),
      2: Math.round((counts[2] / total) * 100),
      1: Math.round((counts[1] / total) * 100),
    };
  };
  const ratingDist = getRatingDistribution(reviews);

  return (
    <div className="course-details-page">
      <SEO 
        title={courseDetails.title} 
        description={courseDetails.short_desc}
        ogImage={courseDetails.coverphoto ? getImageUrl(courseDetails.coverphoto) : undefined}
      />
      <div className="course-container">

        {/* <MyBreadcrumb 
          title={courseDetails.title} 
          subtitle={courseDetails.short_desc} 
          category="Courses"
          paths={[
            { pathName:"Courses", url:"/courses" },
            { pathName: courseDetails.title }
          ]}
        /> */}

        <Row gutter={[48, 32]}>
          {/* LEFT COLUMN */}
          <Col xs={24} lg={16}>

            {/* Header Area */}
            <div className="course-header">
              <Title className="course-title">
                {courseDetails.title}
              </Title>
              <Paragraph className="course-description">
                {courseDetails.short_desc}
              </Paragraph>

              <div className="course-meta-wrapper">
                <Space size={20} wrap className="course-meta">
                  <div className="course-badge-green">
                    <StarFilled /> {Number(avgRating || 0).toFixed(1)}
                  </div>
                  <Text className="meta-text">
                    ({reviews.length.toLocaleString()} reviews) | {courseDetails.enrolled_count?.toLocaleString()} students enrolled
                  </Text>
                </Space>

                <Space size={12} wrap className="course-badges">
                  <span className="info-badge">
                    {courseDetails.skill_level ? courseDetails.skill_level.charAt(0).toUpperCase() + courseDetails.skill_level.slice(1) :"Beginner"}
                  </span>
                  <span className="info-badge">
                     {courseDetails.language ||"English"}
                  </span>
                  <span className="info-badge">
                     Updated {new Date(courseDetails.updatedAt).toLocaleDateString('en-US', { month:'short', year:'numeric' })}
                  </span>
                </Space>
              </div>
            </div>

            {/* Video Player */}
            <Card className="video-card">
              <div className="video-wrapper">
                {isPurchased ? (
                  <div className="video-player">
                    {courseDetails.youtube_links?.[0] ? (
                      <ReactPlayer
                        url={courseDetails.youtube_links[0]}
                        width="100%"
                        height="450px"
                        controls={true}
                        light={courseDetails.coverphoto ? getImageUrl(courseDetails.coverphoto) : false}
                      />
                    ) : (
                      <div
                        className="video-thumbnail"
                        style={{
                          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${getImageUrl(courseDetails.coverphoto)})`
                        }}
                      >
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={<span style={{ color:'white' }}>No introduction video available</span>}
                          style={{ color:'white' }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="video-thumbnail"
                    style={{
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${getImageUrl(courseDetails.coverphoto)})`
                    }}
                  >
                    <Button className="play-button" shape="circle" size="large" icon={<PlayCircleOutlined />} />
                    <div className="video-overlay">Preview this course</div>
                  </div>
                )}
              </div>
            </Card>

            {/* Course Highlights */}
            <Card className="highlights-card">
              <Title className="section-title">Course Highlights</Title>
              <Row gutter={[24, 24]}>
                <Col xs={24} sm={8}>
                  <div className="highlight-item">
                    <ClockCircleOutlined className="highlight-icon" />
                    <div className="highlight-content">
                      <Text className="highlight-value">{courseDetails.duration}+</Text>
                      <Text className="highlight-label">Hours of video</Text>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div className="highlight-item">
                    <VideoCameraOutlined className="highlight-icon" />
                    <div className="highlight-content">
                      <Text className="highlight-value">Weekly</Text>
                      <Text className="highlight-label">Live classes</Text>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div className="highlight-item">
                    <StarFilled className="highlight-icon" />
                    <div className="highlight-content">
                      <Text className="highlight-value">Lifetime</Text>
                      <Text className="highlight-label">Course access</Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* TABS */}
            <Card className="tabs-card">
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className="course-tabs"
              >
                {/*  OVERVIEW TAB  */}
                <TabPane tab="Overview" key="overview">
                  <div className="tab-content-overview">

                    {courseDetails.syllabus && (
                      <div
                        className="download-syllabus-banner"
                        onClick={() => handleDownload(courseDetails.syllabus!, `${courseDetails.title.replace(/\s+/g,'_')}_Syllabus.pdf`)}
                      >
                        <div className="banner-left">
                          <Text className="banner-title">Download Syllabus</Text>
                          <Tag className="free-tag-pill">Free</Tag>
                        </div>
                        <DownloadOutlined className="banner-download-icon" />
                      </div>
                    )}

                    {/* What you get */}
                    <div className="overview-section">
                      <Title level={3} className="overview-main-title">What you get</Title>
                      <Row gutter={[20, 20]}>
                        <Col xs={24} md={8}>
                          <div className="get-feature-card">
                            <div className="feature-icon-box blue-soft">
                              <VideoCameraOutlined />
                            </div>
                            <Text className="feature-card-title">Recorded Video Classes</Text>
                            <Text className="feature-card-desc">
                              Access high-quality lectures anytime, anywhere. Perfect for self-paced learning.
                            </Text>
                          </div>
                        </Col>
                        <Col xs={24} md={8}>
                          <div className="get-feature-card">
                            <div className="feature-icon-box purple-soft">
                              <FilePdfOutlined />
                            </div>
                            <Text className="feature-card-title">PDF Notes</Text>
                            <Text className="feature-card-desc">
                              Chapter-wise downloadable revision notes to help you master every concept.
                            </Text>
                          </div>
                        </Col>
                        <Col xs={24} md={8}>
                          <div className="get-feature-card">
                            <div className="feature-icon-box indigo-soft">
                              <TeamOutlined />
                            </div>
                            <Text className="feature-card-title">Live Classes</Text>
                            <Text className="feature-card-desc">
                              Regularly scheduled doubt-solving sessions and direct interaction with experts.
                            </Text>
                          </div>
                        </Col>
                      </Row>
                    </div>

                    <div className="learning-grid-section">
                      <Row gutter={[48, 32]}>
                        <Col xs={24} md={12}>
                          <Title level={3} className="overview-main-title">What you will learn</Title>
                          <div className="learning-list-dynamic">
                            {(courseDetails.what_you_will_learn || []).map((item, idx) => (
                              <div key={idx} className="learn-item-row">
                                <CheckCircleOutlined className="learn-check-icon" />
                                <Text className="learn-item-text">{item.text}</Text>
                              </div>
                            ))}
                            {!courseDetails.what_you_will_learn?.length && (
                              <Text type="secondary">No learning outcomes added.</Text>
                            )}
                          </div>
                        </Col>

                        <Col xs={24} md={12}>
                          <Title level={3} className="overview-main-title">Who this course is for</Title>
                          <ul className="who-is-it-for-list">
                            {(courseDetails.who_this_course_is_for || []).map((item, idx) => (
                              <li key={idx}>
                                <Text className="who-text">{item.text}</Text>
                              </li>
                            ))}
                            {!courseDetails.who_this_course_is_for?.length && (
                              <Text type="secondary">Target audience not specified.</Text>
                            )}
                          </ul>
                        </Col>
                      </Row>
                    </div>

                    {/* Course Curriculum Preview in Overview */}
                    <div className="curriculum-top-flex">
                      <Title level={3} className="overview-main-title" style={{ marginBottom: 0 }}>Course Curriculum</Title>
                      <Button type="link" className="curriculum-expand-btn" onClick={() => setActiveTab('curriculum')}>
                        Expand all sections
                      </Button>
                    </div>
                    {/* Just replicate the top 3 items here for preview, or directly use collapse. Figma shows Collapse directly. */}
                    <Collapse
                      accordion
                      bordered={false}
                      expandIcon={({ isActive }) => (
                        <PlayCircleOutlined
                          rotate={isActive ? 90 : 0}
                          style={{ color:"#bd7b20", fontSize: 18 }}
                        />
                      )}
                      className="curriculum-main-collapse"
                      defaultActiveKey={[courseDetails.chapters[0]?._id]}
                    >
                      {courseDetails.chapters.slice(0, 3).map((chapter, index) => (
                        <Panel
                          key={chapter._id}
                          className="chapter-custom-panel"
                          header={
                            <div className="chapter-header-flex">
                              <div className="chapter-title-group">
                                <Text className="chapter-title-text">
                                  Chapter {index + 1}: {chapter.chapter_name}
                                </Text>
                                <div className="chapter-subtitle-icons">
                                  {chapter.youtube_video && <span><VideoCameraOutlined /> Video</span>}
                                  {chapter.study_material && <span><FilePdfOutlined /> Notes</span>}
                                  {chapter.practice_set && <span><BookOutlined /> Practice</span>}
                                </div>
                              </div>
                              {index === 0 && !isPurchased && (
                                <span className="free-preview-tag">Free Preview</span>
                              )}
                            </div>
                          }
                        >
                          {chapter.youtube_video && (
                            <div className="lecture-item">
                              <PlayCircleOutlined className="lecture-type-icon video" />
                              <div className="lecture-info">
                                <Text className="lecture-name">Video Lecture</Text>
                                <Text className="lecture-type">YOUTUBE</Text>
                              </div>
                              <LockOutlined style={{ color:'#9ca3af' }} />
                            </div>
                          )}
                          {chapter.study_material && (
                            <div className="lecture-item">
                              <FilePdfOutlined className="lecture-type-icon pdf" />
                              <div className="lecture-info">
                                <Text className="lecture-name">Study Material</Text>
                                <Text className="lecture-type">PDF</Text>
                              </div>
                              <LockOutlined style={{ color:'#9ca3af' }} />
                            </div>
                          )}
                          {chapter.practice_set && (
                            <div className="lecture-item">
                              <BookOutlined className="lecture-type-icon practice" />
                              <div className="lecture-info">
                                <Text className="lecture-name">Practice Set</Text>
                                <Text className="lecture-type">QUESTIONS</Text>
                              </div>
                              <LockOutlined style={{ color:'#9ca3af' }} />
                            </div>
                          )}
                        </Panel>
                      ))}
                    </Collapse>
                  </div>
                </TabPane>

                {/*  CURRICULUM TAB  */}
                <TabPane tab="Curriculum" key="curriculum">
                  {courseDetails.syllabus && (
                    <div
                      className="download-syllabus-banner"
                      onClick={() => handleDownloadTrigger(courseDetails.syllabus!, `${courseDetails.title.replace(/\s+/g,'_')}_Syllabus`)}
                    >
                      <div className="banner-left">
                        <Text className="banner-title">Download Syllabus</Text>
                        <Tag className="free-tag-pill">Free</Tag>
                      </div>
                      <DownloadOutlined className="banner-download-icon" />
                    </div>
                  )}

                  <div className="curriculum-summary-container">
                    <div className="summary-card">
                      <div className="summary-item">
                        <div className="summary-icon-circle blue-bg">
                          <BookOutlined />
                        </div>
                        <div className="summary-text">
                          <Text className="summary-label">TOTAL CHAPTERS</Text>
                          <Text className="summary-value">
                            {courseDetails.chapters.length} Sections
                          </Text>
                        </div>
                      </div>
                      <div className="summary-item">
                        <div className="summary-icon-circle blue-bg">
                          <PlayCircleOutlined />
                        </div>
                        <div className="summary-text">
                          <Text className="summary-label">TOTAL LECTURES</Text>
                          <Text className="summary-value">
                            {courseDetails.chapters.filter(ch => ch.youtube_video).length} Videos
                          </Text>
                        </div>
                      </div>
                      <div className="summary-item">
                        <div className="summary-icon-circle blue-bg">
                          <ClockCircleOutlined />
                        </div>
                        <div className="summary-text">
                          <Text className="summary-label">TOTAL DURATION</Text>
                          <Text className="summary-value">
                            {courseDetails.duration}h 0m
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="curriculum-features-bar">
                    <Text className="feature-pill-item">
                      <CheckCircleOutlined className="check-icon-blue" /> Recorded video lectures
                    </Text>
                    <Text className="feature-pill-item">
                      <CheckCircleOutlined className="check-icon-blue" /> Downloadable PDF notes
                    </Text>
                    <Text className="feature-pill-item">
                      <CheckCircleOutlined className="check-icon-blue" /> Live interactive classes
                    </Text>
                  </div>

                  <Collapse
                    accordion
                    bordered={false}
                    expandIcon={({ isActive }) => (
                      <PlayCircleOutlined
                        rotate={isActive ? 90 : 0}
                        style={{ color:"#bd7b20", fontSize: 18 }}
                      />
                    )}
                    className="curriculum-main-collapse"
                  >
                    {courseDetails.chapters.map((chapter, index) => (
                      <Panel
                        key={chapter._id}
                        className="chapter-custom-panel"
                        header={
                          <div className="chapter-header-flex">
                            <div className="chapter-title-group">
                              <Text className="chapter-title-text">
                                Chapter {index + 1}: {chapter.chapter_name}
                              </Text>
                              <div className="chapter-subtitle-icons">
                                {chapter.youtube_video && <span><VideoCameraOutlined /> Video</span>}
                                {chapter.study_material && <span><FilePdfOutlined /> Notes</span>}
                                {chapter.practice_set && <span><BookOutlined /> Practice</span>}
                              </div>
                            </div>
                            {index === 0 && !isPurchased && (
                              <span className="free-preview-tag">Free Preview</span>
                            )}
                          </div>
                        }
                      >
                        {chapter.youtube_video && (
                          <div className="lecture-item">
                            <PlayCircleOutlined className="lecture-type-icon video" />
                            <div className="lecture-info">
                              <Text className="lecture-name">Video Lecture</Text>
                              <Text className="lecture-type">YOUTUBE</Text>
                            </div>
                            <LockOutlined style={{ color:'#9ca3af' }} />
                          </div>
                        )}
                        {chapter.study_material && (
                          <div className="lecture-item">
                            <FilePdfOutlined className="lecture-type-icon pdf" />
                            <div className="lecture-info">
                              <Text className="lecture-name">Study Material</Text>
                              <Text className="lecture-type">PDF</Text>
                            </div>
                            <LockOutlined style={{ color:'#9ca3af' }} />
                          </div>
                        )}
                        {chapter.practice_set && (
                          <div className="lecture-item">
                            <BookOutlined className="lecture-type-icon practice" />
                            <div className="lecture-info">
                              <Text className="lecture-name">Practice Set</Text>
                              <Text className="lecture-type">QUESTIONS</Text>
                            </div>
                            <LockOutlined style={{ color:'#9ca3af' }} />
                          </div>
                        )}
                      </Panel>
                    ))}
                  </Collapse>
                  {isPurchased && <DashboardAccessMessage />}
                </TabPane>

                {/*  REVIEWS TAB  */}
                <TabPane tab={`Reviews (${reviews.length})`} key="reviews">
                  <Title level={3} className="overview-main-title" style={{ marginTop: 0 }}>Student Feedback</Title>

                  <div className="feedback-stat-box">
                    <div className="feedback-score-col">
                      <div className="feedback-score-number">{Number(avgRating || 0).toFixed(1)}</div>
                      <div className="feedback-score-total">AVERAGE RATING</div>
                      <Rate disabled allowHalf value={Number(avgRating || 0)} style={{ fontSize: 16, marginTop: 8 }} />
                      <div className="meta-text" style={{ marginTop: 8 }}>{reviews.length} reviews</div>
                    </div>

                    <div className="feedback-bars-col">
                      {[5, 4, 3, 2, 1].map((star) => (
                        <div className="feedback-bar-row" key={star}>
                          <div className="bar-star-label">{star}</div>
                          <div className="bar-track">
                            <div className="bar-fill" style={{ width: `${ratingDist[star as keyof typeof ratingDist]}%` }}></div>
                          </div>
                          <div className="bar-pct-label">{ratingDist[star as keyof typeof ratingDist]}%</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="reviews-list-container">
                    {reviews.slice(0, visibleReviews).map((rev, i) => {
                      const initial = rev.student_id?.name ? rev.student_id.name.substring(0, 2).toUpperCase() :"ST";
                      return (
                        <div key={i} className="review-item-card">
                          <div className="review-user-row">
                            <div className="review-user-left">
                              <div className="review-avatar">{initial}</div>
                              <div className="review-user-info">
                                <Text className="review-username">{rev.student_id?.name}</Text>
                                <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
                                  <Rate disabled value={rev.rating} style={{ fontSize: 12, marginTop: 4 }} />
                                  <Tag color="gold" className="verified-student-badge">
                                    <VerifiedOutlined size={10} /> Verified Student
                                  </Tag>
                                </div>
                              </div>
                            </div>
                            <div className="review-time">
                              {rev.createdAt ? moment(rev.createdAt).fromNow() :''}
                            </div>
                          </div>
                          <Paragraph className="review-text-content">"{rev.comment}"</Paragraph>
                        </div>
                      );
                    })}
                    {!reviews.length && <Text type="secondary">No reviews yet.</Text>}
                  </div>

                  {reviews.length > visibleReviews && (
                    <div style={{ textAlign:'center', marginTop: 24 }}>
                      <Button onClick={() => setVisibleReviews(prev => prev + 5)}>
                        View More Reviews
                      </Button>
                    </div>
                  )}

                  {isLoggedIn && isPurchased && (
                    <Card style={{ marginTop: 32 }} className="write-review-card">
                      <Title level={4}>Share Your Experience</Title>
                      <Space direction="vertical" size={16} style={{ width:'100%' }}>
                        <div className="rating-input-box">
                          <Text strong style={{ marginRight: 16 }}>Your Rating:</Text>
                          <Rate value={reviewRating} onChange={setReviewRating} />
                        </div>
                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="What did you like about this course? How can we improve?"
                          className="review-textarea-premium"
                        />
                        <Button 
                          type="primary" 
                          size="large"
                          loading={reviewLoading} 
                          className="submit-review-btn-premium"
                          onClick={submitReview}
                        >
                          Submit Review
                        </Button>
                      </Space>
                    </Card>
                  )}
                  {!isLoggedIn && <Alert type="info" message="Login to write reviews" style={{ marginTop: 24 }} />}
                  {isLoggedIn && !isPurchased && <Alert type="warning" message="Purchase early access to write a review" style={{ marginTop: 24 }} />}
                </TabPane>
              </Tabs>
            </Card>

            {/* Your Instructors Section */}
            <Title level={3} className="overview-main-title" style={{ marginTop: 48 }}>Your Instructors</Title>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card className="instructor-card-replica">
                  <div className="instructor-profile-flex">
                    <Avatar
                      size={64}
                      src={`${url}/${courseDetails.teacher_id?.tprofile}`}
                      icon={<UserOutlined />}
                    />
                    <div className="instructor-details-content">
                      <div className="name-verify-row">
                        <Text className="instructor-name-text">{courseDetails.teacher_id?.tname}</Text>
                        <VerifiedOutlined className="verify-badge-icon" />
                      </div>
                      <Text className="instructor-specialization-text">
                        {courseDetails.teacher_id?.tspecialization ||"Expert Educator"}
                      </Text>
                      <Paragraph className="instructor-bio-text">
                        15+ years of experience in market analysis and wealth management. Making complex topics simplified for students worldwide.
                      </Paragraph>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* FAQs */}
            {(courseDetails.course_faqs?.length ?? 0) > 0 && (
              <Card className="faq-card">
                <Title level={3} className="overview-main-title">Frequently Asked Questions</Title>
                <Collapse bordered={false} expandIconPosition="end" className="faq-collapse">
                  {courseDetails.course_faqs!.map((faq, index) => (
                    <Panel
                      header={faq.question}
                      key={index}
                      className="faq-panel"
                      extra={<PlusOutlined />}
                      showArrow={false}
                    >
                      <Text className="faq-answer">
                        {faq.answer}
                      </Text>
                    </Panel>
                  ))}
                </Collapse>
              </Card>
            )}

          </Col>

          {/* RIGHT COLUMN (STICKY SIDEBAR) */}
          <Col xs={24} lg={8}>
            <div className="sidebar-sticky">

              <Card className="price-card">
                <div className="price-header">
                  <Text className="lifetime-label">LIFETIME ACCESS</Text>

                  <div className="price-amount">
                    {calculatedPricing.totalAmount.toLocaleString("en-IN")}
                    <span style={{ fontSize:"14px", color:"#6b7280", fontWeight: 500, alignSelf:"center", paddingTop:"12px", marginLeft:"4px" }}>+ 18% GST</span>
                  </div>

                  {/* Render Actual vs Discount if applicable */}
                  {discountPercentageDisplay > 0 && (
                    <div style={{ marginTop: 4 }}>
                      <Text className="price-strike">{actualCalculated.totalAmount.toLocaleString("en-IN")}</Text>
                      <Text className="discount-tag">(-{discountPercentageDisplay}% OFF)</Text>
                    </div>
                  )}
                </div>

                <Space direction="vertical" size={16} style={{ width:"100%" }}>
                  {isPurchased ? (
                    <Button className="enrolled-button" size="large" block icon={<CheckCircleOutlined />}>
                       Enrolled
                    </Button>
                  ) : (
                    <>
                      {/* Coins Section */}
                      {walletBalance > 0 && (
                        <div style={{ marginBottom: 0, padding:"12px", background:"#f9fafb", borderRadius:"8px", border:"1px solid #e5e7eb" }}>
                          <Text strong style={{ display:'block', fontSize: 13, marginBottom: 4 }}>Use Draa Coins</Text>
                          <input
                            type="number"
                            min={0}
                            max={walletBalance}
                            step={100}
                            value={coinsToUse}
                            onChange={(e) => {
                              let value = Number(e.target.value);
                              if (value < 0) value = 0;
                              if (value > walletBalance) value = walletBalance;
                              setCoinsToUse(value);
                            }}
                            style={{
                              width:"100%",
                              padding:"8px 12px",
                              borderRadius:"6px",
                              border:"1px solid #d1d5db",
                              outline:"none"
                            }}
                          />
                          <div style={{ display:'flex', justifyContent:'space-between', marginTop: 6 }}>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              Bal: {walletBalance} coins
                            </Text>
                            <Text type="secondary" style={{ fontSize: 11, color:"#10b981", fontWeight: 500 }}>
                              Save {calculateCoinDiscount().toFixed(0)}
                            </Text>
                          </div>
                        </div>
                      )}

                      <Button
                        className="buy-button"
                        size="large"
                        block
                        loading={paymentLoading}
                        onClick={handlePurchaseCourse}
                      >
                        Buy Course Now
                      </Button>
                    </>
                  )}

                  <Button
                    size="large"
                    block
                    loading={wishlistLoading}
                    className={`wishlist-button ${isWishlisted ?"active" :""}`}
                    icon={<HeartOutlined style={{ color: isWishlisted ?"#ef4444" : undefined }} />}
                    onClick={handleWishlistToggle}
                  >
                    {isWishlisted ?"Wishlisted" :"Add to Wishlist"}
                  </Button>
                </Space>

                <div className="safe-checkout">
                  <Text className="checkout-label">GUARANTEED SAFE CHECKOUT</Text>
                  <div className="payment-badge">Razorpay Secured Checkout</div>
                </div>

                <Divider className="price-divider" />

                <div className="help-box">
                  <Space align="start" style={{ width:'100%' }}>
                    <div className="help-icon"><PhoneOutlined /></div>
                    <div className="help-content" style={{ flex: 1 }}>
                      <Text className="help-title">Need help deciding?</Text>
                      <Text className="help-subtitle">Speak to our education experts</Text>
                      <Space size={4} wrap className="help-links">
                        <Button
                          type="link"
                          className="help-link"
                          onClick={() => window.open("https://wa.me/918076003728?text=Hi%20I%20need%20help%20regarding%20this%20course","_blank")}
                        >
                          WhatsApp Us
                        </Button>
                        <Text className="help-separator">|</Text>
                        <Button
                          type="link"
                          className="help-link"
                          onClick={() => { window.location.href ="tel:08076003728"; }}
                        >
                          Request Call
                        </Button>
                      </Space>
                    </div>
                  </Space>
                </div>
              </Card>

              {/* Share Card */}
              <Card className="share-card">
                <Space direction="vertical" size={16} style={{ width:'100%' }}>
                  <Text className="share-title">Share this course</Text>
                  <Space size={12}>
                    <Button shape="circle" icon={<ShareAltOutlined />} className="share-button" onClick={handleCopyLink} />
                    <Button shape="circle" icon={<PhoneOutlined />} className="share-button" onClick={handleWhatsAppShare} />
                    <Button shape="circle" icon={<FacebookFilled />} className="share-button" onClick={handleFacebookShare} />
                    <Button shape="circle" icon={<TwitterOutlined />} className="share-button" onClick={handleTwitterShare} />
                    <Button shape="circle" icon={<LinkedinFilled />} className="share-button" onClick={handleLinkedInShare} />
                  </Space>
                </Space>
              </Card>

            </div>
          </Col>
        </Row>
      </div>

      <DownloadPopupModal 
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        targetUrl={downloadTarget}
        resourceTitle={downloadTitle}
        resourceType="Course Syllabus"
      />
    </div>
  );
}