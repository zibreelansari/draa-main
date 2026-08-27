import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Building2,
  MapPin,
  Award,
  Globe,
  CheckCircle2,
  ArrowRight,
  DollarSign,
  Calendar,
  ShieldCheck,
  Send,
  Phone,
  Mail
} from "lucide-react";
import { UNIVERSITIES } from "../data/portalData";

export default function InstituteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const university = UNIVERSITIES.find((u) => u.id === id) || UNIVERSITIES[0];

  const [enquirySent, setEnquirySent] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "",
    course: university.popularCourses[0] || "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnquirySent(true);
  };

  return (
    <div className="space-y-0 text-slate-800">
      {/* University Header Banner */}
      <section className="bg-[#0B1B2B] text-white py-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded border border-amber-500/30">
                  {university.type}
                </span>
                {university.nirfRank && (
                  <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded border border-slate-700">
                    {university.nirfRank}
                  </span>
                )}
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                {university.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-amber-400" /> {university.city}, {university.state}
                </span>
                <span>•</span>
                <span>{university.naacGrade}</span>
                <span>•</span>
                <span>Est. {university.established}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href="#enquire"
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow transition-colors"
              >
                Submit Direct Enquiry
              </a>
              <Link
                to="/register"
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors"
              >
                Apply via Student Desk
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Profile Grid */}
      <section className="py-12 bg-slate-50 min-h-[70vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Content Column */}
            <div className="lg:col-span-8 space-y-8">
              {/* Campus Photo */}
              <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-md">
                <img
                  src={university.campusImage}
                  alt={university.name}
                  className="w-full h-80 object-cover"
                />
              </div>

              {/* Overview */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <h2 className="font-serif text-xl font-bold text-slate-900">
                  Campus Overview & Academic Profile
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {university.description}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Medium of Instruction</span>
                    <strong className="text-slate-900 font-bold">100% English</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Hostel Available</span>
                    <strong className="text-slate-900 font-bold">Yes (Dedicated Foreign Cell)</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Merit Fee Waivers</span>
                    <strong className="text-slate-900 font-bold">Up to 50% Available</strong>
                  </div>
                </div>
              </div>

              {/* Popular Programmes & Degrees */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="font-serif text-xl font-bold text-slate-900">
                  Programmes & Degrees Available for International Applicants
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {university.popularCourses.map((c) => (
                    <div
                      key={c}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <strong className="font-bold text-slate-800">{c}</strong>
                      <span className="text-amber-600 font-bold">UG / PG</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Campus Facilities */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="font-serif text-xl font-bold text-slate-900">
                  International Student Facilities
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  {university.facilities.map((f) => (
                    <div key={f} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      <CheckCircle2 size={15} className="text-amber-600 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sticky Enquiry Form Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div id="enquire" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    Enquire for 2026-27 Intake
                  </h3>
                  <p className="text-xs text-slate-500">
                    Direct admission guidance for {university.shortName}.
                  </p>
                </div>

                {enquirySent ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs space-y-2 text-center">
                    <CheckCircle2 size={24} className="text-emerald-600 mx-auto" />
                    <strong className="block font-bold text-sm">Enquiry Submitted!</strong>
                    <p className="text-[11px] leading-relaxed text-emerald-700">
                      An international admissions counsellor will contact you within 24 business hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Your full passport name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:outline-none focus:border-amber-600"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="name@student.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:outline-none focus:border-amber-600"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nationality / Country</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Nepal, UAE, Nigeria..."
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:outline-none focus:border-amber-600"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Course of Interest</label>
                      <select
                        value={formData.course}
                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold focus:outline-none focus:border-amber-600"
                      >
                        {university.popularCourses.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-extrabold rounded-xl transition-all shadow flex items-center justify-center gap-1.5"
                    >
                      <Send size={14} /> Send Admission Enquiry
                    </button>
                  </form>
                )}
              </div>

              {/* Fee Summary Card */}
              <div className="bg-[#0B1B2B] text-white p-6 rounded-3xl space-y-3">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                  Tuition & Budget Overview
                </span>
                <div className="text-2xl font-serif font-bold text-white">
                  {university.tuitionPerYearUSD} <span className="text-xs font-sans text-slate-400">/ academic year</span>
                </div>
                <p className="text-xs text-slate-300">
                  Approx. {university.tuitionPerYearINR} in Indian Rupees. Includes library and laboratory access.
                </p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  Intake Timelines: {university.intakes.join(" & ")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
