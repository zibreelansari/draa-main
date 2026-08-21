import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Building2,
  MapPin,
  Award,
  ArrowRight,
  Filter,
  CheckCircle2,
  Globe
} from "lucide-react";
import { UNIVERSITIES } from "../data/portalData";

export default function InstitutesPage() {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("type") || "all";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedState, setSelectedState] = useState("all");

  const filtered = UNIVERSITIES.filter((u) => {
    if (selectedType !== "all") {
      if (selectedType === "Central" && u.type !== "Central University") return false;
      if (selectedType === "National" && u.type !== "Institute of National Importance") return false;
      if (selectedType === "Private" && (u.type !== "Private University" && u.type !== "Deemed University")) return false;
      if (selectedType === "State" && u.type !== "State University") return false;
    }
    if (selectedState !== "all" && u.state !== selectedState) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q) ||
        u.popularCourses.some((c) => c.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const states = Array.from(new Set(UNIVERSITIES.map((u) => u.state)));

  return (
    <div className="space-y-0 text-slate-800">
      {/* Header */}
      <section className="bg-[#0B1B2B] text-white py-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-3">
          <div className="text-xs text-amber-400 font-bold uppercase tracking-widest">
            INSTITUTION DIRECTORY
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
            Explore Higher Education Institutes in India
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Search verified accredited universities, Institutes of National Importance, and top private research campuses offering international admissions.
          </p>
        </div>
      </section>

      {/* Main Filter & Grid Container */}
      <section className="py-12 bg-slate-50 min-h-[70vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Filter Sidebar */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900 border-b border-slate-100 pb-3">
                  <Filter size={15} className="text-amber-600" /> Filter Institutes
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Search by Name or City
                  </label>
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Delhi, Manipal, IISc..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Institution Category
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:border-amber-600"
                  >
                    <option value="all">All Categories</option>
                    <option value="Central">Central Universities</option>
                    <option value="National">Institutes of National Importance</option>
                    <option value="State">State Universities</option>
                    <option value="Private">Deemed & Private Universities</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Location / State
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:border-amber-600"
                  >
                    <option value="all">All States</option>
                    {states.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedType("all");
                    setSelectedState("all");
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                >
                  Reset Filters
                </button>
              </div>

              {/* Quick Info Box */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-2 text-amber-950">
                <strong className="block font-bold flex items-center gap-1.5">
                  <Award size={15} className="text-amber-700" /> Accreditation Notice
                </strong>
                <p className="text-[11px] leading-relaxed text-amber-900">
                  All listed institutions are recognized by the University Grants Commission (UGC) and certified for international student enrollments under Indian Student Visa (S-Visa) regulations.
                </p>
              </div>
            </div>

            {/* University Cards Grid */}
            <div className="lg:col-span-9 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2">
                <span>Showing <strong>{filtered.length}</strong> accredited higher education institutes</span>
              </div>

              {filtered.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                  <p className="text-xs text-slate-500 font-medium">No institutions matched your current filters.</p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedType("all");
                      setSelectedState("all");
                    }}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filtered.map((u) => (
                    <article
                      key={u.id}
                      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-amber-500 transition-all flex flex-col justify-between"
                    >
                      <div className="h-44 relative overflow-hidden">
                        <img
                          src={u.campusImage}
                          alt={u.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 bg-slate-900/90 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700">
                          {u.type}
                        </div>
                        {u.nirfRank && (
                          <div className="absolute top-3 right-3 bg-amber-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow">
                            {u.nirfRank}
                          </div>
                        )}
                        <div className="absolute bottom-2 left-3 text-white text-xs flex items-center gap-1 drop-shadow-md">
                          <MapPin size={12} className="text-amber-400" /> {u.city}, {u.state}
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h2 className="font-serif text-lg font-bold text-slate-900">
                            {u.name}
                          </h2>
                          <span className="text-[11px] text-amber-700 font-bold block mt-0.5">
                            {u.naacGrade} • Est. {u.established}
                          </span>
                          <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                            {u.description}
                          </p>

                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {u.popularCourses.slice(0, 3).map((c) => (
                              <span
                                key={c}
                                className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Tuition / Year</span>
                            <strong className="text-slate-900 font-bold">{u.tuitionPerYearUSD}</strong>
                          </div>
                          <Link
                            to={`/institutes/${u.id}`}
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1"
                          >
                            View Campus Profile <ArrowRight size={13} />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
