import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Upload, Progress } from "antd";
import { GoogleLogin } from "@react-oauth/google";
import {
  ChevronRight,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  GraduationCap,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Camera,
  ShieldCheck,
  KeyRound,
  Loader2,
  Clock,
  Ticket,
  Eye,
  EyeOff } from "lucide-react";
import axios from "axios";
import url from "../../url";
import "./TeacherRegistration.css";
import { notifyAuthUpdate } from "../../utils/global_auth";

export default function TeacherRegistration() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "verify-otp">("form");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otp, setOtp] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    tname: "", temail: "", tphn: "", tpassword: "",
    tspecialization: "", texp: "", tcity: "", tstate: "", tdesc: "",
    tqualification: "", taddress: "", promocode: "" });

  const [formProgress, setFormProgress] = useState(0);

  useEffect(() => {
    if (localStorage.getItem("edudocs")) navigate("/");
  }, [navigate]);

  useEffect(() => {
    let t: number;
    if (countdown > 0) t = window.setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => { if (t) window.clearTimeout(t); };
  }, [countdown]);

  useEffect(() => {
    const required = ["tname", "temail", "tphn", "tpassword", "tspecialization", "texp", "tcity", "tstate", "tdesc"];
    const filled = required.filter(f => formData[f as keyof typeof formData]?.toString().trim()).length;
    setFormProgress((filled / required.length) * 100);
  }, [formData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const SendOTPHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${url}/teachers/send-registration-otp`, {
        ...formData,
        temail: formData.temail.toLowerCase().trim() });
      if (response.data.success) {
        toast.success("OTP sent to your email!");
        setStep("verify-otp");
        setCountdown(60);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const VerifyOTPHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error("Enter valid 6-digit OTP");
    setOtpLoading(true);
    try {
      const fd = new FormData();
      fd.append("temail", formData.temail.toLowerCase().trim());
      fd.append("otp", otp.trim());
      if (profileImage) fd.append("tprofile", profileImage);
      const response = await axios.post(`${url}/teachers/verify-registration-otp`, fd);
      if (response.data.success) {
        toast.success("Registration successful! Wait for admin approval.");
        setTimeout(() => navigate("/teacher-login"), 2000);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "OTP verification failed");
    } finally {
      setOtpLoading(false);
    }
  };

  const ResendOTPHandler = async () => {
    try {
      setOtpLoading(true);
      const response = await axios.post(`${url}/teachers/resend-registration-otp`, {
        temail: formData.temail.toLowerCase().trim() });
      if (response.data.success) {
        toast.success("New OTP sent to your email!");
        setCountdown(60);
        setOtp("");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleGoogleLogin = async (credential: string) => {
    try {
      toast.info("Authenticating...");
      const { data } = await axios.post(`${url}/teachers/google-auth`, { credential });
      if (!data.success) throw new Error(data.message);
      const teacher = data.data.teacher;
      const token = data.data.token;
      const teacherData = {
        id: teacher.id, tname: teacher.tname, temail: teacher.temail, tphn: teacher.tphn,
        tspecialization: teacher.tspecialization, Status: teacher.Status,
        isVerified: teacher.isVerified, token, role: "teacher" };
      localStorage.setItem("edudocs", JSON.stringify(teacherData));
      toast.success("Google Registration Successful!");
      notifyAuthUpdate();
      if (teacher.Status === "pending") {
        toast.info("Your account is pending approval.");
        navigate("/teacher-dashboard?status=pending");
      } else {
        navigate("/teacher-dashboard");
      }
    } catch (err: any) {
      toast.error({ content: err.message || "Google sign-in failed.", key: "google" });
    }
  };

  return (
    <div className="teacher-reg-midnight">
      {/* Ambient particles */}
      <div className="particle" style={{ top: "8%", left: "55%" }} />
      <div className="particle" style={{ top: "22%", left: "15%", animationDelay: "1.2s" }} />
      <div className="particle" style={{ top: "50%", left: "70%", animationDelay: "0.6s" }} />
      <div className="particle" style={{ top: "75%", left: "35%", animationDelay: "2s" }} />
      <div className="particle" style={{ top: "38%", left: "85%", animationDelay: "1.5s" }} />
      <div className="particle" style={{ top: "90%", left: "50%", animationDelay: "2.5s" }} />
      <div className="particle" style={{ top: "15%", left: "40%", animationDelay: "3s" }} />

      {/* LEFT */}
      <div className="auth-panel-left">
        <div className="glass-card">
          <nav className="figma-breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={12} />
            <span className="active">{step === "form" ? "Teacher Registration" : "Verify Identity"}</span>
          </nav>

          <header className="auth-header">
            <div className="auth-icon-box">
              <ShieldCheck size={24} />
            </div>
            <h1>{step === "form" ? "Apply as Teacher" : "Verify Identity"}</h1>

            {step === "form" && (
              <div className="google-auth-wrapper">
                <GoogleLogin
                  onSuccess={res => res.credential && handleGoogleLogin(res.credential)}
                  onError={() => toast.error("Google Sign-In Failed")}
                  theme="filled_blue"
                  size="large"
                  width="100%"
                />
              </div>
            )}

            {step === "form" && (
              <div className="reg-progress-wrapper">
                <div className="progress-info">
                  <span>Application Progress</span>
                  <strong>{Math.round(formProgress)}%</strong>
                </div>
                <Progress percent={Math.round(formProgress)} showInfo={false} strokeColor="#66735b" />
              </div>
            )}
          </header>

          {step === "form" && (
            <>
              <div className="auth-separator"><span>OR</span></div>

              <form onSubmit={SendOTPHandler} className="reg-form-grid">
                <div className="auth-input-group">
                  <label>Full Name *</label>
                  <div className="input-with-icon">
                    <User size={16} />
                    <input type="text" value={formData.tname} onChange={e => handleInputChange("tname", e.target.value)} placeholder="Professor Name" required />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Email Address *</label>
                  <div className="input-with-icon">
                    <Mail size={16} />
                    <input type="email" value={formData.temail} onChange={e => handleInputChange("temail", e.target.value)} placeholder="email@university.com" required />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Phone Number *</label>
                  <div className="input-with-icon">
                    <Phone size={16} />
                    <input type="tel" value={formData.tphn} onChange={e => handleInputChange("tphn", e.target.value)} placeholder="10-digit Mobile" maxLength={10} required />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>City *</label>
                  <div className="input-with-icon">
                    <MapPin size={16} />
                    <input type="text" value={formData.tcity} onChange={e => handleInputChange("tcity", e.target.value)} placeholder="Enter City" required />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>State *</label>
                  <div className="input-with-icon">
                    <MapPin size={16} />
                    <input type="text" value={formData.tstate} onChange={e => handleInputChange("tstate", e.target.value)} placeholder="Enter State" required />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Specialization *</label>
                  <div className="input-with-icon">
                    <GraduationCap size={16} />
                    <input type="text" value={formData.tspecialization} onChange={e => handleInputChange("tspecialization", e.target.value)} placeholder="Subject Specialty" required />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Experience (Years) *</label>
                  <div className="input-with-icon">
                    <Briefcase size={16} />
                    <input type="number" value={formData.texp} onChange={e => handleInputChange("texp", e.target.value)} placeholder="0" required />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Password *</label>
                  <div className="input-with-icon" style={{ position: "relative" }}>
                    <Lock size={16} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.tpassword}
                      onChange={e => handleInputChange("tpassword", e.target.value)}
                      placeholder="Min. 8 characters"
                      required
                      style={{ paddingRight: "48px" }}
                    />
                    <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="auth-input-group full-width">
                  <label>About Your Teaching Methodology *</label>
                  <textarea
                    value={formData.tdesc}
                    onChange={e => handleInputChange("tdesc", e.target.value)}
                    placeholder="Describe your achievements, methodology, and what makes your teaching unique..."
                    rows={3}
                    required
                  />
                </div>

                <div className="auth-input-group">
                  <label>Promocode (Optional)</label>
                  <div className="input-with-icon">
                    <Ticket size={16} />
                    <input
                      type="text"
                      value={formData.promocode}
                      onChange={e => handleInputChange("promocode", e.target.value.toUpperCase())}
                      placeholder="REFERRAL10"
                      maxLength={20}
                    />
                  </div>
                </div>

                <div className="upload-section">
                  <Upload.Dragger maxCount={1} beforeUpload={file => { setProfileImage(file); return false; }}>
                    <p><Camera size={22} /></p>
                    <p style={{ fontSize: "13px" }}>Click or drag profile photo here</p>
                  </Upload.Dragger>
                </div>
              </form>

              <button className="btn-auth-primary" type="submit" disabled={loading} onClick={SendOTPHandler as any}>
                {loading ? <Loader2 className="spinner" size={17} /> : <>Submit Application <ArrowRight size={15} /></>}
              </button>
            </>
          )}

          {step === "verify-otp" && (
            <form onSubmit={VerifyOTPHandler}>
              <div className="auth-input-group">
                <label>Verification Code</label>
                <div className="input-with-icon">
                  <KeyRound size={17} />
                  <input
                    type="text"
                    className="otp-pill"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    required
                  />
                </div>
              </div>

              <div className="timer-box">
                {countdown > 0 ? (
                  <div className="countdown-pill"><Clock size={13} /> Resend in {countdown}s</div>
                ) : (
                  <button type="button" className="resend-link" disabled={otpLoading} onClick={ResendOTPHandler}>
                    {otpLoading ? "Sending..." : "Resend Code"}
                  </button>
                )}
              </div>

              <button className="btn-auth-primary" type="submit" disabled={otpLoading}>
                {otpLoading ? <Loader2 className="spinner" size={17} /> : "Verify & Complete"}
              </button>

              <button type="button" className="btn-back-link" onClick={() => setStep("form")}>
                <ArrowLeft size={13} /> Edit Details
              </button>
            </form>
          )}

          <footer className="auth-footer">
            <p>Already a member of faculty? <Link to="/teacher-login">Sign In</Link></p>
          </footer>
        </div>
      </div>

      {/* RIGHT */}
      <div className="auth-panel-right">
        <div className="illustration-scene-container">
          <img src="/assets/teacher_login_hero.png" alt="Teacher Portal Hero" />
        </div>
      </div>
    </div>
  );
}