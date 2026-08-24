import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Compass,
  Eye,
  Flag,
  Globe2,
  GraduationCap,
  Handshake,
  Heart,
  Laptop2,
  Lightbulb,
  MessageCircle,
  Presentation,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import DraaCorporateFooter from "./DraaCorporateFooter";
import DraaCorporateHeader from "./DraaCorporateHeader";
import SEO from "./SEO";
import ScrollToTop from "./ScrollToTop";
import ScrollTop from "./ScrollTop";
import "./DraaCorporateHome.css";
import "./AboutDraaPage.css";

const studyIndiaPortalUrl =
  import.meta.env.VITE_STUDY_INDIA_URL || "http://localhost:5175";

const promises = [
  {
    icon: ShieldCheck,
    title: "Our promise",
    text: "Evidence-led solutions that create real and lasting impact.",
  },
  {
    icon: Compass,
    title: "Our approach",
    text: "Research, insight and impact in a clear delivery framework.",
  },
  {
    icon: Heart,
    title: "What matters",
    text: "Integrity, collaboration and measurable excellence.",
  },
];

const stats = [
  [BriefcaseBusiness, "Since 2023", "Established in New Delhi"],
  [Users, "Outcome-led", "Designed around real needs"],
  [Globe2, "Bharat & beyond", "Built for diverse contexts"],
  [GraduationCap, "End-to-end", "From strategy to delivery"],
  [Sparkles, "Quality-first", "Clear standards throughout"],
];

const values = [
  {
    icon: Target,
    title: "Purpose",
    text: "Empower education, strengthen institutions and transform communities.",
    image: "/brand/corporate/stock/purpose.webp",
  },
  {
    icon: Flag,
    title: "Mission",
    text: "Design and deliver solutions that create measurable, sustainable impact.",
    image: "/brand/corporate/stock/mission.webp"
  },
  {
    icon: Eye,
    title: "Vision",
    text: "A world where quality education unlocks opportunity and excellence for all.",
    image:"/brand/corporate/stock/values.webp"
  },
  {
    icon: Heart,
    title: "Values",
    text: "Integrity, collaboration, innovation and excellence in everything we do.",
    image: "/brand/corporate/stock/vision.webp"
  },
];

const services = [
  {
    icon: BookOpen,
    title: "Content & Curriculum",
    text: "Research-led content and curricula for meaningful learning.",
    image: "/brand/corporate/stock/writing-content.jpg",
    href: "/services/content-publishing",
  },
  {
    icon: Presentation,
    title: "Learning Programmes",
    text: "Custom programmes for learners, educators and professionals.",
    image: "/brand/corporate/stock/team-learning.jpg",
    href: "/services/professional-learning",
  },
  {
    icon: Laptop2,
    title: "Digital Solutions",
    text: "Learning platforms, portals, websites and digital experiences.",
    image: "/brand/corporate/stock/digital-course-design.jpg",
    href: "/services/digital-learning",
  },
  {
    icon: CalendarDays,
    title: "Events & Conferences",
    text: "Thoughtful knowledge platforms that connect and inspire.",
    image: "/brand/corporate/stock/event-stage.jpg",
    href: "/events",
  },
  {
    icon: Handshake,
    title: "Advisory & Support",
    text: "Strategic guidance for stronger institutional ecosystems.",
    image: "/brand/corporate/institutional-partners-v2.png",
    href: "/services/academic-advisory",
  },
  {
    icon: GraduationCap,
    title: "Study in India Guidance",
    text: "Structured guidance for international learners.",
    image: "/brand/corporate/study-india-campus-v2.png",
    href: studyIndiaPortalUrl,
    external: true,
  },
];

const process = [
  [Search, "Discover", "Understand needs and context"],
  [Lightbulb, "Design", "Create strategy and solutions"],
  [BookOpen, "Develop", "Build content and experiences"],
  [Users, "Deliver", "Implement with excellence"],
  [CheckCircle2, "Measure impact", "Evaluate, learn and improve"],
];

const educationChallenges = [
  [
    BookOpen,
    "Quality learning content",
    "Reliable, structured and current resources are not always easy to access.",
  ],
  [
    GraduationCap,
    "Learning opportunities",
    "Learners and professionals need relevant development beyond traditional classrooms.",
  ],
  [
    Compass,
    "Expert guidance",
    "Institutions and individuals benefit from informed academic and capability decisions.",
  ],
  [
    Laptop2,
    "Connected knowledge",
    "Content, platforms and learning data work better when they form one coherent system.",
  ],
];

const engagementStreams = [
  [
    BookOpen,
    "Content & publishing",
    "Educational books, digital publications, study resources and premium learning materials.",
  ],
  [
    CalendarDays,
    "Events & partnerships",
    "Educational conferences, institutional collaborations and responsible sponsorships.",
  ],
  [
    Handshake,
    "Consultancy & mentorship",
    "Educational advisory, training consultation, institutional development and guidance.",
  ],
  [
    Presentation,
    "Training & capability building",
    "Workshops, certification programmes and practical skill development.",
  ],
];

export default function AboutDraaPage() {
  return (
    <div className="draa-corp about-ref-page">
      <SEO
        title="About DRAA"
        siteName="DRAA"
        description="Discover DRAA's purpose, approach, capabilities and commitment to meaningful educational impact."
        ogImage="/brand/corporate/institutional-partners-v2.png"
      />
      <DraaCorporateHeader />
      <main>
        <section className="about-ref-hero">
          <div className="about-ref-glow" aria-hidden="true" />
          <div className="draa-corp-shell about-ref-hero-grid">
            <div className="about-ref-copy">
              <span className="about-ref-label">ABOUT DRAA</span>
              <h1>
                We shape knowledge
                <br />
                into lasting impact.
                <span>Education. Research. Transformation.</span>
              </h1>
              <p>
                DRAA is an education services and knowledge management company
                that helps institutions, learners and organisations turn complex
                education needs into clear, practical solutions. We connect
                content, learning programmes, advisory, events and digital
                technology through one accountable delivery model.
              </p>
              <div className="about-ref-actions">
                <a href="#about-story">
                  Explore our story <ArrowRight size={15} />
                </a>
                <Link to="/contact">
                  Talk to our team <MessageCircle size={15} />
                </Link>
              </div>
              <div
                className="about-ref-clarity"
                aria-label="DRAA approach summary"
              >
                <span>
                  <strong>Understand</strong>
                  <small>the real need</small>
                </span>
                <i />
                <span>
                  <strong>Design</strong>
                  <small>the right response</small>
                </span>
                <i />
                <span>
                  <strong>Deliver</strong>
                  <small>measurable value</small>
                </span>
              </div>
            </div>
            <div className="about-ref-media">
              <img
                src="/brand/corporate/institutional-partners-v2.png"
                alt="Education leaders and professionals collaborating around a conference table"
              />
              <div className="about-ref-media-shade" />
              <div
                className="about-ref-logo-orbit"
                aria-label="DRAA brand emblem"
              >
                <i />
                <i />
                <i />
                <div>
                  <img src="/brand/draa-mark.png" alt="DRAA" />
                </div>
              </div>
              <div className="about-ref-promises">
                {promises.map(({ icon: Icon, title, text }) => (
                  <article key={title}>
                    <Icon size={19} />
                    <span>
                      <strong>{title}</strong>
                      <small>{text}</small>
                    </span>
                    <ArrowRight size={12} />
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="about-ref-stats">
          <div className="draa-corp-shell">
            {stats.map(([Icon, value, label]) => {
              const MetricIcon = Icon as typeof Users;
              return (
                <article key={String(value)}>
                  <MetricIcon size={18} />
                  <span>
                    <strong>{String(value)}</strong>
                    <small>{String(label)}</small>
                  </span>
                </article>
              );
            })}
          </div>
        </section>

        <section id="about-story" className="about-ref-story">
          <div className="draa-corp-shell about-ref-story-grid">
            <div className="about-ref-story-photo">
              <img
                src="/brand/corporate/stock/india-gate.png"
                alt="A university campus representing education and institutional growth"
              />
              <span>
                <strong>New Delhi</strong>
                <small>Serving education in Bharat and beyond</small>
              </span>
            </div>
            <div className="about-ref-story-copy">
              <span className="about-ref-label">WHO WE ARE</span>
              <h2>
                Purpose-driven.
                <br />
                Impact-focused.
              </h2>
              <p>
                Incorporated on 28 June 2023 in New Delhi, DRAA (OPC) Private
                Limited works across teaching, tutoring and training. Our
                purpose is to help institutions, organisations and learners
                create education experiences that are relevant, inclusive and
                future-ready.
              </p>
              <small className="about-ref-legal">
                ROC Delhi · CIN U85491DL2023OPC416284
              </small>
              <a href="#about-process">
                Learn more about our journey <ArrowRight size={15} />
              </a>
            </div>
            <div className="about-ref-value-grid">
              <div className="about-ref-value-grid">
                {values.map(({ icon: Icon, title, text, image }) => (
                  <article
                    key={title}
                    className={`about-ref-value-card ${image ? "has-background" : ""}`}
                    style={
                      image
                        ? {
                            backgroundImage: `
                linear-gradient(
                  180deg,
                  rgba(20, 15, 10, 0.08) 0%,
                  rgba(20, 15, 10, 0.22) 42%,
                  rgba(20, 15, 10, 0.90) 100%
                ),
                url(${image})
              `,
                          }
                        : undefined
                    }
                  >
                    <Icon size={23} />

                    <h3>{title}</h3>

                    <p>{text}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="about-ref-business">
          <div className="draa-corp-shell">
            <div className="about-ref-business-intro">
              <span className="about-ref-label">WHY DRAA EXISTS</span>
              <h2>Turning education challenges into connected solutions.</h2>
              <p>
                DRAA brings research, delivery and technology into one practical
                model—helping people and institutions move from fragmented needs
                to purposeful learning outcomes.
              </p>
            </div>
            <div className="about-ref-challenge-list">
              {educationChallenges.map(([Icon, title, text], index) => {
                const ChallengeIcon = Icon as typeof BookOpen;
                return (
                  <article key={String(title)}>
                    <b>0{index + 1}</b>
                    <ChallengeIcon size={19} />
                    <span>
                      <strong>{String(title)}</strong>
                      <small>{String(text)}</small>
                    </span>
                  </article>
                );
              })}
            </div>
            <div className="about-ref-streams">
              <div>
                <span className="about-ref-label">HOW WE CREATE VALUE</span>
                <h2>Four connected engagement streams.</h2>
              </div>
              <div>
                {engagementStreams.map(([Icon, title, text]) => {
                  const StreamIcon = Icon as typeof BookOpen;
                  return (
                    <article key={String(title)}>
                      <StreamIcon size={21} />
                      <h3>{String(title)}</h3>
                      <p>{String(text)}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="about-ref-services">
          <div className="draa-corp-shell">
            <span className="about-ref-label">WHAT WE DO</span>
            <div className="about-ref-service-grid">
              {services.map(
                ({ icon: Icon, title, text, image, href, external }) => {
                  const cardContent = (
                    <>
                      <img src={image} alt="" loading="lazy" />
                      <div>
                        <span>
                          <Icon size={15} />
                          {title}
                        </span>
                        <p>{text}</p>
                        <ArrowRight size={15} />
                      </div>
                    </>
                  );
                  return external ? (
                    <a
                      href={studyIndiaPortalUrl}
                      target="_blank"
                      rel="noreferrer"
                      key={title}
                    >
                      {cardContent}
                    </a>
                  ) : (
                    <Link to={href} key={title}>
                      {cardContent}
                    </Link>
                  );
                },
              )}
            </div>
          </div>
        </section>

        <section id="about-process" className="about-ref-process-impact">
          <div className="draa-corp-shell">
            <div className="about-ref-process">
              <span className="about-ref-label">HOW WE WORK</span>
              <div>
                {process.map(([Icon, title, text], index) => {
                  const StepIcon = Icon as typeof Search;
                  return (
                    <article key={String(title)}>
                      <span>
                        <StepIcon size={17} />
                      </span>
                      <strong>{String(title)}</strong>
                      <small>{String(text)}</small>
                      {index < process.length - 1 && (
                        <i>
                          <ArrowRight size={13} />
                        </i>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
            <div className="about-ref-impact">
              <span className="about-ref-label">IMPACT IN ACTION</span>
              <div>
                <article>
                  <img
                    src="/brand/corporate/stock/classroom.jpg"
                    alt="Classroom learning"
                  />
                  <span>Learning</span>
                </article>
                <article>
                  <img
                    src="/brand/corporate/stock/event-networking.jpg"
                    alt="Education collaboration"
                  />
                  <span>Collaboration</span>
                </article>
                <article>
                  <img
                    src="/brand/corporate/stock/event-hero.jpg"
                    alt="Education event"
                  />
                  <span>Ideas</span>
                </article>
                <article>
                  <img
                    src="/brand/corporate/stock/digital-team-workshop.jpg"
                    alt="Digital delivery team"
                  />
                  <span>Innovation</span>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className="about-ref-final">
          <div className="draa-corp-shell">
            <div className="about-ref-final-mark">
              <img src="/brand/draa-mark.png" alt="" />
              <i />
              <i />
            </div>
            <h2>
              Let’s build meaningful
              <br />
              <em>change together.</em>
            </h2>
            <p>
              Whether you’re an institution, enterprise or public body, we would
              welcome the opportunity to explore what we can create together.
            </p>
            <Link to="/contact">
              Start a conversation <ArrowRight size={15} />
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
