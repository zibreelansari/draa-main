import { useEffect, useState } from"react";
import axios from"axios";
import { MessageCircle, Sparkles, Zap, Shield, Target } from"lucide-react";
import { motion } from"framer-motion";
import url from"../../../url";

import"./HeroHomeOne.css";

export default function HeroHomeOne() {
  const [banners, setBanners] = useState<any[]>([]);
  const [users, setUsers] = useState(0);

  useEffect(() => {
    axios.get(`${url}/admin/banner/all?deviceType=web`).then(res => {
      setBanners(res.data.data.filter((b: any) => b.isActive));
    });

    axios.get(`${url}/count/getAllStudents`).then(res => {
      setUsers(res.data.userCount);
    });
  }, []);

  const featureCards = [
    {
      title:"Online Courses",
      desc:"Live and recorded classes by top educators.",
      color:"#bd7b20",
      image:"/1.png"
    },
    {
      title:"Proven Results",
      desc:"Join the league of successful top rankers.",
      color:"#66735b",
      image:"/2.png"
    },
    {
      title:"Complete Prep",
      desc:"Syllabus classes, test series & materials.",
      color:"#ec4899",
      image:"/3.png"
    },
    {
      title:"Expert Books",
      desc:"Simplified study material for faster learning.",
      color:"#10b981",
      image:"/4.png"
    },
    {
      title:"Job Updates",
      desc:"Stay notified about every career opportunity.",
      color:"#f59e0b",
      image:"/5.png"
    },
  ];

  return (
    <section className="hero-section">
      {/* Background Decorative Elements */}
      <div className="hero-grid-bg" />

      <div className="container hero-main">
        {/* Top Intelligence Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="top-badge-new"
        >
          <Sparkles size={14} className="badge-sparkle" />
          <span>REVOLUTIONIZING SUCCESS WITH INTELLIGENCE</span>
        </motion.div>

        {/* Hero Text Content */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hero-title-new"
        >
          Predicting Success.<br />
          <span>One Exam at a Time.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="hero-subtitle-new"
        >
          Indias most advanced learning platform for competitive exams.
          Expert-led classes, physical books, and personalized test series.
        </motion.p>

        {/* Call to Action Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="action-row-new"
        >
          <div className="hero-btns-new">
            <a href="/courses" className="btn-fill-new">
              Start Learning Now
              <Zap size={18} fill="currentColor" />
            </a>
            <a href="/contact" className="btn-outline-new">Contact Advisory</a>
          </div>

          <div className="talk-widget-new">
            <div className="talk-label-new">Expert Council</div>
            <a
              href="https://wa.me/918076003728?text=Hi%20I%20want%20to%20know%20about%20your%20courses"
              target="_blank"
              rel="noopener noreferrer"
              className="talk-icon-new"
            >
              <MessageCircle size={24} color="white" fill="white" />
            </a>
          </div>
        </motion.div>
      </div>

      {/* Modern Feature Horizontal Grid */}
      <div className="container-fluid features-container-new">
        <div className="features-grid-new">
          {featureCards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + (idx * 0.1) }}
              whileHover={{ y: -10 }}
              className="feature-card-new"
              style={{"--card-color": card.color } as any}
            >
              <div className="card-content-new">
                <h3 className="card-title-new">{card.title}</h3>
                <p className="card-desc-new">{card.desc}</p>
              </div>
              <div className="card-visual-new">
                <img src={card.image} alt={card.title} className="card-img-new" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}