import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Globe,
  Sun,
  DollarSign,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { CITIES } from "../data/portalData";

export default function ExploreIndiaPage() {
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);

  return (
    <div className="space-y-0 text-slate-800">
      {/* Header */}
      <section className="bg-[#0B1B2B] text-white py-14 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-3">
          <div className="text-xs text-amber-400 font-bold uppercase tracking-widest">
            STUDENT LIFE, LIVING COSTS & CITIES
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Explore India: Living, Culture & Student Cities
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Discover student life in major educational destinations, monthly living cost benchmarks, campus food and safety, and diverse cultural experiences.
          </p>
        </div>
      </section>

      {/* City Guides Section */}
      <section id="cities" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
              CAMPUS HUBS
            </span>
            <h2 className="font-serif text-3xl font-bold text-slate-900">
              India's Leading Student Hubs
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {CITIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCity(c)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCity.id === c.id
                    ? "bg-amber-600 text-white shadow"
                    : "bg-slate-50 text-slate-700 border border-slate-200 hover:border-amber-500"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-sm">
            <div className="lg:col-span-5 h-72 lg:h-auto relative">
              <img
                src={selectedCity.image}
                alt={selectedCity.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-4 text-white drop-shadow">
                <span className="text-xs font-bold text-amber-400 block">{selectedCity.state}</span>
                <strong className="text-2xl font-serif font-bold">{selectedCity.name}</strong>
              </div>
            </div>

            <div className="lg:col-span-7 p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-slate-900">
                  {selectedCity.tagline}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedCity.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Avg. Living Cost</span>
                    <strong className="text-xs font-bold text-slate-900">{selectedCity.avgLivingCostUSD}</strong>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Climate</span>
                    <strong className="text-xs font-bold text-slate-900">{selectedCity.climate}</strong>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Campuses</span>
                    <strong className="text-xs font-bold text-slate-900">{selectedCity.universitiesCount}</strong>
                  </div>
                </div>

                <div className="pt-2">
                  <strong className="block text-xs font-bold text-slate-800 mb-1.5">Key Highlights:</strong>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCity.highlights.map((h) => (
                      <span key={h} className="text-[11px] bg-white border border-slate-200 px-2.5 py-1 rounded-md text-slate-700 font-medium">
                        ✓ {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <Link
                  to="/institutes"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1.5"
                >
                  Explore Universities in {selectedCity.name} <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Living Costs Breakdown */}
      <section id="living-costs" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
              FINANCIAL PLANNING
            </span>
            <h2 className="font-serif text-3xl font-bold text-slate-900">
              Estimated Monthly Living Expenses in India
            </h2>
            <p className="text-xs text-slate-500">
              India is globally known for offering premium lifestyle quality at exceptionally affordable costs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-amber-600 font-bold text-xs uppercase block">1. Campus Hostel & Room</span>
              <strong className="text-xl font-serif font-bold text-slate-900 block">$120 – $220</strong>
              <p className="text-slate-500 leading-snug">Includes twin/single sharing room with electricity, water, and Wi-Fi access.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-amber-600 font-bold text-xs uppercase block">2. Food & Dining</span>
              <strong className="text-xl font-serif font-bold text-slate-900 block">$80 – $140</strong>
              <p className="text-slate-500 leading-snug">University mess plan (3 meals/day) plus local international dining options.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-amber-600 font-bold text-xs uppercase block">3. Local Commute & Metro</span>
              <strong className="text-xl font-serif font-bold text-slate-900 block">$20 – $40</strong>
              <p className="text-slate-500 leading-snug">Student metro cards, local buses, auto-rickshaws, and campus bicycles.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-amber-600 font-bold text-xs uppercase block">4. Phone, Books & Leisure</span>
              <strong className="text-xl font-serif font-bold text-slate-900 block">$40 – $70</strong>
              <p className="text-slate-500 leading-snug">High-speed 5G mobile data ($5/mo), textbooks, stationery, and outings.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
