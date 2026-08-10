import React, { useEffect, useState } from"react";
import { Link } from"react-router-dom";
import url from"../../../url";

/* ===================== TYPES ===================== */
interface AboutUsData {
  _id: string;
  companyName: string;
  tagline: string;
  overview: string;
  mission: string;
  vision: string;
  values: string[];
  foundedYear: number;
  headquarters: string;
  email: string;
  phone: string;
  website: string;
  statistics: {
    studentsServed: number;
    coursesOffered: number;
    yearsExperience: number;
    successRate: number;
  };
  socialMedia: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
    youtube: string;
  };
}

/* ===================== COMPONENT ===================== */
export default function AboutHomeOne() {
  const [aboutData, setAboutData] = useState<AboutUsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${url}/admin/aboutus/active`);
      const json = await res.json();
      if (json?.success && json?.data) {
        setAboutData(json.data);
      } else {
        throw new Error("No data");
      }
    } catch (err) {
      setError("Failed to load About Us");
      setAboutData({
        _id:"fallback",
        companyName:"Draa LLP",
        tagline:"Empowering Education, Transforming Lives",
        overview:
"Draa is a modern education platform built to help students prepare smarter, learn better, and succeed faster through structured digital learning.",
        mission:
"To provide accessible, high-quality education and guidance to learners across India using technology and expert mentorship.",
        vision:
"To become Indias most trusted digital learning ecosystem for students, educators, and institutions.",
        values: [
"Student First",
"Quality Education",
"Integrity",
"Innovation",
"Results Driven",
        ],
        foundedYear: 2018,
        headquarters:"India",
        email:"contact@draa.com",
        phone:"08076003728",
        website:"https://draa.com",
        statistics: {
          studentsServed: 10000,
          coursesOffered: 50,
          yearsExperience: 7,
          successRate: 95,
        },
        socialMedia: {
          facebook:"",
          twitter:"",
          linkedin:"",
          instagram:"",
          youtube:"",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="about-section">
        <div className="container text-center">Loading...</div>
      </section>
    );
  }

  if (!aboutData) {
    return (
      <section className="about-section">
        <div className="container text-center">{error}</div>
      </section>
    );
  }

  return (
    <>
      {/* ===================== STYLES ===================== */}
      <style jsx>{`
        .about-section {
          padding: 100px 0;
        }

        .about-header {
          max-width: 720px;
          margin-bottom: 70px;
        }

        .about-header span {
          color: #9b6118;
          font-weight: 600;
          font-size: 13px;
          letter-spacing: 1px;
        }

        .about-header h2 {
          font-size: 38px;
          margin: 12px 0;
        }

        .about-header p {
          color: #555;
          font-size: 15px;
          line-height: 1.7;
        }

        .about-image img {
          width: 100%;
          border-radius: 18px;
        }

        .overview {
          font-size: 15px;
          color: #444;
          line-height: 1.8;
          margin-bottom: 30px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 40px;
        }

        .stat {
          background: #f0fbfc;
          padding: 20px;
          border-radius: 14px;
          text-align: center;
        }

        .stat strong {
          font-size: 26px;
          color: #9b6118;
          display: block;
        }

        .stat span {
          font-size: 13px;
          color: #555;
        }

        .mv-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 40px;
        }

        .mv-card {
          border: 1px solid #d9f3f6;
          border-radius: 16px;
          padding: 26px;
        }

        .mv-card h4 {
          color: #9b6118;
          margin-bottom: 10px;
        }

        .mv-card p {
          font-size: 14px;
          color: #555;
          line-height: 1.7;
        }

        .values h5 {
          color: #9b6118;
          margin-bottom: 12px;
        }

        .value-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 40px;
        }

        .value-tags span {
          background: #e6f7f9;
          color: #9b6118;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 40px;
        }

        .info-grid div {
          background: #f8fefe;
          padding: 16px;
          border-radius: 12px;
          font-size: 14px;
        }

        .info-grid strong {
          display: block;
          color: #9b6118;
          margin-bottom: 4px;
        }

        .about-cta {
          display: inline-block;
          padding: 14px 36px;
          background: #9b6118;
          color: #fff;
          border-radius: 30px;
          text-decoration: none;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }

          .mv-grid {
            grid-template-columns: 1fr;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* ===================== CONTENT ===================== */}
      <section className="about-section">
        <div className="container">
          <div className="about-header">
            <span>ABOUT US</span>
            <h2>
  {aboutData.tagline
    .replace(/STEM EDUACTAIONAL RESOURCES/i,"STEM Educational Resources")
  }
</h2>
            <p>{aboutData.overview}</p>
          </div>

          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="about-image">
                <img src="assets/img/about.png" alt="About Draa" />
              </div>
            </div>

            <div className="col-lg-6">
              <div className="stats-grid">
                <div className="stat">
                  <strong>{aboutData.statistics.studentsServed}+</strong>
                  <span>Students</span>
                </div>
                <div className="stat">
                  <strong>{aboutData.statistics.coursesOffered}+</strong>
                  <span>Courses</span>
                </div>
                <div className="stat">
                  <strong>{aboutData.statistics.yearsExperience}</strong>
                  <span>Years</span>
                </div>
                <div className="stat">
                  <strong>{aboutData.statistics.successRate}%</strong>
                  <span>Success Rate</span>
                </div>
              </div>

              <div className="mv-grid">
                <div className="mv-card">
                  <h4>Our Mission</h4>
                  <p>{"To make quality education accessible and affordable for every learner by providing world-class content, mentorship, and tools that drive real success. (Sabko padhao)."}</p>
                </div>
                <div className="mv-card">
                  <h4>Our Vision</h4>
                  <p>{aboutData.vision.replace(/[()]/g,"")}</p>
                </div>
              </div>

              <div className="values">
                <h5>Our Core Values</h5>
                <div className="value-tags">
                  {aboutData.values.map((v, i) => (
                    <span key={i}>{v}</span>
                  ))}
                </div>
              </div>

              <div className="info-grid">
                <div>
                  <strong>Founded</strong>
                  {aboutData.foundedYear}
                </div>
                <div>
                  <strong>Location</strong>
                  {aboutData.headquarters}
                </div>
                <div>
                  <strong>Email</strong>
                  {aboutData.email}
                </div>
                <div>
                  <strong>Phone</strong>
                  {"080760 03728"}
                </div>
              </div>

              <Link to="/about" className="about-cta">
                Learn More About {"Myedudocs LLP"}
              </Link>
            </div>
          </div>
        </div>
      </section>
      <style>
        {
          `
          .about-header h2 {
  font-size: 38px;
}

          
          `
        }
      </style>
    </>
  );
}
