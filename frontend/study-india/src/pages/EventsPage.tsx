import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  Video
} from "lucide-react";
import { EVENTS } from "../data/portalData";

export default function EventsPage() {
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);

  const toggleRegister = (id: string) => {
    if (registeredIds.includes(id)) {
      setRegisteredIds(registeredIds.filter((item) => item !== id));
    } else {
      setRegisteredIds([...registeredIds, id]);
    }
  };

  return (
    <div className="space-y-0 text-slate-800">
      {/* Header */}
      <section className="bg-[#0B1B2B] text-white py-14 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-3">
          <div className="text-xs text-amber-400 font-bold uppercase tracking-widest">
            LIVE ADMISSIONS & WEBINAR SCHEDULE
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Events, Webinars & Virtual Education Fairs
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Connect directly with university admissions deans, international student counsellors, and consular visa experts.
          </p>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16 bg-slate-50 min-h-[70vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {EVENTS.map((event) => {
              const isRegistered = registeredIds.includes(event.id);
              return (
                <div
                  key={event.id}
                  className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-5 hover:border-amber-500 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold uppercase text-[10px]">
                        {event.category}
                      </span>
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <Calendar size={13} /> {event.date}
                      </span>
                    </div>

                    <h2 className="font-serif text-lg font-bold text-slate-900 leading-snug">
                      {event.title}
                    </h2>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-amber-600" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Video size={13} className="text-amber-600" />
                        <span>{event.venue}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    {isRegistered ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                        <CheckCircle2 size={16} /> Registered! Session link sent to your email.
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleRegister(event.id)}
                        className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
                      >
                        Register for Free <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
