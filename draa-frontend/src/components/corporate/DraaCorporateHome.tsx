import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Handshake,
  Landmark,
  Laptop2,
  Lightbulb,
  Presentation,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import DraaCorporateHeader from "./DraaCorporateHeader";
import ScrollToTop from "./ScrollToTop";
import ScrollTop from "./ScrollTop";
import SEO from "./SEO";
import "./DraaCorporateHome.css";
import type { CSSProperties } from "react";

const studyIndiaPortalUrl =
  import.meta.env.VITE_STUDY_INDIA_URL || "http://localhost:5175";

const challenges = [
  {
    icon: BookOpen,
    title: "Quality content is hard to find",
    text: "Learners and institutions need reliable, current and well-structured educational resources.",
    image: "/brand/corporate/stock/quality-content.webp",
  },
  {
    icon: Presentation,
    title: "Learning needs practical exposure",
    text: "Training must move beyond theory through workshops, dialogue and applied skill development.",
    image: "/brand/corporate/stock/learning-need.webp",
  },
  {
    icon: Handshake,
    title: "Institutions need expert direction",
    text: "Academic planning, programme development and quality improvement require specialist support.",
    image: "/brand/corporate/stock/institution-exposure.webp",
  },
  {
    icon: Laptop2,
    title: "Knowledge remains fragmented",
    text: "Digital tools should bring content, delivery, assessment and learner progress into one clear system.",
    image: "/brand/corporate/stock/fragmented.webp",
  },
];

const solutions = [
  {
    number: "01",
    icon: BookOpen,
    title: "Content & Publishing",
    text: "Research-led books, digital publications, courseware, assessments and custom learning resources.",
    tags: ["Books & e-books", "Study resources", "Institutional content"],
    path: "/services/content-publishing",
    image: "/brand/corporate/stock/writing-content.webp",
  },
  {
    number: "02",
    icon: GraduationCap,
    title: "Professional Learning",
    text: "Faculty development, student skill programmes, leadership training and career-readiness workshops.",
    tags: ["Workshops", "Certification", "Skill development"],
    path: "/services/professional-learning",
    image: "/brand/corporate/stock/team-learning.jpg",
  },
  {
    number: "03",
    icon: CalendarDays,
    title: "Education Events",
    text: "Conferences, seminars, webinars, competitions and knowledge-sharing programmes with end-to-end support.",
    tags: ["Conferences", "Webinars", "Education fairs"],
    path: "/services/education-events",
    image: "/brand/corporate/stock/event-stage.webp",
  },
  {
    number: "04",
    icon: BriefcaseBusiness,
    title: "Academic Advisory",
    text: "Practical consultancy for curriculum, institutional development, admissions and quality frameworks.",
    tags: ["Academic planning", "Institutional quality", "Mentorship"],
    path: "/services/academic-advisory",
    image: "/brand/corporate/stock/classroom.webp",
  },
  {
    number: "05",
    icon: Laptop2,
    title: "Digital Learning",
    text: "Accessible learning platforms, online courses, virtual classrooms and assessment-led digital experiences.",
    tags: ["Learning platforms", "Virtual delivery", "Digital assessment"],
    path: "/services/digital-learning",
    image: "/brand/corporate/stock/digital-learning.webp",
  },
];

const audiences = [
  {
    icon: Building2,
    title: "Schools & Colleges",
    text: "Academic content, educator development and learner-engagement programmes aligned with institutional priorities.",
    image: "/brand/corporate/stock/school-colleges.webp",
  },
  {
    icon: Landmark,
    title: "Universities & Higher Education",
    text: "Programme design, international-student guidance, events and knowledge initiatives for modern campuses.",
    image: "/brand/corporate/stock/university-higher.webp",
  },
  {
    icon: GraduationCap,
    title: "Learners & Educators",
    text: "Structured resources, practical training and guided pathways that support academic and professional progress.",
    image: "/brand/corporate/stock/learners-educators.webp",
  },
  {
    icon: BriefcaseBusiness,
    title: "Organisations & Partners",
    text: "Custom learning, capacity-building and education programmes developed for defined organisational outcomes.",
    image: "/brand/corporate/stock/organization-partner.webp",
  },
];

export default function DraaCorporateHome() {
  return (
    <div className="draa-corp">
      <SEO
        title="Education Services & Knowledge Management"
        siteName="DRAA"
        description="DRAA creates educational content, professional learning programmes, education events, institutional advisory and digital learning solutions."
        keywords="DRAA, education services, knowledge management, educational content, training, academic consultancy, study in India"
        ogImage="/brand/draa-mark.png"
      />
      <DraaCorporateHeader />

      <main>
        <section className="draa-corp-hero" aria-labelledby="draa-corp-title">
          <div className="draa-corp-hero-grid" aria-hidden="true" />
          <div className="draa-corp-shell draa-corp-hero-inner">
            <div className="draa-corp-hero-copy">
              <span className="draa-corp-pill">
                <Sparkles size={15} /> Education with purpose. Knowledge with
                impact.
              </span>
              <p className="draa-corp-overline">DRAA (OPC) PRIVATE LIMITED</p>
              <h1 id="draa-corp-title">
                Empowering education.<span>Enriching futures.</span>
              </h1>
              <p className="draa-corp-hero-lead">
                We design content, learning programmes, education events,
                institutional solutions and digital experiences that turn
                knowledge into measurable outcomes.
              </p>
              <div className="draa-corp-actions">
                <a
                  href="/#solutions"
                  className="draa-corp-button draa-corp-button-dark"
                >
                  Explore our capabilities <ArrowRight size={18} />
                </a>
                <a
                  href={studyIndiaPortalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="draa-corp-button draa-corp-button-light"
                >
                  <Landmark size={18} /> Study in India portal
                </a>
              </div>
              <div className="draa-corp-trust-row">
                <div>
                  <strong>Since 2023</strong>
                  <span>Established in New Delhi</span>
                </div>
                <i />
                <div>
                  <strong>Outcome-led</strong>
                  <span>Teaching, tutoring &amp; training</span>
                </div>
                <i />
                <div>
                  <strong>End-to-end</strong>
                  <span>Ideas, delivery &amp; impact</span>
                </div>
              </div>
            </div>

            <div
              className="draa-corp-hero-visual"
              aria-label="DRAA's five education capabilities"
            >
              <div className="draa-corp-visual-meta" aria-hidden="true">
                <span>Integrated education ecosystem</span>
                <strong>05 capabilities</strong>
              </div>
              <div className="draa-corp-visual-orbit" aria-hidden="true">
                <i className="draa-orbit-node draa-orbit-node-one" />
                <i className="draa-orbit-node draa-orbit-node-two" />
                <i className="draa-orbit-node draa-orbit-node-three" />
                <i className="draa-orbit-node draa-orbit-node-four" />
                <i className="draa-orbit-node draa-orbit-node-five" />
              </div>
              <div className="draa-corp-visual-brand">
                <img src="/brand/draa-mark.png" alt="DRAA logo" />
                <strong>DRAA</strong>
                <span>
                  Education Services
                  <br />
                  &amp; Knowledge Management
                </span>
              </div>
              <div className="draa-corp-capability capability-one">
                <BookOpen size={17} /> Content
              </div>
              <div className="draa-corp-capability capability-two">
                <GraduationCap size={17} /> Training
              </div>
              <div className="draa-corp-capability capability-three">
                <CalendarDays size={17} /> Events
              </div>
              <div className="draa-corp-capability capability-four">
                <Handshake size={17} /> Advisory
              </div>
              <div className="draa-corp-capability capability-five">
                <Laptop2 size={17} /> Digital
              </div>
            </div>
          </div>
        </section>

        <section className="draa-corp-proof-band">
          <div className="draa-corp-shell">
            <p>Built for meaningful educational growth</p>
            <div>
              <span>
                <Users size={17} /> Learners
              </span>
              <span>
                <Building2 size={17} /> Institutions
              </span>
              <span>
                <BriefcaseBusiness size={17} /> Professionals
              </span>
              <span>
                <Handshake size={17} /> Organisations
              </span>
            </div>
          </div>
        </section>

        <section id="about" className="draa-corp-section draa-corp-about">
          <div className="draa-corp-shell draa-corp-two-column">
            <div>
              <span className="draa-corp-section-label">Who we are</span>
              <h2>An education partner built around outcomes.</h2>
            </div>
            <div className="draa-corp-about-copy">
              <p>
                DRAA is a New Delhi-based education services and knowledge
                management company established in June 2023. We bring together
                academic insight, content expertise, programme delivery and
                technology to support the future of learning in Bharat and
                beyond.
              </p>
              <p>
                Our role is simple: understand the educational challenge, design
                the right intervention and remain accountable for the quality of
                the outcome.
              </p>
              <div className="draa-corp-about-points">
                <span>
                  <CheckCircle2 size={17} /> Research-led
                </span>
                <span>
                  <CheckCircle2 size={17} /> Institution-ready
                </span>
                <span>
                  <CheckCircle2 size={17} /> Learner-centred
                </span>
              </div>
              <div
                className="draa-corp-delivery-visual"
                aria-label="DRAA delivery approach"
              >
                <div>
                  <span>
                    <Search size={17} />
                  </span>
                  <strong>Discover</strong>
                  <small>Understand the need</small>
                </div>
                <i aria-hidden="true" />
                <div>
                  <span>
                    <Lightbulb size={17} />
                  </span>
                  <strong>Design</strong>
                  <small>Shape the solution</small>
                </div>
                <i aria-hidden="true" />
                <div>
                  <span>
                    <Presentation size={17} />
                  </span>
                  <strong>Deliver</strong>
                  <small>Put learning into action</small>
                </div>
                <i aria-hidden="true" />
                <div>
                  <span>
                    <CheckCircle2 size={17} />
                  </span>
                  <strong>Improve</strong>
                  <small>Review the outcome</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="draa-corp-section draa-corp-challenges">
          <div className="draa-corp-shell">
            <div className="draa-corp-section-heading">
              <span className="draa-corp-section-label">
                The need we address
              </span>
              <h2>Better learning begins with the right structure.</h2>
              <p>
                We connect the parts of education that are too often treated
                separately.
              </p>
            </div>
            <div className="draa-corp-challenge-grid">
              {challenges.map(({ icon: Icon, title, text, image }, index) => (
                <article
                  key={title}
                  className={`draa-corp-challenge-card ${
                    image ? "draa-corp-challenge-card-image" : ""
                  }`}
                  style={
                    image
                      ? ({
                          "--challenge-bg": `url(${image})`,
                        } as CSSProperties)
                      : undefined
                  }
                >
                  <span className="draa-corp-card-index">0{index + 1}</span>

                  <span className="draa-corp-icon-box">
                    <Icon size={23} />
                  </span>

                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="solutions"
          className="draa-corp-section draa-corp-solutions"
        >
          <div className="draa-corp-shell">
            <div className="draa-corp-section-heading draa-corp-section-heading-light">
              <span className="draa-corp-section-label">What we do</span>
              <h2>Five capabilities. One connected education partner.</h2>
              <p>
                Each engagement can stand alone or combine into a complete
                solution.
              </p>
            </div>
            <div className="draa-corp-solution-grid">
              {solutions.map(
                ({ number, icon: Icon, title, text, tags, path, image }) => (
                  <Link
                    key={title}
                    to={path}
                    className="draa-corp-solution-card"
                  >
                    {/* CARD BACKGROUND IMAGE */}
                    <div
                      className="draa-corp-solution-photo"
                      style={{ backgroundImage: `url("${image}")` }}
                      aria-hidden="true"
                    />

                    {/* CARD CONTENT */}
                    <div className="draa-corp-solution-content">
                      <div className="draa-corp-solution-top">
                        <span>{number}</span>
                        <Icon size={25} />
                      </div>

                      <h3>{title}</h3>

                      <p>{text}</p>

                      <ul>
                        {tags.map((tag) => (
                          <li key={tag}>{tag}</li>
                        ))}
                      </ul>

                      <span className="draa-corp-solution-link">
                        Explore this service <ArrowRight size={14} />
                      </span>
                    </div>
                  </Link>
                ),
              )}
            </div>
          </div>
        </section>

        <section
          id="study-in-india"
          className="draa-corp-section draa-corp-study"
        >
          <div className="draa-corp-shell draa-corp-study-card">
            <div className="draa-corp-study-copy">
              <span className="draa-corp-section-label">
                Study in India guidance
              </span>
              <h2>
                Make the journey to Indian higher education easier to
                understand.
              </h2>
              <p>
                DRAA’s guidance hub will help international learners discover
                programmes, understand eligibility, explore scholarships and
                prepare for each admission milestone—with official government
                services clearly identified.
              </p>
              <div className="draa-corp-study-actions">
                <a
                  href={studyIndiaPortalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="draa-corp-button draa-corp-button-gold"
                >
                  Open the DRAA portal <ArrowRight size={18} />
                </a>
                <a
                  href="https://studyinindia.gov.in/"
                  target="_blank"
                  rel="noreferrer"
                  className="draa-corp-text-link"
                >
                  Visit the official portal <ArrowRight size={16} />
                </a>
              </div>
              <small>
                DRAA is an independent education-services company and is not the
                Government of India’s Study in India portal.
              </small>
            </div>
            <div id="study-tools" className="draa-corp-study-tools">
              <div>
                <Search size={20} />
                <span>
                  <strong>Discover</strong>Courses &amp; institutions
                </span>
              </div>
              <div>
                <ClipboardCheck size={20} />
                <span>
                  <strong>Prepare</strong>Eligibility &amp; documents
                </span>
              </div>
              <div>
                <Lightbulb size={20} />
                <span>
                  <strong>Explore</strong>Scholarship guidance
                </span>
              </div>
              <div>
                <ShieldCheck size={20} />
                <span>
                  <strong>Navigate</strong>Visa &amp; FRRO steps
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          id="learning-events"
          className="draa-corp-section draa-corp-learning-events"
        >
          <div className="draa-corp-shell draa-corp-two-column">
            <div>
              <span className="draa-corp-section-label">
                Learning &amp; events
              </span>
              <h2>Programmes that move people from insight to action.</h2>
            </div>
            <div className="draa-corp-learning-list">
              <Link to="/learning-programs">
                <Presentation size={22} />
                <span>
                  <strong>Professional learning</strong>Workshops, faculty
                  development and certification programmes.
                </span>
                <ArrowRight size={17} />
              </Link>
              <Link to="/events">
                <CalendarDays size={22} />
                <span>
                  <strong>Knowledge-sharing events</strong>Conferences,
                  seminars, webinars and education fairs.
                </span>
                <ArrowRight size={17} />
              </Link>
              <div>
                <Users size={22} />
                <span>
                  <strong>Custom institutional programmes</strong>Solutions
                  designed around a defined academic or organisational need.
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          id="institutions"
          className="draa-corp-section draa-corp-institutions"
        >
          <div className="draa-corp-shell">
            <div className="draa-corp-section-heading">
              <span className="draa-corp-section-label">Who we support</span>
              <h2>
                Solutions shaped around the people and institutions we serve.
              </h2>
              <p>
                We begin with the audience, the context and the desired learning
                outcome—not with a one-size-fits-all product.
              </p>
            </div>
            <div className="draa-corp-audience-grid">
              {audiences.map(({ icon: Icon, title, text, image }, index) => (
                <article key={title} className="draa-corp-audience-card">
                  {image && (
                    <img
                      className="draa-corp-audience-bg"
                      src={image}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                    />
                  )}

                  <span className="draa-corp-audience-number">
                    0{index + 1}
                  </span>

                  <Icon size={24} />

                  <h3>{title}</h3>

                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="partner" className="draa-corp-partner">
          <div className="draa-corp-shell draa-corp-partner-inner">
            <div>
              <span className="draa-corp-section-label">Build with DRAA</span>
              <h2>Have an education challenge worth solving?</h2>
              <p>
                Let’s shape the content, programme, event or digital solution
                that moves your learners and institution forward.
              </p>
            </div>
            <Link
              to="/contact"
              className="draa-corp-button draa-corp-button-light"
            >
              Start a conversation <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="draa-corp-footer">
        <div className="draa-corp-shell draa-corp-footer-main">
          <div className="draa-corp-footer-brand">
            <div>
              <img src="/brand/draa-mark.png" alt="DRAA logo" />
              <strong>DRAA</strong>
            </div>
            <p>Education Services &amp; Knowledge Management</p>
          </div>
          <div>
            <strong>Explore</strong>
            <Link to="/about-draa">About DRAA</Link>
            <Link to="/capabilities">Services</Link>
            <Link to="/resources">Resources</Link>
            <Link to="/who-we-support">Who We Support</Link>
          </div>
          <div>
            <strong>Opportunities</strong>
            <a href={studyIndiaPortalUrl} target="_blank" rel="noreferrer">
              Study in India
            </a>
            <Link to="/learning-programs">Learning Programs</Link>
            <Link to="/events">Events</Link>
            <Link to="/contact">Partner with DRAA</Link>
          </div>
          <div>
            <strong>Company</strong>
            <span>DRAA (OPC) Private Limited</span>
            <span>New Delhi, India</span>
            <span>CIN: U85491DL2023OPC416284</span>
          </div>
        </div>
        <div className="draa-corp-shell draa-corp-footer-bottom">
          <span>© {new Date().getFullYear()} DRAA (OPC) Private Limited</span>
          <span>Purpose-led education. Responsible growth.</span>
        </div>
      </footer>
      <ScrollToTop />
      <ScrollTop />
    </div>
  );
}
