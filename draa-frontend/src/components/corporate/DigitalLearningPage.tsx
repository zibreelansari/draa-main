import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Check,
  CirclePlay,
  ClipboardCheck,
  Cloud,
  Code2,
  GraduationCap,
  Laptop2,
  LayoutDashboard,
  MonitorPlay,
  Palette,
  Settings2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
import { Link } from "react-router-dom";
import DraaCorporateFooter from "./DraaCorporateFooter";
import DraaCorporateHeader from "./DraaCorporateHeader";
import SEO from "./SEO";
import ScrollToTop from "./ScrollToTop";
import ScrollTop from "./ScrollTop";
import "./DraaCorporateHome.css";
import "./DigitalLearningPage.css";

const capabilities = [
  {
    icon: LayoutDashboard,
    title: "Learning platforms & LMS",
    text: "Structured portals for courses, resources, learner progress, communication and administration.",
    points: [
      "Role-based dashboards",
      "Course and cohort management",
      "Progress visibility",
    ],
    className: "digital-cap-platform",
  },
  {
    icon: BookOpenCheck,
    title: "Digital course experiences",
    text: "Outcome-led courses that combine clear content, activities, media and guided practice.",
    points: [
      "Learning architecture",
      "Interactive content",
      "Accessible delivery",
    ],
    image: "/brand/corporate/stock/digital-course-design.jpg",
    className: "digital-cap-course",
  },
  {
    icon: Video,
    title: "Virtual classrooms",
    text: "Live and blended learning spaces designed around participation and continuity.",
    className: "digital-cap-small",
  },
  {
    icon: ClipboardCheck,
    title: "Digital assessment",
    text: "Question banks, assignments, feedback and reporting connected to learning outcomes.",
    className: "digital-cap-small",
  },
  {
    icon: Smartphone,
    title: "Mobile learning",
    text: "Responsive experiences that keep essential learning usable across devices and contexts.",
    className: "digital-cap-small",
  },
  {
    icon: Settings2,
    title: "Implementation support",
    text: "Content migration, onboarding, training and adoption support for a confident launch.",
    className: "digital-cap-small",
  },
];

const useCases = [
  {
    label: "Higher education",
    title: "Connected learning for modern campuses",
    text: "Bring courses, faculty resources, assessment and learner support into one coherent experience.",
    image: "/brand/corporate/stock/digital-hero-students.jpg",
    icon: GraduationCap,
  },
  {
    label: "Schools & training providers",
    title: "Blended programmes that stay organised",
    text: "Support classroom teaching with structured content, practice, communication and progress tracking.",
    image: "/brand/corporate/stock/digital-course-design.jpg",
    icon: MonitorPlay,
  },
  {
    label: "Organisations & teams",
    title: "Learning built around capability goals",
    text: "Deliver onboarding, professional learning and role-based development with clearer evidence of participation.",
    image: "/brand/corporate/stock/digital-team-workshop.jpg",
    icon: Users,
  },
];

const journey = [
  ["01", "Discover", "Audience, constraints and outcomes"],
  ["02", "Architect", "Content, pathways and platform"],
  ["03", "Build & launch", "Experience, testing and onboarding"],
  ["04", "Measure & improve", "Usage, feedback and iteration"],
];

const developmentServices = [
  {
    icon: Code2,
    title: "Website Development",
    category: "Custom web solutions",
    delivery: "Responsive + SEO-ready",
    text: "Professional websites and web applications designed around your audience, services and business goals.",
    skills: [
      "Corporate and institutional websites",
      "Portals and custom web applications",
      "CMS, forms and third-party integrations",
    ],
  },
  {
    icon: Smartphone,
    title: "Mobile App Development",
    category: "Android & iOS",
    delivery: "Prototype to launch",
    text: "Useful, reliable mobile applications shaped for learners, customers, teams and everyday operations.",
    skills: [
      "Cross-platform application development",
      "Authentication and notifications",
      "Testing and store-launch support",
    ],
  },
  {
    icon: GraduationCap,
    title: "LMS & Learning Platforms",
    category: "Education technology",
    delivery: "Platform + content",
    text: "Branded learning environments that organise programmes, resources, assessment and learner progress.",
    skills: [
      "Learner and educator dashboards",
      "Course, cohort and resource management",
      "Assessment, reporting and certificates",
    ],
  },
  {
    icon: LayoutDashboard,
    title: "Institution Portals & ERP",
    category: "Workflow automation",
    delivery: "Connected operations",
    text: "Secure portals that simplify information, requests and routine workflows for institutions and organisations.",
    skills: [
      "Admissions and student portals",
      "Document, fee and request workflows",
      "Role-based administrative dashboards",
    ],
  },
  {
    icon: Palette,
    title: "UI/UX & Product Design",
    category: "Research-led design",
    delivery: "Prototype + design system",
    text: "Clear interfaces and user journeys that make websites, applications and platforms easier to understand and use.",
    skills: [
      "User research and journey mapping",
      "Wireframes and interactive prototypes",
      "Accessible UI and reusable design systems",
    ],
  },
  {
    icon: Cloud,
    title: "Cloud, Maintenance & Support",
    category: "Ongoing technology support",
    delivery: "Secure + scalable",
    text: "Technical support that keeps your digital product stable, current and ready to grow after launch.",
    skills: [
      "Cloud deployment and hosting support",
      "Monitoring, backups and security updates",
      "Ongoing improvements and technical help",
    ],
  },
];

export default function DigitalLearningPage() {
  return (
    <div className="draa-corp digital-page">
      <SEO
        title="Digital Learning Solutions"
        siteName="DRAA"
        description="DRAA designs websites, mobile apps, learning platforms, institution portals, digital courses and supported technology solutions for education institutions and organisations."
        ogImage="/brand/corporate/stock/digital-hero-students.jpg"
      />
      <DraaCorporateHeader />
      <main>
        <section className="digital-hero">
          <div className="draa-corp-shell digital-hero-grid">
            <div className="digital-hero-copy">
              <span className="digital-kicker">
                <Sparkles size={15} /> Digital learning, thoughtfully connected
              </span>
              <p className="digital-overline">
                DRAA DIGITAL LEARNING SOLUTIONS
              </p>
              <h1>
                Digital learning designed for <em>people.</em>
                <span>Engineered to perform.</span>
              </h1>
              <p className="digital-hero-lead">
                DRAA integrates content, technology, assessment and learner
                support to create coherent digital experiences for institutions
                and organisations.
              </p>
              <div className="digital-actions">
                <Link
                  to="/contact?subject=Digital%20Learning%20Solutions"
                  className="digital-button digital-button-dark"
                >
                  Discuss your requirement <ArrowRight size={17} />
                </Link>
                <a
                  href="#digital-capabilities"
                  className="digital-button digital-button-light"
                >
                  Explore capabilities
                </a>
              </div>
              <div className="digital-proof-row">
                <span>
                  <ShieldCheck size={17} />
                  <strong>Accessible</strong>
                  <small>Designed for real learners</small>
                </span>
                <span>
                  <Cloud size={17} />
                  <strong>Scalable</strong>
                  <small>Built around your scope</small>
                </span>
                <span>
                  <BarChart3 size={17} />
                  <strong>Measurable</strong>
                  <small>Clear progress signals</small>
                </span>
              </div>
            </div>
            <div className="digital-hero-media">
              <img
                src="/brand/corporate/stock/digital-hero-students.jpg"
                alt="Students collaborating around laptops in a digital learning session"
              />
              <div className="digital-media-shade" />
              <div className="digital-media-panel">
                <span>LEARNING ECOSYSTEM</span>
                <strong>One connected journey</strong>
                <ul>
                  <li>
                    <CirclePlay size={14} /> Learn
                  </li>
                  <li>
                    <ClipboardCheck size={14} /> Practise
                  </li>
                  <li>
                    <BarChart3 size={14} /> Progress
                  </li>
                </ul>
              </div>
              <div className="digital-media-badge">
                <Laptop2 size={18} />
                <span>
                  <strong>Multi-device</strong>
                  <small>Responsive by design</small>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="digital-ecosystem">
          <div className="draa-corp-shell digital-ecosystem-grid">
            <div>
              <span className="digital-section-label">
                A complete learning system
              </span>
              <h2>
                Effective technology begins with a clearly designed learning
                journey.
              </h2>
              <p>
                We define the audience, objectives and operational context
                before shaping the content, platform and support model around
                measurable requirements.
              </p>
            </div>
            <div className="digital-ecosystem-flow">
              <article>
                <span>
                  <BookOpenCheck size={21} />
                </span>
                <strong>Design</strong>
                <small>Purposeful content and pathways</small>
              </article>
              <i />
              <article>
                <span>
                  <MonitorPlay size={21} />
                </span>
                <strong>Deliver</strong>
                <small>Accessible learning experiences</small>
              </article>
              <i />
              <article>
                <span>
                  <BarChart3 size={21} />
                </span>
                <strong>Improve</strong>
                <small>Evidence, feedback and iteration</small>
              </article>
            </div>
          </div>
        </section>

        <section id="digital-capabilities" className="digital-capabilities">
          <div className="draa-corp-shell">
            <div className="digital-heading-row">
              <div>
                <span className="digital-section-label">What we can build</span>
                <h2>
                  An integrated digital ecosystem—not a collection of
                  disconnected tools.
                </h2>
              </div>
              <p>
                Select a focused engagement or combine capabilities into a
                complete digital learning environment with one accountable
                delivery partner.
              </p>
            </div>
            <div className="digital-bento">
              {capabilities.map(
                (
                  { icon: Icon, title, text, points, image, className },
                  index,
                ) => (
                  <article key={title} className={className}>
                    {image && (
                      <img
                        src={image}
                        alt="People designing a digital learning experience on a laptop"
                        loading="lazy"
                      />
                    )}
                    <div className="digital-cap-body">
                      <span className="digital-cap-icon">
                        <Icon size={22} />
                      </span>
                      <small>0{index + 1}</small>
                      <h3>{title}</h3>
                      <p>{text}</p>
                      {points && (
                        <ul>
                          {points.map((point) => (
                            <li key={point}>
                              <Check size={13} />
                              {point}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </article>
                ),
              )}
            </div>
          </div>
        </section>

        <section className="digital-use-cases">
          <div className="draa-corp-shell">
            <div className="digital-heading-row">
              <div>
                <span className="digital-section-label">
                  Designed for context
                </span>
                <h2>
                  Designed for different learners, environments and
                  institutional priorities.
                </h2>
              </div>
              <p>
                Each solution is aligned with your users, programme model,
                infrastructure and evidence requirements.
              </p>
            </div>
            <div className="digital-use-grid">
              {useCases.map(({ label, title, text, image, icon: Icon }) => (
                <article key={title}>
                  <img src={image} alt="" loading="lazy" />
                  <div>
                    <span>
                      <Icon size={17} />
                      {label}
                    </span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="digital-courses">
          <div className="draa-corp-shell">
            <div className="digital-course-intro">
              <div>
                <span className="digital-section-label">
                  Digital development services
                </span>
                <h2>Technology services built around real business needs.</h2>
              </div>
              <div>
                <p>
                  DRAA can design, develop and support digital products for
                  schools, colleges, education providers, organisations and
                  growing businesses.
                </p>
                <span className="digital-course-note">
                  Every engagement is scoped around your users, workflow,
                  timeline and long-term support needs.
                </span>
              </div>
            </div>
            <div className="digital-course-grid">
              {developmentServices.map(
                (
                  { icon: Icon, title, category, delivery, text, skills },
                  index,
                ) => (
                  <article key={title}>
                    <div className="digital-service-visual" aria-hidden="true">
                      <div className="digital-service-screen">
                        <span className="digital-service-screen-top">
                          <i />
                          <i />
                          <i />
                        </span>
                        <span className="digital-service-screen-content">
                          <b />
                          <b />
                          <b />
                        </span>
                      </div>
                      <span className="digital-service-float">
                        <Icon size={23} />
                      </span>
                      <i className="digital-service-orbit" />
                    </div>
                    <div className="digital-course-top">
                      <span className="digital-course-icon">
                        <Icon size={22} />
                      </span>
                      <small>SERVICE 0{index + 1}</small>
                    </div>
                    <h3>{title}</h3>
                    <div className="digital-course-meta">
                      <span>{category}</span>
                      <span>{delivery}</span>
                    </div>
                    <p>{text}</p>
                    <ul>
                      {skills.map((skill) => (
                        <li key={skill}>
                          <Check size={13} />
                          {skill}
                        </li>
                      ))}
                    </ul>
                    <Link to={`/contact?subject=${encodeURIComponent(title)}`}>
                      Discuss this service <ArrowRight size={15} />
                    </Link>
                  </article>
                ),
              )}
            </div>
          </div>
        </section>

        <section className="digital-outcomes">
          <div className="draa-corp-shell">
            <div>
              <span className="digital-section-label">
                What good looks like
              </span>
              <h2>Effective from first interaction to measurable outcome.</h2>
            </div>
            <div className="digital-outcome-list">
              <span>
                <strong>01</strong>
                <b>Simple to navigate</b>
                <small>Clear pathways reduce learner friction.</small>
              </span>
              <span>
                <strong>02</strong>
                <b>Ready for adoption</b>
                <small>Training and onboarding support teams.</small>
              </span>
              <span>
                <strong>03</strong>
                <b>Visible progress</b>
                <small>Useful signals support timely decisions.</small>
              </span>
              <span>
                <strong>04</strong>
                <b>Designed to evolve</b>
                <small>Modular systems grow with the programme.</small>
              </span>
            </div>
          </div>
        </section>

        <section className="digital-journey">
          <div className="draa-corp-shell digital-journey-card">
            <div className="digital-journey-copy">
              <span className="digital-section-label">Our delivery model</span>
              <h2>A structured route from requirement to successful launch.</h2>
              <p>
                One accountable team connects learning design, content,
                technology and implementation.
              </p>
            </div>
            <div className="digital-journey-steps">
              {journey.map(([number, title, text]) => (
                <article key={title}>
                  <span>{number}</span>
                  <strong>{title}</strong>
                  <small>{text}</small>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="digital-final">
          <div className="draa-corp-shell">
            <div>
              <span>READY TO BUILD?</span>
              <h2>
                Let’s create a digital learning environment that is practical,
                scalable and ready to evolve.
              </h2>
            </div>
            <Link to="/contact?subject=Digital%20Learning%20Solutions">
              Start a conversation <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>
      <DraaCorporateFooter />
      <ScrollToTop />
      <ScrollTop />
    </div>
  );
}
