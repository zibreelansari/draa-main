import"./components/homes/home/SuccessStories.css";
import"./components/search/GlobalSearchPage.css";
import"./components/e-learning/ELearningPage.css";
import"./components/common/Breadcrumb.css";
import"./components/register/auth/AuthModal.css";

import React, { Suspense, lazy, useEffect } from"react";
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useLocation, useRouteError } from "react-router-dom";
import ReactGA from "react-ga4";
import { AuthModalFlow, AuthModalProvider, AuthModalTab, useAuthModal } from "./components/register/auth/AuthModalContext";
import AuthModal from "./components/register/auth/AuthModal";
import { isAuthenticated, getStoredUser, getCartKey, getUserRole } from "./utils/global_auth";

// --- LAZY LOADED COMPONENTS ---
const HomeOne = lazy(() => import("./components/homes/home"));
const About = lazy(() => import("./components/about"));
const Courses = lazy(() => import("./components/courses"));
const CourseDetails = lazy(() => import("./components/course-details"));
const GridBlog = lazy(() => import("./components/grid-blog"));
const StandardBlog = lazy(() => import("./components/standard-blog"));
const BlogDetails = lazy(() => import("./components/blog-details"));
const Cart = lazy(() => import("./components/cart"));
const Checkout = lazy(() => import("./components/checkout"));
const Instructors = lazy(() => import("./components/instructors"));
const Error = lazy(() => import("./components/error"));
const Contact = lazy(() => import("./components/homes/home/DraaCorporateContact"));
const CorporateContentPage = lazy(() => import("./components/corporate/CorporateContentPage"));
const StudyInIndiaHub = lazy(() => import("./components/corporate/StudyInIndiaHub"));
const DraaStudentAccess = lazy(() => import("./components/corporate/DraaStudentAccess"));
const StudyIndiaDashboard = lazy(() => import("./components/corporate/StudyIndiaDashboard"));
const LiveChatWidget = lazy(() => import("./components/common/LiveChatWidget"));
const AgenticCopilotWidget = lazy(() => import("./components/common/AgenticCopilotWidget"));

const DashboardMain = lazy(() => import("./components/DASHBOARD"));
const TeacherDashboard = lazy(() => import("./components/DASHBOARD/TeacherDashboard"));
const AdminRegisterIndex = lazy(() => import("./components/register/adminRegisterIndex"));
const AdminLoginIndex = lazy(() => import("./components/login/adminLoginIndex"));
const UnifiedRegisterIndex = lazy(() => import("./components/register/UnifiedRegisterIndex"));
const ManageTeacherIndex = lazy(() => import("./components/DASHBOARD/ManageTeachersIndex"));
const ManageStudentIndex = lazy(() => import("./components/DASHBOARD/ManageStudentIndex"));
const StudentProfileIndex = lazy(() => import("./components/DASHBOARD/StudentProfileIndex"));
const TeacherProfileIndex = lazy(() => import("./components/DASHBOARD/TeacherProfileIndex"));
const AddCourseIndex = lazy(() => import("./components/DASHBOARD/AddCourseIndex"));
const ManageCoursesIndex = lazy(() => import("./components/DASHBOARD/ManageCoursesIndex"));
const SpecificCourseDetails = lazy(() => import("./components/DASHBOARD/SpecificCourseDetailsIndex"));
const UpdateCourseIndex = lazy(() => import("./components/DASHBOARD/UpdateCoursesIndex"));
const TeacherOwnProfileIndex = lazy(() => import("./components/DASHBOARD/TeacherOwnProfileIndex"));
const EditTeacherProfileIndex = lazy(() => import("./components/DASHBOARD/EditTeacherProfileIndex"));
const PublishCourseContentIndex = lazy(() => import("./components/DASHBOARD/PublishCourseContentIndex"));
const ManageCourseContentIndex = lazy(() => import("./components/DASHBOARD/ManageCourseContentIndex"));
const CourseContentDetailsIndex = lazy(() => import("./components/DASHBOARD/CourseContentDetailsIndex"));
const UpdateCourseContentIndex = lazy(() => import("./components/DASHBOARD/UpdateCourseContentIndex"));
const CreateAssignmmentIndex = lazy(() => import("./components/DASHBOARD/CreateAssignmentIndex"));
const ManageAssignmentIndex = lazy(() => import("./components/DASHBOARD/ManageAssignmmentsIndex"));
const UploadAssignmentIndex = lazy(() => import("./components/DASHBOARD/UploadAssignmentIndex"));
const ExamCreation = lazy(() => import("./components/DASHBOARD/ExamCreation"));
const ExamManagementIndex = lazy(() => import("./components/DASHBOARD/ExamManagementIndex"));
const JobsList = lazy(() => import("./components/DASHBOARD/JobListings"));
const JobCategories = lazy(() => import("./components/DASHBOARD/JobsCategories"));
const AddBooks = lazy(() => import("./components/DASHBOARD/AddBooks"));
const BookCateGoriesManager = lazy(() => import("./components/DASHBOARD/AddBooksCategories"));
const StudentOngoingExam = lazy(() => import("./components/DASHBOARD/StudentOngoingExams"));
const AddManageLiveSessions = lazy(() => import("./components/DASHBOARD/Livesessions"));
const StudentsLiveSessions = lazy(() => import("./components/DASHBOARD/StudentsLiveSessions"));
const EditExamPage = lazy(() => import("./components/DASHBOARD/EditExamModal"));
const ManageCoursesAdmin = lazy(() => import("./components/DASHBOARD/ManageCoursesAdmin"));
const ExamManagementAdmin = lazy(() => import("./components/DASHBOARD/ManageExamsAdmin"));
const ManageAssignmentsAdmin = lazy(() => import("./components/DASHBOARD/ManageAssignmentsAdmin"));
const AdminLiveSessionManager = lazy(() => import("./components/DASHBOARD/AdminLiveSessions"));
const Books = lazy(() => import("./components/books"));
const BookDetails = lazy(() => import("./components/book-details"));
const TestSeriesManager = lazy(() => import("./components/DASHBOARD/TestSeriesManagement"));
const AdminTestSeriesDashboard = lazy(() => import("./components/DASHBOARD/AdminTestSeriesdashboard"));
const OnlineTestSeries = lazy(() => import("./components/test-series"));
const CourseCategoryManagement = lazy(() => import("./components/DASHBOARD/CourseCategories"));
const AdminCategoryManagement = lazy(() => import("./components/DASHBOARD/AdminCourseCategories"));
const CategoryWiseCourses = lazy(() => import("./components/courses/CategoryWiseindex"));
const CategoryWiseBooks = lazy(() => import("./components/books/CategoryWiseBooksIndex"));
const CategoryWiseOnlineTestSeries = lazy(() => import("./components/test-series/CategoryWiseTestSeriesIndex"));
const JobsDetails = lazy(() => import("./components/jobs/JobDetailsindex"));
const ExaminationCategoryManager = lazy(() => import("./components/DASHBOARD/ExaminationCategoryManager"));
const SubjectManager = lazy(() => import("./components/DASHBOARD/SubjectManager"));
const TopicCategoryManager = lazy(() => import("./components/DASHBOARD/TopicCategoryManager"));
const CourseLearnPage = lazy(() => import("./components/DASHBOARD/StudentLearningCourse"));
const PaymentManagement = lazy(() => import("./components/DASHBOARD/ManageALlPayments"));
const TestInterface = lazy(() => import("./components/DASHBOARD/TestSeriesInterface"));
const TestResults = lazy(() => import("./components/DASHBOARD/TestResults"));
const PrivacyPolicyManagement = lazy(() => import("./components/DASHBOARD/PrivacyPolicyManagement"));
const TermsAndConditionsManagement = lazy(() => import("./components/DASHBOARD/TermsnConditions"));
const AboutUsManagement = lazy(() => import("./components/DASHBOARD/AboutusManagement"));
const FAQManagement = lazy(() => import("./components/DASHBOARD/FaqsManagement"));
const PrivacyPolicy = lazy(() => import("./components/privacypolicy"));
const TermsandConditionsIndex = lazy(() => import("./components/tnc"));
const StudentLiveSessionsDashboard = lazy(() => import("./components/DASHBOARD/StudentLiveSessions"));
const ForgotPassword = lazy(() => import("./components/login/forgotPass"));
const TeacherForgotPassword = lazy(() => import("./components/login/teacherForgotPassword"));
const TeacherUpdateProfile = lazy(() => import("./components/DASHBOARD/TeacherUpdateProfile"));
const TeacherAttendance = lazy(() => import("./components/DASHBOARD/TeacherAttandances"));
const BannerManager = lazy(() => import("./components/DASHBOARD/AdminBanner_Slider_content"));
const PYQManagement = lazy(() => import("./components/DASHBOARD/PYQManagement"));
const SyllabusManagement = lazy(() => import("./components/DASHBOARD/SyllabusManagement"));
const PYQSIndex = lazy(() => import("./components/pyqs"));
const PYQDetailsIndex = lazy(() => import("./components/pyqs/PYQDetailsIndex"));
const SyllabusIndex = lazy(() => import("./components/syllabus/Index"));
const CurrentAffairsIndex = lazy(() => import("./components/currentAffairs/Index"));
const CurrentAffairsCategorywise = lazy(() => import("./components/currentAffairs/Categorywise/CurrentAffairsCategorywise"));
const AddExams = lazy(() => import("./components/DASHBOARD/Exams"));
const AdminExamManagement = lazy(() => import("./components/DASHBOARD/AdminExamSecionManagement"));
const CurrentAffairsManagement = lazy(() => import("./components/DASHBOARD/CurrentAffairsManagement"));
const ExamIndexPage = lazy(() => import("./components/exams"));
const ExamDetailsIndex = lazy(() => import("./components/homes/home/examDetailsIndex"));
const CADetailsIndex = lazy(() => import("./components/homes/home/CaDetailsIndex"));
const TopicExplorePage = lazy(() => import("./components/explore/TopicExplorePage"));
const GlobalSearchPage = lazy(() => import("./components/search/GlobalSearchPage"));
const JobsNotification = lazy(() => import("./components/jobs/JobsIndex"));
const ExamTopicsPage = lazy(() => import("./components/test-series/ExamTopicsPage"));
const AdminUpdateProfile = lazy(() => import("./components/DASHBOARD/AdminUpdateProfile"));
const FooterManager = lazy(() => import("./components/DASHBOARD/FooterManager"));
const ManageCoupons = lazy(() => import("./components/DASHBOARD/ManageCoupons"));
const FreeResources = lazy(() => import("./components/homes/home/FreeResources"));
const SuccessStoriesIndex = lazy(() => import("./components/homes/home/SuccessStoriesIndex"));
const DownloadApp = lazy(() => import("./components/download-app/Index"));
const QuickViewPage = lazy(() => import("./components/common/QuickViewPage"));
const SupportTicketList = lazy(() => import("./components/DASHBOARD/Support/SupportTicketList"));
const SupportTicketCreate = lazy(() => import("./components/DASHBOARD/Support/SupportTicketCreate"));
const SupportTicketChat = lazy(() => import("./components/DASHBOARD/Support/SupportTicketChat"));
const VerifySubscription = lazy(() => import("./components/newsletter/VerifySubscription"));
const Unsubscribe = lazy(() => import("./components/newsletter/Unsubscribe"));
const VideographyManager = lazy(() => import("./components/DASHBOARD/VideographyManager"));
const TeacherVideographyManager = lazy(() => import("./components/DASHBOARD/TeacherVideographyManager"));
const VideographyIndex = lazy(() => import("./components/videography"));
const TeamsIndex = lazy(() => import("./components/teams"));
const ChatbotFAQManager = lazy(() => import("./components/DASHBOARD/ChatbotFAQManager"));
const AdminLogViewer = lazy(() => import("./components/DASHBOARD/AdminLogViewer"));
const AdminNotifications = lazy(() => import("./components/DASHBOARD/Notifications/AdminNotifications"));
const QuestionIssuesDashboard = lazy(() => import("./components/DASHBOARD/QuestionIssuesDashboard"));


// E-Learning Pages
const WebsiteDevelopment = lazy(() => import("./components/e-learning/WebsiteDevelopment"));
const AcademicContent = lazy(() => import("./components/e-learning/AcademicContent"));
const WhiteLabelContent = lazy(() => import("./components/e-learning/WhiteLabelContent"));
const MobileAppDevelopment = lazy(() => import("./components/e-learning/MobileAppDevelopment"));
const ExamManagement = lazy(() => import("./components/e-learning/ExamManagement"));
const DigitalContentCreation = lazy(() => import("./components/e-learning/DigitalContentCreation"));
const DigitalMarketing = lazy(() => import("./components/e-learning/DigitalMarketing"));
const ManagedServices = lazy(() => import("./components/e-learning/ManagedServices"));

// V2 Student Dashboard
const DashboardIndexV2 = lazy(() => import("./student-dashboards/pages/Dashboard/DashboardIndex"));
const NotificationsListV2 = lazy(() => import("./student-dashboards/pages/Notifications/NotificationsListV2"));
const StudentCoupons = lazy(() => import("./student-dashboards/pages/Coupons/StudentCoupons"));
const StudentDashboardMetricsScreen = lazy(() => import("./student-dashboards/pages/Dashboard/StudentDashboardMetricsScreen"));
const CoursesListV2 = lazy(() => import("./student-dashboards/pages/MyCourses/CoursesList"));
const ExamsListV2 = lazy(() => import("./student-dashboards/pages/Exams/ExamsList"));
const BooksListV2 = lazy(() => import("./student-dashboards/pages/MyBooks/BooksList"));
const TestSeriesListV2 = lazy(() => import("./student-dashboards/pages/TestSeries/TestSeriesList"));
const LiveSessionsListV2 = lazy(() => import("./student-dashboards/pages/LiveSessions/LiveSessionsList"));
const ResultsListV2 = lazy(() => import("./student-dashboards/pages/Results/ResultsList"));
const ResultDetailV2 = lazy(() => import("./student-dashboards/pages/Results/ResultDetail"));
const ProfileSettingsV2 = lazy(() => import("./student-dashboards/pages/Profile/ProfileSettings"));
const WishlistListV2 = lazy(() => import("./student-dashboards/pages/Wishlist/WishlistList"));
const RewardsListV2 = lazy(() => import("./student-dashboards/pages/Rewards/RewardsList"));
const PurchaseHistoryV2 = lazy(() => import("./student-dashboards/pages/Purchases/PurchaseHistory"));
const BlogWritingV2 = lazy(() => import("./student-dashboards/pages/Blogs/BlogList"));
const SettingsIndex = lazy(() => import("./student-dashboards/pages/Settings/SettingsIndex"));
const LeaderboardIndex = lazy(() => import("./student-dashboards/pages/Leaderboard/LeaderboardIndex"));
const SupportListV2 = lazy(() => import("./student-dashboards/pages/Support/SupportListV2"));
const SupportCreateV2 = lazy(() => import("./student-dashboards/pages/Support/SupportCreateV2"));
const SupportChatV2 = lazy(() => import("./student-dashboards/pages/Support/SupportChatV2"));

import { ToastContainer } from "./utils/toast";

function GAListener() {
  const location = useLocation();

  useEffect(() => {
    // 1. Google Analytics
    ReactGA.send({
      hitType: "pageview",
      page: location.pathname + location.search,
    });

    // 2. Internal backend logger (async, safe)
    const logPageView = async () => {
      try {
        const raw = localStorage.getItem("edudocs");
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        
        let userRole = "guest";
        let userName = "";
        
        if (raw) {
          try {
            const user = JSON.parse(raw);
            if (user.token) {
              headers["Authorization"] = `Bearer ${user.token}`;
            }
            if (user.aname || user.A_name || user.role === "admin") {
              userRole = "admin";
              userName = user.aname || user.A_name || "Admin";
            } else if (user.tname || user.T_name || user.role === "teacher") {
              userRole = "teacher";
              userName = user.tname || user.T_name || "Teacher";
            } else {
              userRole = "student";
              userName = user.name || "Student";
            }
          } catch (e) {
            // ignore
          }
        }

        const description = userName 
          ? `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} "${userName}" visited page: ${location.pathname}`
          : `Guest visited page: ${location.pathname}`;

        fetch("/api/v1/admin/logs/activity", {
          method: "POST",
          headers,
          body: JSON.stringify({
            actionType: "page_visit",
            description,
            metadata: {
              path: location.pathname,
              search: location.search,
            },
          }),
        }).catch(() => {});
      } catch (err) {
        // Safe catch
      }
    };

    logPageView();
  }, [location]);

  return null;
}

function CartSyncListener() {
  useEffect(() => {
    const performCartSync = async () => {
      if (!isAuthenticated()) return;
      const user = getStoredUser();
      if (!user || !user.token) return;

      const cartKey = getCartKey();
      let localCart: any[] = [];
      try {
        const stored = localStorage.getItem(cartKey);
        localCart = stored ? JSON.parse(stored) : [];
      } catch {
        localCart = [];
      }

      try {
        await fetch("/api/v1/books/cart/sync-cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.token}`
          },
          body: JSON.stringify({ items: localCart })
        });
      } catch (err) {
        console.error("Cart sync failed:", err);
      }
    };

    const handleAuthChange = async () => {
      if (!isAuthenticated()) return;
      const user = getStoredUser();
      if (!user || !user.token) return;

      const userCartKey = `draa-cart-${user.id}`;
      const guestCartKey = "draa-guest-cart";

      let guestCart: any[] = [];
      let userCart: any[] = [];

      try {
        const guestData = localStorage.getItem(guestCartKey);
        if (guestData) guestCart = JSON.parse(guestData);
      } catch (_) {}

      try {
        const userData = localStorage.getItem(userCartKey);
        if (userData) userCart = JSON.parse(userData);
      } catch (_) {}

      let dbCartItems: any[] = [];
      try {
        const response = await fetch("/api/v1/books/cart/get-cart", {
          headers: {
            "Authorization": `Bearer ${user.token}`
          }
        });
        const resData = await response.json();
        if (resData.success && resData.cart && Array.isArray(resData.cart.items)) {
          dbCartItems = resData.cart.items.map((item: any) => ({
            cartItemId: item.cartItemId || `${item.bookId}-${item.bookType}-${Date.now()}`,
            bookId: item.bookId,
            book_id: item.bookId,
            bookType: item.bookType,
            title: item.title,
            author: item.author,
            coverImage: item.coverImage,
            finalPrice: item.finalPrice,
            basePrice: item.basePrice,
            discountPercentage: item.discountPercentage || 0,
            quantity: item.quantity,
            addedAt: item.addedAt
          }));
        }
      } catch (err) {
        console.error("Failed to fetch DB cart:", err);
      }

      const mergedMap = new Map<string, any>();
      const mergeIntoMap = (items: any[]) => {
        items.forEach(item => {
          const key = `${item.bookId || item.book_id}-${item.bookType}`;
          const existing = mergedMap.get(key);
          if (existing) {
            existing.quantity = Math.max(existing.quantity, item.quantity || 1);
          } else {
            mergedMap.set(key, { ...item });
          }
        });
      };

      mergeIntoMap(dbCartItems);
      mergeIntoMap(userCart);
      mergeIntoMap(guestCart);

      const mergedCart = Array.from(mergedMap.values());

      localStorage.setItem(userCartKey, JSON.stringify(mergedCart));
      
      if (guestCart.length > 0) {
        localStorage.removeItem(guestCartKey);
      }

      try {
        await fetch("/api/v1/books/cart/sync-cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.token}`
          },
          body: JSON.stringify({ items: mergedCart })
        });
      } catch (err) {
        console.error("Failed to sync merged cart:", err);
      }

      window.dispatchEvent(new Event("cart-updated"));
    };

    window.addEventListener("cart-updated", performCartSync);
    window.addEventListener("auth-updated", handleAuthChange);

    handleAuthChange();

    return () => {
      window.removeEventListener("cart-updated", performCartSync);
      window.removeEventListener("auth-updated", handleAuthChange);
    };
  }, []);

  return null;
}

// Root layout rendered inside the router so AuthModal has Router context
function RootLayout() {
  const location = useLocation();
  const corporatePublicRoutes = new Set([
    "/",
    "/about-draa",
    "/capabilities",
    "/study-in-india",
    "/study-in-india/dashboard",
    "/learning-events",
    "/who-we-support",
    "/contact",
    "/login",
  ]);
  const showLegacyChat = !corporatePublicRoutes.has(location.pathname);

  return (
    <>
      <GAListener />
      <CartSyncListener />
      <Outlet />
      {showLegacyChat && (
        <Suspense fallback={null}>
          <LiveChatWidget />
        </Suspense>
      )}
      <AuthModal />
      <ToastContainer />
    </>
  );
}


function AuthModalRoute({ tab, flow }: { tab: AuthModalTab; flow: AuthModalFlow }) {
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    openAuthModal(tab, flow);
  }, [openAuthModal, tab, flow]);

  return <Navigate to="/" replace />;
}

function GlobalErrorBoundary() {
  const error = useRouteError() as any;
  
  useEffect(() => {
    if (
      error &&
      (error.name === 'ChunkLoadError' ||
        (error.message && error.message.toLowerCase().includes('module script failed')) ||
        (error.message && error.message.toLowerCase().includes('dynamically imported module')))
    ) {
      window.location.reload();
    }
  }, [error]);

  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2>Oops! Something went wrong.</h2>
      <p>We are sorry, but an unexpected error occurred.</p>
      <p style={{ color: '#888' }}>{error?.message || 'Unknown error'}</p>
      <button 
        onClick={() => window.location.reload()}
        style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer', background: '#0056b3', color: 'white', border: 'none', borderRadius: '5px' }}
      >
        Refresh Page
      </button>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <GlobalErrorBoundary />,
    children: [
      { index: true, element: <HomeOne /> },
      { path: "about-draa", element: <CorporateContentPage slug="about-draa" /> },
      { path: "capabilities", element: <CorporateContentPage slug="capabilities" /> },
      { path: "study-in-india", element: <StudyInIndiaHub /> },
      { path: "study-in-india/dashboard", element: <StudyIndiaDashboard /> },
      { path: "login", element: <DraaStudentAccess /> },
      { path: "learning-events", element: <CorporateContentPage slug="learning-events" /> },
      { path: "who-we-support", element: <CorporateContentPage slug="who-we-support" /> },
      { path: "download-app", element: <DownloadApp /> },
      { path: "admin-dashboard", element: <DashboardMain /> },
      { path: "teacher-dashboard", element: <TeacherDashboard /> },
      { path: "teacher/forgot-password", element: <TeacherForgotPassword /> },
      { path: "student-dashboard", element: <Navigate to="/v2/student-dashboard" replace /> },
      { path: "manage-teachers", element: <ManageTeacherIndex /> },
      { path: "manage-students", element: <ManageStudentIndex /> },
      { path: "userProfile/:id", element: <StudentProfileIndex /> },
      { path: "teacherProfile/:id", element: <TeacherProfileIndex /> },
      { path: "teacher-dashboard/teacher/MyProfile/:id", element: <TeacherOwnProfileIndex /> },
      { path: "teacher-profile", element: <TeacherUpdateProfile /> },
      { path: "teacher-settings", element: <TeacherUpdateProfile /> },
      { path: "add-courses", element: <AddCourseIndex /> },
      { path: "exams", element: <ExamCreation /> },
      { path: "manage-exams/:id", element: <ExamManagementIndex /> },
      { path: "admin/course-categories", element: <AdminCategoryManagement /> },
      { path: "course-categories/:id", element: <CourseCategoryManagement /> },
      { path: "admin/manage-exams", element: <ExamManagementAdmin /> },
      { path: "publish-course-content", element: <PublishCourseContentIndex /> },
      { path: "manage-courses/:id", element: <ManageCoursesIndex /> },
      { path: "admin/manage-courses", element: <ManageCoursesAdmin /> },
      { path: "about", element: <About /> },
      { path: "verify-subscription", element: <VerifySubscription /> },
      { path: "unsubscribe", element: <Unsubscribe /> },
      { path: "success-stories", element: <SuccessStoriesIndex /> },
      { path: "courses", element: <Courses /> },
      { path: "courses/category/:category", element: <CategoryWiseCourses /> },
      { path: "all-books", element: <Books /> },
      { path: "books/category/:name", element: <CategoryWiseBooks /> },
      { path: "jobs", element: <JobsList /> },
      { path: "job-categories", element: <JobCategories /> },
      { path: "books", element: <AddBooks /> },
      { path: "book-categories", element: <BookCateGoriesManager /> },
      { path: "course-details/:id", element: <CourseDetails /> },
      { path: "book-details/:id", element: <BookDetails /> },
      { path: "job-details/:id", element: <JobsDetails /> },
      { path: "teacher/edit-my-profile/:id", element: <EditTeacherProfileIndex /> },
      { path: "CourseDetails/:id", element: <SpecificCourseDetails /> },
      { path: "updateCourse-content/:id", element: <UpdateCourseContentIndex /> },
      { path: "updateCourse/:id", element: <UpdateCourseIndex /> },
      { path: "manage-courses-content", element: <ManageCourseContentIndex /> },
      { path: "content-details/:id", element: <CourseContentDetailsIndex /> },
      { path: "assignments", element: <CreateAssignmmentIndex /> },
      { path: "manage-assignments/:teacherId", element: <ManageAssignmentIndex /> },
      { path: "admin/manage-assignments", element: <ManageAssignmentsAdmin /> },
      { path: "upload-assignment/:assignmentId", element: <UploadAssignmentIndex /> },
      { path: "grid-blog", element: <GridBlog /> },
      { path: "standard-blog", element: <StandardBlog /> },
      { path: "blog-details/:id", element: <BlogDetails /> },
      { path: "cart", element: <Cart /> },
      { path: "checkout", element: <Checkout /> },
      { path: "student-login", element: <AuthModalRoute tab="student" flow="login" /> },
      { path: "student/profile", element: <Navigate to="/v2/student/profile" replace /> },
      { path: "register", element: <UnifiedRegisterIndex /> },
      { path: "student-register", element: <AuthModalRoute tab="student" flow="register" /> },
      { path: "teacher-register", element: <AuthModalRoute tab="teacher" flow="register" /> },
      { path: "teacher-login", element: <AuthModalRoute tab="teacher" flow="login" /> },
      { path: "admin-register", element: <AdminRegisterIndex /> },
      { path: "admin-login", element: <AdminLoginIndex /> },
      { path: "instructors", element: <Instructors /> },
      { path: "contact", element: <Contact /> },
      { path: "student/exams/ongoing/:examId", element: <StudentOngoingExam /> },
      { path: "live-sessions", element: <AddManageLiveSessions /> },
      { path: "admin/live-sessions", element: <AdminLiveSessionManager /> },
      { path: "students/live-sessions", element: <Navigate to="/v2/student/live-sessions" replace /> },
      { path: "exam/edit/:id", element: <EditExamPage /> },
      { path: "test-series/:teacherId", element: <TestSeriesManager /> },
      { path: "admin/test-series/categories", element: <ExaminationCategoryManager /> },
      { path: "admin/test-series/subjects", element: <SubjectManager /> },
      { path: "admin/test-series/topics", element: <TopicCategoryManager /> },
      { path: "admin/manage-test-series", element: <AdminTestSeriesDashboard /> },
      { path: "admin/question-issues", element: <QuestionIssuesDashboard /> },
      { path: "admin/manage-all-payments", element: <PaymentManagement /> },
      { path: "admin/videography", element: <VideographyManager /> },
      { path: "teacher/videography", element: <TeacherVideographyManager /> },
      { path: "admin/chatbot-faqs", element: <ChatbotFAQManager /> },
      { path: "admin/logs", element: <AdminLogViewer /> },

      { path: "online-test-series", element: <OnlineTestSeries /> },
      { path: "recorded-videos", element: <VideographyIndex /> },
      { path: "teams", element: <TeamsIndex /> },
      { path: "test-series/examination/:examId", element: <CategoryWiseOnlineTestSeries /> },
      { path: "test-series/subject/:subjectId", element: <CategoryWiseOnlineTestSeries /> },
      { path: "student/my-courses/learn/:courseId", element: <CourseLearnPage /> },
      { path: "student/test-interface/:testId", element: <TestInterface /> },
      { path: "student/test-results/:attemptId", element: <TestResults /> },
      { path: "admin/privacy-policies", element: <PrivacyPolicyManagement /> },
      { path: "privacy-policy", element: <PrivacyPolicy /> },
      { path: "admin/tnc", element: <TermsAndConditionsManagement /> },
      { path: "admin/about-us", element: <AboutUsManagement /> },
      { path: "admin/faqs", element: <FAQManagement /> },
      { path: "tnc", element: <TermsandConditionsIndex /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "teacher/attandances", element: <TeacherAttendance /> },
      { path: "admin/banner", element: <BannerManager /> },
      { path: "previous-year-questions/manage", element: <PYQManagement /> },
      { path: "syllabus/manage", element: <SyllabusManagement /> },
      { path: "previous-year-questions", element: <PYQSIndex /> },
      { path: "previous-year-questions/details/:examName", element: <PYQDetailsIndex /> },
      { path: "syllabus", element: <SyllabusIndex /> },
      { path: "current-affairs", element: <CurrentAffairsIndex /> },
      { path: "current-affairs/daily", element: <CurrentAffairsCategorywise /> },
      { path: "current-affairs/weekly", element: <CurrentAffairsCategorywise /> },
      { path: "current-affairs/monthly", element: <CurrentAffairsCategorywise /> },
      { path: "current-affairs/quarterly", element: <CurrentAffairsCategorywise /> },
      { path: "current-affairs/yearly", element: <CurrentAffairsCategorywise /> },
      { path: "exam-sections", element: <AddExams /> },
      { path: "admin/exam-sections", element: <AdminExamManagement /> },
      { path: "current-affairs/management", element: <CurrentAffairsManagement /> },
      { path: "exams-page", element: <ExamIndexPage /> },
      { path: "exams/:slug", element: <ExamDetailsIndex /> },
      { path: "current-affairs/:slug", element: <CADetailsIndex /> },
      { path: "explore/:topic", element: <TopicExplorePage /> },
      { path: "search", element: <GlobalSearchPage /> },
      { path: "jobs-notifications", element: <JobsNotification /> },
      { path: "exam-topics/:examId", element: <ExamTopicsPage /> },
      { path: "admin/profile", element: <AdminUpdateProfile /> },
      { path: "admin/footer", element: <FooterManager /> },
      { path: "admin/manage-coupons", element: <ManageCoupons /> },
      { path: "free-resources", element: <FreeResources /> },
      { path: "view-resource/:type/:id", element: <QuickViewPage /> },
      { path: "support", element: <SupportTicketList /> },
      { path: "support/create", element: <SupportTicketCreate /> },
      { path: "support/ticket/:id", element: <SupportTicketChat /> },
      { path: "admin/notifications", element: <AdminNotifications /> },
      // E-Learning
      { path: "e-learning/website-development", element: <WebsiteDevelopment /> },
      { path: "e-learning/academic-content", element: <AcademicContent /> },
      { path: "e-learning/white-label-content", element: <WhiteLabelContent /> },
      { path: "e-learning/mobile-app-development", element: <MobileAppDevelopment /> },
      { path: "e-learning/exam-management", element: <ExamManagement /> },
      { path: "e-learning/digital-content-creation", element: <DigitalContentCreation /> },
      { path: "e-learning/digital-marketing", element: <DigitalMarketing /> },
      { path: "e-learning/managed-services", element: <ManagedServices /> },
      // V2 Student Dashboard
      { path: "v2/student-dashboard", element: <DashboardIndexV2 /> },
      { path: "v2/student/notifications", element: <NotificationsListV2 /> },
      { path: "v2/student/metrics", element: <StudentDashboardMetricsScreen /> },
      { path: "v2/student/my-courses/:studentId", element: <CoursesListV2 /> },
      { path: "v2/student/my-courses/learn/:courseId", element: <CourseLearnPage /> },
      { path: "v2/student/my-exams", element: <ExamsListV2 /> },
      { path: "v2/student/my-books/purchased/:studentId", element: <BooksListV2 /> },
      { path: "v2/student/my-test-series/:studentId", element: <TestSeriesListV2 /> },
      { path: "v2/student/live-sessions", element: <LiveSessionsListV2 /> },
      { path: "v2/student/exam-results/:studentId?", element: <ResultsListV2 /> },
      { path: "v2/student/test-results/:attemptId", element: <ResultDetailV2 /> },
      { path: "v2/student/profile", element: <ProfileSettingsV2 /> },
      { path: "v2/student/wishlist", element: <WishlistListV2 /> },
      { path: "v2/student/rewards", element: <RewardsListV2 /> },
      { path: "v2/student/coupons", element: <StudentCoupons /> },
      { path: "v2/student/purchases", element: <PurchaseHistoryV2 /> },
      { path: "v2/student/blogs", element: <BlogWritingV2 /> },
      { path: "v2/student/settings", element: <SettingsIndex /> },
      { path: "v2/student/leaderboard", element: <LeaderboardIndex /> },
      { path: "v2/student/support", element: <SupportListV2 /> },
      { path: "v2/student/support/create", element: <SupportCreateV2 /> },
      { path: "v2/student/support/ticket/:id", element: <SupportChatV2 /> },
      { path: "*", element: <Error /> },
    ],
  },
]);

function App() {
  return (
    <AuthModalProvider>
      <Suspense fallback={null}>
        <RouterProvider router={router} />
      </Suspense>
    </AuthModalProvider>
  );
}

export default App;
