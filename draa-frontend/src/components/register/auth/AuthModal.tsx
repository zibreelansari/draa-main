import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Upload, Progress } from "antd";
import { GoogleLogin } from "@react-oauth/google";
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Camera,
  Shield,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  BookOpen,
  KeyRound,
  CheckCircle2,
  Clock,
  ShieldCheck } from "lucide-react";
import axios from "axios";
import url from "../../../url";
import { useAuthModal } from "./AuthModalContext";
import { notifyAuthUpdate } from "../../../utils/global_auth";
import { resetUnauthorizedHandler } from "../../../utils/authErrorHandler";
import OtpInput from "../../common/OtpInput";
import toast from "../../../utils/toast";
import "./AuthModal.css";

type AuthFlow = "login" | "register" | "forgot";

/* ==========================================
   STUDENT LOGIN
   ========================================== */
function StudentLogin({ onSwitch, onClose, onForgot }: { onSwitch: () => void; onClose: () => void; onForgot: () => void }) {
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [step, setStep] = useState<"login" | "otp">("login");
  const [error, setError] = useState("");

  const mergeGuestCart = (uid: string) => {
    const mk = `guest-cart-merged-${uid}`;
    if (localStorage.getItem(mk)) return;
    let guest: any[] = [], user: any[] = [];
    try {
      guest = JSON.parse(localStorage.getItem("draa-guest-cart") || "[]");
      user = JSON.parse(localStorage.getItem(`draa-cart-${uid}`) || "[]");
    } catch { }
    guest.forEach((item: any) => {
      const ex = user.find((u: any) => u.bookId === item.bookId);
      if (ex) ex.quantity += item.quantity;
      else user.push({ ...item, addedBy: uid });
    });
    localStorage.setItem(`draa-cart-${uid}`, JSON.stringify(user));
    localStorage.removeItem("draa-guest-cart");
    localStorage.setItem(mk, "true");
    window.dispatchEvent(new Event("cart-updated"));
  };

  useEffect(() => {
    if (!resendTimer) return;
    const t = setInterval(() => setResendTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  useEffect(() => {
    if (otp.length === 6 && step === "otp") verifyOtp(otp);
  }, [otp, step]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;
    setError("");
    try {
      setLoading(true);
      const { data } = await axios.post(`${url}/users/login`, { email, password });
      if (data?.step === "OTP_REQUIRED" && data.userId) {
        setUserId(data.userId);
        setStep("otp");
        setResendTimer(30);
        toast.success("OTP sent to your registered email");
      } else {
        setError(data.message || "Unexpected response");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (code: string) => {
    if (!userId) { setStep("login"); setError("Session expired"); return; }
    try {
      setLoading(true);
      const { data } = await axios.post(`${url}/users/verify-otp`, { userId, otp: code });
      if (!data.success) { setError(data.message || "Invalid OTP"); setLoading(false); return; }
      const u = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        token: data.user.token,
        role: "student",
        createdAt: data.user.createdAt,
        authProvider: data.user.authProvider || "local",
      };
      localStorage.setItem("edudocs", JSON.stringify(u));
      mergeGuestCart(u.id);
      toast.success("Login successful!");
      resetUnauthorizedHandler();
      notifyAuthUpdate();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!userId || resendTimer > 0) return;
    try {
      setLoading(true);
      const { data } = await axios.post(`${url}/users/resend-login-otp`, { userId });
      if (data.success) { toast.success(data.message); setResendTimer(30); }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to resend");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credential: string) => {
    try {
      toast.info("Authenticating...");
      const { data } = await axios.post(`${url}/users/google-auth`, { credential });
      if (!data.success) throw new Error(data.message);
      const u = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        token: data.user.token,
        role: "student",
        createdAt: data.user.createdAt,
        authProvider: data.user.authProvider || "google",
        googleId: data.user.googleId,
      };
      localStorage.setItem("edudocs", JSON.stringify(u));
      mergeGuestCart(u.id);
      toast.success("Welcome back!");
      resetUnauthorizedHandler();
      notifyAuthUpdate();
      onClose();
    } catch (err: any) {
      toast.error("Google sign-in failed");
    }
  };

  if (step === "otp") {
    return (
      <div className="auth-otp-wrap">
        <h3>OTP Verification</h3>
        <p>Enter the 6-digit code sent to your email</p>
        <div className="otp-inputs">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <input
              key={i}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={otp[i] || ""}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, "");
                const next = [...otp];
                next[i] = val;
                setOtp(next.join(""));
                if (val && i < 5) {
                  const inputs = e.target.parentElement?.querySelectorAll("input");
                  (inputs?.[i + 1] as HTMLInputElement)?.focus();
                }
              }}
              onKeyDown={e => {
                if (e.key === "Backspace" && !otp[i] && i > 0) {
                  const inputs = e.currentTarget.parentElement?.querySelectorAll("input");
                  (inputs?.[i - 1] as HTMLInputElement)?.focus();
                }
              }}
            />
          ))}
        </div>
        <div className="otp-timer">
          {resendTimer > 0 ? (
            <>Resend in <strong>{resendTimer}s</strong></>
          ) : (
            <button type="button" className="resend-btn" onClick={resendOtp} disabled={loading}>
              Resend OTP
            </button>
          )}
        </div>
        {error && <div className="auth-alert error">{error}</div>}
        <button className="auth-submit-btn student" disabled={loading || otp.length < 6} onClick={() => verifyOtp(otp)}>
          {loading ? <Loader2 className="auth-spin" size={17} /> : <><CheckCircle2 size={16} /> Verify & Login</>}
        </button>
        <div className="auth-modal-footer">
          <p>Wrong email? <span className="switch-link" onClick={() => { setStep("login"); setUserId(null); setOtp(""); setError(""); }}>Go back</span></p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin}>
      {error && <div className="auth-alert error">{error}</div>}
      <div className="auth-google-btn">
        <GoogleLogin
          onSuccess={res => res.credential && handleGoogle(res.credential)}
          onError={() => toast.error("Google Sign-In Failed")}
          size="large"
          width="100%"
        />
      </div>
      <div className="auth-form-sep"><span>OR</span></div>
      <div className="auth-input-group">
        <label>Email Address</label>
        <div className="input-wrap">
          <Mail size={16} />
          <input type="email" name="email" placeholder="student@example.com" required />
        </div>
      </div>
      <div className="auth-input-group">
        <div className="forgot-row">
          <span className="forgot-link" onClick={onForgot} style={{ cursor: "pointer" }}>Forgot Password?</span>
        </div>
        <div className="input-wrap">
          <Lock size={16} />
          <input type={showPw ? "text" : "password"} name="password" placeholder="Enter password" required style={{ paddingRight: "44px" }} />
          <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>
      <button className="auth-submit-btn student" type="submit" disabled={loading}>
        {loading ? <Loader2 className="auth-spin" size={17} /> : <>Sign In <ArrowRight size={15} /></>}
      </button>
      <div className="auth-modal-footer">
        <p>Don't have an account? <span className="switch-link" onClick={onSwitch}>Create one free</span></p>
      </div>
    </form>
  );
}

/* ==========================================
   STUDENT REGISTER
   ========================================== */
function StudentRegister({ onSwitch }: { onSwitch: () => void }) {
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let t: number;
    if (countdown > 0) t = window.setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => { if (t) clearTimeout(t); };
  }, [countdown]);

  useEffect(() => {
    if (otp.length === 6 && step === "otp") verifyOtp(otp);
  }, [otp, step]);

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    const fd = new FormData(e.currentTarget);
    const pw = fd.get("password") as string;
    if (pw.length < 6) { setError("Password must be at least 6 characters"); return; }
    setError("");
    try {
      setLoading(true);
      const res = await axios.post(`${url}/users/send-registration-otp`, {
        name: fd.get("name") as string,
        email: fd.get("email") as string,
        phn: fd.get("phn") as string,
        password: pw });
      if (res.data.success) {
        setEmail(fd.get("email") as string);
        setStep("otp");
        setCountdown(60);
        setOtp("");
        toast.success("Verification code sent to your email!");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (code: string) => {
    try {
      setLoading(true);
      const res = await axios.post(`${url}/users/verify-registration-otp`, { email, otp: code });
      if (res.data.success) {
        toast.success("Registration successful! Please sign in.");
        onSwitch();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (step === "otp") {
    return (
      <div className="auth-otp-wrap">
        <h3>Verify Email</h3>
        <p>6-digit code sent to <strong>{email}</strong></p>
        <div className="otp-inputs">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <input
              key={i}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={otp[i] || ""}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, "");
                const next = [...otp];
                next[i] = val;
                setOtp(next.join(""));
                if (val && i < 5) {
                  const inputs = e.target.parentElement?.querySelectorAll("input");
                  (inputs?.[i + 1] as HTMLInputElement)?.focus();
                }
              }}
            />
          ))}
        </div>
        <div className="otp-timer">
          {countdown > 0 ? <>Resend in <strong>{countdown}s</strong></> : <button className="resend-btn" onClick={() => setCountdown(0)}>Resend Code</button>}
        </div>
        {error && <div className="auth-alert error">{error}</div>}
        <button className="auth-submit-btn student" disabled={loading || otp.length < 6} onClick={() => verifyOtp(otp)}>
          {loading ? <Loader2 className="auth-spin" size={17} /> : <><CheckCircle2 size={16} /> Verify & Complete</>}
        </button>
        <div className="auth-modal-footer">
          <p>Wrong email? <span className="switch-link" onClick={() => { setStep("form"); setOtp(""); setError(""); }}>Go back</span></p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSend}>
      {error && <div className="auth-alert error">{error}</div>}
      <div className="auth-google-btn">
        <GoogleLogin
          text="signup_with"
          onSuccess={res => res.credential && handleGoogleStudentAuth(res.credential)}
          onError={() => toast.error("Google Sign-In Failed")}
          width="100%"
          size="large"
        />
      </div>
      <div className="auth-form-sep"><span>OR</span></div>
      <div className="auth-input-row">
        <div className="auth-input-group">
          <label>Full Name</label>
          <div className="input-wrap">
            <User size={16} />
            <input type="text" name="name" placeholder="John Doe" required />
          </div>
        </div>
        <div className="auth-input-group">
          <label>Phone</label>
          <div className="input-wrap">
            <Phone size={16} />
            <input type="tel" name="phn" placeholder="+91 00000 00000" required />
          </div>
        </div>
      </div>
      <div className="auth-input-group">
        <label>Email Address</label>
        <div className="input-wrap">
          <Mail size={16} />
          <input type="email" name="email" placeholder="name@example.com" required />
        </div>
      </div>
      <div className="auth-input-group">
        <label>Password</label>
        <div className="input-wrap">
          <Lock size={16} />
          <input type={showPw ? "text" : "password"} name="password" placeholder="Min. 6 characters" required style={{ paddingRight: "44px" }} />
          <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>
      <button className="auth-submit-btn student" type="submit" disabled={loading}>
        {loading ? <Loader2 className="auth-spin" size={17} /> : <>Create Account <ArrowRight size={15} /></>}
      </button>
      <div className="auth-modal-footer">
        <p>Already have an account? <span className="switch-link" onClick={onSwitch}>Sign in</span></p>
      </div>
    </form>
  );
}

async function handleGoogleStudentAuth(credential: string) {
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
    toast.success("Account created!");
    notifyAuthUpdate();
    window.location.reload();
  } catch (err: any) {
    toast.error("Google signup failed");
  }
}

/* ==========================================
   TEACHER LOGIN
   — navigate passed as prop so useNavigate()
     is called inside the Router context (AuthModal)
   ========================================== */
function TeacherLogin({
  onSwitch,
  onClose,
  navigate,
  onForgot }: {
  onSwitch: () => void;
  onClose: () => void;
  navigate: (path: string) => void;
  onForgot: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [step, setStep] = useState<"login" | "otp">("login");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!resendTimer) return;
    const t = setInterval(() => setResendTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  useEffect(() => {
    if (otp.length === 6 && step === "otp") verifyOtp(otp);
  }, [otp, step]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    const fd = new FormData(e.currentTarget);
    setError("");
    try {
      setLoading(true);
      const res = await axios.post(`${url}/teachers/teacherLogin`, {
        temail: (fd.get("temail") as string)?.trim(),
        tpassword: fd.get("tpassword") as string });
      if (res.data?.step === "OTP_REQUIRED" && res.data.teacherId) {
        setTeacherId(res.data.teacherId);
        setStep("otp");
        setResendTimer(30);
        toast.success("OTP sent to your registered email");
      } else {
        setError("Unexpected response");
      }
    } catch (err: any) {
      setError(err.response?.status === 401 ? "Invalid credentials" : err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (code: string) => {
    if (!teacherId) { setStep("login"); setError("Session expired"); return; }
    try {
      setLoading(true);
      const res = await axios.post(`${url}/teachers/verify-otp`, { teacherId, otp: code });
      const { teacher, token } = res.data.data;
      const tdata = { id: teacher.id, tname: teacher.tname, temail: teacher.temail, tphn: teacher.tphn, tspecialization: teacher.tspecialization, Status: teacher.Status, isVerified: teacher.isVerified, permissions: teacher.permissions, token, role: "teacher", authProvider: teacher.authProvider || "local" };
      localStorage.setItem("edudocs", JSON.stringify(tdata));
      if (teacher.Status === "pending") { toast.info("Account pending approval"); navigate("/teacher-dashboard?status=pending"); }
      else { toast.success("Welcome back, Professor!"); navigate("/teacher-dashboard"); }
      resetUnauthorizedHandler();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!teacherId || resendTimer > 0) return;
    try {
      setLoading(true);
      const { data } = await axios.post(`${url}/teachers/resend-login-otp`, { teacherId });
      if (data.success) { toast.success(data.message); setResendTimer(30); }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to resend");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credential: string) => {
    try {
      toast.info("Authenticating...");
      const { data } = await axios.post(`${url}/teachers/google-auth`, { credential });
      if (!data.success) throw new Error(data.message);
      const teacher = data.data.teacher;
      const token = data.data.token;
      const tdata = { id: teacher.id, tname: teacher.tname, temail: teacher.temail, tphn: teacher.tphn, tspecialization: teacher.tspecialization, Status: teacher.Status, isVerified: teacher.isVerified, permissions: teacher.permissions, token, role: "teacher", authProvider: teacher.authProvider || "google", googleId: teacher.googleId };
      localStorage.setItem("edudocs", JSON.stringify(tdata));
      toast.success("Google Login Successful!");
      resetUnauthorizedHandler();
      notifyAuthUpdate();
      if (teacher.Status === "pending") navigate("/teacher-dashboard?status=pending");
      else navigate("/teacher-dashboard");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Google sign-in failed");
    }
  };

  if (step === "otp") {
    return (
      <div className="auth-otp-wrap">
        <h3>OTP Verification</h3>
        <p>Enter the 6-digit code sent to your email</p>
        <div className="otp-inputs">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <input
              key={i}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={otp[i] || ""}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, "");
                const next = [...otp];
                next[i] = val;
                setOtp(next.join(""));
                if (val && i < 5) {
                  const inputs = e.target.parentElement?.querySelectorAll("input");
                  (inputs?.[i + 1] as HTMLInputElement)?.focus();
                }
              }}
            />
          ))}
        </div>
        <div className="otp-timer">
          {resendTimer > 0 ? <>Resend in <strong>{resendTimer}s</strong></> : <button className="resend-btn" onClick={resendOtp} disabled={loading}>Resend OTP</button>}
        </div>
        {error && <div className="auth-alert error">{error}</div>}
        <button className="auth-submit-btn teacher" disabled={loading || otp.length < 6} onClick={() => verifyOtp(otp)}>
          {loading ? <Loader2 className="auth-spin" size={17} /> : <><CheckCircle2 size={16} /> Verify & Login</>}
        </button>
        <div className="auth-modal-footer">
          <p>Wrong email? <span className="switch-link" onClick={() => { setStep("login"); setTeacherId(null); setOtp(""); setError(""); }}>Go back</span></p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin}>
      {error && <div className="auth-alert error">{error}</div>}
      <div className="auth-google-btn">
        <GoogleLogin
          onSuccess={res => res.credential && handleGoogle(res.credential)}
          onError={() => toast.error("Google Sign-In Failed")}
          size="large"
          width="100%"
        />
      </div>
      <div className="auth-form-sep"><span>OR</span></div>
      <div className="auth-input-group">
        <label>Email Address</label>
        <div className="input-wrap">
          <Mail size={16} />
          <input type="email" name="temail" placeholder="teacher@university.edu" required disabled={loading} />
        </div>
      </div>
      <div className="auth-input-group">
        <div className="forgot-row">
          <span className="forgot-link" onClick={onForgot} style={{ cursor: "pointer" }}>Forgot Password?</span>
        </div>
        <div className="input-wrap">
          <Lock size={16} />
          <input type={showPw ? "text" : "password"} name="tpassword" placeholder="Your password" required style={{ paddingRight: "44px" }} />
          <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>
      <button className="auth-submit-btn teacher" type="submit" disabled={loading}>
        {loading ? <Loader2 className="auth-spin" size={17} /> : <>Access Dashboard <ArrowRight size={15} /></>}
      </button>
      <div className="auth-modal-footer">
        <p>New to faculty? <span className="switch-link" onClick={onSwitch}>Apply as Teacher</span></p>
      </div>
    </form>
  );
}

/* ==========================================
   TEACHER REGISTER
   ========================================== */
function TeacherRegister({ onSwitch }: { onSwitch: () => void }) {
  const navigate = useNavigate();
  const { closeAuthModal } = useAuthModal();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [formProgress, setFormProgress] = useState(0);
  const [formData, setFormData] = useState({
    tname: "", temail: "", tphn: "", tpassword: "",
    tspecialization: "", texp: "", tcity: "", tstate: "", tdesc: "", promocode: "" });

  const handleGoogle = async (credential: string) => {
    try {
      toast.info("Authenticating...");
      const { data } = await axios.post(`${url}/teachers/google-auth`, { credential });
      if (!data.success) throw new Error(data.message);
      const teacher = data.data.teacher;
      const token = data.data.token;
      const tdata = {
        id: teacher.id,
        tname: teacher.tname,
        temail: teacher.temail,
        tphn: teacher.tphn,
        tspecialization: teacher.tspecialization,
        Status: teacher.Status,
        isVerified: teacher.isVerified,
        permissions: teacher.permissions,
        token,
        role: "teacher",
        authProvider: teacher.authProvider || "google",
        googleId: teacher.googleId,
      };
      localStorage.setItem("edudocs", JSON.stringify(tdata));
      toast.success("Google Registration Successful!");
      resetUnauthorizedHandler();
      notifyAuthUpdate();
      if (teacher.Status === "pending") navigate("/teacher-dashboard?status=pending");
      else navigate("/teacher-dashboard");
      closeAuthModal();
    } catch (err: any) {
      toast.error(err.message || "Google sign-in failed");
    }
  };

  useEffect(() => {
    let t: number;
    if (countdown > 0) t = window.setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => { if (t) clearTimeout(t); };
  }, [countdown]);

  useEffect(() => {
    const req = ["tname", "temail", "tphn", "tpassword", "tspecialization", "texp", "tcity", "tstate", "tdesc"];
    const filled = req.filter(f => formData[f as keyof typeof formData]?.trim()).length;
    setFormProgress((filled / req.length) * 100);
  }, [formData]);

  useEffect(() => {
    if (otp.length === 6 && step === "otp") verifyOtp(otp);
  }, [otp, step]);

  const handleChange = (field: string, value: string) => setFormData(p => ({ ...p, [field]: value }));

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    try {
      setLoading(true);
      const res = await axios.post(`${url}/teachers/send-registration-otp`, { ...formData, temail: formData.temail.toLowerCase().trim() });
      if (res.data.success) { setStep("otp"); setCountdown(60); toast.success("OTP sent to your email!"); }
    } catch (err: any) {
      setError(err.response?.data?.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (code: string) => {
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("temail", formData.temail.toLowerCase().trim());
      fd.append("otp", code.trim());
      if (profileImage) fd.append("tprofile", profileImage);
      const res = await axios.post(`${url}/teachers/verify-registration-otp`, fd);
      if (res.data.success) { toast.success("Registration successful! Await admin approval."); onSwitch(); }
    } catch (err: any) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (step === "otp") {
    return (
      <div className="auth-otp-wrap">
        <h3>Verify Identity</h3>
        <p>6-digit code sent to <strong>{formData.temail}</strong></p>
        <div className="otp-inputs">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <input
              key={i}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={otp[i] || ""}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, "");
                const next = [...otp];
                next[i] = val;
                setOtp(next.join(""));
                if (val && i < 5) {
                  const inputs = e.target.parentElement?.querySelectorAll("input");
                  (inputs?.[i + 1] as HTMLInputElement)?.focus();
                }
              }}
            />
          ))}
        </div>
        <div className="otp-timer">
          {countdown > 0 ? <>Resend in <strong>{countdown}s</strong></> : <button className="resend-btn" onClick={() => setCountdown(0)}>Resend Code</button>}
        </div>
        {error && <div className="auth-alert error">{error}</div>}
        <button className="auth-submit-btn teacher" disabled={loading || otp.length < 6} onClick={() => verifyOtp(otp)}>
          {loading ? <Loader2 className="auth-spin" size={17} /> : <><CheckCircle2 size={16} /> Verify & Complete</>}
        </button>
        <div className="auth-modal-footer">
          <p>Wrong details? <span className="switch-link" onClick={() => { setStep("form"); setOtp(""); setError(""); }}>Go back</span></p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSend}>
      {error && <div className="auth-alert error">{error}</div>}
      <div className="auth-google-btn">
        <GoogleLogin
          text="signup_with"
          onSuccess={res => res.credential && handleGoogle(res.credential)}
          onError={() => toast.error("Google Sign-In Failed")}
          width="100%"
          size="large"
        />
      </div>
      <div className="auth-form-sep"><span>OR</span></div>
      <div className="auth-progress-wrap">
        <div className="prog-info"><span>Application Progress</span><strong>{Math.round(formProgress)}%</strong></div>
        <Progress percent={Math.round(formProgress)} showInfo={false} strokeColor="#66735b" />
      </div>
      <div className="auth-input-row">
        <div className="auth-input-group">
          <label>Full Name *</label>
          <div className="input-wrap">
            <User size={16} />
            <input type="text" value={formData.tname} onChange={e => handleChange("tname", e.target.value)} placeholder="Professor Name" required />
          </div>
        </div>
        <div className="auth-input-group">
          <label>Email *</label>
          <div className="input-wrap">
            <Mail size={16} />
            <input type="email" value={formData.temail} onChange={e => handleChange("temail", e.target.value)} placeholder="email@university.com" required />
          </div>
        </div>
      </div>
      <div className="auth-input-row">
        <div className="auth-input-group">
          <label>Phone *</label>
          <div className="input-wrap">
            <Phone size={16} />
            <input type="tel" value={formData.tphn} onChange={e => handleChange("tphn", e.target.value)} placeholder="10-digit Mobile" maxLength={10} required />
          </div>
        </div>
        <div className="auth-input-group">
          <label>City *</label>
          <div className="input-wrap">
            <MapPin size={16} />
            <input type="text" value={formData.tcity} onChange={e => handleChange("tcity", e.target.value)} placeholder="Enter City" required />
          </div>
        </div>
      </div>
      <div className="auth-input-row">
        <div className="auth-input-group">
          <label>State *</label>
          <div className="input-wrap">
            <MapPin size={16} />
            <input type="text" value={formData.tstate} onChange={e => handleChange("tstate", e.target.value)} placeholder="Enter State" required />
          </div>
        </div>
        <div className="auth-input-group">
          <label>Specialization *</label>
          <div className="input-wrap">
            <GraduationCap size={16} />
            <input type="text" value={formData.tspecialization} onChange={e => handleChange("tspecialization", e.target.value)} placeholder="Subject Specialty" required />
          </div>
        </div>
      </div>
      <div className="auth-input-row">
        <div className="auth-input-group">
          <label>Experience (Years) *</label>
          <div className="input-wrap">
            <Briefcase size={16} />
            <input type="number" value={formData.texp} onChange={e => handleChange("texp", e.target.value)} placeholder="0" required />
          </div>
        </div>
        <div className="auth-input-group">
          <label>Password *</label>
          <div className="input-wrap">
            <Lock size={16} />
            <input type={showPw ? "text" : "password"} value={formData.tpassword} onChange={e => handleChange("tpassword", e.target.value)} placeholder="Min. 8 characters" required style={{ paddingRight: "44px" }} />
            <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
      </div>
      <div className="auth-input-group">
        <label>About Your Teaching *</label>
        <div className="input-wrap">
          <textarea
            value={formData.tdesc}
            onChange={e => handleChange("tdesc", e.target.value)}
            placeholder="Describe your achievements and methodology..."
            rows={2}
            required
          />
        </div>
      </div>
      <div className="auth-input-group">
        <label>Promocode (Optional)</label>
        <div className="input-wrap">
          <KeyRound size={16} />
          <input type="text" value={formData.promocode} onChange={e => handleChange("promocode", e.target.value.toUpperCase())} placeholder="REFERRAL10" maxLength={20} />
        </div>
      </div>
      <div className="auth-dragger-wrap">
        <Upload.Dragger maxCount={1} beforeUpload={file => { setProfileImage(file); return false; }}>
          <p><Camera size={20} /></p>
          <p style={{ fontSize: "12px" }}>Profile photo (optional)</p>
        </Upload.Dragger>
      </div>
      <button className="auth-submit-btn teacher" type="submit" disabled={loading}>
        {loading ? <Loader2 className="auth-spin" size={17} /> : <>Submit Application <ArrowRight size={15} /></>}
      </button>
      <div className="auth-modal-footer">
        <p>Already a member? <span className="switch-link" onClick={onSwitch}>Sign In</span></p>
      </div>
    </form>
  );
}

/* ==========================================
   STUDENT FORGOT PASSWORD (in-modal)
   ========================================== */
function StudentForgotPassword({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<"email" | "verify" | "done">("email");
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!countdown) return;
    const t = window.setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    if (resetCode.length === 6 && newPassword.length >= 6 && newPassword === confirmPassword && step === "verify") {
      handleReset();
    }
  }, [resetCode, newPassword, confirmPassword]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${url}/users/send-forgot-password-otp`, { email: email.trim().toLowerCase() });
      if (res.data.success) {
        toast.success("Reset code sent to your email!");
        setStep("verify");
        setCountdown(900);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Error sending code");
    } finally { setLoading(false); }
  };

  const handleReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${url}/users/verify-forgot-password-otp`, {
        email: email.trim().toLowerCase(),
        resetCode: resetCode.trim(),
        newPassword });
      if (res.data.success) {
        toast.success("Password reset successfully!");
        setStep("done");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed");
    } finally { setLoading(false); }
  };

  if (step === "done") {
    return (
      <div className="auth-otp-wrap">
        <CheckCircle2 size={48} color="#16a34a" style={{ margin: "0 auto 12px" }} />
        <h3>Password Updated!</h3>
        <p>Your password has been reset successfully.</p>
        <button className="auth-submit-btn student" style={{ marginTop: 16 }} onClick={onBack}>
          Back to Sign In
        </button>
      </div>
    );
  }

  if (step === "verify") {
    return (
      <div>
        <button type="button" className="auth-back-btn" onClick={() => { setStep("email"); setResetCode(""); setError(""); }}>
          <ArrowLeft size={15} /> Back
        </button>
        <div className="auth-otp-wrap">
          <h3>Enter Reset Code</h3>
          <p>6-digit code sent to <strong>{email}</strong></p>
          <OtpInput value={resetCode} onChange={setResetCode} disabled={loading} length={6} />
          <div className="otp-timer" style={{ marginBottom: 12 }}>
            {countdown > 0
              ? <><Clock size={13} style={{ verticalAlign: "middle" }} /> Code expires in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}</>
              : <button className="resend-btn" onClick={() => handleSend({ preventDefault: () => { } } as any)}>Resend Code</button>}
          </div>
        </div>
        <form onSubmit={handleReset}>
          <div className="auth-input-group">
            <label>New Password</label>
            <div className="input-wrap">
              <Lock size={16} />
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 6 characters" required />
            </div>
          </div>
          <div className="auth-input-group">
            <label>Confirm Password</label>
            <div className="input-wrap">
              <Lock size={16} />
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" required />
            </div>
          </div>
          {error && <div className="auth-alert error">{error}</div>}
          <button className="auth-submit-btn student" type="submit" disabled={loading}>
            {loading ? <Loader2 className="auth-spin" size={17} /> : <><ShieldCheck size={16} /> Reset Password</>}
          </button>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={handleSend}>
      <button type="button" className="auth-back-btn" onClick={onBack}>
        <ArrowLeft size={15} /> Back to Sign In
      </button>
      <div className="auth-otp-wrap" style={{ marginBottom: 8 }}>
        <h3>Reset Password</h3>
        <p>Enter your email to receive a reset code.</p>
      </div>
      <div className="auth-input-group">
        <label>Email Address</label>
        <div className="input-wrap">
          <Mail size={16} />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="student@example.com" required />
        </div>
      </div>
      {error && <div className="auth-alert error">{error}</div>}
      <button className="auth-submit-btn student" type="submit" disabled={loading}>
        {loading ? <Loader2 className="auth-spin" size={17} /> : <>Send Reset Code <ArrowRight size={15} /></>}
      </button>
    </form>
  );
}

/* ==========================================
   TEACHER FORGOT PASSWORD (in-modal)
   ========================================== */
function TeacherForgotPassword({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<"email" | "verify" | "done">("email");
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!countdown) return;
    const t = window.setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    if (resetCode.length === 6 && newPassword.length >= 8 && newPassword === confirmPassword && step === "verify") {
      handleReset();
    }
  }, [resetCode, newPassword, confirmPassword]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${url}/teachers/send-forgot-password-otp`, { temail: email.trim().toLowerCase() });
      if (res.data.success) {
        toast.success("Reset code sent to your email!");
        setStep("verify");
        setCountdown(900);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Error sending code");
    } finally { setLoading(false); }
  };

  const handleReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${url}/teachers/verify-forgot-password-otp`, {
        temail: email.trim().toLowerCase(),
        resetCode: resetCode.trim(),
        newPassword });
      if (res.data.success) {
        toast.success("Password reset successfully!");
        setStep("done");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed");
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${url}/teachers/resend-forgot-password-otp`, { temail: email.trim().toLowerCase() });
      if (res.data.success) { toast.success("New reset code sent!"); setCountdown(900); setResetCode(""); }
    } catch (err: any) {
      toast.error("Error resending reset code");
    } finally { setLoading(false); }
  };

  if (step === "done") {
    return (
      <div className="auth-otp-wrap">
        <CheckCircle2 size={48} color="#16a34a" style={{ margin: "0 auto 12px" }} />
        <h3>Password Updated!</h3>
        <p>Your password has been reset successfully.</p>
        <button className="auth-submit-btn teacher" style={{ marginTop: 16 }} onClick={onBack}>
          Back to Sign In
        </button>
      </div>
    );
  }

  if (step === "verify") {
    return (
      <div>
        <button type="button" className="auth-back-btn" onClick={() => { setStep("email"); setResetCode(""); setError(""); }}>
          <ArrowLeft size={15} /> Back
        </button>
        <div className="auth-otp-wrap" style={{ marginBottom: 8 }}>
          <h3>Enter Reset Code</h3>
          <p>6-digit code sent to <strong>{email}</strong></p>
          <OtpInput value={resetCode} onChange={setResetCode} disabled={loading} length={6} />
          <div className="otp-timer" style={{ marginBottom: 12 }}>
            {countdown > 0
              ? <><Clock size={13} style={{ verticalAlign: "middle" }} /> Code expires in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}</>
              : <button className="resend-btn" onClick={handleResend}>Resend Code</button>}
          </div>
        </div>
        <form onSubmit={handleReset}>
          <div className="auth-input-group">
            <label>New Password</label>
            <div className="input-wrap">
              <Lock size={16} />
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 characters" required />
            </div>
          </div>
          <div className="auth-input-group">
            <label>Confirm Password</label>
            <div className="input-wrap">
              <Lock size={16} />
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" required />
            </div>
          </div>
          {error && <div className="auth-alert error">{error}</div>}
          <button className="auth-submit-btn teacher" type="submit" disabled={loading}>
            {loading ? <Loader2 className="auth-spin" size={17} /> : <><ShieldCheck size={16} /> Reset Password</>}
          </button>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={handleSend}>
      <button type="button" className="auth-back-btn" onClick={onBack}>
        <ArrowLeft size={15} /> Back to Sign In
      </button>
      <div className="auth-otp-wrap" style={{ marginBottom: 8 }}>
        <h3>Reset Password</h3>
        <p>Enter your email to receive a reset code.</p>
      </div>
      <div className="auth-input-group">
        <label>Email Address</label>
        <div className="input-wrap">
          <Mail size={16} />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="teacher@university.edu" required />
        </div>
      </div>
      {error && <div className="auth-alert error">{error}</div>}
      <button className="auth-submit-btn teacher" type="submit" disabled={loading}>
        {loading ? <Loader2 className="auth-spin" size={17} /> : <>Send Reset Code <ArrowRight size={15} /></>}
      </button>
    </form>
  );
}

/* ==========================================
   MAIN MODAL COMPONENT
   useNavigate() lives HERE (inside Router context)
   and is passed down as a prop to TeacherLogin
   ========================================== */
export default function AuthModal() {
  const { isOpen, defaultTab, defaultFlow, closeAuthModal } = useAuthModal();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"student" | "teacher">(defaultTab);
  const [flow, setFlow] = useState<AuthFlow>(defaultFlow);

  useEffect(() => {
    setTab(defaultTab);
    setFlow(defaultFlow);
  }, [defaultTab, defaultFlow]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuthModal();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [closeAuthModal]);

  if (!isOpen) return null;

  const handleSwitchFlow = () => setFlow(f => f === "login" ? "register" : "login");

  return createPortal(
    <div className="auth-modal-overlay" onClick={e => { if (e.target === e.currentTarget) closeAuthModal(); }}>
      <div className={`auth-modal-card${tab === "teacher" ? " teacher-mode" : ""}`}>

        <button className="auth-modal-close" onClick={closeAuthModal}>
          <X size={16} />
        </button>

        {/* HEADER */}
        <div className="auth-modal-header">
          <div className="auth-modal-logo">
            <BookOpen size={22} color="#ffffff" />
          </div>
          <h2>
            {flow === "forgot"
              ? <>Reset<em>Your Password</em></>
              : flow === "login"
                ? <>Unlock Your <em>True Potential</em></>
                : <>Join <em>Draa Family</em> Today</>}
          </h2>
          <p>
            {flow === "forgot"
              ? "We'll send a reset code to your email."
              : flow === "login"
                ? "Sign in to access your personalized learning portal."
                : "Create your free account and start learning instantly."}
          </p>
        </div>

        {/* TABS — hide on forgot flow */}
        {flow !== "forgot" && (
          <div className="auth-tab-bar">
            <button
              className={`auth-tab-btn tab-student${tab === "student" ? " active" : ""}`}
              onClick={() => { setTab("student"); setFlow("login"); }}
            >
              <User size={14} />
              Student
            </button>
            <button
              className={`auth-tab-btn tab-teacher${tab === "teacher" ? " active" : ""}`}
              onClick={() => { setTab("teacher"); setFlow("login"); }}
            >
              <GraduationCap size={14} />
              Teacher
            </button>
          </div>
        )}

        {/* FORM BODY */}
        <div className="auth-form-body">
          {tab === "student" && flow === "login" && (
            <StudentLogin onSwitch={handleSwitchFlow} onClose={closeAuthModal} onForgot={() => setFlow("forgot")} />
          )}
          {tab === "student" && flow === "register" && (
            <StudentRegister onSwitch={handleSwitchFlow} />
          )}
          {tab === "student" && flow === "forgot" && (
            <StudentForgotPassword onBack={() => setFlow("login")} />
          )}
          {tab === "teacher" && flow === "login" && (
            <TeacherLogin onSwitch={handleSwitchFlow} onClose={closeAuthModal} navigate={navigate} onForgot={() => setFlow("forgot")} />
          )}
          {tab === "teacher" && flow === "register" && (
            <TeacherRegister onSwitch={handleSwitchFlow} />
          )}
          {tab === "teacher" && flow === "forgot" && (
            <TeacherForgotPassword onBack={() => setFlow("login")} />
          )}
        </div>

        {/* SECURITY BADGE */}
        <div style={{ padding: "0 24px 20px" }}>
          <div className="auth-security-badge">
            <Shield size={14} />
            <span>100% Safe &amp; Secure — We never post without your permission</span>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
