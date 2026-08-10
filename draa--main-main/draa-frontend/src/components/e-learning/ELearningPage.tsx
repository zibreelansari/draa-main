import React, { useState } from'react';
import toast from '../../utils/toast';
import HeaderOne from'../../layouts/headers/HeaderOne';
import Breadcrumb from'../common/Breadcrumb';
import MainFooter from'../../layouts/footers/MainFooter';
import ScrollToTop from'../common/ScrollToTop';
import ScrollTop from'../common/ScrollTop';
import { 
  CheckCircle2, 
  ArrowRight, 
  MessageSquare, 
  Phone, 
  Mail, 
  Send, 
  Loader2, 
  ChevronRight, 
  Globe, 
  BookOpen, 
  Layers, 
  Smartphone, 
  FileText, 
  Video, 
  TrendingUp, 
  Settings, 
  HelpCircle,
  ShieldCheck,
  Zap,
  Users
} from'lucide-react';
import ServiceLeadModal from'./ServiceLeadModal';
import'./ELearningPage.css';
import SEO from'../common/SEO';
import axios from'axios';
import url from'../../url';
import { Link, useLocation } from'react-router-dom';

interface ContentSection {
  title: string;
  description: React.ReactNode;
  image: string;
  imagePosition?:'left' |'right';
}

interface ELearningPageProps {
  title: string;
  subtitle: string;
  category?: string;
  description: React.ReactNode;
  features: string[];
  image?: string;
  overviewImage?: string;
  contentSections?: ContentSection[];
  galleryImages?: string[];
}

const getServiceIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("website") || n.includes("web")) return <Globe size={22} />;
  if (n.includes("academic") || n.includes("curriculum")) return <BookOpen size={22} />;
  if (n.includes("white label") || n.includes("label")) return <Layers size={22} />;
  if (n.includes("mobile") || n.includes("app")) return <Smartphone size={22} />;
  if (n.includes("exam") || n.includes("question")) return <FileText size={22} />;
  if (n.includes("digital content") || n.includes("video") || n.includes("creation")) return <Video size={22} />;
  if (n.includes("marketing") || n.includes("seo")) return <TrendingUp size={22} />;
  if (n.includes("managed") || n.includes("service")) return <Settings size={22} />;
  return <HelpCircle size={22} />;
};

const ELearningPage: React.FC<ELearningPageProps> = ({
  title,
  subtitle,
  category ="E-Learning",
  description,
  features,
  image,
  overviewImage,
  contentSections,
  galleryImages
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  // Sidebar Inquiry Form State
  const [formData, setFormData] = useState({
    name:'',
    email:'',
    phone:'',
    message: `I want to inquire about ${title} service.`
  });
  const [loading, setLoading] = useState(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${url}/admin/contactus/contact/submit`, {
        ...formData,
        subject: `Inquiry for ${title} (Page Lead)`,
        targetEmail:'admin@draa.in'
      });

      if (response.data.success) {
        toast.success('Thank you! Your request has been sent.');
        setFormData({
          name:'',
          email:'',
          phone:'',
          message: `I want to inquire about ${title} service.`
        });
      }
    } catch (error: any) {
      console.error('Lead submission error:', error);
      toast.error(error.response?.data?.message ||'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const eLearningServices = [
    { name:"Website Development", path:"/e-learning/website-development" },
    { name:"Academic Content", path:"/e-learning/academic-content" },
    { name:"White Label Content", path:"/e-learning/white-label-content" },
    { name:"Mobile App Development", path:"/e-learning/mobile-app-development" },
    { name:"Exam Management", path:"/e-learning/exam-management" },
    { name:"Digital Content Creation", path:"/e-learning/digital-content-creation" },
    { name:"Digital Marketing", path:"/e-learning/digital-marketing" },
    { name:"Managed Services", path:"/e-learning/managed-services" },
  ];

  return (
    <>
      <SEO 
        title={title} 
        description={subtitle || `Explore our expert ${title} e-learning services designed to empower educational institutes, academies, and tutors.`} 
      />
      <HeaderOne />
      <Breadcrumb 
        theme="e-learning"
        title={title} 
        subtitle={subtitle} 
        category={category}
        image={image}
        showSearch={false}
      />
      
      <div className="elearning-redesign-wrapper">
        
        {/* Section 1: Overview Block (Text Left, Image Right) */}
        <section className="el-section el-overview-section">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <div className="el-section-content text-left-content">
                  <span className="el-tag-badge">Service Overview</span>
                  <h2 className="el-section-title">
                    Transforming Learning through <span className="el-text-gradient">{title}</span>
                  </h2>
                  <div className="el-description-text">{description}</div>
                  <div className="el-action-btns">
                    <button className="el-btn el-btn-primary" onClick={() => setIsModalOpen(true)}>
                      Inquire Now <ArrowRight size={18} />
                    </button>
                    <button className="el-btn el-btn-secondary" onClick={() => window.open('https://wa.me/918076003728','_blank')}>
                      Chat with Experts
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                {overviewImage && (
                  <div className="el-image-wrapper image-right-wrapper">
                    <img src={overviewImage} alt={`${title} Overview`} className="el-main-img" />
                    <div className="el-image-accent-glow" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Services Navigation Section (Horizontal Track Grid) */}
        <section className="el-section el-services-nav-section">
          <div className="container">
            <div className="el-center-header">
              <span className="el-tag-badge">Our E-Learning Suite</span>
              <h2 className="el-section-title">Explore Other Solutions</h2>
              <p className="el-section-subtitle">We offer a complete range of digitized education capabilities, built to scale.</p>
            </div>
            <div className="el-services-grid">
              {eLearningServices.map((service, index) => {
                const isActive = location.pathname === service.path;
                return (
                  <Link 
                    to={service.path} 
                    key={index} 
                    className={`el-service-card ${isActive ?'el-service-card-active' :''}`}
                  >
                    <div className="el-card-icon-box">
                      {getServiceIcon(service.name)}
                    </div>
                    <div className="el-card-body">
                      <h4>{service.name}</h4>
                      <p>Premium e-learning module optimized for institutes.</p>
                    </div>
                    <div className="el-card-arrow">
                      <ChevronRight size={18} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 3: Key Features Section (Illustration Left, Grid Right) */}
        <section className="el-section el-features-section">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-5 order-lg-1 order-2">
                <div className="el-image-wrapper image-left-wrapper">
                  <img 
                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Key Features Illustration" 
                    className="el-main-img" 
                  />
                  <div className="el-badge-float">
                    <ShieldCheck size={20} className="el-badge-icon" />
                    <span>Verified Quality</span>
                  </div>
                </div>
              </div>
              <div className="col-lg-7 order-lg-2 order-1">
                <div className="el-section-content text-right-content">
                  <span className="el-tag-badge">Core Capabilities</span>
                  <h2 className="el-section-title">Key <span className="el-text-gradient">Features & Benefits</span></h2>
                  <p className="el-feature-intro-desc">
                    Engineered to exceed standards. All our modules are developed using premium tech and reviewed by industry educators.
                  </p>
                  <div className="el-features-rich-list">
                    {features.map((feature, index) => (
                      <div className="el-feature-list-item" key={index}>
                        <div className="el-feature-icon-badge">
                          <CheckCircle2 size={18} />
                        </div>
                        <div className="el-feature-text-block">
                          <h5>{feature}</h5>
                          <p>Tailored solution delivering exceptional performance and high reliability for online users.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Rich Content Sections (Zigzag alternating based on index) */}
        {contentSections && contentSections.length > 0 && (
          <section className="el-section el-rich-sections">
            <div className="container">
              {contentSections.map((section, index) => {
                const isEven = index % 2 === 0;
                return (
                  <div className="row align-items-center el-zigzag-row" key={index}>
                    <div className={`col-lg-6 ${isEven ?'order-lg-1 order-2' :'order-lg-2 order-2'}`}>
                      <div className="el-section-content">
                        <span className="el-tag-badge">Deep Dive {index + 1}</span>
                        <h3 className="el-zigzag-title">{section.title}</h3>
                        <div className="el-zigzag-desc">{section.description}</div>
                        <button className="el-link-btn" onClick={() => setIsModalOpen(true)}>
                          Learn more about this <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                    <div className={`col-lg-6 ${isEven ?'order-lg-2 order-1' :'order-lg-1 order-1'}`}>
                      <div className="el-image-wrapper">
                        <img src={section.image} alt={section.title} className="el-main-img" />
                        <div className="el-image-accent-glow" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Section 5: Gallery Showcase Grid */}
        {galleryImages && galleryImages.length > 0 && (
          <section className="el-section el-gallery-section">
            <div className="container">
              <div className="el-center-header">
                <span className="el-tag-badge">Visual Showcase</span>
                <h2 className="el-section-title">Our <span className="el-text-gradient">Portfolio Showcase</span></h2>
                <p className="el-section-subtitle">A glimpse of the clean user interfaces and educational frameworks we build.</p>
              </div>
              <div className="el-gallery-masonry">
                {galleryImages.map((img, index) => (
                  <div className="el-gallery-card" key={index}>
                    <img src={img} alt={`Showcase ${index + 1}`} />
                    <div className="el-gallery-overlay">
                      <span>Preview Service Interface</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Section 6: Unified Inquiry & Why Choose Us Section */}
        <section className="el-section el-inquiry-footer-section">
          <div className="container">
            <div className="row g-5 align-items-center">
              <div className="col-lg-6">
                <div className="el-section-content text-left-content">
                  <span className="el-tag-badge">Why Partner With Us</span>
                  <h2 className="el-section-title">Leading the Ed-Tech <span className="el-text-gradient">Revolution</span></h2>
                  <p className="el-inquiry-desc">
                    We combine domain expertise with robust software engineering to deliver e-learning suites that engage students, automate admin tasks, and scale instantly.
                  </p>
                  
                  <div className="el-why-cards">
                    <div className="el-why-card">
                      <div className="el-why-num">01</div>
                      <div className="el-why-details">
                        <h4>Expert Development</h4>
                        <p>Our engineers have years of industry specialization in educational platform deployment.</p>
                      </div>
                    </div>
                    <div className="el-why-card">
                      <div className="el-why-num">02</div>
                      <div className="el-why-details">
                        <h4>Custom Solutions</h4>
                        <p>We tailor every detail to support your branding, curriculum style, and student dashboard needs.</p>
                      </div>
                    </div>
                    <div className="el-why-card">
                      <div className="el-why-num">03</div>
                      <div className="el-why-details">
                        <h4>Premium Support</h4>
                        <p>Get active maintenance and 24/7 dedicated support queries.</p>
                      </div>
                    </div>
                  </div>

                  <div className="el-support-quick-info">
                    <h4>Need Immediate Assistance?</h4>
                    <div className="el-support-grid">
                      <a href="tel:+918076003728" className="el-support-link">
                        <Phone size={18} />
                        <span>+91 80760 03728</span>
                      </a>
                      <a href="mailto:admin@draa.in" className="el-support-link">
                        <Mail size={18} />
                        <span>admin@draa.in</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="el-inquiry-card-glow">
                  <h3 className="el-inquiry-card-title">Quick Inquiry</h3>
                  <p className="el-inquiry-card-subtitle">Fill out the form below, and our experts will contact you within 24 hours.</p>
                  
                  <form onSubmit={handleFormSubmit} className="el-inquiry-form">
                    <div className="el-form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="name"
                        placeholder="e.g. John Doe"
                        required
                        value={formData.name}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="el-form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        name="email"
                        placeholder="name@company.com"
                        required
                        value={formData.email}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="el-form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="e.g. +91 99999 99999"
                        required
                        value={formData.phone}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="el-form-group">
                      <label>Requirements Brief</label>
                      <textarea
                        name="message"
                        rows={4}
                        placeholder="How can we help your academy?"
                        required
                        value={formData.message}
                        onChange={handleFormChange}
                      />
                    </div>
                    <button type="submit" className="el-submit-btn" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 size={18} className="el-spinner" /> Submitting Request...
                        </>
                      ) : (
                        <>
                          Send Message <Send size={16} />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      <MainFooter />
      <ScrollToTop />
      <ScrollTop />

      <ServiceLeadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        serviceTitle={title} 
      />
    </>
  );
};

export default ELearningPage;

