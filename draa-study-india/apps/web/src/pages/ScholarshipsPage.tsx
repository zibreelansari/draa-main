import React from "react";
import { Link } from "react-router-dom";
import {
  Award,
  DollarSign,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { SCHOLARSHIPS } from "../data/portalData";

export default function ScholarshipsPage() {
  return (
    <div className="space-y-0 text-slate-800">
      {/* Header */}
      <section className="bg-[#0B1B2B] text-white py-14 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-3">
          <div className="text-xs text-amber-400 font-bold uppercase tracking-widest">
            FINANCIAL ASSISTANCE & CONCESSIONS
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Scholarships & Fee Concessions
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Discover merit fee waivers and institutional scholarship schemes designed to support outstanding international students studying in India.
          </p>
        </div>
      </section>

      {/* Main Scholarships Grid */}
      <section className="py-16 bg-slate-50 min-h-[70vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          {/* Overview Banner */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                MERIT FEE WAIVER SCHEME
              </span>
              <h2 className="font-serif text-2xl font-bold text-slate-900">
                Tuition Fee Waivers up to 100%
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Under the Study in India partnership framework, participating accredited institutions allocate merit fee waivers ranging from 25% to 100% off standard international tuition for high-achieving applicants.
              </p>
            </div>
            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <Link
                to="/register"
                className="px-6 py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow transition-colors flex items-center gap-2"
              >
                Apply via Student Desk <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Scholarship Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SCHOLARSHIPS.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-500 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      {s.type}
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      Deadline: {s.deadline}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-slate-900 leading-snug">
                    {s.name}
                  </h3>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <strong className="block text-amber-700 font-bold text-base">
                      {s.discount}
                    </strong>
                    <span className="text-[11px] text-slate-600 mt-0.5 block">
                      {s.coverage}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>Eligibility:</strong> {s.eligibility}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Link
                    to="/register"
                    className="w-full py-2.5 bg-slate-900 hover:bg-amber-600 text-white text-center text-xs font-bold rounded-lg transition-colors block"
                  >
                    Check Eligibility on Desk
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Scholarship FAQs Box */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="font-serif text-xl font-bold text-slate-900">
              How Scholarship Fee Waivers are Awarded
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
              <div className="space-y-1.5 p-4 bg-slate-50 rounded-2xl">
                <strong className="text-slate-900 block font-bold">1. Academic Evaluation</strong>
                <p>Your submitted 10+2/secondary or bachelor transcripts are reviewed against cutoff benchmarks.</p>
              </div>
              <div className="space-y-1.5 p-4 bg-slate-50 rounded-2xl">
                <strong className="text-slate-900 block font-bold">2. Provisional Offer Letter</strong>
                <p>Eligible fee waivers (25%, 50%, or 100%) are stated explicitly on your institutional offer letter.</p>
              </div>
              <div className="space-y-1.5 p-4 bg-slate-50 rounded-2xl">
                <strong className="text-slate-900 block font-bold">3. Visa Endorsement</strong>
                <p>The reduced fee structure is recorded on your official documents for consular visa clearance.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
