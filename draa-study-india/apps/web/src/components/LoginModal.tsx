import React, { useState } from "react";
import { X, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LoginModal({
  isOpen,
  onClose,
  initialRole = "Student",
  onSwitchToRegister,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: string;
  onSwitchToRegister: () => void;
}) {
  const navigate = useNavigate();
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
    navigate("/dashboard");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-900">
            {role} Login
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Email ID / Student ID *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:border-[#1565C0]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Password *
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:border-[#1565C0]"
            />
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <label className="flex items-center gap-1 text-slate-600">
              <input type="checkbox" className="rounded border-slate-300" />
              <span>Remember me</span>
            </label>
            <a
              href="#forgot"
              onClick={(e) => {
                e.preventDefault();
                alert("Password reset instructions have been simulated.");
              }}
              className="text-[#1565C0] font-semibold hover:underline"
            >
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#1565C0] hover:bg-[#0D47A1] text-white font-bold rounded-lg transition-colors shadow-sm"
          >
            Log In
          </button>

          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-600">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToRegister();
              }}
              className="text-[#FF6F00] font-bold hover:underline"
            >
              Register Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
