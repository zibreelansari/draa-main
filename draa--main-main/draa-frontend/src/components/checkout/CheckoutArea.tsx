import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  message, Spin, Card, Radio, Divider, Button, Input,
  Typography, Row, Col, Space, Badge, Avatar, Alert, Tag
} from "antd";
import {
  EnvironmentOutlined,
  CreditCardOutlined,
  LockOutlined,
  ArrowLeftOutlined,
  WalletOutlined,
  SafetyCertificateOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from "@ant-design/icons";
import uri, { getImageUrl } from "../../url";
import ImgWithFallback from "../common/ImgWithFallback";
import { isAuthenticated, getStoredUser, getUserRole, getCartKey } from "../../utils/global_auth";
import { useAuthModal } from "../register/auth/AuthModalContext";

const { Title, Text } = Typography;

declare global {
  interface Window {
    Razorpay: any;
  }
}

const SHIPPING_CHARGE = 100;
const COIN_VALUE = 0.10;
const MIN_COINS_TO_USE = 100;

const emptyAddress = {
  fullName: "",
  phone: "",
  house: "",
  area: "",
  landmark: "",
  pincode: "",
  city: "",
  district: "",
  state: "",
  country: "India"
};

const normalizeSavedAddress = (user: any) => ({
  ...emptyAddress,
  ...(user?.deliveryAddress || {}),
  fullName: user?.deliveryAddress?.fullName || user?.name || "",
  phone: user?.deliveryAddress?.phone || user?.phn || user?.phone || ""
});

export default function CheckoutArea() {
  const navigate = useNavigate();
  const location = useLocation();
  const { openAuthModal } = useAuthModal();

  // --- States ---
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [student, setStudent] = useState<any>(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [coinsToUse, setCoinsToUse] = useState(0);
  const [verifiedPincode, setVerifiedPincode] = useState("");

  const [address, setAddress] = useState(emptyAddress);

  // --- Saved Address States ---
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressLabel, setAddressLabel] = useState<string>("Home");

  // --- External Scripts ---
  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  const loadSavedAddresses = (userId: string, user: any) => {
    const localKey = `draa-saved-addresses-${userId}`;
    let addresses: any[] = [];
    try {
      addresses = JSON.parse(localStorage.getItem(localKey) || "[]");
    } catch {
      addresses = [];
    }

    const profileAddr = user?.deliveryAddress;
    if (addresses.length === 0 && profileAddr && profileAddr.fullName && profileAddr.phone && profileAddr.house) {
      const seeded = {
        id: `addr-profile-${Date.now()}`,
        ...normalizeSavedAddress(user),
        label: "Home",
        isDefault: true
      };
      addresses = [seeded];
      localStorage.setItem(localKey, JSON.stringify(addresses));
    }

    setSavedAddresses(addresses);

    if (addresses.length > 0) {
      const def = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddressId(def.id);
      setAddress(def);
      setAddressLabel(def.label || "Home");
      if (def.pincode && def.city && def.state) setVerifiedPincode(def.pincode);
      setShowNewAddressForm(false);
    } else {
      setSelectedAddressId(null);
      setAddress(normalizeSavedAddress(user));
      setVerifiedPincode("");
      setShowNewAddressForm(true);
    }
  };

  const loadData = useCallback(() => {
    const isAuthed = isAuthenticated();
    if (!isAuthed) {
      setStudent(null);
      setWalletBalance(0);
      setCoinsToUse(0);

      const cartKey = getCartKey();
      const storedCart = localStorage.getItem(cartKey);
      if (location.state?.cartItems) {
        setCartItems(location.state.cartItems);
      } else if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
      setLoading(false);
      return;
    }

    const parsed = getStoredUser();
    const role = getUserRole();

    if (role === "ADMIN" || role === "TEACHER") {
      message.error(`Access Denied: As a ${role.toLowerCase()}, you are not permitted to access the checkout page.`);
      navigate(role === "ADMIN" ? "/admin-dashboard" : "/teacher-dashboard", { replace: true });
      return;
    }

    setStudent(parsed);
    loadSavedAddresses(parsed.id || parsed._id, parsed);

    fetch(`${uri}/student/profile`, {
      headers: { Authorization: `Bearer ${parsed.token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (!data.success) return;
        const refreshedStudent = { ...parsed, ...data.user, token: parsed.token };
        if (refreshedStudent._id && !refreshedStudent.id) refreshedStudent.id = refreshedStudent._id;
        setStudent(refreshedStudent);
        localStorage.setItem("edudocs", JSON.stringify(refreshedStudent));
        loadSavedAddresses(refreshedStudent.id, refreshedStudent);
      })
      .catch(() => console.error("Profile address refresh failed"));

    fetch(`${uri}/student/wallet`, {
      headers: { Authorization: `Bearer ${parsed.token}` }
    })
      .then(res => res.json())
      .then(data => data.success && setWalletBalance(data.wallet.balance || 0))
      .catch(() => console.error("Wallet error"));

    const cartKey = getCartKey();
    const storedCart = localStorage.getItem(cartKey);
    if (location.state?.cartItems) {
      setCartItems(location.state.cartItems);
    } else if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
    setLoading(false);
  }, [navigate, location.state]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handleAuthUpdated = () => {
      loadData();
    };
    window.addEventListener("auth-updated", handleAuthUpdated);
    window.addEventListener("cart-updated", handleAuthUpdated);
    return () => {
      window.removeEventListener("auth-updated", handleAuthUpdated);
      window.removeEventListener("cart-updated", handleAuthUpdated);
    };
  }, [loadData]);

  const [pincodeResults, setPincodeResults] = useState<any[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // --- Calculations ---
  const subtotal = useMemo(() =>
    cartItems.reduce((t, i) => t + (Math.floor(i.finalPrice || i.price) * (i.quantity || 1)), 0),
    [cartItems]);

  const shippingFee = cartItems.some(i => i.bookType === "paperback") ? SHIPPING_CHARGE : 0;
  const coinDiscount = Math.floor(coinsToUse / 10);
  const total = Math.max(subtotal + shippingFee - coinDiscount, 0);

  // --- Real-time Validation Logic ---
  const validateField = (name: string, value: string) => {
    let error = "";
    if (name === "phone") {
      if (!/^[6-9]\d{9}$/.test(value)) error = "Enter a valid 10-digit Indian mobile number";
    } else if (name === "pincode") {
      if (!/^\d{6}$/.test(value)) error = "Pincode must be exactly 6 digits";
    } else if (name === "fullName") {
      if (value.length < 3) error = "Name is too short";
    } else if (!value && name !== "landmark" && name !== "area") {
      error = "This field is required";
    }

    setFormErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const isValid = useMemo(() => {
    if (showNewAddressForm) return false;
    return (
      selectedAddressId !== null &&
      address.fullName.length >= 3 &&
      /^[6-9]\d{9}$/.test(address.phone) &&
      address.pincode.length === 6 &&
      verifiedPincode === address.pincode &&
      address.house.length > 0 &&
      address.area.length > 0 &&
      address.city.length > 0 &&
      address.state.length > 0
    );
  }, [address, verifiedPincode, showNewAddressForm, selectedAddressId]);

  // --- Address Handlers ---
  const handleSelectAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    setAddress(addr);
    setAddressLabel(addr.label || "Home");
    setVerifiedPincode(addr.pincode);
    setFormErrors({});
    setShowNewAddressForm(false);
    setEditingAddressId(null);
  };

  const handleAddNewAddressClick = () => {
    setShowNewAddressForm(true);
    setSelectedAddressId(null);
    setEditingAddressId(null);
    setAddressLabel("Home");
    setAddress({
      ...emptyAddress,
      fullName: student?.name || "",
      phone: student?.phn || student?.phone || ""
    });
    setVerifiedPincode("");
    setFormErrors({});
  };

  const handleEditAddress = (addr: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNewAddressForm(true);
    setEditingAddressId(addr.id);
    setSelectedAddressId(null);
    setAddress(addr);
    setAddressLabel(addr.label || "Home");
    setVerifiedPincode(addr.pincode);
    setFormErrors({});
  };

  const handleDeleteAddress = (addrId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!student) return;
    const localKey = `draa-saved-addresses-${student.id}`;
    const filtered = savedAddresses.filter(a => a.id !== addrId);
    localStorage.setItem(localKey, JSON.stringify(filtered));
    setSavedAddresses(filtered);
    message.success("Address deleted successfully");

    if (selectedAddressId === addrId) {
      if (filtered.length > 0) {
        handleSelectAddress(filtered[0]);
      } else {
        handleAddNewAddressClick();
      }
    }
  };

  const handleSaveAddress = () => {
    if (!student) {
      return message.error("Please login to save address.");
    }

    // Temporarily disable the form block logic of isValid to validate address inputs
    const isFormValid =
      address.fullName.length >= 3 &&
      /^[6-9]\d{9}$/.test(address.phone) &&
      address.pincode.length === 6 &&
      verifiedPincode === address.pincode &&
      address.house.length > 0 &&
      address.area.length > 0 &&
      address.city.length > 0 &&
      address.state.length > 0;

    if (!isFormValid) {
      Object.keys(address).forEach(key => validateField(key, (address as any)[key]));
      return message.error("Please fill all required fields correctly.");
    }

    const localKey = `draa-saved-addresses-${student.id}`;
    let updatedList = [...savedAddresses];

    const addressToSave = {
      ...address,
      label: addressLabel
    };

    if (editingAddressId) {
      updatedList = updatedList.map(a =>
        a.id === editingAddressId
          ? { ...addressToSave, id: editingAddressId }
          : a
      );
      message.success("Address updated successfully");
    } else {
      const newAddr = {
        ...addressToSave,
        id: `addr-${Date.now()}`,
        isDefault: updatedList.length === 0
      };
      updatedList.push(newAddr);
      message.success("Address saved successfully");
    }

    localStorage.setItem(localKey, JSON.stringify(updatedList));
    setSavedAddresses(updatedList);

    const target = editingAddressId
      ? updatedList.find(a => a.id === editingAddressId)
      : updatedList[updatedList.length - 1];

    setSelectedAddressId(target.id);
    setAddress(target);
    setVerifiedPincode(target.pincode);
    setShowNewAddressForm(false);
    setEditingAddressId(null);
  };

  // --- Handlers ---
  const handlePincodeLookup = async (pin: string) => {
    const val = pin.replace(/\D/g, "").slice(0, 6);
    setVerifiedPincode("");
    setAddress(prev => ({
      ...prev,
      pincode: val,
      area: "",
      city: "",
      district: "",
      state: ""
    }));
    validateField("pincode", val);

    if (val.length === 6) {
      setPincodeLoading(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const data = await res.json();
        if (data[0]?.Status === "Success" && Array.isArray(data[0].PostOffice) && data[0].PostOffice.length > 0) {
          const results = data[0].PostOffice;
          setPincodeResults(results);
          const po = results[0];
          const city = po.Block && po.Block !== "NA" ? po.Block : po.District;
          setAddress(prev => ({
            ...prev,
            area: po.Name || "",
            city,
            district: po.District,
            state: po.State
          }));
          setVerifiedPincode(val);

          setFormErrors(prev => ({ ...prev, pincode: "", area: "", city: "", state: "" }));
          message.success(`Found ${results.length} areas in ${po.District}`);
        } else {
          setPincodeResults([]);
          setFormErrors(prev => ({ ...prev, pincode: "Invalid pincode or not found" }));
        }
      } catch {
        setPincodeResults([]);
        setFormErrors(prev => ({ ...prev, pincode: "Could not verify pincode. Please try again." }));
        message.error("Pincode service temporarily busy");
      } finally {
        setPincodeLoading(false);
      }
    } else {
      setPincodeResults([]);
    }
  };

  const placeOrder = async () => {
    if (!student) {
      message.warning("Please login to place your order.");
      openAuthModal("student", "login");
      return;
    }
    const role = student?.role || "GUEST";
    if (role === "teacher" || role === "admin" || role === "TEACHER" || role === "ADMIN") {
      return message.error("You are not allowed to place orders.");
    }
    if (!isValid) {
      Object.keys(address).forEach(key => validateField(key, (address as any)[key]));
      return message.error("Please fix the errors in the address form.");
    }
    setPaymentLoading(true);

    const saveDeliveryAddress = async () => {
      try {
        const profileRes = await fetch(`${uri}/student/profile`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${student.token}` },
          body: JSON.stringify({ deliveryAddress: address })
        });
        const profileData = await profileRes.json();
        if (profileData.success) {
          const updatedStudent = { ...student, ...profileData.user, token: student.token };
          if (updatedStudent._id && !updatedStudent.id) updatedStudent.id = updatedStudent._id;
          setStudent(updatedStudent);
          localStorage.setItem("edudocs", JSON.stringify(updatedStudent));
        }
      } catch {
        console.error("Failed to save delivery address");
      }
    };

    const orderPayload = {
      books: cartItems.map(i => ({ book_id: i.bookId, quantity: i.quantity, purchase_type: i.bookType, finalPrice: Math.floor(i.finalPrice || i.price) })),
      shipping_fee: shippingFee,
      total_amount: total,
      coins_used: coinsToUse,
      payment_method: paymentMethod,
      student_data: student,
      delivery_address: address
    };

    try {
      const res = await fetch(`${uri}/books/cart/create-cart-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${student.token}` },
        body: JSON.stringify(orderPayload)
      });

      if (res.status === 401) {
        message.error("Session expired. Redirecting...");
        navigate("/student-login", { replace: true });
        return;
      }

      if (!res.ok) throw new Error("Order creation failed");

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Order failed");

      if (paymentMethod === "razorpay") {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_LIVE_KEY,
          order_id: data.orderId,
          amount: data.amount,
          name: "Draa",
          prefill: { name: address.fullName, contact: address.phone, email: student.email },
          handler: async (response: any) => {
            const verifyRes = await fetch(`${uri}/books/cart/verify-cart-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${student.token}` },
              body: JSON.stringify({ ...orderPayload, ...response })
            });
            const vData = await verifyRes.json();
            if (vData.success) {
              await saveDeliveryAddress();
              localStorage.removeItem(`draa-cart-${student.id}`);
              navigate("/student-dashboard", { state: { orderSuccess: true } });
            } else {
              message.error("Payment verification failed");
            }
          }
        };
        new window.Razorpay(options).open();
      } else {
        await saveDeliveryAddress();
        localStorage.removeItem(`draa-cart-${student.id}`);
        navigate("/student-dashboard", { state: { orderSuccess: true } });
      }
    } catch (error: any) {
      message.error(error.message || "Failed to place order");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) return <div className="loader-container"><Spin size="large" /></div>;

  return (
    <div className="checkout-wrapper">
      <div className="checkout-container">
        {/* Header Section */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 32 }}>
          <Col>
            <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ padding: 0 }}>
              Back to Cart
            </Button>
            <Title level={2} style={{ margin: "8px 0 0" }}>Checkout</Title>
          </Col>
          <Col className="hide-mobile">
            <Space>
              <SafetyCertificateOutlined style={{ color: '#52c41a', fontSize: 24 }} />
              <div>
                <Text strong style={{ display: 'block' }}>Secure Payment</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}> Verified by Draa</Text>
              </div>
            </Space>
          </Col>
        </Row>

        <Row gutter={[32, 32]}>
          {/* Form Side */}
          <Col xs={24} lg={15}>
            <Space direction="vertical" size={24} style={{ width: '100%' }}>

              {/* Shipping Card */}
              <Card
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Space><EnvironmentOutlined /><span>1. Delivery Address</span></Space>
                    {!showNewAddressForm && student && (
                      <Button
                        type="dashed"
                        onClick={handleAddNewAddressClick}
                        icon={<PlusOutlined />}
                        style={{ borderStyle: 'dashed' }}
                      >
                        Add New Address
                      </Button>
                    )}
                  </div>
                }
                className="checkout-card"
              >
                {!student ? (
                  // Guest Login Prompt
                  <div style={{ textAlign: "center", padding: "32px 16px" }}>
                    <div style={{ marginBottom: 16 }}>
                      <LockOutlined style={{ fontSize: 48, color: "#1677ff" }} />
                    </div>
                    <Title level={4} style={{ margin: "0 0 8px" }}>Login to select delivery address</Title>
                    <Text type="secondary" style={{ display: "block", marginBottom: 24, maxWidth: 400, margin: "0 auto 24px" }}>
                      Please sign in or create a free account to enter your shipping details and complete your order.
                    </Text>
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => openAuthModal("student", "login")}
                      style={{
                        background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                        border: "none",
                        padding: "0 40px",
                        height: 44,
                        borderRadius: 8,
                        fontWeight: 600
                      }}
                    >
                      Login / Sign Up
                    </Button>
                  </div>
                ) : showNewAddressForm ? (
                  // Address Form (Add/Edit)
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <Title level={4} style={{ margin: 0 }}>
                        {editingAddressId ? "Edit Address" : "Add a New Address"}
                      </Title>
                      {savedAddresses.length > 0 && (
                        <Button type="link" onClick={() => {
                          setShowNewAddressForm(false);
                          setEditingAddressId(null);
                          const prevSelected = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
                          if (prevSelected) {
                            handleSelectAddress(prevSelected);
                          }
                        }}>
                          Cancel
                        </Button>
                      )}
                    </div>
                    <Row gutter={[16, 20]}>
                      <Col span={24}>
                        <Text strong style={{ display: 'block', marginBottom: 8 }}>Full Name</Text>
                        <Input
                          size="large"
                          placeholder="e.g. Rahul Sharma"
                          value={address.fullName}
                          status={formErrors.fullName ? "error" : ""}
                          onChange={e => {
                            setAddress({ ...address, fullName: e.target.value });
                            validateField("fullName", e.target.value);
                          }}
                        />
                        {formErrors.fullName && <Text type="danger" style={{ fontSize: 12 }}>{formErrors.fullName}</Text>}
                      </Col>

                      <Col xs={24} sm={12}>
                        <Text strong style={{ display: 'block', marginBottom: 8 }}>Mobile Number</Text>
                        <Input
                          size="large"
                          prefix="+91"
                          maxLength={10}
                          placeholder="10-digit number"
                          status={formErrors.phone ? "error" : ""}
                          value={address.phone}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, "");
                            setAddress({ ...address, phone: val });
                            validateField("phone", val);
                          }}
                        />
                        {formErrors.phone && <Text type="danger" style={{ fontSize: 12 }}>{formErrors.phone}</Text>}
                      </Col>

                      <Col xs={24} sm={12}>
                        <Text strong style={{ display: 'block', marginBottom: 8 }}>Pincode</Text>
                        <Input
                          size="large"
                          suffix={pincodeLoading ? <Spin size="small" /> : null}
                          maxLength={6}
                          placeholder="6-digit Pincode"
                          status={formErrors.pincode ? "error" : ""}
                          value={address.pincode}
                          onChange={e => handlePincodeLookup(e.target.value)}
                        />
                        {formErrors.pincode && <Text type="danger" style={{ fontSize: 12 }}>{formErrors.pincode}</Text>}
                      </Col>

                      <Col span={24}>
                        <Text strong style={{ display: 'block', marginBottom: 8 }}>House No. / Building Name</Text>
                        <Input
                          size="large"
                          placeholder="Door No, Floor, etc."
                          status={formErrors.house ? "error" : ""}
                          value={address.house}
                          onChange={e => {
                            setAddress({ ...address, house: e.target.value });
                            validateField("house", e.target.value);
                          }}
                        />
                        {formErrors.house && <Text type="danger" style={{ fontSize: 12 }}>{formErrors.house}</Text>}
                      </Col>

                      <Col span={24}>
                        <Text strong style={{ display: 'block', marginBottom: 8 }}>Road Name / Area / Colony</Text>
                        {pincodeResults.length > 0 ? (
                          <Radio.Group
                            style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}
                            value={address.area}
                            onChange={e => {
                              const po = pincodeResults.find(item => item.Name === e.target.value);
                              setAddress({
                                ...address,
                                area: e.target.value,
                                city: po?.Block && po.Block !== "NA" ? po.Block : po?.District || address.city,
                                district: po?.District || address.district,
                                state: po?.State || address.state
                              });
                            }}
                          >
                            {pincodeResults.slice(0, 10).map(po => (
                              <Radio.Button key={po.Name} value={po.Name} style={{ height: 'auto', padding: '8px' }}>
                                {po.Name}
                              </Radio.Button>
                            ))}
                          </Radio.Group>
                        ) : (
                          <Input
                            size="large"
                            placeholder="Street, Sector, etc."
                            value={address.area}
                            onChange={e => setAddress({ ...address, area: e.target.value })}
                          />
                        )}
                      </Col>

                      <Col span={24}>
                        <Text strong style={{ display: 'block', marginBottom: 8 }}>Landmark (Optional)</Text>
                        <Input size="large" placeholder="Near Temple, School, etc." value={address.landmark} onChange={e => setAddress({ ...address, landmark: e.target.value })} />
                      </Col>

                      <Col xs={24} sm={12}>
                        <Text strong style={{ display: 'block', marginBottom: 8 }}>City / District</Text>
                        <Input size="large" value={address.city} readOnly style={{ backgroundColor: '#f9f9f9' }} />
                      </Col>

                      <Col xs={24} sm={12}>
                        <Text strong style={{ display: 'block', marginBottom: 8 }}>State</Text>
                        <Input size="large" value={address.state} readOnly style={{ backgroundColor: '#f9f9f9' }} />
                      </Col>

                      <Col span={24}>
                        <Text strong style={{ display: 'block', marginBottom: 8 }}>Address Type</Text>
                        <Radio.Group
                          value={addressLabel}
                          onChange={e => setAddressLabel(e.target.value)}
                        >
                          <Radio.Button value="Home">Home (All day delivery)</Radio.Button>
                          <Radio.Button value="Work">Work (Delivery between 9 AM - 5 PM)</Radio.Button>
                          <Radio.Button value="Other">Other</Radio.Button>
                        </Radio.Group>
                      </Col>

                      <Col span={24}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: 12 }}>
                          {savedAddresses.length > 0 && (
                            <Button size="large" onClick={() => {
                              setShowNewAddressForm(false);
                              setEditingAddressId(null);
                              const prevSelected = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
                              if (prevSelected) {
                                handleSelectAddress(prevSelected);
                              }
                            }}>
                              Cancel
                            </Button>
                          )}
                          <Button type="primary" size="large" onClick={handleSaveAddress}>
                            Save & Deliver Here
                          </Button>
                        </Space>
                      </Col>
                    </Row>
                  </div>
                ) : (
                  // Saved Addresses Selection List
                  <div>
                    <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr', marginBottom: 20 }}>
                      {savedAddresses.map(addr => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => handleSelectAddress(addr)}
                            style={{
                              border: isSelected ? '2px solid #0cb3e6' : '1px solid #e0e0e0',
                              borderRadius: '12px',
                              padding: '16px',
                              cursor: 'pointer',
                              backgroundColor: isSelected ? '#f6fcff' : '#ffffff',
                              transition: 'all 0.2s ease',
                              position: 'relative'
                            }}
                            className="saved-address-card"
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Space align="center">
                                <Radio checked={isSelected} />
                                <span style={{ fontWeight: 700, fontSize: '15px' }}>{addr.fullName}</span>
                                <Tag color={addr.label === 'Home' ? 'green' : addr.label === 'Work' ? 'blue' : 'orange'}>
                                  {addr.label?.toUpperCase() || 'HOME'}
                                </Tag>
                              </Space>
                              <Space onClick={e => e.stopPropagation()}>
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<EditOutlined />}
                                  onClick={(e) => handleEditAddress(addr, e)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  type="text"
                                  size="small"
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={(e) => handleDeleteAddress(addr.id, e)}
                                >
                                  Delete
                                </Button>
                              </Space>
                            </div>

                            <div style={{ paddingLeft: '24px', marginTop: '8px' }}>
                              <Text style={{ display: 'block', marginBottom: 4 }}>
                                {addr.house}, {addr.area}
                              </Text>
                              {addr.landmark && <Text type="secondary" style={{ display: 'block', fontSize: '13px', marginBottom: 4 }}>Landmark: {addr.landmark}</Text>}
                              <Text strong style={{ display: 'block' }}>
                                {addr.city}, {addr.state} - {addr.pincode}
                              </Text>
                              <Text style={{ display: 'block', marginTop: 8 }} type="secondary">
                                Phone: <b>{addr.phone}</b>
                              </Text>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>

              {/* Payment Card */}
              <Card
                title={<Space><CreditCardOutlined /><span>2. Payment Method</span></Space>}
                className="checkout-card"
              >
                <Radio.Group onChange={e => setPaymentMethod(e.target.value)} value={paymentMethod} style={{ width: '100%' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div className={`payment-option ${paymentMethod === 'razorpay' ? 'active' : ''}`} onClick={() => setPaymentMethod('razorpay')}>
                      <Radio value="razorpay" disabled={!student}>
                        <Text strong>Online Payment</Text>
                        <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>UPI, Cards, Wallets (100% Secure)</Text>
                      </Radio>
                    </div>
                    <div className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`} onClick={() => setPaymentMethod('cod')}>
                      <Radio value="cod" disabled={!student}>
                        <Text strong>Cash on Delivery</Text>
                        <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>Pay at your doorstep</Text>
                      </Radio>
                    </div>
                  </Space>
                </Radio.Group>
              </Card>
            </Space>
          </Col>

          {/* Summary Side */}
          <Col xs={24} lg={9}>
            <div className="sticky-summary">
              <Card className="summary-card">
                <Title level={4}>Order Summary</Title>
                <div className="summary-items">
                  {cartItems.map(item => (
                    <div key={item.cartItemId || item.bookId} className="item-row">
                      <Badge count={item.quantity} offset={[-2, 5]} color="#1a1a1a">
                        <div style={{ width: 60, height: 60, display: 'block', overflow: 'hidden', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                          <ImgWithFallback
                            src={getImageUrl(item.coverImage)}
                            alt={item.title}
                            size="sm"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      </Badge>
                      <div className="item-details">
                        <Text strong className="line-clamp-1">{item.title}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>{item.finalPrice}</Text>
                      </div>
                      <Text strong>{item.finalPrice * item.quantity}</Text>
                    </div>
                  ))}
                </div>

                <Divider />

                <div className="coin-section">
                  <Text strong><WalletOutlined /> Reward Coins</Text>
                  <div className="coin-input-group">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={coinsToUse}
                      disabled={!student}
                      onChange={e => {
                        const value = Math.max(0, Number(e.target.value) || 0);
                        setCoinsToUse(Math.min(value, walletBalance));
                      }}
                    />
                    <Button onClick={() => setCoinsToUse(walletBalance)} disabled={!student}>Max</Button>
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Available: {walletBalance} (10 coins = 1)</Text>
                </div>

                <Divider style={{ margin: '16px 0' }} />

                <Space direction="vertical" style={{ width: '100%' }} size={8}>
                  <div className="price-row"><Text>Subtotal</Text><Text>{subtotal}</Text></div>
                  <div className="price-row"><Text>Shipping</Text><Text>{shippingFee ? `${shippingFee}` : 'FREE'}</Text></div>
                  {coinDiscount > 0 && (
                    <div className="price-row discount"><Text>Coin Discount</Text><Text>-{coinDiscount}</Text></div>
                  )}
                  <div className="price-row total">
                    <Text strong style={{ fontSize: 18 }}>Total</Text>
                    <Text strong style={{ fontSize: 22, color: '#0cb3e6' }}>{total}</Text>
                  </div>
                </Space>

                <Button
                  type="primary"
                  size="large"
                  block
                  loading={paymentLoading}
                  onClick={!student ? () => openAuthModal("student", "login") : placeOrder}
                  className="place-order-btn"
                  style={{
                    background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(30, 58, 138, 0.2)",
                    marginTop: "20px",
                    height: "50px",
                    borderRadius: "8px",
                    fontWeight: 700
                  }}
                >
                  {!student
                    ? "LOGIN / SIGN UP TO PLACE ORDER"
                    : (isValid ? "PAY & PLACE ORDER" : "Complete Address First")
                  }
                </Button>

                <Alert
                  style={{ marginTop: 16 }}
                  type="info"
                  showIcon
                  message="Safe & Secure Payments"
                  description="Your transaction is encrypted and protected."
                />
              </Card>
            </div>
          </Col>
        </Row>
      </div>

      <style>{`
        .checkout-wrapper { background: #f4f7f9; min-height: 100vh; padding: 40px 20px; }
        .checkout-container { max-width: 1100px; margin: 0 auto; }
        .checkout-card { border-radius: 12px; border: none; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .payment-option { 
          padding: 16px; border: 1.5px solid #eee; border-radius: 10px; 
          cursor: pointer; transition: 0.2s; margin-bottom: 8px;
        }
        .payment-option:hover { border-color: #0cb3e6; }
        .payment-option.active { border-color: #0cb3e6; background: #f0fbff; }
        .sticky-summary { position: sticky; top: 24px; }
        .summary-card { border-radius: 16px; border: none; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .summary-items { max-height: 250px; overflow-y: auto; padding-right: 8px; }
        .item-row { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; }
        .item-details { flex: 1; overflow: hidden; }
        .line-clamp-1 { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .price-row { display: flex; justify-content: space-between; }
        .discount { color: #52c41a; }
        .total { margin-top: 12px; border-top: 1px dashed #ddd; paddingTop: 12px; }
        .coin-input-group { display: flex; gap: 8px; margin: 8px 0; }
        .place-order-btn { transition: all 0.3s ease; }
        .place-order-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .loader-container { height: 100vh; display: flex; justify-content: center; align-items: center; }
        
        .saved-address-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        @media (max-width: 768px) {
          .hide-mobile { display: none; }
          .checkout-wrapper { padding: 15px; }
        }
      `}</style>
    </div>
  );
}
