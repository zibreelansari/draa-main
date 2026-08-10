// frontend/src/components/TopicPurchaseButton.tsx
import React, { useState, useEffect } from'react';
import { Button, Modal, Spin, Alert, Card, Tag, Space } from'antd';
import { 
  LockOutlined, 
  UnlockOutlined, 
  ShoppingCartOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  TrophyOutlined,
  ClockCircleOutlined
} from'@ant-design/icons';
import axios from'axios';
import url from'../../url';
import { getStoredUser, isAuthenticated, getAuthHeaders } from'../../utils/global_auth';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface TopicPurchaseButtonProps {
  topicCategoryId: string;
  topicName: string;
  topicPrice: number;
  originalPrice?: number;
  discount?: number;
  totalTests: number;
  isPaid: boolean;
  onPurchaseSuccess?: () => void;
}

interface StudentData {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

const TopicPurchaseButton: React.FC<TopicPurchaseButtonProps> = ({
  topicCategoryId,
  topicName,
  topicPrice,
  originalPrice,
  discount,
  totalTests,
  isPaid,
  onPurchaseSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [purchaseDetails, setPurchaseDetails] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [studentData, setStudentData] = useState<StudentData | null>(null);

  useEffect(() => {
    // Get logged-in student data
    const parsed = getStoredUser();
    if (parsed) {
      setStudentData({
        id: parsed.id,
        name: parsed.name ||'',
        email: parsed.email ||'',
        phone: parsed.phone ||''
      });
    }
  }, []);

  useEffect(() => {
    if (studentData?.id && isPaid) {
      checkPurchaseStatus();
    } else {
      setCheckingAccess(false);
    }
  }, [studentData, topicCategoryId, isPaid]);

  const checkPurchaseStatus = async () => {
    try {
      setCheckingAccess(true);
      const response = await axios.get(
        `${url}/topic-purchase/check-purchase/${topicCategoryId}`,
        { params: { student_id: studentData?.id } }
      );

      if (response.data.success && response.data.purchased) {
        setHasPurchased(true);
        setPurchaseDetails(response.data);
      }
    } catch (error) {
      console.error('Error checking purchase status:', error);
    } finally {
      setCheckingAccess(false);
    }
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src ='https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchase = async () => {
    // Real-time auth check
    if (!isAuthenticated()) {
      toast.error('Please login to purchase');
      return;
    }

    if (hasPurchased) {
      toast.info('You have already purchased this topic');
      return;
    }

    setConfirmModal(true);
  };

  const proceedWithPurchase = async () => {
    setConfirmModal(false);
    setLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Step 1: Create order
      const orderResponse = await axios.post(
        `${url}/topic-purchase/create-order`,
        {
          topic_category_id: topicCategoryId,
          student_data: studentData
        },
        {
          headers: getAuthHeaders()
        }
      );

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.message);
      }

      const { orderId, amount, currency, topicCategory } = orderResponse.data;

      // Step 2: Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_LIVE_KEY,
        amount: amount,
        currency: currency,
        name:'Draa',
        description: `Purchase: ${topicName} (${totalTests} Tests)`,
        order_id: orderId,
        prefill: {
          name: studentData.name,
          email: studentData.email,
          contact: studentData.phone ||''
        },
        theme: {
          color:'#1890ff'
        },
        handler: async (response: any) => {
          await verifyPayment(response);
        },
        modal: {
          ondismiss: () => {
            toast.info('Payment cancelled');
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error: any) {
      console.error('Purchase error:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please login again.');
        window.location.href ='/student-login';
        return;
      }
      
      toast.error(error.response?.data?.message ||'Failed to initiate purchase');
      setLoading(false);
    }
  };

  const verifyPayment = async (paymentData: any) => {
    try {
      const verifyResponse = await axios.post(
        `${url}/topic-purchase/verify-payment`,
        {
          topic_category_id: topicCategoryId,
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_signature: paymentData.razorpay_signature,
          student_data: studentData
        },
        {
          headers: getAuthHeaders()
        }
      );

      if (verifyResponse.data.success) {
        toast.success(verifyResponse.data.message);
        setHasPurchased(true);
        setPurchaseDetails(verifyResponse.data);

        if (onPurchaseSuccess) {
          onPurchaseSuccess();
        }
      } else {
        throw new Error(verifyResponse.data.message);
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        toast.error('Your session expired during payment. Please login and try again.');
        window.location.href ='/student-login';
        return;
      }
      
      toast.error(error.response?.data?.message ||'Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  // If not paid, show free access
  if (!isPaid) {
    return (
      <Button 
        type="primary" 
        icon={<UnlockOutlined />}
        size="large"
        style={{ width:'100%' }}
      >
        Free Access - View {totalTests} Tests
      </Button>
    );
  }

  // Loading state
  if (checkingAccess) {
    return (
      <Button 
        size="large" 
        style={{ width:'100%' }}
        disabled
      >
        <Spin size="small" /> Checking access...
      </Button>
    );
  }

  // Already purchased
  if (hasPurchased) {
    return (
      <Button 
        type="primary"
        icon={<CheckCircleOutlined />}
        size="large"
        style={{ 
          width:'100%',
          background:'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
          border:'none'
        }}
      >
         Purchased - Access {totalTests} Tests
      </Button>
    );
  }

  // Purchase button
  return (
    <>
      <Button
        type="primary"
        icon={<ShoppingCartOutlined />}
        size="large"
        loading={loading}
        onClick={handlePurchase}
        style={{ 
          width:'100%',
          background:'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
          border:'none',
          height:'48px',
          fontSize:'16px',
          fontWeight:'bold'
        }}
      >
        <Space>
          <span>Buy Topic Bundle</span>
          <span style={{ fontSize:'18px' }}>{topicPrice}</span>
          {originalPrice && originalPrice > topicPrice && (
            <span style={{ 
              textDecoration:'line-through', 
              fontSize:'14px',
              opacity: 0.8
            }}>
              {originalPrice}
            </span>
          )}
        </Space>
      </Button>

      {/* Confirmation Modal */}
      <Modal
        title={
          <div style={{ fontSize:'20px', fontWeight:'bold' }}>
            <ShoppingCartOutlined style={{ color:'#1890ff', marginRight: 8 }} />
            Confirm Purchase
          </div>
        }
        open={confirmModal}
        onOk={proceedWithPurchase}
        onCancel={() => setConfirmModal(false)}
        okText="Proceed to Payment"
        cancelText="Cancel"
        width={600}
        okButtonProps={{ 
          size:'large',
          style: { 
            background:'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
            border:'none'
          }
        }}
      >
        <Card bordered={false} style={{ background:'#f5f5f5', marginBottom: 16 }}>
          <h3 style={{ marginBottom: 16 }}>{topicName}</h3>

          <div style={{ marginBottom: 16 }}>
            <Space direction="vertical" size="small" style={{ width:'100%' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span><TrophyOutlined /> Total Tests:</span>
                <Tag color="blue" style={{ fontSize:'14px' }}>{totalTests} Tests</Tag>
              </div>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span><ClockCircleOutlined /> Validity:</span>
                <Tag color="green">365 Days (1 Year)</Tag>
              </div>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span><UnlockOutlined /> Attempts:</span>
                <Tag color="purple">Unlimited</Tag>
              </div>
            </Space>
          </div>

          <div style={{ 
            padding:'16px',
            background:'#e6f7ff',
            borderRadius:'8px',
            border:'1px solid #91d5ff'
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:'16px', fontWeight:'bold', color:'#096dd9' }}>
                  <DollarOutlined /> Total Amount:
                </div>
                {originalPrice && originalPrice > topicPrice && (
                  <div style={{ fontSize:'12px', color:'#999', textDecoration:'line-through' }}>
                    Original: {originalPrice}
                  </div>
                )}
              </div>
              <div>
                <span style={{ fontSize:'28px', fontWeight:'bold', color:'#1890ff' }}>
                  {topicPrice}
                </span>
                {discount && discount > 0 && (
                  <Tag color="red" style={{ marginLeft: 8 }}>
                    {discount}% OFF
                  </Tag>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Alert
          message=" One-time Purchase"
          description={`Pay once and get lifetime access to all ${totalTests} tests under this topic. New tests added to this topic will be automatically accessible to you.`}
          type="success"
          showIcon
          style={{ marginTop: 16 }}
        />
      </Modal>
    </>
  );
};

export default TopicPurchaseButton;