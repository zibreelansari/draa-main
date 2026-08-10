import React, { useState, useEffect } from"react";
import { Link } from"react-router-dom";
import { Star, ChevronRight, Award, TrendingUp } from"lucide-react";
import { motion, AnimatePresence } from'framer-motion';
import axios from"axios";
import { Swiper, SwiperSlide } from'swiper/react';
import { Autoplay, Pagination, Navigation } from'swiper/modules';
import'swiper/css';
import'swiper/css/pagination';
import'swiper/css/navigation';
import url from"../../../url";
import"./ToppersSection.css";

interface Topper {
  _id?: string;
  name: string;
  rank?: string;
  examName: string;
  year?: string;
  imageUrl?: string;
  quote?: string;
  score?: string;
  category?: string;
}

const defaultToppers: Topper[] = [
  {
    name:"Rahul Kumar",
    rank:"AIR 1",
    examName:"SSC CGL",
    year:"2025",
    score:"687/700",
    imageUrl:"/topper1.jpg",
    quote:"Draa test series was my secret weapon. The pattern was exactly like the real exam.",
    category:"SSC",
  },
  {
    name:"Priya Singh",
    rank:"AIR 3",
    examName:"IBPS PO",
    year:"2025",
    score:"578/600",
    imageUrl:"/topper2.jpg",
    quote:"The detailed solutions and video explanations helped me crack it in my first attempt!",
    category:"Banking",
  },
  {
    name:"Amit Sharma",
    rank:"AIR 7",
    examName:"Railway NTPC",
    year:"2025",
    score:"245/300",
    imageUrl:"/topper3.jpg",
    quote:"Comprehensive books and consistent practice through mock tests made all the difference.",
    category:"Railway",
  },
  {
    name:"Sneha Patel",
    rank:"AIR 12",
    examName:"SBI Clerk",
    year:"2025",
    score:"412/500",
    imageUrl:"/topper4.jpg",
    quote:"Draa gave me the perfect blend of theory and practice. Highly recommended!",
    category:"Banking",
  },
];

const ToppersSection = () => {
  const [toppers, setToppers] = useState<Topper[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    axios.get(`${url}/toppers/all`)
      .then(res => {
        if (res.data?.data?.length > 0) {
          setToppers(res.data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getInitials = (name: string) => {
    return name.split('').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRankColor = (rank: string) => {
    if (rank.includes("AIR 1")) return"#f59e0b";
    if (rank.includes("AIR 2")) return"#94a3b8";
    if (rank.includes("AIR 3")) return"#cd7f32";
    return"#bd7b20";
  };

  return (
    <section className="toppers-section">
      <div className="container">
        {/* Header */}
        <div className="toppers-header">
          <div className="toppers-eyebrow">
            <Award size={16} color="#bd7b20" />
            <span>Our Achievers</span>
          </div>
          <h2 className="toppers-title">Meet Our <span>Top Rankers</span></h2>
          <p className="toppers-subtitle">
            Real students, real results. Join thousands who cracked their dream exams with Draa.
          </p>
        </div>

        {/* Topper Cards Slider */}
        {!loading && (
          <div className="toppers-slider-wrapper">
            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
              spaceBetween={24}
              slidesPerView={1}
              navigation={true}
              autoplay={{
                delay: 4500,
                disableOnInteraction: false,
              }}
              pagination={{ clickable: true }}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                },
                1024: {
                  slidesPerView: 3,
                },
                1280: {
                  slidesPerView: 4,
                },
              }}
              className="toppers-swiper"
            >
              {(toppers.length > 0 ? toppers : defaultToppers).map((topper, idx) => (
                <SwiperSlide key={topper._id || idx}>
                  <div
                    className={`topper-card ${idx === activeIndex ?'featured' :''}`}
                    onMouseEnter={() => setActiveIndex(idx)}
                  >
                    {/* Rank Badge */}
                    <div
                      className="rank-badge"
                      style={{ backgroundColor: getRankColor(topper.rank ||'') }}
                    >
                      <Star size={12} fill="white" />
                      <span>{topper.rank}</span>
                    </div>

                    {/* Topper Image */}
                    <div className="topper-img-wrapper">
                      {topper.imageUrl && topper.imageUrl !=='/topper1.jpg' ? (
                        <img
                          src={topper.imageUrl.startsWith('http')
                            ? topper.imageUrl
                            : `${url}${topper.imageUrl}`}
                          alt={topper.name}
                          className="topper-img"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display ='none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.add('show');
                          }}
                        />
                      ) : null}
                      <div className="topper-initials">
                        {getInitials(topper.name)}
                      </div>
                    </div>

                    {/* Exam Badge */}
                    <div className="exam-tag-row">
                      <span className="exam-tag">{topper.examName}</span>
                      {topper.year && <span className="year-tag">{topper.year}</span>}
                    </div>

                    {/* Name & Score */}
                    <div className="topper-info">
                      <h3 className="topper-name">{topper.name}</h3>
                      {topper.score && (
                        <div className="score-row">
                          <TrendingUp size={13} />
                          <span>Score: {topper.score}</span>
                        </div>
                      )}
                    </div>

                    {/* Quote */}
                    {topper.quote && (
                      <div className="topper-quote">
                        <p>"{topper.quote}"</p>
                      </div>
                    )}

                    {/* CTA */}
                    <Link to="/success-stories" className="topper-cta">
                      Read Full Story <ChevronRight size={14} />
                    </Link>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="toppers-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="topper-card skeleton-topper">
                <div className="skeleton rank-badge-skel" />
                <div className="skeleton img-skel" />
                <div className="skeleton title-skel" />
                <div className="skeleton subtitle-skel" />
                <div className="skeleton text-skel" />
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="toppers-footer">
          <Link to="/success-stories" className="toppers-view-all">
            View All Success Stories <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ToppersSection;
