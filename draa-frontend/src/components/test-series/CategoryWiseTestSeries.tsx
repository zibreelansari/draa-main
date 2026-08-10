import React, { useState, useEffect } from'react';
import { Link, useParams, useSearchParams, useNavigate } from'react-router-dom';
import url from'../../url';
import { getAuthHeaders } from'../../utils/global_auth';

//  All your existing interfaces
interface Teacher {
  _id: string;
  name?: string;
  tname: string;
  temail: string;
  tspecialization: string;
  tprofile: string;
}

interface Question {
  _id: string;
  questionText: string;
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  marks: number;
  negativeMarks: number;
  difficulty:'easy' |'medium' |'hard';
}

interface ExaminationCategory {
  _id: string;
  name: string;
  code: string;
  year: number;
  description?: string;
  examDate?: string;
  isActive: boolean;
  priority?: number;
  bannerImage?: string;
  statistics?: {
    totalSubjects: number;
    totalTestSeries: number;
  };
}

interface Subject {
  _id: string;
  name: string;
  code: string;
  examinationCategory: ExaminationCategory;
  description?: string;
  isActive: boolean;
}

interface TopicCategory {
  _id: string;
  name: string;
  code: string;
  subject: Subject;
  description?: string;
  difficulty?:'beginner' |'intermediate' |'advanced' |'mixed';
  isActive: boolean;
}

interface TestSeries {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  subCategory?: string;
  examinationCategory?: ExaminationCategory;
  subject?: Subject;
  topicCategory?: TopicCategory;
  seriesNumber?: number;
  testType?: string;
  duration: number;
  totalMarks?: number;
  questions: Question[];
  createdBy: Teacher;
  maxAttempts: number;
  isPaid: boolean;
  price?: number;
  difficulty:'beginner' |'intermediate' |'advanced';
  status:'approved' |'pending' |'rejected' |'draft';
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface HierarchicalStats {
  totalTests: number;
  totalSubjects?: number;
  totalTopics?: number;
  freeTests: number;
  paidTests: number;
  beginnerLevel: number;
  intermediateLevel: number;
  advancedLevel: number;
  averageDuration: number;
  testTypes?: {
    mock?: number;
    practice?: number;
    previous?: number;
    sectional?: number;
  };
}

interface ApiResponse {
  success: boolean;
  data: {
    testSeries: TestSeries[];
    examinationCategory?: ExaminationCategory;
    subject?: Subject;
    topicCategory?: TopicCategory;
    statistics: HierarchicalStats;
    pagination: {
      current: number;
      pages: number;
      total: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message: string;
}

interface StudentData {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface PurchaseStatus {
  purchased: boolean;
  access_granted: boolean;
  purchase_date?: string;
  validity_until?: string;
  attempts_used?: number;
  remaining_attempts?: number;
  best_score?: number;
  best_percentage?: number;
  completion_status?: string;
}

interface LoginUser {
  name?: string;
  email?: string;
  id?: string;
  token?: string;
  tname?: string;
  aname?: string;
  [key: string]: any;
}

//  COMPANY INFO - Update with your real details
const COMPANY_INFO = {
  name:"DRAA ACADEMICS LLP",
  address:"B-99(NEW) B-97(OLD) ,SHEIKH SARAI ,Panchsheel Vihar,New Delhi-110017",
  phone:"+91-8076003728",
  email:"support@edudocs.com",
  gstin:"07ACDFM1081A1ZS",
  pan:"ACDFM1081A"
};

//  STYLED NOTIFICATION SYSTEM (replaces alert)
const notify = (message: string, type:'success' |'error' |'info' ='info') => {
  const containerId ='edudocs-toast-container';
  let container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.style.position ='fixed';
    container.style.top ='20px';
    container.style.right ='20px';
    container.style.zIndex ='9999';
    container.style.display ='flex';
    container.style.flexDirection ='column';
    container.style.gap ='8px';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `edudocs-toast edudocs-toast-${type}`;
  toast.innerText = message;
  toast.style.minWidth ='260px';
  toast.style.maxWidth ='360px';
  toast.style.padding ='12px 16px';
  toast.style.borderRadius ='8px';
  toast.style.boxShadow ='0 10px 30px rgba(0,0,0,0.15)';
  toast.style.color ='#fff';
  toast.style.fontSize ='13px';
  toast.style.fontWeight ='500';
  toast.style.background =
    type ==='success'
      ?'linear-gradient(135deg,#28a745,#20c997)'
      : type ==='error'
        ?'linear-gradient(135deg,#dc3545,#c82333)'
        :'linear-gradient(135deg,#667eea,#764ba2)';

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity ='0';
    toast.style.transform ='translateX(20px)';
    toast.style.transition ='all 0.3s ease';
    setTimeout(() => {
      toast.remove();
      if (container && container.childElementCount === 0) container.remove();
    }, 300);
  }, 3500);
};

const CategoryWiseTestSeries: React.FC = () => {
  const [loginUser, setLoginUser] = useState<LoginUser>({});
  const { examId, subjectId, topicId } = useParams<{
    examId?: string;
    subjectId?: string;
    topicId?: string;
  }>();

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [testSeries, setTestSeries] = useState<TestSeries[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [examinationCategory, setExaminationCategory] = useState<ExaminationCategory | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topicCategory, setTopicCategory] = useState<TopicCategory | null>(null);
  const [hierarchicalStats, setHierarchicalStats] = useState<HierarchicalStats | null>(null);

  const [totalPages, setTotalPages] = useState<number>(1);
  const testsPerPage = 12;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [studentData, setStudentData] = useState<StudentData>({} as StudentData);
  const [purchaseStatus, setPurchaseStatus] = useState<{ [key: string]: PurchaseStatus }>({});
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);

  const difficulty = searchParams.get('difficulty') ||'';
  const isPaid = searchParams.get('isPaid') ||'';
  const search = searchParams.get('search') ||'';
  const sortBy = searchParams.get('sortBy') ||'createdAt';
  const sortOrder = searchParams.get('sortOrder') ||'desc';
  const testType = searchParams.get('testType') ||'';

  useEffect(() => {
    const userStr = localStorage.getItem("edudocs");
    if (userStr) {
      try {
        const user: LoginUser = JSON.parse(userStr);
        setLoginUser(user);
        if (user.id) {
          console.log("user ok")
        }
      } catch {
        console.log("not ok")
        navigate("/student-login");
      }
    } else {
      console.log("not ok")
      navigate("/student-login");
    }
  }, [navigate]);

  console.log(' Route params:', { examId, subjectId, topicId });

  useEffect(() => {
    checkUserAuthentication();
  }, []);

  const checkUserAuthentication = () => {
    try {
      const studentStr = localStorage.getItem('edudocs');
      if (studentStr) {
        const student = JSON.parse(studentStr);
        if (student && student.id && student.name && student.email) {
          setIsLoggedIn(true);
          setStudentData({
            id: student.id,
            name: student.name,
            email: student.email,
            phone: student.phone ||''
          });
          console.log(' User authenticated:', student.name);
        }
      }
    } catch (error) {
      console.error(' Error checking authentication:', error);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && studentData.id && testSeries.length > 0) {
      checkAllPurchaseStatus();
    }
  }, [isLoggedIn, studentData.id, testSeries]);

  const checkAllPurchaseStatus = async () => {
    if (!studentData.id) return;

    const paidTests = testSeries.filter(test => test.isPaid);
    const purchasePromises = paidTests.map(async (test) => {
      try {
        const response = await fetch(`${url}/student/test-series/purchase/check-purchase/${test._id}?student_id=${studentData.id}`);
        if (response.ok) {
          const data = await response.json();
          return { testId: test._id, status: data };
        }
      } catch (error) {
        console.error(`Error checking purchase for test ${test._id}:`, error);
      }
      return { testId: test._id, status: { purchased: false, access_granted: false } };
    });

    const results = await Promise.all(purchasePromises);
    const statusMap: { [key: string]: PurchaseStatus } = {};
    results.forEach(result => {
      statusMap[result.testId] = result.status;
    });
    setPurchaseStatus(statusMap);
  };

  useEffect(() => {
    const page = parseInt(searchParams.get('page') ||'1');
    setCurrentPage(page);
  }, [searchParams]);

  useEffect(() => {
    if (examId || subjectId || topicId) {
      fetchHierarchicalTestSeries();
    } else {
      setError('Invalid route: Missing examination, subject, or topic ID');
      setLoading(false);
    }
  }, [examId, subjectId, topicId, currentPage, difficulty, isPaid, search, sortBy, sortOrder, testType]);

  const fetchHierarchicalTestSeries = async () => {
    setLoading(true);
    try {
      let apiUrl ='';

      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: testsPerPage.toString(),
        sortBy,
        sortOrder,
      });

      if (difficulty) queryParams.append('difficulty', difficulty);
      if (isPaid) queryParams.append('isPaid', isPaid);
      if (search) queryParams.append('search', search);
      if (testType) queryParams.append('testType', testType);

      if (topicId) {
        apiUrl = `${url}/test-series/topic/${topicId}?${queryParams}`;
        console.log(' Fetching topic-level test series:', apiUrl);
      } else if (subjectId) {
        apiUrl = `${url}/test-series/subject/${subjectId}?${queryParams}`;
        console.log(' Fetching subject-level test series:', apiUrl);
      } else if (examId) {
        apiUrl = `${url}/test-series/examination/${examId}?${queryParams}`;
        console.log(' Fetching examination-level test series:', apiUrl);
      }

      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(' Response error text:', errorText);
        throw new Error(`Failed to fetch test series: ${response.status} - ${errorText}`);
      }

      const data: ApiResponse = await response.json();
      console.log(' Hierarchical data received:', data);

      if (data.success) {
        setTestSeries(data.data.testSeries || []);
        setHierarchicalStats(data.data.statistics);
        setTotalPages(data.data.pagination?.pages || 1);

        if (data.data.examinationCategory) {
          setExaminationCategory(data.data.examinationCategory);
        }
        if (data.data.subject) {
          setSubject(data.data.subject);
        }
        if (data.data.topicCategory) {
          setTopicCategory(data.data.topicCategory);
        }

        setError('');
        console.log(' Data loaded successfully:', data.data.testSeries.length,'tests found');
      } else {
        throw new Error(data.message ||'Failed to load test series');
      }
    } catch (error: any) {
      console.error(" Error fetching hierarchical test series:", error);
      setError(error.message ||'Failed to load test series. Please try again later.');
      setTestSeries([]);
      setHierarchicalStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTestAccess = async (test: TestSeries) => {
    if (!test.isPaid) {
      if (!isLoggedIn || !studentData?.id) {
        if (window.confirm('You need to login to access this test series. Do you want to login now?')) {
          navigate('/student-login');
        }
        return;
      }
      navigate(`/v2/student/my-test-series/${studentData.id}`);
      return;
    }

    if (!isLoggedIn) {
      if (window.confirm('You need to login to purchase this test series. Do you want to login now?')) {
        navigate('/student-login');
      }
      return;
    }

    const purchase = purchaseStatus[test._id];
    if (purchase?.purchased && purchase?.access_granted) {
      navigate(`/v2/student/my-test-series/${studentData.id}`);
      return;
    }

    await handlePurchaseTestSeries(test);
  };

  const handlePurchaseTestSeries = async (test: TestSeries) => {
    if (!test.price) {
      notify('Price not set for this test series.','error');
      return;
    }

    const basePrice = test.price;
    const gstRate = 0.18;
    const gstAmount = basePrice * gstRate;
    const totalPayable = basePrice + gstAmount;

    const confirmMessage =
      ` PURCHASE INVOICE SUMMARY\n\n` +
      `Test Series: ${test.title}\n` +
      `--------------------------------\n` +
      `Base Price:   ${basePrice.toFixed(2)}\n` +
      `GST (18%):    ${gstAmount.toFixed(2)}\n` +
      `--------------------------------\n` +
      `TOTAL PAYABLE: ${totalPayable.toFixed(2)}\n\n` +
      `Do you want to proceed with the payment?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setPaymentLoading(test._id);

    try {
      console.log(' Starting test series purchase process...');
      console.log(' Student:', studentData.name,' Test Series:', test.title);

      const orderPayload = {
        test_series_id: test._id,
        invoice_details: {
          base_price: basePrice,
          gst_amount: gstAmount,
          gst_rate: 18,
          total_amount: totalPayable,
          currency:'INR'
        },
        student_data: {
          id: studentData.id,
          name: studentData.name,
          email: studentData.email,
          phone: studentData.phone ||''
        }
      };

      console.log(' Sending order request with GST details:', orderPayload);

      const orderResponse = await fetch(`${url}/student/test-series/purchase/create-order`, {
        method:'POST',
        headers: {
          ...getAuthHeaders(),
'Content-Type':'application/json'
        },
        body: JSON.stringify(orderPayload)
      });

      // Handle authentication errors
      if (orderResponse.status === 401) {
        notify('Your session has expired. Please login again.','error');
        navigate('/student-login', { replace: true });
        setPaymentLoading(null);
        return;
      }

      if (!orderResponse.ok) {
        notify('Failed to create order. Please try again.','error');
        setPaymentLoading(null);
        return;
      }

      const orderData = await orderResponse.json();
      console.log(' Order response:', orderData);

      if (!orderData.success) {
        throw new Error(orderData.message ||'Failed to create order');
      }

      const razorpayOptions = {
        key: import.meta.env.VITE_RAZORPAY_LIVE_KEY,
        amount: orderData.amount,
        currency: orderData.currency,
        name:'EduDocs - Invoice Payment',
        description: `Test: ${test.title} (Inc. 18% GST)`,
        image: test.createdBy?.tprofile ? `${url}${test.createdBy.tprofile}` : undefined,
        order_id: orderData.orderId,
        notes: {
          invoice_ref: `INV-${test._id}-${Date.now()}`,
          gst_info:"18% GST Included"
        },

        handler: async function (paymentResponse: any) {
          try {
            console.log(' Payment completed:', paymentResponse);

            const verifyPayload = {
              test_series_id: test._id,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              invoice_generated: true,
              payment_breakdown: {
                base: basePrice,
                gst: gstAmount,
                total: totalPayable
              },
              student_data: {
                id: studentData.id,
                name: studentData.name,
                email: studentData.email,
                phone: studentData.phone ||''
              }
            };

            console.log(' Verifying payment:', verifyPayload);

            const verifyResponse = await fetch(`${url}/student/test-series/purchase/verify-payment`, {
              method:'POST',
              headers: {
                ...getAuthHeaders(),
'Content-Type':'application/json'
              },
              body: JSON.stringify(verifyPayload)
            });

            // Handle verification auth errors
            if (verifyResponse.status === 401) {
              notify('Your session expired during payment. Please login and try again.','error');
              navigate('/student-login', { replace: true });
              setPaymentLoading(null);
              return;
            }

            const verifyData = await verifyResponse.json();
            console.log(' Verification response:', verifyData);

            if (verifyData.success) {
              notify(`Payment successful! Invoice generated. You now have access to"${test.title}".`,'success');

              setPurchaseStatus(prev => ({
                ...prev,
                [test._id]: {
                  purchased: true,
                  access_granted: true,
                  purchase_date: new Date().toISOString(),
                  remaining_attempts: test.maxAttempts,
                  attempts_used: 0,
                  completion_status:'not_started'
                }
              }));

              navigate(`/v2/student/my-test-series/${studentData.id}`);

            } else {
              throw new Error(verifyData.message ||'Payment verification failed');
            }

          } catch (verifyError: any) {
            console.error(' Payment verification failed:', verifyError);
            notify(`Payment verification failed: ${verifyError.message}`,'error');
          } finally {
            setPaymentLoading(null);
          }
        },

        prefill: {
          name: studentData.name,
          email: studentData.email,
          contact: studentData.phone ||''
        },

        theme: {
          color:'#007bff'
        },

        modal: {
          ondismiss: function () {
            console.log(' Payment popup dismissed');
            setPaymentLoading(null);
          }
        }
      };

      console.log(' Opening Razorpay payment popup...');

      const razorpay = new (window as any).Razorpay(razorpayOptions);

      razorpay.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        notify(`Payment failed: ${response.error.description}`,'error');
        setPaymentLoading(null);
      });

      razorpay.open();

    } catch (error: any) {
      console.error(' Payment error:', error);
      notify(error.message ||'Payment failed! Please try again.','error');
      setPaymentLoading(null);
    }
  };

  //  DOWNLOAD INVOICE HANDLER
  const downloadInvoice = (test: TestSeries) => {
    const purchase = purchaseStatus[test._id];
    if (!purchase?.purchased) {
      notify('Invoice is available only after successful purchase.','info');
      return;
    }

    const basePrice = test.price || 0;
    const gstRate = 0.18;
    const gstAmount = basePrice * gstRate;
    const total = basePrice + gstAmount;

    const invoiceNumber = `INV-${test._id.slice(-6).toUpperCase()}-${new Date().getTime()}`;
    const dateStr = new Date(purchase.purchase_date || new Date().toISOString()).toLocaleString();

    const studentName = studentData.name ||'Student';
    const studentEmail = studentData.email ||'';
    const studentPhone = studentData.phone ||'';

    const html = `
      <html>
        <head>
          <title>Invoice - ${invoiceNumber}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont,'Segoe UI', sans-serif; padding: 24px; color: #212529; }
            .invoice-wrapper { max-width: 720px; margin: 0 auto; border: 1px solid #dee2e6; border-radius: 12px; padding: 24px; }
            .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
            .company-name { font-size: 20px; font-weight: 700; color: #343a40; }
            .badge-paid { background: #28a745; color: #fff; padding: 4px 10px; border-radius: 999px; font-size: 11px; }
            .invoice-meta { font-size: 12px; color: #6c757d; }
            .section-title { font-size: 14px; font-weight: 600; margin-top: 16px; margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { padding: 8px 6px; font-size: 13px; }
            th { text-align: left; background: #f8f9fa; }
            tfoot td { font-weight: 600; }
            .text-right { text-align: right; }
            .text-muted { color: #6c757d; }
            .small { font-size: 12px; }
            hr { border: none; border-top: 1px solid #e9ecef; margin: 16px 0; }
          </style>
        </head>
        <body>
          <div class="invoice-wrapper">
            <div class="invoice-header">
              <div>
                <div class="company-name">${COMPANY_INFO.name}</div>
                <div class="small">
                  ${COMPANY_INFO.addressLine1}<br/>
                  ${COMPANY_INFO.addressLine2}<br/>
                  GSTIN: ${COMPANY_INFO.gstin}<br/>
                  Email: ${COMPANY_INFO.email} | Ph: ${COMPANY_INFO.phone}
                </div>
              </div>
              <div style="text-align:right;">
                <div class="badge-paid">PAID</div>
                <div class="invoice-meta">
                  Invoice No: <strong>${invoiceNumber}</strong><br/>
                  Date: ${dateStr}<br/>
                  Mode: Razorpay
                </div>
              </div>
            </div>

            <hr/>

            <div>
              <div class="section-title">Billed To</div>
              <div class="small">
                ${studentName}<br/>
                ${studentEmail}${studentPhone ?'<br/>Ph:' + studentPhone :''}
              </div>
            </div>

            <div>
              <div class="section-title">Order Details</div>
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th class="text-right">Amount Rs</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${test.title}</td>
                    <td class="text-right">${basePrice.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td class="text-muted">GST @ 18%</td>
                    <td class="text-right">${gstAmount.toFixed(2)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total Payable</td>
                    <td class="text-right">${total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <hr/>

            <div class="small text-muted">
              This is a system-generated invoice and does not require a physical signature.<br/>
              Thank you for purchasing from EduDocs.
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    const blob = new Blob([html], { type:'text/html' });
    const urlBlob = URL.createObjectURL(blob);
    const win = window.open(urlBlob,'_blank');
    if (!win) {
      notify('Popup blocked. Please allow popups to download the invoice.','info');
    }
  };

  const getCurrentContext = () => {
    if (topicCategory) {
      return {
        type:'Topic',
        name: topicCategory.name,
        code: topicCategory.code,
        description: topicCategory.description || `${topicCategory.name} test series`,
        level: 3
      };
    } else if (subject) {
      return {
        type:'Subject',
        name: subject.name,
        code: subject.code,
        description: subject.description || `${subject.name} - All Topics`,
        level: 2
      };
    } else if (examinationCategory) {
      return {
        type:'Examination',
        name: examinationCategory.name,
        code: examinationCategory.code,
        description: examinationCategory.description || `${examinationCategory.name} ${examinationCategory.year} - All Subjects`,
        level: 1
      };
    }
    return null;
  };

  const generateBreadcrumb = () => {
    const breadcrumbs = [
      { label:'Home', link:'/' },
      { label:'Test Series', link:'/online-test-series' }
    ];

    if (examinationCategory) {
      breadcrumbs.push({
        label: `${examinationCategory.code} ${examinationCategory.year}`,
        link: `/test-series/examination/${examinationCategory._id}`
      });
    }

    if (subject) {
      breadcrumbs.push({
        label: subject.name,
        link: `/test-series/subject/${subject._id}`
      });
    }

    if (topicCategory) {
      breadcrumbs.push({
        label: topicCategory.name,
        link: `/test-series/topic/${topicCategory._id}`
      });
    }

    return breadcrumbs;
  };

  const updateFilters = (newFilters: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    if (newFilters.page === undefined) {
      newParams.set('page','1');
    }

    setSearchParams(newParams);
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page: page.toString() });
  };

  const handleFilterChange = (filterType: string, value: string) => {
    updateFilters({ [filterType]: value });
  };

  const clearAllFilters = () => {
    setSearchParams({ page:'1' });
  };

  const renderStars = (rating: number = 4) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`${i <= rating ?'bx bxs-star text-warning' :'bx bx-star text-muted'}`}
        ></i>
      );
    }
    return stars;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const capitalizeFirst = (str: string) => {
    if (!str || str ==='undefined') return'Not specified';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const calculateTotalMarks = (questions: Question[]) => {
    return questions.reduce((total, q) => total + q.marks, 0);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const getTestButtonInfo = (test: TestSeries) => {
    if (!test.isPaid) {
      return {
        text:'Start Free Test',
        variant:'btn-success',
        disabled: false,
        loading: false
      };
    }

    const purchase = purchaseStatus[test._id];
    const loading = paymentLoading === test._id;

    if (loading) {
      return {
        text:'Processing...',
        variant:'btn-primary',
        disabled: true,
        loading: true
      };
    }

    if (purchase?.purchased && purchase?.access_granted) {
      return {
        text:'Start Test',
        variant:'btn-success',
        disabled: false,
        loading: false
      };
    }

    return {
      text: `Buy ${test.price?.toLocaleString()} (+GST)`,
      variant:'btn-primary',
      disabled: false,
      loading: false
    };
  };

  const context = getCurrentContext();
  const breadcrumbs = generateBreadcrumb();

  if (loading) {
    return (
      <section className="test-series section-padding bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 text-center">
              <div className="loading-spinner mb-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
              <h5 className="text-muted">
                Loading {context?.name ||'test series'} for you...
              </h5>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="test-series section-padding">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 text-center">
              <div className="error-message p-4 bg-light rounded-4 shadow-sm">
                <i className="bx bx-error-circle display-1 text-danger mb-3"></i>
                <h5 className="text-danger mb-2">Oops! Something went wrong</h5>
                <p className="text-muted">{error}</p>
                <div className="mt-3">
                  <button
                    className="btn btn-primary me-2"
                    onClick={() => fetchHierarchicalTestSeries()}
                  >
                    Try Again
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/online-test-series')}
                  >
                    Back to All Tests
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="test-series section-padding bg-light">
        <div className="container">
          <div className="row mb-5">
            <div className="col-12 text-center">
              <nav aria-label="breadcrumb" className="mb-3">
                <ol className="breadcrumb justify-content-center">
                  {breadcrumbs.map((crumb, index) => (
                    <li
                      key={index}
                      className={`breadcrumb-item ${index === breadcrumbs.length - 1 ?'active' :''}`}
                      aria-current={index === breadcrumbs.length - 1 ?'page' : undefined}
                    >
                      {index === breadcrumbs.length - 1 ? (
                        crumb.label
                      ) : (
                        <Link to={crumb.link} className="text-decoration-none">
                          {crumb.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>

              <div className="mb-4">
                {context?.code && (
                  <div className="mb-2">
                    <span className="badge bg-primary fs-6 px-3 py-2 rounded-pill">
                      {context.code}
                    </span>
                    {context.level && (
                      <span className="badge bg-secondary ms-2 px-2 py-1 small">
                        Level {context.level}
                      </span>
                    )}
                  </div>
                )}
                <h2 className="section-title mb-3">
                  <span className="text-primary">{context?.name}</span> Test Series
                </h2>
                <p className="lead text-muted mb-4">
                  {context?.description || `Comprehensive test series for ${context?.name}`}
                </p>
              </div>
            </div>
          </div>

          {hierarchicalStats && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="category-stats bg-white p-4 rounded-3 shadow-sm">
                  <div className="row text-center">
                    <div className="col-lg-2 col-md-4 col-6 mb-3 mb-lg-0">
                      <div className="stat-item">
                        <h4 className="text-primary mb-1">{hierarchicalStats.totalTests}</h4>
                        <small className="text-muted">Total Tests</small>
                      </div>
                    </div>
                    {hierarchicalStats.totalSubjects && hierarchicalStats.totalSubjects > 0 && (
                      <div className="col-lg-2 col-md-4 col-6 mb-3 mb-lg-0">
                        <div className="stat-item">
                          <h4 className="text-info mb-1">{hierarchicalStats.totalSubjects}</h4>
                          <small className="text-muted">Subjects</small>
                        </div>
                      </div>
                    )}
                    {hierarchicalStats.totalTopics && hierarchicalStats.totalTopics > 0 && (
                      <div className="col-lg-2 col-md-4 col-6 mb-3 mb-lg-0">
                        <div className="stat-item">
                          <h4 className="text-secondary mb-1">{hierarchicalStats.totalTopics}</h4>
                          <small className="text-muted">Topics</small>
                        </div>
                      </div>
                    )}
                    <div className="col-lg-2 col-md-4 col-6 mb-3 mb-lg-0">
                      <div className="stat-item">
                        <h4 className="text-success mb-1">{hierarchicalStats.freeTests}</h4>
                        <small className="text-muted">Free</small>
                      </div>
                    </div>
                    <div className="col-lg-2 col-md-4 col-6 mb-3 mb-lg-0">
                      <div className="stat-item">
                        <h4 className="text-warning mb-1">{hierarchicalStats.paidTests}</h4>
                        <small className="text-muted">Paid</small>
                      </div>
                    </div>
                    <div className="col-lg-2 col-md-4 col-6">
                      <div className="stat-item">
                        <h4 className="text-danger mb-1">{hierarchicalStats.averageDuration}min</h4>
                        <small className="text-muted">Avg Duration</small>
                      </div>
                    </div>
                  </div>

                  {hierarchicalStats.testTypes && (
                    <div className="row mt-4 pt-3 border-top">
                      <div className="col-12 mb-2">
                        <small className="text-muted fw-semibold">Test Types Distribution:</small>
                      </div>
                      {Object.entries(hierarchicalStats.testTypes).map(([type, count]) => (
                        <div key={type} className="col-lg-3 col-md-6 col-6 mb-2">
                          <div className="d-flex align-items-center">
                            <span className="badge bg-light text-dark me-2 px-2 py-1">
                              {capitalizeFirst(type)}
                            </span>
                            <small className="text-muted">{count} tests</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="row mb-4">
            <div className="col-12">
              <div className="filters-section bg-white p-3 rounded-3 shadow-sm">
                <div className="row align-items-center">
                  <div className="col-lg-2 col-md-3 col-sm-6 mb-2 mb-lg-0">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Search tests..."
                      value={search}
                      onChange={(e) => updateFilters({ search: e.target.value })}
                    />
                  </div>
                  <div className="col-lg-2 col-md-3 col-sm-6 mb-2 mb-lg-0">
                    <select
                      className="form-select form-select-sm"
                      value={difficulty}
                      onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                    >
                      <option value="">All Levels</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="col-lg-2 col-md-3 col-sm-6 mb-2 mb-lg-0">
                    <select
                      className="form-select form-select-sm"
                      value={testType}
                      onChange={(e) => handleFilterChange('testType', e.target.value)}
                    >
                      <option value="">All Types</option>
                      <option value="mock">Mock Test</option>
                      <option value="practice">Practice Test</option>
                      <option value="previous">Previous Year</option>
                      <option value="sectional">Sectional Test</option>
                    </select>
                  </div>
                  <div className="col-lg-2 col-md-3 col-sm-6 mb-2 mb-lg-0">
                    <select
                      className="form-select form-select-sm"
                      value={isPaid}
                      onChange={(e) => handleFilterChange('isPaid', e.target.value)}
                    >
                      <option value="">All Access</option>
                      <option value="false">Free</option>
                      <option value="true">Paid</option>
                    </select>
                  </div>
                  <div className="col-lg-2 col-md-4 col-sm-6 mb-2 mb-lg-0">
                    <select
                      className="form-select form-select-sm"
                      value={sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    >
                      <option value="createdAt">Latest</option>
                      <option value="title">Title</option>
                      <option value="seriesNumber">Series Number</option>
                      <option value="duration">Duration</option>
                      <option value="difficulty">Difficulty</option>
                    </select>
                  </div>
                  <div className="col-lg-1 col-md-2 col-sm-3 mb-2 mb-lg-0">
                    <select
                      className="form-select form-select-sm"
                      value={sortOrder}
                      onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    >
                      <option value="desc"></option>
                      <option value="asc"></option>
                    </select>
                  </div>
                  <div className="col-lg-1 col-md-2 col-sm-3">
                    <button
                      className="btn btn-outline-secondary btn-sm w-100"
                      onClick={clearAllFilters}
                      title="Clear all filters"
                    >
                      <i className="bx bx-refresh"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-12">
              <div className="results-counter bg-white p-3 rounded-3 shadow-sm">
                <p className="mb-0 text-muted">
                  <strong className="text-primary">{testSeries.length}</strong> test series found
                  <span className="mx-2"></span>
                  <strong className="text-info">Page {currentPage} of {totalPages}</strong>
                  <span className="mx-2"></span>
                  <strong className="text-success">{context?.type}: {context?.name}</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {testSeries.length > 0 ? (
              testSeries.map((test) => {
                const buttonInfo = getTestButtonInfo(test);
                const purchase = purchaseStatus[test._id];

                return (
                  <div key={test._id} className="col-xl-4 col-lg-6 col-md-6">
                    <div className="test-card h-100 bg-white rounded-4 shadow-sm overflow-hidden hover-lift transition-all">
                      <div className="test-header position-relative bg-gradient-primary p-4">
                        <div className="test-category position-absolute top-0 start-0 m-3">
                          <span className="badge bg-white text-primary px-3 py-2 rounded-pill small">
                            {test.examinationCategory?.code || test.category}
                          </span>
                        </div>
                        <div className="price-badge position-absolute top-0 end-0 m-3">
                          {test.isPaid ? (
                            <span className="badge bg-warning text-dark fs-6 px-3 py-2 rounded-pill">
                              {test.price?.toLocaleString()}
                            </span>
                          ) : (
                            <span className="badge bg-success fs-6 px-3 py-2 rounded-pill">
                              FREE
                            </span>
                          )}
                        </div>

                        {purchase?.purchased && (
                          <div className="purchase-status position-absolute top-0 start-50 translate-middle-x mt-3">
                            <span className="badge bg-success text-white px-2 py-1 small">
                              <i className="bx bx-check-circle me-1"></i>
                              Purchased
                            </span>
                          </div>
                        )}

                        <div className="difficulty-level position-absolute bottom-0 start-0 m-3">
                          <span className={`badge px-3 py-2 rounded-pill ${test.difficulty ==='advanced' ?'bg-danger' :
                            test.difficulty ==='intermediate' ?'bg-warning' :'bg-success'
                            }`}>
                            {capitalizeFirst(test.difficulty)}
                          </span>
                        </div>

                        {test.seriesNumber && (
                          <div className="series-number position-absolute bottom-0 end-0 m-3">
                            <span className="badge bg-light text-dark px-2 py-1 small">
                              #{test.seriesNumber}
                            </span>
                          </div>
                        )}

                        <div className="text-center text-white pt-3">
                          <i className="bx bx-file-blank display-4 mb-2"></i>
                          {test.testType && (
                            <div className="test-type-badge">
                              <span className="badge bg-white bg-opacity-25 text-white px-2 py-1 small">
                                {capitalizeFirst(test.testType)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="card-body p-4">
                        <div className="test-rating mb-3">
                          <div className="d-flex align-items-center">
                            <div className="stars me-2">
                              {renderStars(4)}
                            </div>
                            <span className="text-muted small">(4.5)  200+ attempts</span>
                          </div>
                        </div>

                        {(test.subject || test.topicCategory) && (
                          <div className="hierarchical-context mb-2">
                            <div className="d-flex flex-wrap gap-1">
                              {test.subject && (
                                <span className="badge bg-light text-dark small">
                                   {test.subject.name}
                                </span>
                              )}
                              {test.topicCategory && (
                                <span className="badge bg-light text-dark small">
                                   {test.topicCategory.name}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <h5 className="test-title mb-3">
                          <Link
                            to={`/v2/student/my-test-series/${studentData.id}`}
                            className="text-decoration-none text-dark hover-primary"
                            title={test.title}
                          >
                            {test.title}
                          </Link>
                        </h5>

                        <p className="test-desc text-muted mb-3 small">
                          {test.description ||'Comprehensive test series designed to assess and improve your knowledge.'}
                        </p>

                        <div className="test-meta mb-4">
                          <div className="row g-3">
                            <div className="col-4">
                              <div className="meta-item text-center">
                                <i className='bx bx-help-circle text-primary mb-1'></i>
                                <div className="small text-muted">Questions</div>
                                <div className="fw-bold small">{test.questions.length}</div>
                              </div>
                            </div>
                            <div className="col-4">
                              <div className="meta-item text-center">
                                <i className='bx bx-time text-warning mb-1'></i>
                                <div className="small text-muted">Duration</div>
                                <div className="fw-bold small">{formatDuration(test.duration)}</div>
                              </div>
                            </div>
                            <div className="col-4">
                              <div className="meta-item text-center">
                                <i className='bx bx-trophy text-success mb-1'></i>
                                <div className="small text-muted">Marks</div>
                                <div className="fw-bold small">{calculateTotalMarks(test.questions)}</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {purchase?.purchased && (
                          <div className="purchase-info mb-3 p-2 bg-light rounded">
                            <div className="row text-center">
                              {purchase.purchased && (
                                <div className="col-6">
                                  <small className="text-muted">Attempts</small>
                                  <div className="fw-bold small text-success">Unlimited</div>
                                </div>
                              )}
                              {purchase.best_percentage !== undefined && purchase.best_percentage > 0 && (
                                <div className="col-6">
                                  <small className="text-muted">Best Score</small>
                                  <div className="fw-bold small text-success">{purchase.best_percentage}%</div>
                                </div>
                              )}
                            </div>
                            <div className="text-center mt-2 border-top pt-1">
                              <button
                                className="btn btn-link btn-sm text-decoration-none p-0"
                                style={{ fontSize:'11px' }}
                                onClick={() => downloadInvoice(test)}
                              >
                                <i className='bx bx-download me-1'></i>Download Invoice
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="test-info mb-4">
                          <div className="row g-2">
                            <div className="col-6">
                              <div className="d-flex align-items-center">
                                <i className="bx bx-infinite text-info me-2"></i>
                                <span className="small text-muted">Unlimited Attempts</span>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="d-flex align-items-center">
                                <i className="bx bx-calendar text-secondary me-2"></i>
                                <span className="small text-muted">Practice</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="test-footer d-flex align-items-center justify-content-between">
                          <div className="instructor d-flex align-items-center">
                            <img
                              src={test.createdBy?.tprofile
                                ? `${url}${test.createdBy.tprofile}`
                                :"https://via.placeholder.com/40x40/6c757d/ffffff?text=T"
                              }
                              alt={test.createdBy?.name || test.createdBy?.tname}
                              className="instructor-img rounded-circle me-2"
                              style={{ width:'32px', height:'32px', objectFit:'cover' }}
                            />
                            <div>
                              <div className="instructor-name small fw-semibold">
                                {test.createdBy?.name || test.createdBy?.tname ||'Test Creator'}
                              </div>
                              <div className="instructor-spec text-muted" style={{ fontSize:'12px' }}>
                                {test.createdBy?.tspecialization ||'Expert'}
                              </div>
                            </div>
                          </div>

                          <div>
                            <button
                              className={`btn ${buttonInfo.variant} btn-sm px-3`}
                              onClick={() => handleTestAccess(test)}
                              disabled={buttonInfo.disabled}
                            >
                              {buttonInfo.loading ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                  {buttonInfo.text}
                                </>
                              ) : (
                                <>
                                  <i className={`bx ${test.isPaid && !purchase?.purchased ?'bx-shopping-bag' :'bx-play'} me-1`}></i>
                                  {buttonInfo.text}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-12">
                <div className="no-tests text-center py-5">
                  <i className="bx bx-file-blank display-1 text-muted mb-3"></i>
                  <h5 className="text-muted mb-2">
                    No test series found for"{context?.name}"
                  </h5>
                  <p className="text-muted">
                    Try adjusting your filters or check back later for new tests!
                  </p>
                  <div className="mt-3">
                    <button
                      className="btn btn-primary me-2"
                      onClick={clearAllFilters}
                    >
                      Clear Filters
                    </button>
                    <Link
                      to="/online-test-series"
                      className="btn btn-outline-secondary"
                    >
                      View All Tests
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="row mt-5">
              <div className="col-12">
                <nav className="pagination-wrapper d-flex justify-content-center">
                  <ul className="pagination pagination-lg shadow-sm rounded-3 overflow-hidden">
                    <li className={`page-item ${currentPage === 1 ?'disabled' :''}`}>
                      <button
                        className="page-link border-0 px-4"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                      >
                        <i className="bx bx-chevron-left"></i>
                        Previous
                      </button>
                    </li>

                    {[...Array(Math.min(totalPages, 10))].map((_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <li key={pageNumber} className={`page-item ${currentPage === pageNumber ?'active' :''}`}>
                          <button
                            className="page-link border-0 px-4"
                            onClick={() => handlePageChange(pageNumber)}
                          >
                            {pageNumber}
                          </button>
                        </li>
                      );
                    })}

                    <li className={`page-item ${currentPage === totalPages ?'disabled' :''}`}>
                      <button
                        className="page-link border-0 px-4"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <i className="bx bx-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          )}
        </div>
      </section>

      <style>{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
        }
        
        .test-card {
          border: 1px solid #f0f0f0;
          transition: all 0.3s ease;
        }
        
        .test-card:hover {
          border-color: #007bff;
        }
        
        .hover-primary:hover {
          color: #007bff !important;
        }
        
        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        
        .test-title {
          font-size: 1.1rem;
          font-weight: 600;
          line-height: 1.4;
          height: 2.8rem;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        
        .test-desc {
          height: 3rem;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        
        .hierarchical-context .badge {
          font-size: 0.75rem;
        }
        
        .series-number {
          font-size: 0.8rem;
        }
        
        .test-type-badge {
          margin-top: 5px;
        }
        
        .meta-item i {
          font-size: 1.2rem;
        }
        
        .purchase-status {
          z-index: 10;
        }
        
        .purchase-info {
          border: 1px solid #e9ecef;
        }
        
        .btn-primary:disabled {
          opacity: 0.7;
        }
        
        .spinner-border-sm {
          width: 0.875rem;
          height: 0.875rem;
        }

        .edudocs-toast {
          animation: toastIn 0.25s ease-out;
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .pagination .page-link {
          color: #6c757d;
          background-color: #fff;
          border: none;
        }
        
        .pagination .page-item.active .page-link {
          background-color: #007bff;
          border-color: #007bff;
          color: white;
        }
        
        .pagination .page-link:hover {
          color: #007bff;
          background-color: #f8f9fa;
        }
        
        .price-badge .badge {
          font-size: 0.9rem;
          font-weight: 600;
        }
        
        .results-counter {
          border-left: 4px solid #007bff;
        }
        
        .category-stats {
          border-left: 4px solid #28a745;
        }
        
        .filters-section {
          border-left: 4px solid #ffc107;
        }
        
        .stars i {
          color: #ffc107;
          font-size: 0.9rem;
        }
        
        .loading-spinner {
          animation: fadeIn 0.5s ease-in;
        }
        
        .test-header {
          min-height: 140px;
          position: relative;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          font-weight: 500;
        }
        
        .btn-primary:hover {
          background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
          transform: translateY(-1px);
        }
        
        .breadcrumb {
          background: none;
          padding: 0;
        }
        
        .breadcrumb-item + .breadcrumb-item::before {
          content:"";
          color: #6c757d;
        }
        
        .stat-item h4 {
          font-size: 1.5rem;
          font-weight: 700;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @media (max-width: 768px) {
          .section-title {
            font-size: 2rem;
          }
          
          .test-meta .row {
            --bs-gutter-x: 0.5rem;
          }
          
          .meta-item {
            font-size: 0.85rem;
          }
          
          .filters-section .row > div {
            margin-bottom: 0.5rem;
          }
          
          .hierarchical-context .badge {
            font-size: 0.7rem;
          }
          
          .category-stats .row {
            --bs-gutter-x: 0.5rem;
          }
          
          .stat-item h4 {
            font-size: 1.2rem;
          }
          
          .purchase-info {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </>
  );
};

export default CategoryWiseTestSeries;
