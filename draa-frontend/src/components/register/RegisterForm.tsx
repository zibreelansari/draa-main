import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "../../utils/toast";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import {
  ChevronRight,
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  KeyRound,
  CheckCircle,
  Eye,
  EyeOff } from "lucide-react";
import url from "../../url";
import "./RegisterForm.css";

export default function RegisterForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"register" | "verify-otp">("register");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("edudocs")) {
      toast.warning("You are already logged in!");
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    let t: number;
    if (countdown > 0) t = window.setTimeout(() => setCountdown(p => p - 1), 1000);
    return () => { if (t) window.clearTimeout(t); };
  }, [countdown]);

  const SendOTPHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      phn: fd.get("phn") as string,
      password: fd.get("password") as string };
    if (payload.password.length < 6) return toast.error("Password must be at least 6 characters");
    try {
      setLoading(true);
      const res = await axios.post(`${url}/users/send-registration-otp`, payload);
      if (res.data.success) {
        toast.success("Verification code sent to your email!");
        setEmail(payload.email);
        setStep("verify-otp");
        setCountdown(60);
        setOtp("");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const VerifyOTPHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otpLoading) return;
    if (otp.length !== 6) return toast.error("Enter a valid 6-digit code");
    try {
      setOtpLoading(true);
      const res = await axios.post(`${url}/users/verify-registration-otp`, { email, otp });
      if (res.data.success) {
        toast.success("Registration Successful! Please login.");
        navigate("/student-login");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Verification failed");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleGoogleAuth = async (credential: string) => {
    try {
      toast.info("Creating account...");
      const { data } = await axios.post<any>(`${url}/users/google-auth`, { credential });
      if (!data.success) throw new Error(data.message);
      localStorage.setItem("edudocs", JSON.stringify({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        token: data.user.token,
        role: "student",
        createdAt: data.user.createdAt,
        authProvider: data.user.authProvider || "google",
        googleId: data.user.googleId,
      }));
      toast.success("Account created successfully!");
      navigate("/");
    } catch (err: any) {
      toast.error("Google signup failed.");
    }
  };

  return (
    <div className="midnight-auth-page student-auth">
      {/* Ambient particles */}
      <div className="particle" style={{ top: "10%", left: "6%" }} />
      <div className="particle" style={{ top: "28%", left: "40%", animationDelay: "1.2s" }} />
      <div className="particle" style={{ top: "65%", left: "20%", animationDelay: "2s" }} />
      <div className="particle" style={{ top: "82%", left: "58%", animationDelay: "0.8s" }} />
      <div className="particle" style={{ top: "42%", left: "75%", animationDelay: "1.8s" }} />
      <div className="particle" style={{ top: "90%", left: "30%", animationDelay: "2.5s" }} />
      <div className="particle" style={{ top: "18%", left: "88%", animationDelay: "3s" }} />

      {/* LEFT */}
      <div className="auth-panel-left">
        <div className="glass-card">
          <nav className="figma-breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={12} />
            <span className="active">{step === "register" ? "Register" : "Verify Email"}</span>
          </nav>

          <header className="auth-header">
            <div className="auth-icon-box">
              <ShieldCheck size={26} />
            </div>
            <h1>{step === "register" ? "Create Account" : "Verify Email"}</h1>
            <p>
              {step === "register"
                ? "Join Draa and unlock your full learning potential."
                : `We sent a 6-digit code to ${email}`}
            </p>
          </header>

          {step === "register" && (
            <>
              <div className="google-auth-wrapper">
                <GoogleLogin
                  text="signup_with"
                  onSuccess={res => res.credential && handleGoogleAuth(res.credential)}
                  onError={() => toast.error("Google Sign-In Failed")}
                  theme="filled_blue"
                  width="100%"
                  size="large"
                />
              </div>

              <div className="auth-separator"><span>OR</span></div>

              <form onSubmit={SendOTPHandler}>
                <div className="auth-input-group">
                  <label>Full Name</label>
                  <div className="input-with-icon">
                    <User size={17} />
                    <input type="text" name="name" placeholder="John Doe" required />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Email Address</label>
                  <div className="input-with-icon">
                    <Mail size={17} />
                    <input type="email" name="email" placeholder="name@example.com" required />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Phone Number</label>
                  <div className="input-with-icon">
                    <Phone size={17} />
                    <input type="tel" name="phn" placeholder="+91 00000 00000" required />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Password</label>
                  <div className="input-with-icon">
                    <Lock size={17} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Min. 6 characters"
                      required
                      style={{ paddingRight: "48px" }}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button className="btn-auth-primary" type="submit" disabled={loading}>
                  {loading
                    ? <Loader2 className="spinner" size={17} />
                    : <>Create Account <ArrowRight size={15} /></>}
                </button>
              </form>
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
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    required
                    style={{ letterSpacing: "8px", textAlign: "center", fontWeight: 800 }}
                  />
                </div>
              </div>

              <div className="otp-timer-box">
                {countdown > 0 ? (
                  <p className="timer-text">Resend available in <strong>{countdown}s</strong></p>
                ) : (
                  <button type="button" className="btn-resend-link" disabled={otpLoading} onClick={() => {}}>
                    Resend Code
                  </button>
                )}
              </div>

              <button className="btn-auth-primary" type="submit" disabled={otpLoading}>
                {otpLoading
                  ? <Loader2 className="spinner" size={17} />
                  : <>Verify & Complete <CheckCircle size={15} /></>}
              </button>

              <button type="button" className="btn-back-link" onClick={() => setStep("register")}>
                <ArrowLeft size={13} /> Go back to details
              </button>
            </form>
          )}

          <footer className="auth-footer">
            <p>Already have an account? <Link to="/student-login">Sign in</Link></p>
          </footer>
        </div>
      </div>

      {/* RIGHT */}
      <div className="auth-panel-right">
        <div className="illustration-scene-container">
          <img src="/assets/student_login_hero.png" alt="Student Portal Hero" />
        </div>
      </div>
    </div>
  );
}