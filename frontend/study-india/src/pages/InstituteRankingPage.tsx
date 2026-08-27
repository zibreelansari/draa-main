import React from "react";
import { Link } from "react-router-dom";
import { Award, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { UNIVERSITIES } from "../data/portalData";

export default function InstituteRankingPage() {
  return (
    <div className="space-y-0 text-slate-800">
      <section className="bg-gradient-to-r from-[#0d3b66] via-[#1565C0] to-[#0D47A1] text-white py-14 text-center">
        <h1 className="font-bold text-3xl sm:text-4xl text-white">
          Institute Rankings & Accreditation
        </h1>
        <p className="text-xs sm:text-sm text-slate-200 mt-2">
          NIRF National Institutional Ranking Framework & NAAC Grade Benchmarks
        </p>
      </section>

      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
            <h2 className="text-base font-bold text-slate-900">
              NIRF Assessment Parameters
            </h2>
            <p>
              NIRF ranks top institutions based on: 1) Teaching, Learning and Resources, 2) Research and Professional Practices, 3) Graduation Outcomes, 4) Outreach and Inclusivity, and 5) Peer Perception.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase">
              Top Ranked Partner Universities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {UNIVERSITIES.map((u) => (
                <div key={u.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between text-xs">
                  <div>
                    <strong className="block text-sm font-bold text-slate-900">{u.name}</strong>
                    <span className="text-slate-500">{u.city}, {u.state}</span>
                    <span className="text-amber-700 font-bold block mt-1">{u.naacGrade}</span>
                  </div>
                  <div className="text-right">
                    <span className="bg-blue-100 text-[#1565C0] font-bold px-2 py-0.5 rounded text-[11px]">
                      {u.nirfRank || "Top Ranked"}
                    </span>
                    <Link to={`/institutes/${u.id}`} className="block text-xs font-bold text-[#1565C0] hover:underline mt-2">
                      View Profile →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
