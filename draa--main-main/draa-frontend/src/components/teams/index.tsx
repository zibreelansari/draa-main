import React from "react";
import HeaderOne from "../../layouts/headers/HeaderOne";
import MainFooter from "../../layouts/footers/MainFooter";
import Breadcrumb from "../common/Breadcrumb";
import ScrollToTop from "../common/ScrollToTop";
import { Mail, Phone, Linkedin, ExternalLink, Sparkles, Award, Shield, Users } from "lucide-react";
import usePageTitle from '../../hooks/usePageTitle';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  email: string;
  phone: string;
  linkedin: string;
  photo: string;
  color: string;
  gradient: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "team1",
    name: "Team 1",
    role: "Founder & Managing Director",
    bio: "Leading the vision of Draa to democratize quality education across India. Dedicated to helping competitive exam aspirants achieve their dreams.",
    email: "team1@draa.com",
    phone: "+91 90001 00001",
    linkedin: "https://linkedin.com/company/draa",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
    color: "#ff6b6b",
    gradient: "linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)",
  },
  {
    id: "team2",
    name: "Team 2",
    role: "Head of Academics",
    bio: "Ensuring high pedagogical standards, managing core subject curriculums, and delivering comprehensive study content for all competitive exams.",
    email: "team2@draa.com",
    phone: "+91 90002 00002",
    linkedin: "https://linkedin.com/company/draa",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
    color: "#bd7b20",
    gradient: "linear-gradient(135deg, #bd7b20 0%, #00d2fe 100%)",
  },
  {
    id: "team3",
    name: "Team 3",
    role: "Chief Operations Officer",
    bio: "Managing student support, operations, and study material delivery. Passionate about creating seamless and highly interactive user experiences.",
    email: "team3@draa.com",
    phone: "+91 90003 00003",
    linkedin: "https://linkedin.com/company/draa",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80",
    color: "#e056fd",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    id: "team4",
    name: "Team 4",
    role: "Head of Technology & LMS",
    bio: "Architect of the Draa web and mobile learning platforms. Focused on delivering premium, high-speed, and secure educational systems.",
    email: "team4@draa.com",
    phone: "+91 90004 00004",
    linkedin: "https://linkedin.com/company/draa",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80",
    color: "#2ecc71",
    gradient: "linear-gradient(135deg, #2ecc71 0%, #1abc9c 100%)",
  },
  {
    id: "team5",
    name: "Team 5",
    role: "Student Relations Lead",
    bio: "The friendly voice assisting aspirants with their queries, subscription setup, and technical support. Committed to keeping students satisfied.",
    email: "team5@draa.com",
    phone: "+91 90005 00005",
    linkedin: "https://linkedin.com/company/draa",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=80",
    color: "#f39c12",
    gradient: "linear-gradient(135deg, #f1c40f 0%, #f39c12 100%)",
  },
  {
    id: "team6",
    name: "Team 6",
    role: "Content Quality Head",
    bio: "Overseeing textbook, test series, and question bank validations. Ensuring error-free, syllabus-aligned resources for every test taker.",
    email: "team6@draa.com",
    phone: "+91 90006 00006",
    linkedin: "https://linkedin.com/company/draa",
    photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80",
    color: "#e67e22",
    gradient: "linear-gradient(135deg, #e67e22 0%, #d35400 100%)",
  },
  {
    id: "team7",
    name: "Team 7",
    role: "Academic Support Specialist",
    bio: "Coordinating teacher engagements, live doubt-clearing sessions, and scheduling mock test feedback loops for active subscribers.",
    email: "team7@draa.com",
    phone: "+91 90007 00007",
    linkedin: "https://linkedin.com/company/draa",
    photo: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=500&auto=format&fit=crop&q=80",
    color: "#1abc9c",
    gradient: "linear-gradient(135deg, #1abc9c 0%, #16a085 100%)",
  },
  {
    id: "team8",
    name: "Team 8",
    role: "General Administrator",
    bio: "Handling day-to-day administrative tasks, partner queries, and institutional collaborations to expand the Draa outreach.",
    email: "team8@draa.com",
    phone: "+91 90008 00008",
    linkedin: "https://linkedin.com/company/draa",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80",
    color: "#9b59b6",
    gradient: "linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)",
  },
];

const Teams: React.FC = () => {
  usePageTitle('Our Team | Draa');
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <HeaderOne />
      <Breadcrumb
        title="Meet Our Team"
        subtitle="The dedicated leaders and visionaries working to power your educational journey."
        category="Team"
        paths={[{ pathName: "Team", url: "/teams" }]}
      />

      <section className="teams-page-section">
        <div className="container">
          
          {/* Header Stats / Vision */}
          <div className="teams-intro-card">
            <div className="teams-intro-grid">
              <div className="teams-intro-text">
                <div className="teams-eyebrow">
                  <Sparkles size={16} className="spark-icon" />
                  <span>Our Mission</span>
                </div>
                <h2>Working Together For Student Success</h2>
                <p>
                  At Draa, our diverse team combines academic excellence, innovative pedagogy, 
                  and cutting-edge engineering to build India's premier online preparation portal. 
                  Meet the leaders making this possible every day.
                </p>
              </div>
              <div className="teams-badges-panel">
                <div className="teams-badge-item">
                  <div className="teams-badge-icon" style={{ background: "rgba(91, 108, 255, 0.1)", color: "#bd7b20" }}>
                    <Users size={20} />
                  </div>
                  <div>
                    <h5>Collaborative</h5>
                    <p>Student-First Ethos</p>
                  </div>
                </div>
                <div className="teams-badge-item">
                  <div className="teams-badge-icon" style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
                    <Award size={20} />
                  </div>
                  <div>
                    <h5>Excellence</h5>
                    <p>Highest Content Standards</p>
                  </div>
                </div>
                <div className="teams-badge-item">
                  <div className="teams-badge-icon" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
                    <Shield size={20} />
                  </div>
                  <div>
                    <h5>Trust</h5>
                    <p>Secure & Transparent</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Members Grid */}
          <div className="team-members-grid">
            {TEAM_MEMBERS.map((member, i) => (
              <div 
                key={member.id} 
                className="team-member-card"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Visual Accent Bar */}
                <div className="member-card-accent" style={{ background: member.gradient }} />
                
                <div className="member-photo-wrap">
                  <img 
                    src={member.photo} 
                    alt={member.name}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                  <div 
                    className="member-photo-fallback"
                    style={{ background: member.gradient }}
                  >
                    {getInitials(member.name)}
                  </div>
                </div>

                <div className="member-card-body">
                  <h3 className="member-name">{member.name}</h3>
                  <span className="member-role" style={{ color: member.color }}>{member.role}</span>
                  <p className="member-bio">{member.bio}</p>

                  <div className="member-contact-info">
                    <a href={`mailto:${member.email}`} className="contact-link" title="Email Address">
                      <Mail size={15} />
                      <span>{member.email}</span>
                    </a>
                    <a href={`tel:${member.phone}`} className="contact-link" title="Contact Number">
                      <Phone size={15} />
                      <span>{member.phone}</span>
                    </a>
                  </div>
                </div>

                <div className="member-card-footer">
                  <a 
                    href={member.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="linkedin-profile-btn"
                    style={{ border: `1.5px solid ${member.color}22`, color: member.color }}
                  >
                    <Linkedin size={15} fill="currentColor" />
                    <span>View LinkedIn Profile</span>
                    <ExternalLink size={12} className="link-ext-arrow" />
                  </a>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      <MainFooter />
      <ScrollToTop />

      <style>{`
        .teams-page-section {
          padding: 60px 0 100px;
          background: #f8fafc;
        }

        .teams-intro-card {
          background: white;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          padding: 40px;
          margin-bottom: 50px;
          box-shadow: 0 4px 20px rgba(148, 163, 184, 0.05);
        }

        .teams-intro-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 40px;
          align-items: center;
        }

        @media (max-width: 992px) {
          .teams-intro-grid {
            grid-template-columns: 1fr;
          }
        }

        .teams-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(91, 108, 255, 0.08);
          color: #bd7b20;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .teams-intro-text h2 {
          font-size: 32px;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 16px;
          line-height: 1.25;
        }

        .teams-intro-text p {
          font-size: 15px;
          color: #64748b;
          line-height: 1.6;
          margin: 0;
        }

        .teams-badges-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .teams-badge-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border-radius: 16px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
        }

        .teams-badge-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .teams-badge-item h5 {
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 2px;
        }

        .teams-badge-item p {
          font-size: 12px;
          color: #64748b;
          margin: 0;
        }

        /* Card grid styling */
        .team-members-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 30px;
        }

        .team-member-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 25px rgba(148, 163, 184, 0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: teamCardFadeIn 0.6s ease forwards;
          opacity: 0;
          transform: translateY(20px);
        }

        @keyframes teamCardFadeIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .team-member-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(148, 163, 184, 0.12);
        }

        .member-card-accent {
          height: 6px;
          width: 100%;
          position: absolute;
          top: 0;
          left: 0;
        }

        .member-photo-wrap {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          overflow: hidden;
          margin: 35px auto 20px;
          border: 4px solid #fff;
          box-shadow: 0 8px 20px rgba(148, 163, 184, 0.15);
          position: relative;
          flex-shrink: 0;
        }

        .member-photo-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .team-member-card:hover .member-photo-wrap img {
          transform: scale(1.1);
        }

        .member-photo-fallback {
          width: 100%;
          height: 100%;
          display: none;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 28px;
          font-weight: 700;
          text-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        .member-card-body {
          padding: 0 30px 25px;
          text-align: center;
          flex-grow: 1;
        }

        .member-name {
          font-size: 20px;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 6px;
        }

        .member-role {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          display: block;
          margin-bottom: 16px;
        }

        .member-bio {
          font-size: 14px;
          color: #64748b;
          line-height: 1.5;
          margin: 0 auto 20px;
          max-width: 280px;
        }

        .member-contact-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: #f8fafc;
          padding: 12px 16px;
          border-radius: 12px;
          align-items: flex-start;
          text-align: left;
          max-width: 280px;
          margin: 0 auto;
        }

        .contact-link {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          color: #475569;
          text-decoration: none;
          transition: color 0.2s;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
        }

        .contact-link:hover {
          color: #bd7b20;
        }

        .contact-link svg {
          color: #94a3b8;
          flex-shrink: 0;
        }

        .member-card-footer {
          padding: 20px 30px 30px;
          border-top: 1px solid #f1f5f9;
          text-align: center;
        }

        .linkedin-profile-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 10px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          background: transparent;
          transition: all 0.25s ease;
        }

        .linkedin-profile-btn:hover {
          background: #0077b5;
          border-color: #0077b5 !important;
          color: white !important;
          box-shadow: 0 4px 12px rgba(0, 119, 181, 0.2);
        }

        .link-ext-arrow {
          transition: transform 0.2s ease;
        }

        .linkedin-profile-btn:hover .link-ext-arrow {
          transform: translate(2px, -2px);
        }
      `}</style>
    </>
  );
};

export default Teams;
