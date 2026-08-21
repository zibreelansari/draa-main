import React, { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RegisterModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("977");
  const [phone, setPhone] = useState("");
  const [course, setCourse] = useState("");
  const [degree, setDegree] = useState("Undergraduate");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      navigate("/dashboard");
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-900">
            Student Registration
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto">
          {submitted ? (
            <div className="p-6 text-center space-y-2 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900">
              <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
              <strong className="block font-bold text-base">Registration Complete!</strong>
              <p className="text-xs text-emerald-700">Opening your Student Desk...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:border-[#1565C0]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:border-[#1565C0]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:border-[#1565C0]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5">
                  <label className="block font-bold text-slate-700 mb-1">
                    Country Code *
                  </label>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#1565C0]"
                  >
                    <option value="977">Nepal (+977)</option>
                    <option value="880">Bangladesh (+880)</option>
                    <option value="94">Sri Lanka (+94)</option>
                    <option value="234">Nigeria (+234)</option>
                    <option value="254">Kenya (+254)</option>
                    <option value="971">UAE (+971)</option>
                    <option value="233">Ghana (+233)</option>
                    <option value="1">USA / Canada (+1)</option>
                    <option value="44">UK (+44)</option>
                  </select>
                </div>
                <div className="sm:col-span-7">
                  <label className="block font-bold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:border-[#1565C0]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Interested Course
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science, MBA, Medicine"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:border-[#1565C0]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Interested Degree
                </label>
                <select
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#1565C0]"
                >
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Postgraduate">Postgraduate</option>
                  <option value="PhD">PhD / Doctorate</option>
                  <option value="Diploma">Diploma / Short Course</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#1565C0] hover:bg-[#0D47A1] text-white font-bold rounded-lg transition-colors shadow-sm"
                >
                  Complete Registration
                </button>
              </div>

              <p className="text-center text-[11px] text-slate-500 pt-1 mb-0">
                By registering, you agree to receive official communications regarding Study in India programs.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
