import {
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarCheck2,
  CheckCircle2,
  Code2,
  Compass,
  GraduationCap,
  Handshake,
  HeartHandshake,
  Lightbulb,
  MessageCircleMore,
  PenTool,
  SearchCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import DraaCorporateFooter from "./DraaCorporateFooter";
import DraaCorporateHeader from "./DraaCorporateHeader";
import SEO from "./SEO";
import ScrollToTop from "./ScrollToTop";
import ScrollTop from "./ScrollTop";
import "./DraaCorporateHome.css";
import "./CareersPage.css";

const disciplines = [
  {
    icon: PenTool,
    title: "Academic content & curriculum",
    text: "Writers, editors, subject experts and curriculum professionals who turn research into useful learning.",
  },
  {
    icon: GraduationCap,
    title: "Learning & facilitation",
    text: "Educators, trainers and programme leads who make professional learning practical and participatory.",
  },
  {
    icon: CalendarCheck2,
    title: "Events & partnerships",
    text: "Programme, speaker, sponsorship and community professionals who bring knowledge-sharing platforms to life.",
  },
  {
    icon: Compass,
    title: "Advisory & research",
    text: "Researchers and consultants who help institutions make confident, evidence-informed decisions.",
  },
  {
    icon: Code2,
    title: "Digital products & development",
    text: "Designers, developers and learning technologists who build accessible websites, apps, platforms and tools.",
  },
  {
    icon: Handshake,
    title: "Operations & client success",
    text: "Coordinators and relationship professionals who keep delivery clear, accountable and people-centred.",
  },
];

const principles = [
  [Lightbulb, "Purpose in the work", "Every brief begins with a real education or capability need."],
  [UsersRound, "One multidisciplinary team", "Content, learning, advisory, events and technology work together."],
  [CheckCircle2, "Ownership with standards", "We value dependable delivery, thoughtful detail and honest communication."],
  [Sparkles, "Learning as a habit", "Curiosity, reflection and stronger practice are part of how we grow."],
];

const hiringSteps = [
  [SearchCheck, "Profile review", "We consider your experience, work samples and alignment with the opportunity."],
  [MessageCircleMore, "Focused conversation", "A practical discussion about your interests, strengths and the work."],
  [BookOpenCheck, "Capability discussion", "Some opportunities may include a short role-relevant exercise or portfolio review."],
  [HeartHandshake, "Decision & onboarding", "Selected candidates receive clear next steps, expectations and joining support."],
];

export default function CareersPage() {
  return (
    <div className="draa-corp careers-page">
      <SEO
        title="Careers at DRAA"
        siteName="DRAA"
        description="Explore career pathways with DRAA across educational content, training, events, advisory, digital products and programme delivery."
        ogImage="/brand/corporate/home-collaboration-v2.png"
      />
      <DraaCorporateHeader />
      <main>
        <section className="careers-hero">
          <div className="careers-hero-glow" aria-hidden="true" />
          <div className="draa-corp-shell careers-hero-grid">
            <div className="careers-hero-copy">
              <span className="careers-eyebrow">CAREERS AT DRAA</span>
              <h1>
                Build work that helps
                <span>learning move forward</span>
              </h1>
              <p>
                Join a purpose-led education services company where research,
                content, training, events, advisory and technology come together
                to solve meaningful learning challenges.
              </p>
              <div className="careers-hero-actions">
                <Link to="/contact?subject=Career%20Expression%20of%20Interest">
                  Share your profile <ArrowRight size={16} />
                </Link>
                <a href="#career-pathways">Explore career pathways</a>
              </div>
              <div className="careers-hero-note">
                <BriefcaseBusiness size={18} />
                <span>
                  <strong>Open to thoughtful specialists and collaborators</strong>
                  <small>Permanent, project and consulting opportunities may be published as needs arise.</small>
                </span>
              </div>
            </div>

            <div className="careers-hero-media">
              <img
                src="/brand/corporate/home-collaboration-v2.png"
                alt="A collaborative education and technology team working together"
              />
              <div className="careers-media-wash" />
              <div className="careers-orbit" aria-hidden="true">
                <i />
                <i />
                <span><img src="/brand/draa-mark.png" alt="" /></span>
              </div>
              <div className="careers-media-card careers-media-card--one">
                <PenTool size={18} />
                <span><strong>Create</strong><small>useful knowledge</small></span>
              </div>
              <div className="careers-media-card careers-media-card--two">
                <UsersRound size={18} />
                <span><strong>Collaborate</strong><small>across disciplines</small></span>
              </div>
              <div className="careers-media-card careers-media-card--three">
                <Sparkles size={18} />
                <span><strong>Grow</strong><small>through real work</small></span>
              </div>
            </div>
          </div>
        </section>

        <section className="careers-principles">
          <div className="draa-corp-shell">
            <div className="careers-section-intro">
              <span>HOW WE WORK</span>
              <h2>Professional standards — Human collaboration</h2>
              <p>
                DRAA was established in New Delhi in 2023 with a focus on
                education services and knowledge management. Our work is
                outcome-led, multidisciplinary and grounded in practical value.
              </p>
            </div>
            <div className="careers-principle-grid">
              {principles.map(([Icon, title, text]) => {
                const PrincipleIcon = Icon as typeof Lightbulb;
                return (
                  <article key={String(title)}>
                    <PrincipleIcon size={21} />
                    <strong>{String(title)}</strong>
                    <p>{String(text)}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="career-pathways" className="careers-pathways">
          <div className="draa-corp-shell">
            <div className="careers-pathway-heading">
              <div>
                <span>WHERE YOU CAN CONTRIBUTE</span>
                <h2>Many disciplines — One education mission</h2>
              </div>
              <p>
                Our work calls for different kinds of expertise. These are the
                professional areas most closely connected to DRAA&apos;s services.
              </p>
            </div>
            <div className="careers-pathway-grid">
              {disciplines.map(({ icon: Icon, title, text }) => (
                <article key={title}>
                  <Icon size={23} />
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="careers-opportunities">
          <div className="draa-corp-shell careers-opportunities-grid">
            <div className="careers-opportunity-copy">
              <span>CURRENT OPPORTUNITIES</span>
              <h2>We are building our talent network</h2>
              <p>
                No specific vacancies are published on the website at this time.
                If your experience aligns with our work, you are welcome to send
                a concise profile and portfolio for future consideration.
              </p>
              <Link to="/contact?subject=Career%20Expression%20of%20Interest">
                Submit an expression of interest <ArrowRight size={16} />
              </Link>
              <small>
                Submitting a profile does not guarantee an interview or role. We
                will contact you when a relevant opportunity is available.
              </small>
            </div>
            <div className="careers-role-board">
              <div>
                <span><i /> Talent network</span>
                <strong>Future opportunities</strong>
                <small>New Delhi · Project, consulting and full-time needs</small>
              </div>
              {["Education & content", "Training & programmes", "Technology & digital", "Partnerships & operations"].map((item) => (
                <p key={item}><CheckCircle2 size={16} /> {item}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="careers-process">
          <div className="draa-corp-shell">
            <div className="careers-section-intro">
              <span>A CLEAR CANDIDATE JOURNEY</span>
              <h2>What to expect when an opportunity matches</h2>
            </div>
            <div className="careers-process-grid">
              {hiringSteps.map(([Icon, title, text]) => {
                const StepIcon = Icon as typeof SearchCheck;
                return (
                  <article key={String(title)}>
                    <span><StepIcon size={20} /></span>
                    <h3>{String(title)}</h3>
                    <p>{String(text)}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="careers-final">
          <div className="draa-corp-shell">
            <div>
              <span>BRING YOUR PERSPECTIVE</span>
              <h2>Help us create knowledge that makes a difference</h2>
            </div>
            <p>
              We welcome interest from people with varied backgrounds and
              evaluate profiles against the needs, standards and responsibilities
              of each opportunity.
            </p>
            <Link to="/contact?subject=Career%20Expression%20of%20Interest">
              Introduce yourself <ArrowRight size={16} />
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
