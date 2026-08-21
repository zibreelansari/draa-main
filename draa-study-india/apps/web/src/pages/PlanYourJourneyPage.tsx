import React from "react";
import { Link } from "react-router-dom";
import {
  FileCheck2,
  Plane,
  ShieldCheck,
  Building2,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Clock,
  DollarSign
} from "lucide-react";

export default function PlanYourJourneyPage() {
  return (
    <div className="space-y-0 text-slate-800">
      {/* Header */}
      <section className="bg-[#0B1B2B] text-white py-14 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-3">
          <div className="text-xs text-amber-400 font-bold uppercase tracking-widest">
            ADMISSION, VISA & ONBOARDING GUIDE
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Plan Your Journey to India
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Everything you need to know about the 5-step application process, Indian Student Visa (S-Visa) documentation, and mandatory e-FRRO arrival registration.
          </p>
        </div>
      </section>

      {/* 5-Step Process Breakdown */}
      <section id="steps" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
              STEP-BY-STEP WORKFLOW
            </span>
            <h2 className="font-serif text-3xl font-bold text-slate-900">
              The 5-Step Admission Journey
            </h2>
          </div>

          <div className="space-y-4">
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="w-10 h-10 rounded-xl bg-amber-600 text-white font-serif font-bold text-lg flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <strong className="block text-base font-bold text-slate-900">Step 1: Student Registration</strong>
                  <p className="text-xs text-slate-600 mt-1">
                    Create your account on the Student Login Desk, fill in your personal information, passport details, and educational background.
                  </p>
                </div>
              </div>
              <Link to="/register" className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg shrink-0">
                Register Now
              </Link>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="w-10 h-10 rounded-xl bg-amber-600 text-white font-serif font-bold text-lg flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <strong className="block text-base font-bold text-slate-900">Step 2: Course & Institute Choice Filling</strong>
                  <p className="text-xs text-slate-600 mt-1">
                    Search through accredited undergraduate or postgraduate courses and select your top 3 preferred university campuses.
                  </p>
                </div>
              </div>
              <Link to="/courses" className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg shrink-0">
                Explore Courses
              </Link>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="w-10 h-10 rounded-xl bg-amber-600 text-white font-serif font-bold text-lg flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <strong className="block text-base font-bold text-slate-900">Step 3: Document Verification & Submission</strong>
                  <p className="text-xs text-slate-600 mt-1">
                    Upload certified secondary/bachelor academic transcripts, passport copy, and medium-of-instruction certificate.
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-500">Digital Upload</span>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="w-10 h-10 rounded-xl bg-amber-600 text-white font-serif font-bold text-lg flex items-center justify-center shrink-0">
                  4
                </span>
                <div>
                  <strong className="block text-base font-bold text-slate-900">Step 4: Provisional Admission Offer</strong>
                  <p className="text-xs text-slate-600 mt-1">
                    Universities review your application and issue the official Provisional Admission Letter stating course, fees, and applicable fee concessions.
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-amber-600 font-bold">Offer Issued</span>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="w-10 h-10 rounded-xl bg-amber-600 text-white font-serif font-bold text-lg flex items-center justify-center shrink-0">
                  5
                </span>
                <div>
                  <strong className="block text-base font-bold text-slate-900">Step 5: Student Visa (S-Visa) & Travel to India</strong>
                  <p className="text-xs text-slate-600 mt-1">
                    Apply for your student visa at the Indian Embassy/Consulate using your admission letter, complete pre-departure, and arrive on campus.
                  </p>
                </div>
              </div>
              <a href="#visa" className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-lg shrink-0">
                Visa Checklist
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Student Visa (S-Visa) & e-FRRO Section */}
      <section id="visa" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                CONSULAR REQUIREMENTS
              </span>
              <h2 className="font-serif text-3xl font-bold text-slate-900">
                Indian Student Visa (S-Visa) Guidelines
              </h2>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              International students admitted into full-time regular academic programmes are eligible for a multiple-entry Indian Student Visa valid for the full duration of the degree course.
            </p>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
              <strong className="block font-bold text-slate-900 text-sm">
                Mandatory Visa Documents Checklist:
              </strong>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-center gap-2">✓ Valid Passport with minimum 6 months validity</li>
                <li className="flex items-center gap-2">✓ Official Provisional Admission Letter from the Indian University</li>
                <li className="flex items-center gap-2">✓ Certified copies of academic certificates and transcripts</li>
                <li className="flex items-center gap-2">✓ Proof of Financial Solvency (Bank Statement / Sponsor letter)</li>
                <li className="flex items-center gap-2">✓ Four recent passport-sized photographs (White background)</li>
                <li className="flex items-center gap-2">✓ Yellow Fever / Health certificate (for designated countries)</li>
              </ul>
            </div>
          </div>

          <div id="frro" className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                ARRIVAL ONBOARDING
              </span>
              <h2 className="font-serif text-3xl font-bold text-slate-900">
                Mandatory e-FRRO Registration
              </h2>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Foreign students entering India on a Student Visa valid for more than 180 days must register online with the Foreigners Regional Registration Office (e-FRRO) within 14 days of arrival in India.
            </p>

            <div className="bg-[#0B1B2B] text-white p-6 rounded-2xl space-y-3 text-xs">
              <strong className="block text-amber-400 font-bold text-sm">
                How e-FRRO Registration Works:
              </strong>
              <p className="text-slate-300 leading-relaxed">
                Registration is completely online. The International Student Cell at your host university will assist you in generating the Bonafide Student Certificate (Form S) and submitting your residential address details.
              </p>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                No physical visit to FRRO office is required in most cases; your Residential Permit (RP) will be emailed directly.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
