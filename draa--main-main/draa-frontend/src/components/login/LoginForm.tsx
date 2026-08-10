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
import { notifyAuthUpdate, getUserRole } from "../../utils/global_auth";
import OtpInput from "../common/OtpInput";

type Step = "LOGIN" | "OTP";

export default function LoginForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("LOGIN");
  const [userId, setUserId] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  /* ==================== GUEST CART MERGE ==================== */
  const mergeGuestCart = (uid: string) => {
    const mergedKey = `guest-cart-merged-${uid}`;
    if (localStorage.getItem(mergedKey)) return;
    const guestKey = "draa-guest-cart";
    const userKey = `draa-cart-${uid}`;
    let guest: any[] = [], user: any[] = [];
    try {
      guest = JSON.parse(localStorage.getItem(guestKey) || "[]");
      user = JSON.parse(localStorage.getItem(userKey) || "[]");
    } catch {}
    if (!guest.length) return;
    guest.forEach((item: any) => {
      const ex = user.find((u: any) => u.bookId === item.bookId);
      if (ex) ex.quantity += item.quantity;
      else user.push({ ...item, addedBy: uid });
    });
    localStorage.setItem(userKey, JSON.stringify(user));
    localStorage.removeItem(guestKey);
    localStorage.setItem(mergedKey, "true");
    window.dispatchEvent(new Event("cart-updated"));
  };

  /* ==================== RESEND TIMER ==================== */
  useEffect(() => {
    if (!resendTimer) return;
    const t = setInterval(() => setResendTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  /* ==================== LOGIN ==================== */
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    try {
      setLoading(true);
      const { data } = await axios.post(`${url}/users/login`, { email, password });
      if (data?.step === "OTP_REQUIRED" && data.userId) {
        setUserId(data.userId);
        setStep("OTP");
        setResendTimer(30);
        toast.success("OTP sent to your registered email");
      } else {
        toast.error(data.message || "Unexpected login response");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  /* ==================== VERIFY OTP ==================== */
  const handleVerifyOtp = async (_e?: React.FormEvent<HTMLFormElement>, customOtp?: string) => {
    if (!userId) { toast.error("Session expired. Please login again."); setStep("LOGIN"); return; }
    const code = customOtp || otp;
    if (!code || code.length !== 6) { toast.error("Please enter valid 6-digit OTP"); return; }
    try {
      setLoading(true);
      const { data } = await axios.post(`${url}/users/verify-otp`, { userId, otp: code });
      if (!data.success) { toast.error(data.message || "Invalid OTP"); return; }
      const authUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        token: data.user.token,
        role: "student",
        createdAt: data.user.createdAt,
        authProvider: data.user.authProvider || "local",
      };
      localStorage.setItem("edudocs", JSON.stringify(authUser));
      mergeGuestCart(authUser.id);
      toast.success("Login successful!");
      notifyAuthUpdate();
      navigate("/");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  /* ==================== AUTO VERIFY ==================== */
  useEffect(() => {
    if (otp.length === 6 && step === "OTP") handleVerifyOtp(undefined, otp);
  }, [otp, step]);

  /* ==================== RESEND ==================== */
  const resendOtp = async () => {
    if (!userId) { toast.error("Session expired. Please login again."); setStep("LOGIN"); return; }
    if (resendTimer > 0) return;
    try {
      setLoading(true);
      const { data } = await axios.post(`${url}/users/resend-login-otp`, { userId });
      if (data.success) { toast.success(data.message); setResendTimer(30); }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ==================== GOOGLE LOGIN ==================== */
  const handleGoogleLogin = async (credential: string) => {
    try {
      toast.info("Authenticating...");
      const { data } = await axios.post(`${url}/users/google-auth`, { credential });
      if (!data.success) throw new Error(data.message);
      const authUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        token: data.user.token,
        role: "student",
        createdAt: data.user.createdAt,
        authProvider: data.user.authProvider || "google",
        googleId: data.user.googleId,
      };
      localStorage.setItem("edudocs", JSON.stringify(authUser));
      mergeGuestCart(authUser.id);
      toast.success("Google Login Successful!");
      notifyAuthUpdate();
      navigate("/");
    } catch {
      toast.error("Google sign-in failed.");
    }
  };

  /* ==================== AUTH GUARD ==================== */
  useEffect(() => {
    const role = getUserRole();
    if (role !== "GUEST") navigate("/");
  }, [navigate]);

  /* ── RENDER ── */
  return (
    <div className="midnight-auth-page student-auth">
      {/* Ambient particles */}
      <div className="particle" style={{ top: "12%", left: "8%" }} />
      <div className="particle" style={{ top: "25%", left: "45%", animationDelay: "1s" }} />
      <div className="particle" style={{ top: "60%", left: "22%", animationDelay: "2s" }} />
      <div className="particle" style={{ top: "80%", left: "62%", animationDelay: "0.5s" }} />
      <div className="particle" style={{ top: "40%", left: "78%", animationDelay: "1.5s" }} />
      <div className="particle" style={{ top: "88%", left: "35%", animationDelay: "3s" }} />
      <div className="particle" style={{ top: "15%", left: "90%", animationDelay: "2.5s" }} />

      {/* LEFT — Form */}
      <div className="auth-panel-left">
        <div className="glass-card">
          <nav className="figma-breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={12} />
            <span className="active">{step === "LOGIN" ? "Login" : "Verify OTP"}</span>
          </nav>

          <header className="auth-header">
            <h1>{step === "LOGIN" ? "Welcome Back" : "OTP Verification"}</h1>
            <p>
              {step === "LOGIN"
                ? "Sign in to access your personalized learning portal."
                : "Enter the 6-digit code we sent to your registered email."}
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
                    <input type="email" name="email" placeholder="student@example.com" required />
                  </div>
                </div>

                <div className="auth-input-group">
                  <div className="label-row">
                    <label style={{ marginBottom: 0 }}>Password</label>
                    <Link to="/forgot-password">Forgot Password?</Link>
                  </div>
                  <div className="input-with-icon">
                    <Lock size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      required
                      style={{ paddingRight: "48px" }}
                    />
                    <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button className="btn-auth-primary" disabled={loading}>
                  {loading ? <Loader2 className="spinner" size={18} /> : <>{step === "LOGIN" ? "Sign In" : "Verify & Login"} <ArrowRight size={16} /></>}
                </button>
              </form>
            </>
          )}

          {step === "OTP" && (
            <form onSubmit={(e) => handleVerifyOtp(e)}>
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
                <p style={{ cursor: "pointer" }} onClick={() => { setStep("LOGIN"); setUserId(null); setOtp(""); }}>
                  Wrong email? <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 700 }}>Go back</span>
                </p>
              </div>
            </form>
          )}

          <footer className="auth-footer">
            <p>Don't have an account? <Link to="/student-register">Create one free</Link></p>
          </footer>
        </div>
      </div>

      {/* RIGHT — Illustration */}
      <div className="auth-panel-right">
        <div className="illustration-scene-container">
          <img src="/assets/student_login_hero.png" alt="Student Portal Hero" />
        </div>
      </div>
    </div>
  );
}