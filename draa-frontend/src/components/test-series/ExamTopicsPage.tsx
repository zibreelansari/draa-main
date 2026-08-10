



// import React, { useState, useEffect } from'react';
import toast from '../../utils/toast';
// import { useParams, Link } from'react-router-dom';
// import axios from'axios';
// // import url from'../../url';
// import HeaderOne from'../../layouts/headers/HeaderOne';
// import Breadcrumb from'../common/Breadcrumb';
// import FooterOne from'../../layouts/footers/FooterOne';
// import ScrollToTop from'../common/ScrollToTop';
// import ScrollTop from'../common/ScrollTop';
// import Preloader from'../common/Preloader';
// import InquiryPopUp from'../common/studentInqury';
// import Swal from'sweetalert2';
// import'./ExamTopicsPage.css';
// import MainFooter from'../../layouts/footers/MainFooter';
// const GST_RATE = 0.18;
// // Add Razorpay types
// declare global {
//   interface Window {
//     Razorpay: any;
//   }
// }

// interface TestSeries {
//   _id: string;
//   title: string;
//   seriesNumber?: number;
//   testType?: string;
//   difficulty?: string;
//   duration: number;
//   totalQuestions?: number;
//   totalMarks?: number;
//   isPaid: boolean;
//   price?: number;
//   description?: string;
// }

// interface Topic {
//   _id: string;
//   name: string;
//   code: string;
//   description?: string;
//   isPaid: boolean;
//   price?: number;
//   originalPrice?: number;
//   discount?: number;
//   difficulty?: string;
//   estimatedStudyTime?: number;
//   topicsCovered?: string[];
//   hasPurchased?: boolean;
//   testSeriesCount?: number;
//   subject: {
//     _id: string;
//     name: string;
//     code: string;
//   };
// }

// interface ExamData {
//   _id: string;
//   name: string;
//   code: string;
//   year: number;
//   description?: string;
// }

// const ExamTopicsPage: React.FC = () => {
//   const { examId } = useParams<{ examId: string }>();

//   const [loading, setLoading] = useState(true);
//   const [exam, setExam] = useState<ExamData | null>(null);
//   const [topics, setTopics] = useState<Topic[]>([]);
//   const [studentId, setStudentId] = useState<string>('');
//   const [studentData, setStudentData] = useState<any>(null);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [paymentProcessing, setPaymentProcessing] = useState(false);
//   const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

//   // Sidebar state
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [sidebarTopic, setSidebarTopic] = useState<Topic | null>(null);
//   const [sidebarTests, setSidebarTests] = useState<TestSeries[]>([]);
//   const [sidebarLoading, setSidebarLoading] = useState(false);
//   const [coinsBalance, setCoinsBalance] = useState<number>(0);
//   const [coinsUsed, setCoinsUsed] = useState<number>(0);
//   const COIN_VALUE = 0.10;
//   const MIN_COINS = 100;
//   // Load Razorpay script
//   useEffect(() => {
//     const script = document.createElement('script');
//     script.src ='https://checkout.razorpay.com/v1/checkout.js';
//     script.async = true;
//     document.body.appendChild(script);

//     return () => {
//       if (document.body.contains(script)) {
//         document.body.removeChild(script);
//       }
//     };
//   }, []);

//   const calculatePricing = (basePrice: number) => {

//     const gstAmount = basePrice * GST_RATE;
//     const totalAmount = basePrice + gstAmount;

//     const coinDiscount = coinsUsed * COIN_VALUE;

//     const finalAmount = Math.max(0, totalAmount - coinDiscount);

//     return {
//       basePrice,
//       gstAmount,
//       coinDiscount,
//       finalAmount
//     };
//   };

//   // Get Bearer Token Header
//   const getAuthHeaders = () => {
//     try {
//       const userStr = localStorage.getItem('edudocs');
//       if (!userStr) return {};
//       const user = JSON.parse(userStr);
//       const token = user?.token;
//       return token ? { Authorization: `Bearer ${token}` } : {};
//     } catch (err) {
//       console.error(' getAuthHeaders() parse error:', err);
//       return {};
//     }
//   };

//   // Check if user is logged in
//   useEffect(() => {
//     const userStr = localStorage.getItem('edudocs');
//     if (userStr) {
//       try {
//         const user = JSON.parse(userStr);
//         if (user?.id) {
//           setStudentId(user.id);
//           setStudentData(user);
//           setIsLoggedIn(true);
//         }
//       } catch (error) {
//         console.error(' Error parsing user:', error);
//         localStorage.removeItem('edudocs');
//       }
//     }
//   }, []);

//   // Fetch data
//   useEffect(() => {
//     if (examId) {
//       fetchExamAndTopics();
//     }

//     if (studentId) {
//       fetchCoins();
//     }

//   }, [examId, studentId]);
//   const fetchExamAndTopics = async () => {
//     try {
//       setLoading(true);

//       const examResponse = await axios.get(url +'/test-series/navigation/examinations');
//       if (examResponse.data.success) {
//         const examData = examResponse.data.data.examinationCategories.find(
//           (e: any) => e._id === examId
//         );
//         setExam(examData);
//       }

//       const subjectsResponse = await axios.get(
//         url +'/test-series/navigation/examinations/' + examId +'/subjects'
//       );

//       if (!subjectsResponse.data.success) {
//         setTopics([]);
//         setLoading(false);
//         return;
//       }

//       const subjects = subjectsResponse.data.data?.subjects || [];
//       if (subjects.length === 0) {
//         setTopics([]);
//         setLoading(false);
//         return;
//       }

//       let allTopics: Topic[] = [];

//       for (const subject of subjects) {
//         try {
//           const topicsResponse = await axios.get(
//             url +'/test-series/navigation/subjects/' + subject._id +'/topics'
//           );

//           if (topicsResponse.data.success) {
//             const subjectTopics = topicsResponse.data.data?.topicCategories || [];

//             for (const topic of subjectTopics) {
//               let testCount = 0;
//               try {
//                 const testSeriesResponse = await axios.get(
//                   url +'/test-series/navigation/topics/' + topic._id +'/test-series'
//                 );
//                 if (testSeriesResponse.data.success) {
//                   testCount = testSeriesResponse.data.data?.testSeries?.length || 0;
//                 }
//               } catch (error) {
//                 console.log('Failed to fetch test count for', topic.name);
//               }

//               allTopics.push({
//                 ...topic,
//                 testSeriesCount: testCount,
//                 subject: {
//                   _id: subject._id,
//                   name: subject.name,
//                   code: subject.code
//                 }
//               });
//             }
//           }
//         } catch (error) {
//           console.error('Error fetching topics for subject:', subject.name);
//         }
//       }

//       if (isLoggedIn && studentId) {
//         const topicsWithPurchaseStatus = await Promise.all(
//           allTopics.map(async (topic) => {
//             try {
//               const purchaseCheck = await axios.get(
//                 url +'/topic-purchase/check-purchase/' + topic._id,
//                 {
//                   params: { student_id: studentId },
//                   headers: { ...getAuthHeaders() }
//                 }
//               );
//               return {
//                 ...topic,
//                 hasPurchased: purchaseCheck.data.purchased || false
//               };
//             } catch (error: any) {
//               return { ...topic, hasPurchased: false };
//             }
//           })
//         );
//         setTopics(topicsWithPurchaseStatus);
//       } else {
//         setTopics(allTopics.map(topic => ({ ...topic, hasPurchased: false })));
//       }
//     } catch (error: any) {
//       console.error('Error:', error);
//       setTopics([]);
//     } finally {
//       setLoading(false);
//     }
//   };
//   const fetchCoins = async () => {
//     try {
//       if (!studentId) return;

//       const res = await axios.get(
//         url +"/student/wallet",
//         {
//           headers: { ...getAuthHeaders() }
//         }
//       );

//       if (res.data.success) {
//         setCoinsBalance(res.data.wallet?.balance || 0);
//       }

//     } catch (err) {
//       console.log("Failed to load coins");
//     }
//   };
//   const requireLogin = (actionText: string ='continue') => {
//     if (!isLoggedIn) {
//       Swal.fire({
//         icon:'warning',
//         title:'Login Required',
//         text: `Please login to ${actionText}`,
//         showCancelButton: true,
//         confirmButtonText:'Login Now',
//         cancelButtonText:'Cancel',
//         confirmButtonColor:'#9b6118',
//         cancelButtonColor:'#6c757d',
//         reverseButtons: true
//       }).then((result) => {
//         if (result.isConfirmed) {
//           sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
//           window.location.href ='/student-login';
//         }
//       });
//       return false;
//     }
//     return true;
//   };

//   const requireToken = () => {
//     const headers = getAuthHeaders();
//     if (!headers?.Authorization) {
//       Swal.fire({
//         icon:'warning',
//         title:'Session Expired',
//         text:'Please login again to continue.',
//         confirmButtonColor:'#9b6118',
//         confirmButtonText:'Login'
//       }).then(() => {
//         localStorage.removeItem("edudocs");
//         sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
//         window.location.href ='/student-login';
//       });
//       return false;
//     }
//     return true;
//   };

//   const handlePreviewTests = async (topic: Topic) => {
//     setSidebarTopic(topic);
//     setSidebarOpen(true);
//     setSidebarLoading(true);
//     setSidebarTests([]);

//     try {
//       const response = await axios.get(
//         url +'/test-series/navigation/topics/' + topic._id +'/test-series'
//       );

//       if (response.data.success) {
//         const tests = response.data.data?.testSeries || [];
//         setSidebarTests(tests);
//       }
//     } catch (error) {
//       console.error(' Error loading tests:', error);
//       setSidebarTests([]);
//     } finally {
//       setSidebarLoading(false);
//     }
//   };

//   const handleCloseSidebar = () => {
//     setSidebarOpen(false);
//     setTimeout(() => {
//       setSidebarTopic(null);
//       setSidebarTests([]);
//     }, 300);
//   };



//   const handleFreePurchase = async (topic: Topic) => {
//     if (!requireLogin('purchase this topic')) return;
//     if (!requireToken()) return;

//     setPaymentProcessing(true);
//     setSelectedTopic(topic);

//     try {
//       const requestData = {
//         topic_category_id: topic._id,
//         student_data: {
//           id: studentId,
//           email: studentData.email ||'',
//           name: studentData.name ||'',
//           phone: studentData.phone ||''
//         }
//       };

//       const purchaseResponse = await axios.post(
//         url +'/topic-purchase/create-free-purchase',
//         requestData,
//         {
//           headers: {
//"Content-Type":"application/json",
//             ...getAuthHeaders()
//           }
//         }
//       );

//       if (purchaseResponse.data.success) {
//         Swal.fire({
//           icon:'success',
//           title:'Access Granted!',
//           text: `You now have access to all ${topic.testSeriesCount || 0} tests in ${topic.name}!`,
//           confirmButtonColor:'#9b6118',
//           confirmButtonText:'Start Learning'
//         }).then((result) => {
//           if (result.isConfirmed) {
//             window.location.href ='/sudent/my-test-series/' + studentId;
//           }
//         });
//         await fetchExamAndTopics();
//       } else {
//         throw new Error(purchaseResponse.data.message ||'Failed to process free purchase');
//       }
//     } catch (error: any) {
//       if (error.response?.data?.message?.includes('already purchased')) {
//         Swal.fire({
//           icon:'info',
//           title:'Already Enrolled',
//           text:'You already have access to this topic!',
//           confirmButtonColor:'#9b6118'
//         }).then(() => {
//           window.location.href ='/sudent/my-test-series/' + studentId;
//         });
//       } else {
//         toast.error(error.response?.data?.message ||'Failed to process request');
//       }
//     } finally {
//       setPaymentProcessing(false);
//       setSelectedTopic(null);
//     }
//   };

//   const handlePurchase = async (topic: Topic) => {
//     if (!requireLogin('purchase this topic')) return;
//     if (!requireToken()) return;

//     if (!topic.isPaid || !topic.price || topic.price === 0) {
//       await handleFreePurchase(topic);
//       return;
//     }

//     setPaymentProcessing(true);
//     setSelectedTopic(topic);

//     try {
//       const requestData = {
//         topic_category_id: topic._id,
//         coins_used: coinsUsed,   //  ADD THIS LINE
//         student_data: {
//           id: studentId,
//           email: studentData.email ||'',
//           name: studentData.name ||'',
//           phone: studentData.phone ||''
//         }
//       };

//       const orderResponse = await axios.post(
//         url +'/topic-purchase/create-order',
//         requestData,
//         {
//           headers: {
//"Content-Type":"application/json",
//             ...getAuthHeaders()
//           }
//         }
//       );

//       if (!orderResponse.data.success) {
//         throw new Error(orderResponse.data.message ||'Failed to create order');
//       }

//       const { orderId, amount, currency } = orderResponse.data;

//       const options = {
//         key: import.meta.env.VITE_RAZORPAY_TEST_KEY,
//         amount: amount,
//         currency: currency,
//         name:'Draa',
//         description:'Purchase:' + topic.name,
//         order_id: orderId,
//         prefill: {
//           name: studentData?.name ||'',
//           email: studentData?.email ||'',
//           contact: studentData?.phone ||''
//         },
//         theme: { color:'#9b6118' },
//         handler: async (response: any) => {
//           await verifyPayment(response, topic);
//         },
//         modal: {
//           ondismiss: () => {
//             setPaymentProcessing(false);
//             setSelectedTopic(null);
//           }
//         }
//       };

//       const razorpay = new window.Razorpay(options);
//       razorpay.open();
//     } catch (error: any) {
//       toast.error(error.response?.data?.message ||'Failed to create order');
//       setPaymentProcessing(false);
//       setSelectedTopic(null);
//     }
//   };

//   const verifyPayment = async (paymentResponse: any, topic: Topic) => {
//     try {
//       if (!requireToken()) return;

//       const requestData = {
//         topic_category_id: topic._id,
//         coins_used: coinsUsed,
//         razorpay_order_id: paymentResponse.razorpay_order_id,
//         razorpay_payment_id: paymentResponse.razorpay_payment_id,
//         razorpay_signature: paymentResponse.razorpay_signature,
//         student_data: {
//           id: studentId,
//           email: studentData.email ||'',
//           name: studentData.name ||'',
//           phone: studentData.phone ||''
//         }
//       };

//       const verifyResponse = await axios.post(
//         url +'/topic-purchase/verify-payment',
//         requestData,
//         {
//           headers: {
//"Content-Type":"application/json",
//             ...getAuthHeaders()
//           }
//         }
//       );

//       if (verifyResponse.data.success) {
//         Swal.fire({
//           icon:'success',
//           title:'Payment Successful!',
//           text:'You now have access to all tests in this topic.',
//           confirmButtonColor:'#9b6118'
//         });
//         await fetchExamAndTopics();
//       } else {
//         Swal.fire({
//           icon:'error',
//           title:'Verification Failed',
//           text:'Payment verification failed. Please contact support.',
//           confirmButtonColor:'#9b6118'
//         });
//       }
//     } catch (error: any) {
//       Swal.fire({
//         icon:'error',
//         title:'Verification Error',
//         text:'Payment verification failed. Please contact support.',
//         confirmButtonColor:'#9b6118'
//       });
//     } finally {
//       setPaymentProcessing(false);
//       setSelectedTopic(null);
//     }
//   };

//   const handleViewTests = (topicId: string) => {
//     if (!requireLogin('access your tests')) return;
//     window.location.href ='/sudent/my-test-series/' + studentId;
//   };

//   const handleStartTest = (testId: string) => {
//     if (!requireLogin('start this test')) return;
//     window.location.href ='/sudent/my-test-series/' + testId;
//   };

//   const canAccessTest = (): boolean => {
//     if (!isLoggedIn) return false;
//     return sidebarTopic?.hasPurchased === true;
//   };

//   // Calculate totals
//   const totalMockTests = topics.reduce((sum, t) => sum + (t.testSeriesCount || 0), 0);
//   const totalSubjects = [...new Set(topics.map(t => t.subject._id))].length;
//   const totalQuestions = totalMockTests * 100; // Estimate
//   const isTopicSellable = (topic: Topic) => {
//     return topic.isPaid && topic.price && topic.price > 0;
//   };

//   const hasPlayableTests = (topic: Topic) => {
//     return (topic.testSeriesCount || 0) > 0;
//   };

//   const firstSellableTopic = topics.find(isTopicSellable);


//   if (loading) {
//     return (
//       <>
//         {/* <Preloader /> */}
//         <div className="exam-topics-loading">
//           <div className="spinner"></div>
//           <p>Loading topics...</p>
//         </div>
//       </>
//     );
//   }

//   return (
//     <>
//       {/* <Preloader /> */}
//       <HeaderOne />
//       {/* <Breadcrumb title="Test Series" subtitle="Test Series" /> */}

//       <div className="exam-topics-wrapper">
//         <div className="exam-topics-container">
//           {/* Breadcrumb */}
//           <nav className="figma-breadcrumb">
//             <Link to="/">Home</Link>
//             <span className="separator"></span>
//             <Link to="/online-test-series">Test Series</Link>
//             <span className="separator"></span>
//             <span className="current">{exam?.name ||'Loading...'}</span>
//           </nav>

//           {/* Main Grid Layout */}
//           <div className="figma-main-grid">
//             {/* Left Content */}
//             <div className="figma-left-content">
//               {/* Header Section */}
//               <div className="figma-header-section">
//                 <div className="figma-exam-badge">
//                   <span className="badge-code">{exam?.code}</span>
//                   <span className="badge-year">{exam?.year}</span>
//                 </div>
//                 <h1 className="figma-title">{exam?.name}</h1>
//                 <p className="figma-description">{exam?.description ||'Updated questions based on PYQ analysis and more. Designed to simulate the real-time exam environment with expert-curated content to boost your preparation.'}</p>

//                 {/* Features Row */}
//                 <div className="figma-features-row">
//                   <div className="feature-item">
//                     <div className="feature-icon">
//                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                         <path d="M9 11H15M9 15H15M21 7V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V7C3 4 4.5 2 8 2H16C19.5 2 21 4 21 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//                       </svg>
//                     </div>
//                     <div className="feature-text">
//                       <div className="feature-title">Full-length tests</div>
//                       <div className="feature-subtitle">Real exam feel</div>
//                     </div>
//                   </div>

//                   <div className="feature-item">
//                     <div className="feature-icon">
//                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                         <path d="M22 10V15C22 20 20 22 15 22H9C4 22 2 20 2 15V9C2 4 4 2 9 2H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//                         <path d="M22 10H18C15 10 14 9 14 6V2L22 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//                       </svg>
//                     </div>
//                     <div className="feature-text">
//                       <div className="feature-title">Detailed solutions</div>
//                       <div className="feature-subtitle">Comprehensive analysis</div>
//                     </div>
//                   </div>

//                   <div className="feature-item">
//                     <div className="feature-icon">
//                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                         <path d="M18 18.86H17.24C16.44 18.86 15.68 19.17 15.12 19.73L13.41 21.42C12.63 22.19 11.36 22.19 10.58 21.42L8.87 19.73C8.31 19.17 7.54 18.86 6.75 18.86H6C4.34 18.86 3 17.53 3 15.89V4.97C3 3.33 4.34 2 6 2H18C19.66 2 21 3.33 21 4.97V15.88C21 17.52 19.66 18.86 18 18.86Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" />
//                         <path d="M12 10C13.2869 10 14.33 8.95681 14.33 7.67C14.33 6.38319 13.2869 5.34 12 5.34C10.7132 5.34 9.67004 6.38319 9.67004 7.67C9.67004 8.95681 10.7132 10 12 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//                         <path d="M16 15.66C16 13.86 14.21 12.4 12 12.4C9.79 12.4 8 13.86 8 15.66" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//                       </svg>
//                     </div>
//                     <div className="feature-text">
//                       <div className="feature-title">Performance Analysis</div>
//                       <div className="feature-subtitle">Track your progress</div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Test Series Structure */}
//               <div className="figma-structure-section">
//                 <div className="structure-header">
//                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                     <path d="M22 16.74V4.67C22 3.47 21.02 2.58 19.83 2.68H19.77C17.67 2.86 14.48 3.93 12.7 5.05L12.53 5.16C12.24 5.34 11.76 5.34 11.47 5.16L11.22 5.01C9.44 3.9 6.26 2.84 4.16 2.67C2.97 2.57 2 3.47 2 4.66V16.74C2 17.7 2.78 18.6 3.74 18.72L4.03 18.76C6.2 19.05 9.55 20.15 11.47 21.2L11.51 21.22C11.78 21.37 12.21 21.37 12.47 21.22C14.39 20.16 17.75 19.05 19.93 18.76L20.26 18.72C21.22 18.6 22 17.7 22 16.74Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//                     <path d="M12 5.49V20.49" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//                   </svg>
//                   <span>Test Series Structure</span>
//                 </div>

//                 <div className="structure-grid">
//                   <div className="structure-card">
//                     <div className="structure-icon">
//                       <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
//                         <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//                         <path d="M15.5 9.75C16.3284 9.75 17 9.07843 17 8.25C17 7.42157 16.3284 6.75 15.5 6.75C14.6716 6.75 14 7.42157 14 8.25C14 9.07843 14.6716 9.75 15.5 9.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//                       </svg>
//                     </div>
//                     <div className="structure-value">{totalMockTests}</div>
//                     <div className="structure-label">Mock<br />TESTS</div>
//                   </div>

//                   <div className="structure-card">
//                     <div className="structure-icon">
//                       <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
//                         <path d="M22 16.74V4.67C22 3.47 21.02 2.58 19.83 2.68H19.77C17.67 2.86 14.48 3.93 12.7 5.05L12.53 5.16C12.24 5.34 11.76 5.34 11.47 5.16L11.22 5.01C9.44 3.9 6.26 2.84 4.16 2.67C2.97 2.57 2 3.47 2 4.66V16.74C2 17.7 2.78 18.6 3.74 18.72L4.03 18.76C6.2 19.05 9.55 20.15 11.47 21.2L11.51 21.22C11.78 21.37 12.21 21.37 12.47 21.22C14.39 20.16 17.75 19.05 19.93 18.76L20.26 18.72C21.22 18.6 22 17.7 22 16.74Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//                       </svg>
//                     </div>
//                     <div className="structure-value">{totalSubjects}</div>
//                     <div className="structure-label">Subject<br />WISE</div>
//                   </div>

//                   <div className="structure-card">
//                     <div className="structure-icon">
//                       <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
//                         <path d="M8 2V5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" />
//                         <path d="M16 2V5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" />
//                         <path d="M3.5 9.09H20.5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" />
//                         <path d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" />
//                       </svg>
//                     </div>
//                     <div className="structure-value">{totalQuestions}+</div>
//                     <div className="structure-label"><br />QUESTIONS</div>
//                   </div>
//                 </div>
//               </div>

//               {/* Available Tests */}
//               {/* ================= Available Tests ================= */}
//               <div className="figma-tests-section">
//                 <div className="tests-header">
//                   <h2>Available Tests</h2>
//                   <span className="tests-count">
//                     Total: {topics.filter(t => (t.testSeriesCount || 0) > 0).length} Topics
//                   </span>
//                 </div>

//                 <div className="tests-table-wrapper">
//                   <table className="figma-tests-table">
//                     <thead>
//                       <tr>
//                         <th style={{ width:'50px' }}></th>
//                         <th>TEST NAME</th>
//                         <th style={{ width:'120px' }}>TYPE</th>
//                         <th style={{ width:'120px' }}>QUESTIONS</th>
//                         <th style={{ width:'120px' }}>DURATION</th>
//                         <th style={{ width:'140px' }}>STATUS</th>
//                       </tr>
//                     </thead>

//                     <tbody>
//                       {topics.filter(t => (t.testSeriesCount || 0) > 0).length === 0 ? (
//                         <tr>
//                           <td colSpan={6} style={{ textAlign:'center', padding:'40px' }}>
//                             <div style={{ color:'#9ca3af' }}>
//                               Tests are coming soon for this exam.
//                             </div>
//                           </td>
//                         </tr>
//                       ) : (
//                         topics
//                           .filter(topic => (topic.testSeriesCount || 0) > 0)
//                           .map((topic, index) => {
//                             const totalQuestions = (topic.testSeriesCount || 0) * 100;
//                             const totalDuration = (topic.testSeriesCount || 0) * 120;

//                             return (
//                               <tr key={topic._id} className="test-row">
//                                 <td>
//                                   <div className="test-number">
//                                     {String(index + 1).padStart(2,'0')}
//                                   </div>
//                                 </td>

//                                 <td>
//                                   <div className="test-name-cell">
//                                     <div className="test-name">{topic.name}</div>
//                                     {topic.description && (
//                                       <div className="test-description">
//                                         {topic.description}
//                                       </div>
//                                     )}
//                                   </div>
//                                 </td>

//                                 <td>
//                                   <span className="test-type-badge">
//                                     {topic.isPaid ?'Full Length' :'Free'}
//                                   </span>
//                                 </td>

//                                 <td>
//                                   <span className="test-questions">
//                                     {totalQuestions} Qs
//                                   </span>
//                                 </td>

//                                 <td>
//                                   <span className="test-duration">
//                                     {totalDuration} Mins
//                                   </span>
//                                 </td>

//                                 <td>
//                                   {topic.hasPurchased ? (
//                                     <button
//                                       className="status-btn available"
//                                       onClick={() => handleViewTests(topic._id)}
//                                     >
//                                       AVAILABLE
//                                     </button>
//                                   ) : (
//                                     <button
//                                       className="status-btn locked"
//                                       onClick={() => handlePreviewTests(topic)}
//                                     >
//                                       <svg
//                                         width="12"
//                                         height="12"
//                                         viewBox="0 0 24 24"
//                                         fill="none"
//                                       >
//                                         <path
//                                           d="M6 10V8C6 4.69 7 2 12 2C17 2 18 4.69 18 8V10"
//                                           stroke="currentColor"
//                                           strokeWidth="1.5"
//                                           strokeLinecap="round"
//                                         />
//                                         <path
//                                           d="M12 18.5C13.3807 18.5 14.5 17.3807 14.5 16C14.5 14.6193 13.3807 13.5 12 13.5C10.6193 13.5 9.5 14.6193 9.5 16C9.5 17.3807 10.6193 18.5 12 18.5Z"
//                                           stroke="currentColor"
//                                           strokeWidth="1.5"
//                                           strokeLinecap="round"
//                                         />
//                                         <path
//                                           d="M17 22H7C3 22 2 21 2 17V15C2 11 3 10 7 10H17C21 10 22 11 22 15V17C22 21 21 22 17 22Z"
//                                           stroke="currentColor"
//                                           strokeWidth="1.5"
//                                           strokeLinecap="round"
//                                         />
//                                       </svg>
//                                       LOCKED
//                                     </button>
//                                   )}
//                                 </td>
//                               </tr>
//                             );
//                           })
//                       )}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Unlock hint */}
//                 {topics.some(t => (t.testSeriesCount || 0) > 0) &&
//                   !topics.every(t => t.hasPurchased) && (
//                     <div className="unlock-message">
//                       Unlock all tests by enrolling in the test series.
//                     </div>
//                   )}
//               </div>
//             </div>

//             {/* Right Sidebar */}
//             <div className="figma-right-sidebar">
//               <div className="sidebar-sticky">
//                 {/* Price Card */}
//                 <div className="figma-price-card">
//                   {firstSellableTopic ? (
//                     <>
//                       <div className="price-header">
//                         <div className="price-main">
//                           <span className="price-symbol"></span>
//                           {(() => {
//                             const pricing = calculatePricing(firstSellableTopic.price || 0);

//                             return (
//                               <>
//                                 <span className="price-symbol"></span>
//                                 <span className="price-value">
//                                   {pricing.finalAmount.toFixed(0)}
//                                 </span>

//                                 <div style={{ fontSize: 12, color:"#666", marginTop: 4 }}>
//                                   Base {pricing.basePrice} + GST {pricing.gstAmount.toFixed(0)}
//                                 </div>
//                               </>
//                             );
//                           })()}
//                         </div>

//                         {firstSellableTopic.originalPrice && (
//                           <div className="price-old">
//                             <span className="old-value">{firstSellableTopic.originalPrice}</span>
//                             {firstSellableTopic.discount && (
//                               <span className="discount-badge">{firstSellableTopic.discount}% OFF</span>
//                             )}
//                           </div>
//                         )}
//                       </div>

//                       <div className="price-note">
//                         {(firstSellableTopic.testSeriesCount || 0) > 0
//                           ? `Includes ${firstSellableTopic.testSeriesCount} tests`
//                           :'Tests will be available soon'}
//                       </div>

//                       <div style={{ marginTop: 12 }}>

//                         <div style={{ fontSize: 13, marginBottom: 4 }}>
//                           Coins available: <b>{coinsBalance}</b>
//                         </div>

//                         <input
//                           type="number"
//                           min={0}
//                           max={coinsBalance}
//                           value={coinsUsed}
//                           onChange={(e) => {

//                             let val = Number(e.target.value);

//                             if (val > coinsBalance) {
//                               toast.warning("Not enough coins");
//                               val = coinsBalance;
//                             }

//                             if (val < 0) val = 0;

//                             if (val > 0 && val < MIN_COINS) {
//                               toast.info("Minimum 100 coins required to apply discount");
//                             }

//                             setCoinsUsed(val);

//                           }}
//                           style={{
//                             width:"100%",
//                             padding:"6px",
//                             border:"1px solid #ddd",
//                             borderRadius: 6
//                           }}
//                           placeholder="Use coins"
//                         />

//                         {coinsUsed >= MIN_COINS && (
//                           <div style={{ fontSize: 12, color:"#666", marginTop: 4 }}>
//                             Discount {coinsUsed >= MIN_COINS ? (coinsUsed * COIN_VALUE).toFixed(2) : 0}
//                           </div>
//                         )}

//                       </div>

//                     </>
//                   ) : (
//                     <div className="price-note">Tests will be added soon</div>
//                   )}

//                   {/* <div className="price-note">Limited time offer includes all 38 tests</div> */}

//                   {/* Benefits */}
//                   <div className="benefits-list">
//                     <div className="benefit-item">
//                       <div className="benefit-icon">
//                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                           <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//                           <path d="M7.75 12L10.58 14.83L16.25 9.17004" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//                         </svg>
//                       </div>
//                       <div className="benefit-text">
//                         <div className="benefit-title">Comprehensive Coverage</div>
//                         <div className="benefit-subtitle">Every topic included as per official syllabus</div>
//                       </div>
//                     </div>

//                     <div className="benefit-item">
//                       <div className="benefit-icon">
//                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                           <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//                           <path d="M12 8V12L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//                         </svg>
//                       </div>
//                       <div className="benefit-text">
//                         <div className="benefit-title">Anywhere Access</div>
//                         <div className="benefit-subtitle">Practice on mobile or desktop anytime</div>
//                       </div>
//                     </div>

//                     <div className="benefit-item">
//                       <div className="benefit-icon">
//                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                           <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//                           <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//                         </svg>
//                       </div>
//                       <div className="benefit-text">
//                         <div className="benefit-title">Validity</div>
//                         <div className="benefit-subtitle">Valid for 1 year from the date of purchase</div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* CTA Button */}
//                   {isLoggedIn && topics.length > 0 && topics.every(t => t.hasPurchased) ? (
//                     <button className="figma-cta-btn purchased" disabled>
//                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//                         <path
//                           d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
//                           stroke="currentColor"
//                           strokeWidth="1.5"
//                         />
//                         <path
//                           d="M7.75 12L10.58 14.83L16.25 9.17004"
//                           stroke="currentColor"
//                           strokeWidth="1.5"
//                           strokeLinecap="round"
//                         />
//                       </svg>
//                       Already Purchased
//                     </button>
//                   ) : firstSellableTopic ? (
//                     <button
//                       className="figma-cta-btn"
//                       onClick={() => handlePurchase(firstSellableTopic)}
//                       disabled={paymentProcessing || !hasPlayableTests(firstSellableTopic)}
//                     >
//                       {hasPlayableTests(firstSellableTopic) ?'Buy Now' :'Coming Soon'}
//                     </button>
//                   ) : (
//                     <button className="figma-cta-btn disabled" disabled>
//                       Tests Coming Soon
//                     </button>
//                   )}

//                   <button
//                     className="figma-preview-btn"
//                     onClick={() => handlePreviewTests(firstSellableTopic)}
//                     disabled={!firstSellableTopic || !hasPlayableTests(firstSellableTopic)}
//                   >
//                     Preview Tests
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Sidebar Overlay */}
//       {sidebarOpen && <div className="figma-sidebar-overlay" onClick={handleCloseSidebar}></div>}

//       {/* Sidebar Drawer */}
//       <div className={'figma-test-sidebar' + (sidebarOpen ?'open' :'')}>
//         <div className="sidebar-header">
//           <h3>{sidebarTopic?.name}</h3>
//           <button className="close-btn" onClick={handleCloseSidebar}>
//             <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
//               <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
//             </svg>
//           </button>
//         </div>

//         <div className="sidebar-body">
//           {sidebarLoading ? (
//             <div className="sidebar-loading">
//               <div className="spinner"></div>
//               <p>Loading tests...</p>
//             </div>
//           ) : sidebarTests.length === 0 ? (
//             <div className="sidebar-empty">
//               <p>No tests available</p>
//             </div>
//           ) : (
//             <div className="sidebar-tests-list">
//               {sidebarTests.map((test, index) => {
//                 const hasAccess = canAccessTest();
//                 return (
//                   <div key={test._id} className="sidebar-test-item">
//                     <div className="test-item-number">{String(index + 1).padStart(2,'0')}</div>
//                     <div className="test-item-content">
//                       <h4>{test.title}</h4>
//                       <div className="test-item-meta">
//                         <span>{test.duration} min</span>
//                         <span></span>
//                         <span>{test.totalQuestions || 100} Questions</span>
//                         {test.difficulty && (
//                           <>
//                             <span></span>
//                             <span className={'difficulty' + test.difficulty.toLowerCase()}>{test.difficulty}</span>
//                           </>
//                         )}
//                       </div>
//                     </div>
//                     <button
//                       className={'test-item-btn' + (hasAccess ?'start' :'locked')}
//                       onClick={() => hasAccess ? handleStartTest(test._id) : handlePurchase(sidebarTopic!)}
//                     >
//                       {hasAccess ?'Start' :'Locked'}
//                     </button>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>

//       <InquiryPopUp />
//       <MainFooter />
//       <ScrollToTop />
//       <ScrollTop />
//     </>
//   );
// };

// export default ExamTopicsPage;










































































































import React, { useState, useEffect } from'react';
import { useParams, Link, useNavigate } from'react-router-dom';
import axios from'axios';
import url from'../../url';
import MyBreadcrumb from'../common/Breadcrumb';
import HeaderOne from'../../layouts/headers/HeaderOne';
import ScrollToTop from'../common/ScrollToTop';
import ScrollTop from'../common/ScrollTop';
import InquiryPopUp from'../common/studentInqury';
import Swal from'sweetalert2';
import'./ExamTopicsPage.css';
import'../common/SkeletonLoader.css';
import MainFooter from'../../layouts/footers/MainFooter';

import { Heart, Star, Share2 } from'lucide-react';
import { fetchWishlist, addToWishlist, removeFromWishlist } from'../../utils/wishlistApi';
import { getUserRole, getStoredUser, isAuthenticated, getAuthHeaders as globalGetAuthHeaders } from'../../utils/global_auth';
import { Rate, Tag, Typography, Progress, Button } from'antd';
import { Plus, CheckCircle2, BadgeCheck } from'lucide-react';
import moment from'moment';
import TestSeriesReviewModal from'./TestSeriesReviewModal';
import usePageTitle from'../../hooks/usePageTitle';
const { Title, Text, Paragraph } = Typography;

const GST_RATE = 0.18;

// Add Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

//  Interfaces 

interface TestSeries {
  _id: string;
  title: string;
  seriesNumber?: number;
  testType?: string;
  difficulty?: string;
  duration: number;
  totalQuestions?: number;
  totalMarks?: number;
}

interface Topic {
  _id: string;
  name: string;
  code: string;
  description?: string;
  difficulty?: string;
  estimatedStudyTime?: number;
  topicsCovered?: string[];
  testSeriesCount?: number;
  subject: {
    _id: string;
    name: string;
    code: string;
    //  Pricing lives on SUBJECT now
    isPaid?: boolean;
    price?: number;
    originalPrice?: number;
    discount?: number;
  };
}

interface Subject {
  _id: string;
  name: string;
  code: string;
  isPaid?: boolean;
  price?: number;
  originalPrice?: number;
  discount?: number;
  hasPurchased?: boolean; //  access flag at subject level
}

interface ExamData {
  _id: string;
  name: string;
  code: string;
  year: number;
  description?: string;
  //  Category-level pricing
  isPaid?: boolean;
  price?: number;
  originalPrice?: number;
  discount?: number;
  hasPurchased?: boolean; //  access flag at category level
  statistics?: {
    totalSubjects?: number;
    totalTestSeries?: number;
    averageRating?: number;
    totalReviews?: number;
  };
}

//  Component 
const ExamTopicsPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<ExamData | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [studentId, setStudentId] = useState<string>('');
  const [studentData, setStudentData] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTopic, setSidebarTopic] = useState<Topic | null>(null);
  const [sidebarTests, setSidebarTests] = useState<TestSeries[]>([]);
  const [sidebarLoading, setSidebarLoading] = useState(false);

  // Coins
  const [coinsBalance, setCoinsBalance] = useState<number>(0);
  const [coinsUsed, setCoinsUsed] = useState<number>(0);

  // Inline test expansion
  const [topicTestsMap, setTopicTestsMap] = useState<{ [key: string]: TestSeries[] }>({});
  const [expandedTopics, setExpandedTopics] = useState<{ [key: string]: boolean }>({});

  // Purchase check
  const [categoryPurchased, setCategoryPurchased] = useState(false);
  const [purchasedSubjectIds, setPurchasedSubjectIds] = useState<Set<string>>(new Set());

  // Wishlist state
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [wishlistLoading, setWishlistLoading] = useState<string | null>(null);

  // Reviews integration
  const [activeTab, setActiveTab] = useState<'tests' |'reviews'>('tests');
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [visibleReviews, setVisibleReviews] = useState(3);

  // Set dynamic page title
  usePageTitle(exam?.name ||'Exam Topics');

  const COIN_VALUE = 0.10;
  const MIN_COINS = 100;

  //  Load Razorpay 

  useEffect(() => {
    const script = document.createElement('script');
    script.src ='https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  //  Pricing helpers 

  const calculatePricing = (basePrice: number) => {
    const gstAmount = basePrice * GST_RATE;
    const totalAmount = basePrice + gstAmount;
    const coinDiscount = coinsUsed >= MIN_COINS ? coinsUsed * COIN_VALUE : 0;
    const finalAmount = Math.max(0, totalAmount - coinDiscount);
    return { basePrice, gstAmount, coinDiscount, finalAmount };
  };

  //  Auth helpers 

  const getAuthHeaders = () => {
    return globalGetAuthHeaders();
  };

  const requireLogin = (actionText: string ='continue') => {
    if (!isAuthenticated()) {
      Swal.fire({
        icon:'warning',
        title:'Login Required',
        text: `Please login to ${actionText}`,
        showCancelButton: true,
        confirmButtonText:'Login Now',
        cancelButtonText:'Cancel',
        confirmButtonColor:'#9b6118',
        cancelButtonColor:'#6c757d',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
          window.location.href ='/student-login';
        }
      });
      return false;
    }
    return true;
  };

  const requireToken = () => {
    if (!isAuthenticated()) {
      Swal.fire({
        icon:'warning',
        title:'Session Expired',
        text:'Please login again to continue.',
        confirmButtonColor:'#9b6118',
        confirmButtonText:'Login'
      }).then(() => {
        localStorage.removeItem('edudocs');
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.href ='/student-login';
      });
      return false;
    }
    return true;
  };

  //  Auth init 

  useEffect(() => {
    const user = getStoredUser();
    if (user && user.id) {
      setStudentId(user.id);
      setStudentData(user);
      setIsLoggedIn(true);
    }
  }, []);

  //  Data fetch 

  useEffect(() => {
    if (examId) fetchExamAndTopics();
    if (studentId) {
      fetchCoins();
    }
  }, [examId, studentId]);

  /*  WISHLIST  */
  useEffect(() => {
    const role = getUserRole();
    if (role !=='STUDENT' || !studentId) return;

    const loadWishlist = async () => {
      try {
        const items = await fetchWishlist();
        const ids = new Set<string>(
          items
            .filter((i: any) => i.item_type ==='test_series' || i.item_type ==='topic')
            .map((i: any) => String(i.item_id))
        );
        setWishlistIds(ids);
      } catch (err) {
        console.error('Failed to load wishlist:', err);
      }
    };
    loadWishlist();
  }, [studentId]);

  const toggleWishlist = async (item: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (wishlistLoading) return;

    const role = getUserRole();

    if (role ==='GUEST') {
      Swal.fire({
        title:'Login Required',
        text:'Please login as a student to use wishlist',
        icon:'info',
        showCancelButton: true,
        confirmButtonText:'Login Now' }).then(res => {
        if (res.isConfirmed) navigate('/student-login');
      });
      return;
    }

    if (role !=='STUDENT') {
      toast.error(`Access Denied: As a ${role.toLowerCase()}, you are not permitted to use the wishlist. This feature is reserved for students.`);
      return;
    }

    const isTopic = !!item.subject;
    const itemType = isTopic ?'topic' :'test_series';
    const alreadyWishlisted = wishlistIds.has(item._id);

    try {
      setWishlistLoading(item._id);

      if (alreadyWishlisted) {
        const res = await removeFromWishlist({
          item_type: itemType,
          item_id: item._id });

        if (res?.success) {
          setWishlistIds(prev => {
            const s = new Set(prev);
            s.delete(item._id);
            return s;
          });
          toast.success('Removed from wishlist');
        }
      } else {
        const res = await addToWishlist({
          item_type: itemType,
          item_id: item._id,
          snapshot: isTopic ? {
            name: item.name,
            code: item.code,
            subject_name: item.subject?.name } : {
            name: item.name,
            code: item.code,
            year: item.year } });

        if (res?.success || res?.message ==='Already in wishlist') {
          setWishlistIds(prev => new Set(prev).add(item._id));
          toast.success('Added to wishlist');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Wishlist action failed');
    } finally {
      setWishlistLoading(null);
    }
  };

  const handleShareExam = async (exam: any) => {
    const shareUrl = `${window.location.origin}/test-series/examination/${exam._id}`;
    const shareData = {
      title: exam.name,
      text: exam.description || `Check out ${exam.name} test series on Draa!`,
      url: shareUrl };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        navigator.clipboard.writeText(shareUrl);
        toast.info("Link copied to clipboard!");
      }
    }
  };

  const fetchExamAndTopics = async () => {
    try {
      setLoading(true);

      //  ONE CALL TO FETCH EVERYTHING! (Replaces ~100+ separate calls)
      const hierarchyResponse = await axios.get(url +'/test-series/hierarchy/full/' + examId);
      
      if (!hierarchyResponse.data.success) {
        setTopics([]);
        setSubjects([]);
        setLoading(false);
        return;
      }

      const { exam, subjects } = hierarchyResponse.data.data;

      // 1. Set Exam
      setExam(exam);

      // 2. Set Subjects
      setSubjects(subjects);

      // 3. Check purchase status (Keep existing logic)
      if (studentId) {
        await checkPurchaseStatus(examId!, subjects.map((s: any) => s._id));
      }

      // 4. Flatten subjects into topics for the table
      let allTopics: Topic[] = [];
      const newTopicTestsMap: Record<string, TestSeries[]> = {};

      subjects.forEach((subject: any) => {
        if (subject.topics) {
          subject.topics.forEach((topic: any) => {
            // Flatten the subject info into the topic for backward compatibility
            const flattenedTopic: Topic = {
              ...topic,
              subject: {
                _id: subject._id,
                name: subject.name,
                code: subject.code,
                isPaid: subject.isPaid,
                price: subject.price,
                originalPrice: subject.originalPrice,
                discount: subject.discount },
              // Calculate total questions if needed
              totalQuestions: topic.testSeries?.reduce((sum: number, ts: any) => sum + (ts.totalMarks || 0), 0) || 0
            };

            allTopics.push(flattenedTopic);

            // Populate the tests map so expansion is instant
            if (topic.testSeries) {
              newTopicTestsMap[topic._id] = topic.testSeries;
            }
          });
        }
      });

      setTopics(allTopics);
      setTopicTestsMap(newTopicTestsMap);

    } catch (error: any) {
      console.error('Error in Bulk Hierarchy Fetch:', error);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!examId) return;
    setReviewsLoading(true);
    try {
      const res = await axios.get(`${url}/test-series/review/${examId}`);
      if (res.data.success) {
        setReviews(res.data.reviews);
        setReviewStats(res.data.stats);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [examId]);

  //  Purchase status check 

  /**
   * Checks if the user has purchased the full category OR individual subjects.
   * Sets categoryPurchased and purchasedSubjectIds accordingly.
   */
  const checkPurchaseStatus = async (categoryId: string, subjectIds: string[]) => {
    try {
      if (!studentId) return;

      //  ONE CALL TO CHECK ALL PURCHASES (Category + All Subjects)
      const res = await axios.get(
        url +'/test-series-enrollment/purchase/check-bulk-purchase',
        {
          params: {
            categoryId,
            subjectIds: subjectIds.join(','),
            student_id: studentId
          },
          headers: { ...getAuthHeaders() }
        }
      );

      if (res.data.success) {
        setCategoryPurchased(res.data.categoryPurchased);
        setPurchasedSubjectIds(new Set(res.data.purchasedSubjectIds));
      }

    } catch (err) {
      console.log(' Bulk purchase check failed:', err);
    }
  };

  /**
   * Returns true if user has access to a given topic
   * (either bought full category OR the topic's subject)
   */
  const hasAccessToTopic = (topic: Topic): boolean => {
    //  Free category  full access
    if (!exam?.isPaid) return true;

    //  Category purchased  full access
    if (categoryPurchased) return true;

    //  Subject purchased  access
    if (purchasedSubjectIds.has(topic.subject._id)) return true;

    return false;
  };

  //  Coins 

  const fetchCoins = async () => {
    try {
      if (!studentId) return;
      const res = await axios.get(url +'/student/wallet', {
        headers: { ...getAuthHeaders() }
      });
      if (res.data.success) {
        setCoinsBalance(res.data.wallet?.balance || 0);
      }
    } catch (err) {
      console.log('Failed to load coins');
    }
  };

  //  Payment 

  /**
   * Unified purchase handler  works for CATEGORY or SUBJECT.
   * type:"category" |"subject"
   * id:   the _id of what is being purchased
   * price: the base price (before GST/coins)
   * name: display name for Razorpay
   */
  const handlePurchase = async (
    type:'category' |'subject',
    id: string,
    price: number,
    name: string
  ) => {
    if (!requireLogin('purchase this')) return;
    const role = getUserRole();
    if (role ==='TEACHER' || role ==='ADMIN') {
      return Swal.fire({
        title:"Action Restricted",
        text: `As a ${role.toLowerCase()}, you are not permitted to purchase test series. This feature is reserved for students.`,
        icon:"warning" });
    }
    if (!requireToken()) return;

    if (!id || !type) {
      toast.error('Invalid purchase request');
      return;
    }

    if (!price || price <= 0) {
      toast.warning('This item is free');
      return;
    }

    setPaymentProcessing(true);

    try {
      //  CREATE ORDER
      const orderResponse = await axios.post(
        url +'/test-series-enrollment/purchase/create-order',
        {
          type,
          item_id: id, //  FIXED
          coins_used: coinsUsed || 0,
          student_data: {
            id: studentId,
            email: studentData?.email ||'',
            name: studentData?.name ||'',
            phone: studentData?.phone ||''
          }
        },
        {
          headers: {
'Content-Type':'application/json',
            ...getAuthHeaders()
          }
        }
      );

      if (!orderResponse.data?.success) {
        throw new Error(orderResponse.data?.message ||'Failed to create order');
      }

      const { orderId, amount, currency } = orderResponse.data;

      //  RAZORPAY OPTIONS
      const options = {
        key: import.meta.env.VITE_RAZORPAY_LIVE_KEY,
        amount,
        currency,
        name:'Draa',
        description: `Purchase: ${name}`,
        order_id: orderId,

        prefill: {
          name: studentData?.name ||'',
          email: studentData?.email ||'',
          contact: studentData?.phone ||''
        },

        theme: { color:'#9b6118' },

        handler: async (response: any) => {
          await verifyPayment(response, type, id);
        },

        modal: {
          ondismiss: () => {
            setPaymentProcessing(false);
            toast.info('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error: any) {
      console.error(' Order error:', error);

      toast.error(
        error.response?.data?.message ||
        error.message ||
'Failed to initiate payment'
      );

      setPaymentProcessing(false);
    }
  };

  const verifyPayment = async (
    paymentResponse: any,
    type:'category' |'subject',
    id: string
  ) => {
    try {
      if (!requireToken()) return;

      //  VERIFY PAYMENT
      const verifyResponse = await axios.post(
        url +'/test-series-enrollment/purchase/verify-payment',
        {
          type,
          item_id: id, //  FIXED
          coins_used: coinsUsed || 0,

          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,

          student_data: {
            id: studentId,
            email: studentData?.email ||'',
            name: studentData?.name ||'',
            phone: studentData?.phone ||''
          }
        },
        {
          headers: {
'Content-Type':'application/json',
            ...getAuthHeaders()
          }
        }
      );

      if (verifyResponse.data?.success) {
        //  SUCCESS UI
        Swal.fire({
          icon:'success',
          title:'Payment Successful!',
          text:'Access unlocked successfully.',
          confirmButtonColor:'#9b6118'
        });

        //  RESET COINS (IMPORTANT)
        setCoinsUsed(0);

        //  REFRESH DATA
        await fetchExamAndTopics();

      } else {
        throw new Error(verifyResponse.data?.message ||'Verification failed');
      }

    } catch (error: any) {
      console.error(' Verification error:', error);

      Swal.fire({
        icon:'error',
        title:'Verification Failed',
        text:
          error.response?.data?.message ||
          error.message ||
'Payment verification failed. Please contact support.',
        confirmButtonColor:'#9b6118'
      });

    } finally {
      setPaymentProcessing(false);
    }
  };

  //  Sidebar 

  const handlePreviewTests = async (topic: Topic) => {
    if (!topic?._id) return;

    setSidebarTopic(topic);
    setSidebarOpen(true);
    setSidebarLoading(true);
    setSidebarTests([]);

    try {
      const response = await axios.get(
        url +'/test-series/navigation/topics/' + topic._id +'/test-series'
      );

      if (response.data?.success) {
        setSidebarTests(response.data.data?.testSeries || []);
      } else {
        setSidebarTests([]);
      }

    } catch (error) {
      console.error(' Error loading tests:', error);
      setSidebarTests([]);
    } finally {
      setSidebarLoading(false);
    }
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);

    setTimeout(() => {
      setSidebarTopic(null);
      setSidebarTests([]);
      setSidebarLoading(false);
    }, 300);
  };

  //  Inline topic expansion 

  const fetchTestsForTopic = async (topicId: string) => {
    try {
      const res = await axios.get(
        url +'/test-series/navigation/topics/' + topicId +'/test-series'
      );
      if (res.data.success) {
        setTopicTestsMap(prev => ({
          ...prev,
          [topicId]: res.data.data?.testSeries || []
        }));
      }
    } catch (err) {
      console.log('Failed to fetch tests');
    }
  };

  const toggleTopicTests = (topic: Topic) => {
    // Everything is already fetched in bulk, so this is now INSTANT!
    setExpandedTopics(prev => ({ ...prev, [topic._id]: !prev[topic._id] }));
  };

  //  Navigation 

  const handleStartTest = (testId: string, topic?: Topic) => {
    if (!requireLogin('start this test')) return;

    //  Access check
    if (topic && !hasAccessToTopic(topic)) {
      toast.warning('Please purchase to access this test');
      return;
    }

    window.location.href ='/v2/student/my-test-series/' + studentId;
  };

  const handleViewTests = (topicId: string) => {
    if (!requireLogin('access your tests')) return;
    window.location.href ='/v2/student/my-test-series/' + studentId;
  };

  //  Helpers 

  const hasPlayableTests = (topic: Topic) =>
    (topic?.testSeriesCount ?? 0) > 0;
  const totalMockTests = topics.reduce((sum, t) => sum + (t.testSeriesCount || 0), 0);
  const totalSubjectsCount = [...new Set(topics.map(t => t.subject._id))].length;
  const totalQuestions = topics.reduce((sum, t) => sum + ((t as any).totalQuestions || 0), 0);

  //  Which subject/category to show in the sidebar price card
  // Priority: show category price if set, otherwise show first paid subject
  const firstPaidSubject = subjects.find(s => s.isPaid && (s.price ?? 0) > 0) ?? null;
  const showCategoryPrice = exam?.isPaid && (exam?.price ?? 0) > 0;

  // Has user purchased EVERYTHING (category or all subjects)
  const everythingPurchased =
    categoryPurchased ||
    !exam?.isPaid ||
    (subjects.length > 0 && subjects.every(s => purchasedSubjectIds.has(s._id)));
  //  Render 

  if (loading) {
    return (
      <>
        <HeaderOne />
        <div style={{ padding: '40px 0', background: '#f8fafc', minHeight: '80vh' }}>
          <div className="exam-topics-container">
            {/* Header skeleton */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
              <div className="sk-shimmer" style={{ width: 120, height: 22, borderRadius: 8 }} />
              <div className="sk-shimmer" style={{ width: '55%', height: 32, borderRadius: 10 }} />
              <div className="sk-shimmer" style={{ width: '80%', height: 16, borderRadius: 8 }} />
              <div className="sk-shimmer" style={{ width: '65%', height: 16, borderRadius: 8 }} />
            </div>
            {/* Stats row skeleton */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="sk-shimmer" style={{ flex: 1, height: 80, borderRadius: 14 }} />
              ))}
            </div>
            {/* Topics table skeleton */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="sk-shimmer" style={{ width: '100%', height: 62, borderRadius: 12 }} />
              ))}
            </div>
          </div>
        </div>
        <MainFooter />
      </>
    );
  }

  return (
    <>
      <HeaderOne />

      <div className="exam-topics-wrapper">
        <div className="exam-topics-container">

          {/* <MyBreadcrumb 
            title={exam?.name ||'Loading...'} 
            subtitle={'Practice online test series with expert curated questions with Draa.'} 
            category="Test Series"
            paths={[
              { pathName:"Test Series", url:"/online-test-series" },
              { pathName: exam?.name ||'Loading...' }
            ]}
          /> */}

          {/* Main Grid Layout */}
          <div className="figma-main-grid">

            {/*  Left Content  */}
            <div className="figma-left-content">

              {/* Header Section */}
              <div className="figma-header-section">
                {exam?.statistics && (
                  <div className="figma-exam-rating" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 14px', borderRadius: '50px', marginBottom: '16px' }}>
                    <Star size={16} fill={exam.statistics.averageRating && exam.statistics.averageRating > 0 ? "#faad14" : "none"} stroke={exam.statistics.averageRating && exam.statistics.averageRating > 0 ? "#faad14" : "#faad14"} />
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                      {exam.statistics.averageRating && exam.statistics.averageRating > 0 ? exam.statistics.averageRating.toFixed(1) : "New"}
                    </span>
                    {exam.statistics.totalReviews && exam.statistics.totalReviews > 0 ? (
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                        ({exam.statistics.totalReviews} {exam.statistics.totalReviews === 1 ? 'review' : 'reviews'})
                      </span>
                    ) : null}
                  </div>
                )}
                <h1 className="figma-title">{exam?.name}</h1>
                {exam && (
                  <div className="exam-action-buttons-group">
                    {/* SHARE */}
                    <button
                      className="exam-share-btn"
                      onClick={() => handleShareExam(exam)}
                      aria-label="Share Exam"
                    >
                      <Share2
                        size={26}
                        stroke="#cbd5e1"
                      />
                    </button>

                    {/* WISHLIST */}
                    <button
                      className={`exam-wishlist-btn ${wishlistIds.has(exam._id) ?'active' :''}`}
                      onClick={(e) => toggleWishlist(exam as any, e)}
                      disabled={wishlistLoading === exam._id}
                      aria-label="Wishlist Exam"
                    >
                      <Heart
                        size={28}
                        fill={wishlistIds.has(exam._id) ?"#ef4444" :"none"}
                        stroke={wishlistIds.has(exam._id) ?"#ef4444" :"#cbd5e1"}
                      />
                    </button>
                  </div>
                )}
                <p className="figma-description">
                  {exam?.description ||
'Updated questions based on PYQ analysis and more. Designed to simulate the real-time exam environment with expert-curated content to boost your preparation.'}
                </p>

                {/* Features Row */}
                <div className="figma-features-row">
                  <div className="feature-item">
                    <div className="feature-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M9 11H15M9 15H15M21 7V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V7C3 4 4.5 2 8 2H16C19.5 2 21 4 21 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="feature-text">
                      <div className="feature-title">Full-length tests</div>
                      <div className="feature-subtitle">Real exam feel</div>
                    </div>
                  </div>

                  <div className="feature-item">
                    <div className="feature-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M22 10V15C22 20 20 22 15 22H9C4 22 2 20 2 15V9C2 4 4 2 9 2H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M22 10H18C15 10 14 9 14 6V2L22 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="feature-text">
                      <div className="feature-title">Detailed solutions</div>
                      <div className="feature-subtitle">Comprehensive analysis</div>
                    </div>
                  </div>

                  <div className="feature-item">
                    <div className="feature-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M18 18.86H17.24C16.44 18.86 15.68 19.17 15.12 19.73L13.41 21.42C12.63 22.19 11.36 22.19 10.58 21.42L8.87 19.73C8.31 19.17 7.54 18.86 6.75 18.86H6C4.34 18.86 3 17.53 3 15.89V4.97C3 3.33 4.34 2 6 2H18C19.66 2 21 3.33 21 4.97V15.88C21 17.52 19.66 18.86 18 18.86Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" />
                        <path d="M12 10C13.2869 10 14.33 8.95681 14.33 7.67C14.33 6.38319 13.2869 5.34 12 5.34C10.7132 5.34 9.67004 6.38319 9.67004 7.67C9.67004 8.95681 10.7132 10 12 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M16 15.66C16 13.86 14.21 12.4 12 12.4C9.79 12.4 8 13.86 8 15.66" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="feature-text">
                      <div className="feature-title">Performance Analysis</div>
                      <div className="feature-subtitle">Track your progress</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Test Series Structure */}
              <div className="figma-structure-section">
                <div className="structure-header">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22 16.74V4.67C22 3.47 21.02 2.58 19.83 2.68H19.77C17.67 2.86 14.48 3.93 12.7 5.05L12.53 5.16C12.24 5.34 11.76 5.34 11.47 5.16L11.22 5.01C9.44 3.9 6.26 2.84 4.16 2.67C2.97 2.57 2 3.47 2 4.66V16.74C2 17.7 2.78 18.6 3.74 18.72L4.03 18.76C6.2 19.05 9.55 20.15 11.47 21.2L11.51 21.22C11.78 21.37 12.21 21.37 12.47 21.22C14.39 20.16 17.75 19.05 19.93 18.76L20.26 18.72C21.22 18.6 22 17.7 22 16.74Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M12 5.49V20.49" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span>Test Series Structure</span>
                </div>

                <div className="structure-grid">
                  <div className="structure-card">
                    <div className="structure-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M15.5 9.75C16.3284 9.75 17 9.07843 17 8.25C17 7.42157 16.3284 6.75 15.5 6.75C14.6716 6.75 14 7.42157 14 8.25C14 9.07843 14.6716 9.75 15.5 9.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="structure-value">{totalMockTests}</div>
                    <div className="structure-label">Mock<br />TESTS</div>
                  </div>

                  <div className="structure-card">
                    <div className="structure-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path d="M22 16.74V4.67C22 3.47 21.02 2.58 19.83 2.68H19.77C17.67 2.86 14.48 3.93 12.7 5.05L12.53 5.16C12.24 5.34 11.76 5.34 11.47 5.16L11.22 5.01C9.44 3.9 6.26 2.84 4.16 2.67C2.97 2.57 2 3.47 2 4.66V16.74C2 17.7 2.78 18.6 3.74 18.72L4.03 18.76C6.2 19.05 9.55 20.15 11.47 21.2L11.51 21.22C11.78 21.37 12.21 21.37 12.47 21.22C14.39 20.16 17.75 19.05 19.93 18.76L20.26 18.72C21.22 18.6 22 17.7 22 16.74Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="structure-value">{totalSubjectsCount}</div>
                    <div className="structure-label">Subject<br />WISE</div>
                  </div>

                  <div className="structure-card">
                    <div className="structure-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path d="M8 2V5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" />
                        <path d="M16 2V5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" />
                        <path d="M3.5 9.09H20.5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" />
                        <path d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="structure-value">{totalQuestions}+</div>
                    <div className="structure-label"><br />QUESTIONS</div>
                  </div>
                </div>
              </div>

                {/* Tabs for Tests/Reviews */}
                <div className="figma-tabs-row">
                  <button 
                    className={`figma-tab-btn ${activeTab ==='tests' ?'active' :''}`}
                    onClick={() => setActiveTab('tests')}
                  >
                    Tests ({topics.filter(t => (t.testSeriesCount || 0) > 0).length})
                  </button>
                  <button 
                    className={`figma-tab-btn ${activeTab ==='reviews' ?'active' :''}`}
                    onClick={() => setActiveTab('reviews')}
                  >
                    Reviews ({reviews.length})
                  </button>
                </div>

                {activeTab ==='tests' ? (
                  <div className="figma-tests-section">
                    <div className="tests-header">
                      <h2>Available Topics</h2>
                      <span className="tests-count">
                        Total: {topics.filter(t => (t.testSeriesCount || 0) > 0).length} Topics
                      </span>
                    </div>

                <div className="tests-table-wrapper">
                  <table className="figma-tests-table">
                    <thead>
                      <tr>
                        <th></th>
                        <th>TEST NAME</th>
                        <th>TYPE</th>
                        <th>QUESTIONS</th>
                        <th>DURATION</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>

                    <tbody>
                      {topics.filter(t => (t.testSeriesCount || 0) > 0).length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign:'center', padding:'40px' }}>
                            <div style={{ color:'#9ca3af' }}>
                              Tests are coming soon for this exam.
                            </div>
                          </td>
                        </tr>
                      ) : (
                        topics
                          .filter(topic => (topic.testSeriesCount || 0) > 0)
                          .map((topic, index) => {
                            const totalQ = (topic as any).totalQuestions || 0;
                            const totalDur = (topic.testSeriesCount || 0) * 120;
                            const tests = topicTestsMap[topic._id] || [];
                            //  Access based on category OR subject purchase
                            const hasAccess = hasAccessToTopic(topic);

                            return (
                              <React.Fragment key={topic._id}>
                                {/* Main topic row */}
                                <tr className="test-row">
                                  <td>
                                    <div className="test-number">
                                      {String(index + 1).padStart(2,'0')}
                                    </div>
                                  </td>

                                  <td>
                                    <div className="test-name-cell">
                                      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                                        <div className="test-name">{topic.name}</div>
                                        <button
                                          className={`topic-wishlist-btn ${wishlistIds.has(topic._id) ?'active' :''}`}
                                          onClick={(e) => toggleWishlist(topic, e)}
                                          disabled={wishlistLoading === topic._id}
                                          style={{
                                            background:'none',
                                            border:'none',
                                            padding: 0,
                                            cursor:'pointer',
                                            display:'flex',
                                            alignItems:'center',
                                            transition:'transform 0.2s'
                                          }}
                                        >
                                          <Heart
                                            size={16}
                                            fill={wishlistIds.has(topic._id) ?"#ef4444" :"none"}
                                            stroke={wishlistIds.has(topic._id) ?"#ef4444" :"currentColor"}
                                          />
                                        </button>
                                      </div>
              {topic.description && (
                                        <div className="test-description">{topic.description}</div>
                                      )}
                                    </div>
                                  </td>

                                  <td>
                                    <span className="test-type-badge">Full Length</span>
                                  </td>

                                  <td>
                                    <span className="test-questions">{totalQ} Qs</span>
                                  </td>

                                  <td>
                                    <span className="test-duration">{totalDur} Mins</span>
                                  </td>

                                  <td>
                                    {/*  Status based on subject/category purchase */}
                                    <span className={`status-btn ${hasAccess ?'available' :'locked'}`}>
                                      {hasAccess ?'AVAILABLE' :'BUY TO UNLOCK'}
                                    </span>
                                  </td>
                                </tr>

                                {/* Inline tests list */}
                                <tr className="expanded-row">
                                  <td colSpan={6}>
                                    <div className="inline-tests-list">
                                      {tests.length === 0 ? (
                                        <div>No tests available</div>
                                      ) : (
                                        tests.map((test, i) => (
                                          <div key={test._id} className="inline-test-item">
                                            <div className="inline-left">
                                              <span className="test-no">
                                                {String(i + 1).padStart(2,'0')}
                                              </span>
                                              <div>
                                                <div className="test-title">{test.title}</div>
                                                <div className="test-meta">
                                                  {test.duration} min  {test.totalQuestions || 0} Questions
                                                </div>
                                              </div>
                                            </div>

                                            {/*  Button: Start if access, else show buy for subject */}
                                            {hasAccess ? (
                                              <button
                                                className="inline-btn start"
                                                onClick={() => handleStartTest(test._id)}
                                              >
                                                Start
                                              </button>
                                            ) : (
                                              <button
                                                className="inline-btn locked"
                                                onClick={() => {
                                                  //  Buy subject (not topic)
                                                  const subj = subjects.find(
                                                    s => s._id === topic.subject._id
                                                  );
                                                  if (subj?.isPaid && subj.price) {
                                                    handlePurchase(
'subject',
                                                      subj._id,
                                                      subj.price,
                                                      subj.name
                                                    );
                                                  }
                                                }}
                                              >
                                                Locked
                                              </button>
                                            )}
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              </React.Fragment>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
                  <div className="test-series-reviews-section">
                    <div className="reviews-header-new">
                      <div className="rev-header-left">
                        <Title level={3}>Student Reviews</Title>
                        <Text type="secondary">Real feedback from actual aspirants</Text>
                      </div>
                      <Button 
                        type="primary" 
                        className="write-review-btn-premium"
                        icon={<Plus size={16} />}
                        onClick={() => {
                          if (!isAuthenticated()) {
                            requireLogin('write a review');
                            return;
                          }
                          setReviewModalVisible(true);
                        }}
                      >
                        Write a review
                      </Button>
                    </div>

                    <div className="feedback-summary-box-premium">
                      <div className="feedback-avg-col">
                        <div className="avg-num">{Number(reviewStats?.averageRating || 0).toFixed(1)}</div>
                        <Rate disabled allowHalf value={Number(reviewStats?.averageRating || 0)} />
                        <div className="avg-total-text">Based on {reviews.length} reviews</div>
                      </div>

                      <div className="feedback-bars-col">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = reviewStats?.distribution?.[star] || 0;
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
                                  {rev.student_id?.name?.substring(0, 2).toUpperCase() ||"ST"}
                                </div>
                                <div className="rev-user-details">
                                  <Text strong className="rev-name">{rev.student_id?.name}</Text>
                                  <div className="rev-stars-row">
                                    <Rate disabled value={rev.rating} style={{ fontSize: 12 }} />
                                    {rev.verified && (
                                      <Tag color="gold" className="verified-badge-mini">
                                        <CheckCircle2 size={10} style={{ marginRight: 4 }} /> Verified Student
                                      </Tag>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Text className="rev-date">
                                {rev.createdAt ? moment(rev.createdAt).fromNow() :"Just now"}
                              </Text>
                            </div>
                            {rev.title && <Title level={5} className="rev-title-text">{rev.title}</Title>}
                            <Paragraph className="rev-comment-text">"{rev.comment}"</Paragraph>
                          </div>
                        ))
                      ) : (
                        <div className="empty-reviews-state">
                          <Text type="secondary">No reviews yet for this test series. Be the first to share your experience!</Text>
                        </div>
                      )}
                    </div>

                    {reviews.length > visibleReviews && (
                      <div style={{ textAlign:'center', marginTop: 32 }}>
                        <Button 
                          className="view-more-rev-btn"
                          onClick={() => setVisibleReviews(prev => prev + 5)}
                        >
                          View More Reviews
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {reviewModalVisible && (
                  <TestSeriesReviewModal 
                    examId={examId!} 
                    onClose={() => setReviewModalVisible(false)}
                    onSuccess={fetchReviews}
                  />
                )}
              </div>

            {/*  Right Sidebar  */}
            <div className="figma-right-sidebar">
              <div className="sidebar-sticky">
                <div className="figma-price-card">

                  {/*  Show category price OR subject price */}
                  {(showCategoryPrice || firstPaidSubject) ? (
                    <>
                      {/*  Price display  */}
                      <div className="price-header">
                        <div className="price-main">
                          {(() => {
                            const basePrice = showCategoryPrice
                              ? (exam?.price ?? 0)
                              : (firstPaidSubject?.price ?? 0);
                            const pricing = calculatePricing(basePrice);
                            const originalPrice = showCategoryPrice
                              ? exam?.originalPrice
                              : firstPaidSubject?.originalPrice;
                            const discount = showCategoryPrice
                              ? exam?.discount
                              : firstPaidSubject?.discount;

                            return (
                              <>
                                <span className="price-symbol"></span>
                                <span className="price-value">
                                  {pricing.finalAmount.toFixed(0)}
                                </span>
                                <div style={{ fontSize: 12, color:'#666', marginTop: 4 }}>
                                  Base {pricing.basePrice} + GST {pricing.gstAmount.toFixed(0)}
                                </div>

                                {originalPrice && originalPrice > basePrice && (
                                  <div className="price-old" style={{ marginTop: 4 }}>
                                    <span className="old-value">{originalPrice}</span>
                                    {discount && discount > 0 && (
                                      <span className="discount-badge">{discount}% OFF</span>
                                    )}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Label: Full Test Series or Subject */}
                      <div className="price-note">
                        {showCategoryPrice
                          ? `Full Test Series  all ${totalSubjectsCount} subjects included`
                          : `${firstPaidSubject?.name}  ${topics.filter(t => t.subject._id === firstPaidSubject?._id).length} topics`}
                      </div>

                      {/*  Coins  */}
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 13, marginBottom: 4 }}>
                          Coins available: <b>{coinsBalance}</b>
                        </div>

                        <input
                          type="number"
                          min={0}
                          max={coinsBalance}
                          value={coinsUsed}
                          onChange={(e) => {
                            let val = Number(e.target.value);
                            if (val > coinsBalance) {
                              toast.warning('Not enough coins');
                              val = coinsBalance;
                            }
                            if (val < 0) val = 0;
                            if (val > 0 && val < MIN_COINS) {
                              toast.info('Minimum 100 coins required to apply discount');
                            }
                            setCoinsUsed(val);
                          }}
                          style={{
                            width:'100%',
                            padding:'6px',
                            border:'1px solid #ddd',
                            borderRadius: 6
                          }}
                          placeholder="Use coins"
                        />

                        {coinsUsed >= MIN_COINS && (
                          <div style={{ fontSize: 12, color:'#666', marginTop: 4 }}>
                            Discount {(coinsUsed * COIN_VALUE).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="price-note">Tests will be added soon</div>
                  )}
                  <br />
                  {/* <br /> */}
                  {/* Benefits */}
                  <div className="benefits-list">
                    <div className="benefit-item">
                      <div className="benefit-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M7.75 12L10.58 14.83L16.25 9.17004" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className="benefit-text">
                        <div className="benefit-title">Comprehensive Coverage</div>
                        <div className="benefit-subtitle">Every topic included as per official syllabus</div>
                      </div>
                    </div>

                    <div className="benefit-item">
                      <div className="benefit-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M12 8V12L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className="benefit-text">
                        <div className="benefit-title">Anywhere Access</div>
                        <div className="benefit-subtitle">Practice on mobile or desktop anytime</div>
                      </div>
                    </div>

                    <div className="benefit-item">
                      <div className="benefit-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className="benefit-text">
                        <div className="benefit-title">Validity</div>
                        <div className="benefit-subtitle">Valid for 1 year from the date of purchase</div>
                      </div>
                    </div>
                  </div>

                  {/*  CTA Buttons  */}

                  {/* Already purchased everything */}
                  {isLoggedIn && everythingPurchased ? (
                    <button className="figma-cta-btn purchased" disabled>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M7.75 12L10.58 14.83L16.25 9.17004" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      Already Purchased
                    </button>
                  ) : (
                    <>
                      {/*  Buy Full Test Series (Category) */}
                      {showCategoryPrice && !categoryPurchased && (
                        <button
                          className="figma-cta-btn"
                          onClick={() =>
                            handlePurchase(
'category',
                              exam!._id,
                              exam!.price!,
                              exam!.name
                            )
                          }
                          disabled={paymentProcessing}
                        >
                          {paymentProcessing ?'Processing...' :'Buy Full Test Series'}
                        </button>
                      )}

                      {/*  Buy Subject (e.g. January) */}
                      {firstPaidSubject && !purchasedSubjectIds.has(firstPaidSubject._id) && (
                        <button
                          className="figma-cta-btn"
                          style={showCategoryPrice ? { marginTop: 8, background:'#fff', color:'#9b6118', border:'1.5px solid #9b6118' } : {}}
                          onClick={() =>
                            handlePurchase(
'subject',
                              firstPaidSubject._id,
                              firstPaidSubject.price!,
                              firstPaidSubject.name
                            )
                          }
                          disabled={paymentProcessing}
                        >
                          {paymentProcessing
                            ?'Processing...'
                            : showCategoryPrice
                              ? `Buy ${firstPaidSubject.name} Only`
                              :'Buy Now'}
                        </button>
                      )}

                      {/* No paid options */}
                      {!showCategoryPrice && !firstPaidSubject && (
                        <button className="figma-cta-btn disabled" disabled>
                          Tests Coming Soon
                        </button>
                      )}
                    </>
                  )}

                  {/* Preview button */}
                  <button
                    className="figma-preview-btn"
                    onClick={() => {
                      const previewTopic = topics.find(t => (t.testSeriesCount || 0) > 0);
                      if (previewTopic) handlePreviewTests(previewTopic);
                    }}
                    disabled={!topics.some(t => (t.testSeriesCount || 0) > 0)}
                  >
                    Preview Tests
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/*  Sidebar Overlay  */}
      {sidebarOpen && (
        <div className="figma-sidebar-overlay" onClick={handleCloseSidebar}></div>
      )}

      {/*  Sidebar Drawer  */}
      <div className={'figma-test-sidebar' + (sidebarOpen ? ' open' : '')}>
        <div className="sidebar-header">
          <h3>{sidebarTopic?.name}</h3>
          <button className="close-btn" onClick={handleCloseSidebar}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="sidebar-body">
          {sidebarLoading ? (
            <div className="sidebar-loading">
              <div className="spinner"></div>
              <p>Loading tests...</p>
            </div>
          ) : sidebarTests.length === 0 ? (
            <div className="sidebar-empty">
              <p>No tests available</p>
            </div>
          ) : (
            <div className="sidebar-tests-list">
              {sidebarTests.map((test, index) => {
                //  Access based on subject/category  not topic
                const hasAccess = sidebarTopic ? hasAccessToTopic(sidebarTopic) : false;

                return (
                  <div key={test._id} className="sidebar-test-item">
                    <div className="test-item-number">{String(index + 1).padStart(2,'0')}</div>
                    <div className="test-item-content">
                      <h4>{test.title}</h4>
                      <div className="test-item-meta">
                        <span>{test.duration} min</span>
                        <span></span>
                        <span>{test.totalQuestions || 0} Questions</span>
                        {test.difficulty && (
                          <>
                            <span></span>
                            <span className={'difficulty' + test.difficulty.toLowerCase()}>
                              {test.difficulty}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/*  Start or buy subject */}
                    {hasAccess ? (
                      <button
                        className="test-item-btn start"
                        onClick={() => handleStartTest(test._id)}
                      >
                        Start
                      </button>
                    ) : (
                      <button
                        className="test-item-btn locked"
                        onClick={() => {
                          if (sidebarTopic) {
                            const subj = subjects.find(
                              s => s._id === sidebarTopic.subject._id
                            );
                            if (subj?.isPaid && subj.price) {
                              handlePurchase('subject', subj._id, subj.price, subj.name);
                            }
                          }
                        }}
                      >
                        Locked
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* <InquiryPopUp /> */}
      <MainFooter />
      <ScrollToTop />
      <ScrollTop />
    </>
  );
};

export default ExamTopicsPage;