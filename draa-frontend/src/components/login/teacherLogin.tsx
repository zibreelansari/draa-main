import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "../../utils/toast";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import {
  ChevronRight,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  RefreshCcw,
  Eye,
  EyeOff } from "lucide-react";
import url from "../../url";
import "./LoginForm.css";
import { notifyAuthUpdate } from "../../utils/global_auth";
import OtpInput from "../common/OtpInput";

type Step = "LOGIN" | "OTP";

export default function TeacherLoginForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("LOGIN");
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  /* AUTH GUARD */
  useEffect(() => {
    const auth = localStorage.getItem("edudocs");
    if (auth) {
      try {
        const user = JSON.parse(auth);
        if (user.role === "teacher" && user.token) navigate("/teacher-dashboard");
      } catch {
        localStorage.removeItem("edudocs");
      }
    }
  }, [navigate]);

  /* RESEND TIMER */
  useEffect(() => {
    if (!resendTimer) return;
    const t = setInterval(() => setResendTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  /* LOGIN */
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    const fd = new FormData(e.currentTarget);
    const temail = (fd.get("temail") as string)?.trim();
    const tpassword = fd.get("tpassword") as string;
    if (!temail || !tpassword) { toast.error("Please enter both email and password"); setLoading(false); return; }
    try {
      setLoading(true);
      const res = await axios.post(`${url}/teachers/teacherLogin`, { temail, tpassword });
      if (res.data?.step === "OTP_REQUIRED" && res.data.teacherId) {
        setTeacherId(res.data.teacherId);
        setStep("OTP");
        setResendTimer(30);
        toast.success("OTP sent to your registered email");
      } else {
        toast.error("Unexpected login response");
      }
    } catch (err: any) {
      const status = err.response?.status;
      toast.error(status === 401 || status === 404 ? "Invalid credentials" : err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  /* VERIFY OTP */
  const handleOtpVerify = async (_e?: React.FormEvent<HTMLFormElement>, customOtp?: string) => {
    if (!teacherId) { toast.error("Session expired. Please login again."); setStep("LOGIN"); return; }
    const code = customOtp || otp;
    if (!code || code.length !== 6) { toast.error("Please enter a valid 6-digit OTP"); return; }
    try {
      setLoading(true);
      const res = await axios.post(`${url}/teachers/verify-otp`, { teacherId, otp: code });
      const { teacher, token } = res.data.data;
      const teacherData = {
        id: teacher.id, tname: teacher.tname, temail: teacher.temail, tphn: teacher.tphn,
        tspecialization: teacher.tspecialization, Status: teacher.Status,
        isVerified: teacher.isVerified, permissions: teacher.permissions, token, role: "teacher",
        authProvider: teacher.authProvider || "local" };
      localStorage.setItem("edudocs", JSON.stringify(teacherData));
      notifyAuthUpdate();
      if (teacher.Status === "pending") {
        toast.info("Your account is pending approval.");
        navigate("/teacher-dashboard?status=pending");
      } else if (teacher.Status === "rejected" || teacher.Status === "suspended") {
        toast.error(`Your account has been ${teacher.Status}. Please contact support.`, 8);
        localStorage.removeItem("edudocs");
        setStep("LOGIN");
      } else {
        toast.success("Welcome back, Professor!");
        navigate("/teacher-dashboard");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /* AUTO VERIFY */
  useEffect(() => {
    if (otp.length === 6 && step === "OTP") handleOtpVerify(undefined, otp);
  }, [otp, step]);

  /* RESEND */
  const resendOtp = async () => {
    if (!teacherId) { toast.error("Session expired. Please login again."); setStep("LOGIN"); return; }
    if (resendTimer > 0) return;
    try {
      setLoading(true);
      const res = await axios.post(`${url}/teachers/resend-login-otp`, { teacherId });
      if (res.data.success) { toast.success(res.data.message); setResendTimer(30); }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  /* GOOGLE LOGIN */
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
        isVerified: teacher.isVerified, permissions: teacher.permissions, token, role: "teacher",
        authProvider: teacher.authProvider || "google", googleId: teacher.googleId };
      localStorage.setItem("edudocs", JSON.stringify(teacherData));
      toast.success("Google Login Successful!");
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

  /* RENDER */
  return (
    <div className="midnight-auth-page teacher-auth">
      {/* Ambient particles */}
      <div className="particle" style={{ top: "8%", left: "5%" }} />
      <div className="particle" style={{ top: "30%", left: "42%", animationDelay: "1.5s" }} />
      <div className="particle" style={{ top: "55%", left: "18%", animationDelay: "0.7s" }} />
      <div className="particle" style={{ top: "78%", left: "65%", animationDelay: "2.2s" }} />
      <div className="particle" style={{ top: "35%", left: "80%", animationDelay: "1s" }} />
      <div className="particle" style={{ top: "92%", left: "28%", animationDelay: "2.8s" }} />
      <div className="particle" style={{ top: "15%", left: "92%", animationDelay: "3.5s" }} />

      {/* LEFT */}
      <div className="auth-panel-left">
        <div className="glass-card">
          <nav className="figma-breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={12} />
            <span className="active">{step === "LOGIN" ? "Teacher Login" : "Verify OTP"}</span>
          </nav>

          <header className="auth-header">
            <h1>{step === "LOGIN" ? "Welcome Back" : "OTP Verification"}</h1>
            <p>
              {step === "LOGIN"
                ? "Access your faculty portal to manage courses and students."
                : "Enter the 6-digit code sent to your registered email."}
            </p>
          </header>

          {step === "LOGIN" && (
            <>
              <div className="google-auth-wrapper">
                <GoogleLogin
                  onSuccess={res => res.credential && handleGoogleLogin(res.credential)}
                  onError={() => toast.error("Google Sign-In Failed")}
                  theme="filled_blue"
                  size="large"
                  width="100%"
                />
              </div>

              <div className="auth-separator"><span>OR</span></div>

              <form onSubmit={handleLogin}>
                <div className="auth-input-group">
                  <label>Email Address</label>
                  <div className="input-with-icon">
                    <Mail size={18} />
                    <input type="email" name="temail" placeholder="teacher@university.edu" required disabled={loading} />
                  </div>
                </div>

                <div className="auth-input-group">
                  <div className="label-row">
                    <label style={{ marginBottom: 0 }}>Password</label>
                    <Link to="/teacher/forgot-password">Forgot Password?</Link>
                  </div>
                  <div className="input-with-icon">
                    <Lock size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="tpassword"
                      placeholder="Your account password"
                      required
                      disabled={loading}
                      style={{ paddingRight: "48px" }}
                    />
                    <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button className="btn-auth-primary" type="submit" disabled={loading}>
                  {loading ? <Loader2 className="spinner" size={18} /> : <>Access Dashboard <ArrowRight size={16} /></>}
                </button>
              </form>
            </>
          )}

          {step === "OTP" && (
            <form onSubmit={e => handleOtpVerify(e)}>
              <div className="auth-input-group">
                <label>One-Time Password</label>
                <OtpInput value={otp} onChange={setOtp} disabled={loading} length={6} />
              </div>

              <button className="btn-auth-primary" disabled={loading}>
                {loading ? <Loader2 className="spinner" size={18} /> : <>Verify & Login <ArrowRight size={16} /></>}
              </button>

              <div style={{ textAlign: "center", marginTop: 14 }}>
                <button type="button" className="btn-auth-primary" disabled={resendTimer > 0 || loading} onClick={resendOtp}>
                  <RefreshCcw size={14} />
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                </button>
              </div>

              <div className="auth-footer" style={{ marginTop: 16, paddingTop: 0, borderTop: "none" }}>
                <p style={{ cursor: "pointer" }} onClick={() => { setStep("LOGIN"); setTeacherId(null); setOtp(""); }}>
                  Wrong email? <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 700 }}>Go back</span>
                </p>
              </div>
            </form>
          )}

          <footer className="auth-footer">
            <p>New to our faculty? <Link to="/teacher-register">Apply as Teacher</Link></p>
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