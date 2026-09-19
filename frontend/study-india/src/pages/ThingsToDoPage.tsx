import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Search,
  SlidersHorizontal,
  Bookmark,
  Heart,
  Calendar,
  Sparkles,
  Info,
  CheckCircle2,
  X,
  ArrowRight,
  ExternalLink,
  Train,
  ShieldCheck,
  Award,
  Compass,
  DollarSign,
  Coffee,
  Share2,
  BookOpen
} from "lucide-react";
import { HERITAGE_LANDMARKS, type HeritageLandmark } from "../data/thingsToDoData";
import "../styles/ThingsToDo.css";

export default function ThingsToDoPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recommended");
  const [selectedLandmark, setSelectedLandmark] = useState<HeritageLandmark | null>(null);
  const [bucketList, setBucketList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("draa_student_bucket_list");
      return saved ? JSON.parse(saved) : ["taj-mahal", "golden-temple", "kerala-backwaters"];
    } catch {
      return ["taj-mahal", "golden-temple"];
    }
  });
  const [showBucketModal, setShowBucketModal] = useState(false);

  // Sync bucket list to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("draa_student_bucket_list", JSON.stringify(bucketList));
    } catch {
      // ignore
    }
  }, [bucketList]);

  const toggleBucketList = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBucketList((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filter & Sort Logic
  const filteredLandmarks = useMemo(() => {
    let list = HERITAGE_LANDMARKS.filter((item) => {
      // Category filter
      if (selectedCategory !== "all") {
        if (selectedCategory === "unesco" && !item.isUnesco) return false;
        if (selectedCategory !== "unesco" && item.category !== selectedCategory) return false;
      }
      // Region filter
      if (selectedRegion !== "all" && item.region !== selectedRegion) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchLoc = item.location.toLowerCase().includes(q);
        const matchState = item.state.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchHub = item.nearestHubs.toLowerCase().includes(q);
        if (!matchTitle && !matchLoc && !matchState && !matchDesc && !matchHub) {
          return false;
        }
      }
      return true;
    });

    // Sort logic
    if (sortBy === "unesco") {
      list = [...list].sort((a, b) => (b.isUnesco ? 1 : 0) - (a.isUnesco ? 1 : 0));
    } else if (sortBy === "budget") {
      list = [...list].sort((a, b) => {
        const aNum = parseInt(a.studentBudgetInr.replace(/[^0-9]/g, "")) || 0;
        const bNum = parseInt(b.studentBudgetInr.replace(/[^0-9]/g, "")) || 0;
        return aNum - bNum;
      });
    }

    return list;
  }, [searchQuery, selectedCategory, selectedRegion, sortBy]);

  const savedLandmarkObjects = useMemo(() => {
    return HERITAGE_LANDMARKS.filter((item) => bucketList.includes(item.id));
  }, [bucketList]);

  return (
    <div className="ttd-page">
      {/* ═══════════ HERO BANNER ═══════════ */}
      <section className="ttd-hero">
        <div className="ttd-hero-content">
          <div className="ttd-eyebrow">
            <Sparkles size={14} /> LIFE BEYOND CAMPUS · STUDY IN INDIA
          </div>
          <h1 className="ttd-title">
            Discover India: <span>Living Heritages</span>, Ancient Wonders & Student Journeys
          </h1>
          <p className="ttd-subtitle">
            From 42+ UNESCO World Heritage monuments and Himalayan meditation retreats to tropical backwaters and lively street bazaars. Explore authentic experiences curated specifically for international scholars.
          </p>

          {/* Quick Stats Ticker */}
          <div className="ttd-stats-ticker">
            <div className="ttd-stat-card">
              <div className="ttd-stat-val">42+</div>
              <div className="ttd-stat-lbl">UNESCO World Heritages</div>
            </div>
            <div className="ttd-stat-card">
              <div className="ttd-stat-val">28</div>
              <div className="ttd-stat-lbl">Diverse States & Cultures</div>
            </div>
            <div className="ttd-stat-card">
              <div className="ttd-stat-val">50%</div>
              <div className="ttd-stat-lbl">Student Travel & Rail Discounts</div>
            </div>
            <div className="ttd-stat-card">
              <div className="ttd-stat-val">100+</div>
              <div className="ttd-stat-lbl">Campus & Folk Festivals</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ INTERACTIVE CONTROLS BAR ═══════════ */}
      <section className="ttd-controls-section">
        <div className="ttd-controls-shell">
          <div className="ttd-search-row">
            {/* Search Input */}
            <div className="ttd-search-box">
              <Search size={18} className="ttd-search-icon" />
              <input
                type="text"
                className="ttd-search-input"
                placeholder="Search landmarks, cities, heritages, or university hubs (e.g. Taj, Delhi, Kerala, Yoga)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{ position: "absolute", right: 12, background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Region Dropdown */}
            <div className="ttd-filter-selects">
              <select
                className="ttd-select"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
              >
                <option value="all">🗺️ All Regions</option>
                <option value="north">North India & Himalayas</option>
                <option value="south">South India</option>
                <option value="west">West & Central India</option>
                <option value="east">East & Northeast India</option>
              </select>

              {/* Sort Dropdown */}
              <select
                className="ttd-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recommended">⭐ Top Recommended</option>
                <option value="unesco">🏛️ UNESCO Certified First</option>
                <option value="budget">💰 Budget Friendly First</option>
              </select>

              {/* Bucket List Toggle Button */}
              <button className="ttd-bucket-btn" onClick={() => setShowBucketModal(true)}>
                <Bookmark size={15} /> My Bucket List
                <span className="ttd-bucket-count">{bucketList.length}</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="ttd-category-pills">
            <button
              className={`ttd-pill ${selectedCategory === "all" ? "active" : ""}`}
              onClick={() => setSelectedCategory("all")}
            >
              All Experiences ({HERITAGE_LANDMARKS.length})
            </button>
            <button
              className={`ttd-pill ${selectedCategory === "unesco" ? "active" : ""}`}
              onClick={() => setSelectedCategory("unesco")}
            >
              <Award size={13} /> UNESCO World Heritage ({HERITAGE_LANDMARKS.filter((l) => l.isUnesco).length})
            </button>
            <button
              className={`ttd-pill ${selectedCategory === "spiritual" ? "active" : ""}`}
              onClick={() => setSelectedCategory("spiritual")}
            >
              <Sparkles size={13} /> Spiritual & Living Traditions
            </button>
            <button
              className={`ttd-pill ${selectedCategory === "nature" ? "active" : ""}`}
              onClick={() => setSelectedCategory("nature")}
            >
              <Compass size={13} /> Nature & Mountain Escapes
            </button>
            <button
              className={`ttd-pill ${selectedCategory === "festivals" ? "active" : ""}`}
              onClick={() => setSelectedCategory("festivals")}
            >
              🎉 Festivals & Cultural Life
            </button>
            <button
              className={`ttd-pill ${selectedCategory === "culinary" ? "active" : ""}`}
              onClick={() => setSelectedCategory("culinary")}
            >
              🍲 Street Food & Bazaars
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════ MAIN GALLERY GRID ═══════════ */}
      <main className="ttd-main-content">
        <div className="ttd-results-count">
          Showing <strong>{filteredLandmarks.length}</strong> living Indian heritages & student destinations
          {selectedCategory !== "all" && ` in ${selectedCategory.toUpperCase()}`}
          {selectedRegion !== "all" && ` (${selectedRegion.toUpperCase()})`}
        </div>

        {filteredLandmarks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#ffffff", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
            <Compass size={48} style={{ color: "#94a3b8", margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "8px" }}>No landmarks matched your search</h3>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
              Try clearing your search query or selecting "All Categories".
            </p>
            <button
              className="ttd-btn-primary"
              style={{ display: "inline-flex", width: "auto", margin: "0 auto" }}
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedRegion("all");
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="ttd-cards-grid">
            {filteredLandmarks.map((landmark) => {
              const isSaved = bucketList.includes(landmark.id);
              return (
                <article key={landmark.id} className="ttd-card">
                  {/* Photo Container with Badges */}
                  <div className="ttd-card-imgwrap">
                    <img
                      src={landmark.image}
                      alt={landmark.title}
                      loading="lazy"
                    />
                    <div className="ttd-card-badge-top">
                      {landmark.isUnesco && (
                        <span className="ttd-unesco-pill">
                          <Award size={12} /> UNESCO Heritage
                        </span>
                      )}
                      <span className="ttd-category-pill-card">
                        {landmark.categoryName}
                      </span>
                    </div>

                    {/* Bookmark Heart Button */}
                    <button
                      className={`ttd-card-fav-btn ${isSaved ? "active" : ""}`}
                      onClick={(e) => toggleBucketList(landmark.id, e)}
                      title={isSaved ? "Remove from Bucket List" : "Add to Bucket List"}
                      aria-label="Bookmark destination"
                    >
                      <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="ttd-card-body">
                    <div className="ttd-card-meta-top">
                      <span className="ttd-card-loc">
                        <MapPin size={13} /> {landmark.location}, {landmark.state}
                      </span>
                      <span className="ttd-card-season">
                        <Calendar size={12} /> {landmark.bestSeason}
                      </span>
                    </div>

                    <h2 className="ttd-card-title">{landmark.title}</h2>
                    <div className="ttd-card-subtitle">{landmark.subtitle}</div>
                    <p className="ttd-card-desc">{landmark.description}</p>

                    {/* Highlights List */}
                    <ul className="ttd-card-highlights">
                      {landmark.highlights.slice(0, 2).map((h, i) => (
                        <li key={i} className="ttd-card-highlight-item">
                          <CheckCircle2 size={14} />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Stats Box */}
                    <div className="ttd-card-stats-box">
                      <div className="ttd-card-stat-col">
                        <span className="ttd-card-stat-label">Student Budget</span>
                        <span className="ttd-card-stat-value">{landmark.studentBudgetInr}</span>
                      </div>
                      <div className="ttd-card-stat-col">
                        <span className="ttd-card-stat-label">Ideal Trip</span>
                        <span className="ttd-card-stat-value">{landmark.idealDuration}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="ttd-card-actions">
                      <button
                        className="ttd-btn-primary"
                        onClick={() => setSelectedLandmark(landmark)}
                      >
                        <Info size={14} /> Student Travel Guide
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* ═══════════ STUDENT TRAVEL TIPS & ADVISORIES ═══════════ */}
      <section className="ttd-guide-section">
        <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#ea580c", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            ESSENTIAL STUDENT TRAVEL TIPS
          </span>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, marginTop: "6px", color: "#0f172a" }}>
            How to Travel Smart & Safely Across India
          </h2>
          <p style={{ color: "#64748b", fontSize: "15px", marginTop: "8px" }}>
            Essential travel regulations, student railway discounts, and safety helplines for international students enrolled in Indian universities.
          </p>
        </div>

        <div className="ttd-guide-card-grid">
          <div className="ttd-guide-card">
            <div className="ttd-guide-icon">
              <Train size={24} />
            </div>
            <h3>Railway & Flight Concessions</h3>
            <p>
              Foreign students are eligible for Indian Railways Foreign Tourist Quota (FTQ) and up to 50% seasonal student train travel concessions for educational tours. Major airlines also provide an extra 10kg baggage allowance with a valid university student ID.
            </p>
          </div>

          <div className="ttd-guide-card">
            <div className="ttd-guide-icon">
              <ShieldCheck size={24} />
            </div>
            <h3>Safety, Helpline & FRRO Rules</h3>
            <p>
              The Government of India operates a dedicated 24x7 Multi-lingual Tourist Helpline at <strong>1363</strong> and National Emergency Helpline at <strong>112</strong>. If traveling outside your university state for more than 2 weeks, remember to keep your hostel warden informed.
            </p>
          </div>

          <div className="ttd-guide-card">
            <div className="ttd-guide-icon">
              <DollarSign size={24} />
            </div>
            <h3>UPI & Cashless Payments</h3>
            <p>
              India is the world leader in digital micropayments. Once you open a student bank account with your Aadhaar / FRRO registration, you can use UPI (Google Pay, PhonePe, Paytm) to pay seamlessly at street stalls, monuments, and mountain cafes.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════ CALL TO ACTION ═══════════ */}
      <section style={{ maxWidth: "1280px", margin: "80px auto 0", padding: "0 20px" }}>
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", borderRadius: "24px", padding: "48px 36px", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "24px" }}>
          <div style={{ maxWidth: "620px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#fdba74", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              STUDY IN INDIA · BEGIN YOUR JOURNEY
            </span>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, marginTop: "8px", lineHeight: "1.2" }}>
              Ready to study near these iconic world heritages?
            </h2>
            <p style={{ color: "#cbd5e1", fontSize: "15px", marginTop: "10px", lineHeight: "1.6" }}>
              Browse accredited undergraduate, postgraduate, and doctoral degree programmes offered by India's premier government and private universities with merit scholarship opportunities.
            </p>
          </div>
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <Link
              to="/courses"
              className="ttd-btn-primary"
              style={{ background: "#f97316", padding: "14px 24px", fontSize: "15px" }}
            >
              <BookOpen size={16} /> Explore Courses
            </Link>
            <Link
              to="/scholarships"
              className="ttd-btn-primary"
              style={{ background: "rgba(255, 255, 255, 0.12)", border: "1px solid rgba(255, 255, 255, 0.25)", padding: "14px 24px", fontSize: "15px" }}
            >
              View Scholarships <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ DETAILED LANDMARK MODAL ═══════════ */}
      {selectedLandmark && (
        <div className="ttd-modal-backdrop" onClick={() => setSelectedLandmark(null)}>
          <div className="ttd-modal-window" onClick={(e) => e.stopPropagation()}>
            <button
              className="ttd-modal-close-btn"
              onClick={() => setSelectedLandmark(null)}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {/* Modal Image Header */}
            <div className="ttd-modal-img">
              <img src={selectedLandmark.image} alt={selectedLandmark.title} />
              <div className="ttd-modal-img-overlay">
                <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                  {selectedLandmark.isUnesco && (
                    <span className="ttd-unesco-pill">
                      <Award size={12} /> UNESCO World Heritage Site
                    </span>
                  )}
                  <span className="ttd-category-pill-card">{selectedLandmark.categoryName}</span>
                </div>
                <h2 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 4px" }}>
                  {selectedLandmark.title}
                </h2>
                <div style={{ fontSize: "13px", opacity: 0.9 }}>
                  <MapPin size={13} style={{ display: "inline", verticalAlign: "middle" }} /> {selectedLandmark.location}, {selectedLandmark.state} · Best time: {selectedLandmark.bestSeason}
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="ttd-modal-content">
              {/* Quick Specs Bar */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", background: "#f8fafc", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Student Budget</span>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>{selectedLandmark.studentBudgetInr}</div>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>approx. {selectedLandmark.studentBudgetUsd}</span>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Duration</span>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>{selectedLandmark.idealDuration}</div>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>weekend friendly</span>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Nearest Hub</span>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{selectedLandmark.nearestHubs}</div>
                </div>
              </div>

              {/* Narrative Description */}
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "8px", color: "#0f172a" }}>About the Destination</h3>
              <p style={{ fontSize: "14px", lineHeight: "1.7", color: "#334155", marginBottom: "20px" }}>
                {selectedLandmark.description}
              </p>

              {/* Student Experience Highlights */}
              <h4 style={{ fontSize: "13.5px", fontWeight: 700, marginBottom: "10px", color: "#0f172a" }}>Key Student Highlights</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px 0", display: "flex", flexDirection: "column", gap: "8px" }}>
                {selectedLandmark.highlights.map((h, i) => (
                  <li key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "13.5px", color: "#334155", lineHeight: "1.5" }}>
                    <CheckCircle2 size={16} style={{ color: "#10b981", flexShrink: 0, marginTop: "2px" }} />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>

              {/* Student Money-Saving Tip */}
              <div className="ttd-modal-notice-box">
                <div style={{ display: "flex", gap: "8px", alignItems: "center", fontWeight: 700, fontSize: "13px", color: "#854d0e", marginBottom: "4px" }}>
                  <Award size={16} /> Student Discount & Money-Saving Hack
                </div>
                <div style={{ fontSize: "13px", color: "#713f12", lineHeight: "1.5" }}>
                  {selectedLandmark.studentTip}
                </div>
              </div>

              {/* Cultural Etiquette */}
              <div className="ttd-modal-etiquette-box">
                <div style={{ display: "flex", gap: "8px", alignItems: "center", fontWeight: 700, fontSize: "13px", color: "#166534", marginBottom: "4px" }}>
                  <ShieldCheck size={16} /> Cultural Etiquette & Local Guidelines
                </div>
                <div style={{ fontSize: "13px", color: "#14532d", lineHeight: "1.5" }}>
                  {selectedLandmark.etiquette}
                </div>
              </div>

              {/* How to Reach */}
              <div className="ttd-modal-transit-box">
                <div style={{ display: "flex", gap: "8px", alignItems: "center", fontWeight: 700, fontSize: "13px", color: "#075985", marginBottom: "4px" }}>
                  <Train size={16} /> How to Reach from University Hubs
                </div>
                <div style={{ fontSize: "13px", color: "#0c4a6e", lineHeight: "1.5" }}>
                  {selectedLandmark.howToReach}
                </div>
              </div>

              {/* Local Food to Try */}
              <div style={{ marginTop: "20px", padding: "14px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "10px" }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", fontWeight: 700, fontSize: "13px", color: "#9a3412", marginBottom: "4px" }}>
                  <Coffee size={16} /> Iconic Regional Food to Try Nearby
                </div>
                <div style={{ fontSize: "13px", color: "#7c2d12", lineHeight: "1.5" }}>
                  {selectedLandmark.mustTryFood}
                </div>
              </div>

              {/* Footer Buttons */}
              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button
                  className="ttd-btn-primary"
                  onClick={() => toggleBucketList(selectedLandmark.id)}
                  style={{
                    background: bucketList.includes(selectedLandmark.id) ? "#e11d48" : "#f97316"
                  }}
                >
                  <Heart size={15} fill={bucketList.includes(selectedLandmark.id) ? "currentColor" : "none"} />
                  {bucketList.includes(selectedLandmark.id) ? "Saved in Bucket List" : "Add to My Bucket List"}
                </button>
                <Link
                  to={`/courses?q=${encodeURIComponent(selectedLandmark.location)}`}
                  className="ttd-btn-primary"
                  style={{ background: "#0f172a" }}
                  onClick={() => setSelectedLandmark(null)}
                >
                  <BookOpen size={15} /> Find Courses in {selectedLandmark.state}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ BUCKET LIST DRAWER / MODAL ═══════════ */}
      {showBucketModal && (
        <div className="ttd-modal-backdrop" onClick={() => setShowBucketModal(false)}>
          <div className="ttd-modal-window" style={{ maxWidth: "600px" }} onClick={(e) => e.stopPropagation()}>
            <button
              className="ttd-modal-close-btn"
              onClick={() => setShowBucketModal(false)}
              aria-label="Close bucket list"
            >
              <X size={20} />
            </button>

            <div style={{ padding: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <Bookmark size={24} style={{ color: "#f97316" }} />
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>
                  My India Student Bucket List
                </h2>
              </div>
              <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
                You have selected <strong>{savedLandmarkObjects.length}</strong> dream destinations to visit during your studies in India.
              </p>

              {savedLandmarkObjects.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 10px", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
                  <Heart size={36} style={{ color: "#cbd5e1", margin: "0 auto 10px" }} />
                  <p style={{ fontSize: "14px", color: "#64748b" }}>Your bucket list is currently empty.</p>
                  <p style={{ fontSize: "12px", color: "#94a3b8" }}>Click the heart icon on any landmark to save it here!</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "380px", overflowY: "auto", paddingRight: "4px" }}>
                  {savedLandmarkObjects.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "10px",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc"
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{ width: "64px", height: "64px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: "12px", color: "#ea580c" }}>
                          <MapPin size={11} style={{ display: "inline" }} /> {item.location}, {item.state}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                          Budget: <strong>{item.studentBudgetInr}</strong> · {item.idealDuration}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleBucketList(item.id)}
                        style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "6px" }}
                        title="Remove"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {savedLandmarkObjects.length > 0 && (
                <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                  <button
                    className="ttd-btn-primary"
                    style={{ background: "#0f172a" }}
                    onClick={() => {
                      const text = savedLandmarkObjects.map((l) => `• ${l.title} (${l.location}, ${l.state}) - Budget: ${l.studentBudgetInr}`).join("\n");
                      navigator.clipboard?.writeText?.(text);
                      alert("Bucket list copied to clipboard!");
                    }}
                  >
                    <Share2 size={14} /> Copy Itinerary
                  </button>
                  <button
                    className="ttd-btn-primary"
                    style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1" }}
                    onClick={() => setBucketList([])}
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
