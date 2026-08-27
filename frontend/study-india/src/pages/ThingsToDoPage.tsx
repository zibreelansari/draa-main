import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Globe, Compass, ArrowRight } from "lucide-react";

export default function ThingsToDoPage() {
  return (
    <div className="space-y-0 text-slate-800">
      <section className="bg-gradient-to-r from-[#0d3b66] via-[#1565C0] to-[#0D47A1] text-white py-14 text-center">
        <h1 className="font-bold text-3xl sm:text-4xl text-white">
          Things to Do in India
        </h1>
        <p className="text-xs sm:text-sm text-slate-200 mt-2">
          Experience Student Life, Festivals, Cuisine & Historical Landmarks
        </p>
      </section>

      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8 text-xs text-slate-700 leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <strong className="block text-base font-bold text-slate-900">1. Celebrate Global Festivals</strong>
              <p className="text-slate-600">Join campus celebrations of Diwali, Holi, Eid, Christmas, and regional harvest festivals across vibrant multicultural student cohorts.</p>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <strong className="block text-base font-bold text-slate-900">2. Explore World Heritage</strong>
              <p className="text-slate-600">Travel to 40+ UNESCO World Heritage Sites including the Taj Mahal, Jaipur palaces, ancient Nalanda ruins, and Himalayan hill stations.</p>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <strong className="block text-base font-bold text-slate-900">3. Diverse Cuisines & Food</strong>
              <p className="text-slate-600">Enjoy safe, healthy campus meal plans and explore regional Indian street food, traditional thalis, and international culinary cafes.</p>
            </div>
          </div>

          <div className="pt-6 text-center">
            <Link
              to="/institutes"
              className="px-6 py-3 bg-[#1565C0] hover:bg-[#0D47A1] text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow"
            >
              Explore Institutes Across India <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
