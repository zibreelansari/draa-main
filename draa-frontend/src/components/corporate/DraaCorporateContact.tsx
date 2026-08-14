import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Handshake,
  Landmark,
  Laptop2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import DraaCorporateFooter from "./DraaCorporateFooter";
import DraaCorporateHeader from "./DraaCorporateHeader";
import SEO from "./SEO";
import ScrollToTop from "./ScrollToTop";
import ScrollTop from "./ScrollTop";
import "./DraaCorporateHome.css";
import "./ContactPage.css";

type FormStatus = { type: "idle" | "success"; message?: string };
const interests = [
  [BookOpen, "Content development"],
  [GraduationCap, "Training & capacity building"],
  [Laptop2, "Digital experiences"],
  [CalendarClock, "Events & conferences"],
  [Landmark, "Advisory solutions"],
  [Building2, "Learning programmes"],
  [MapPin, "Study in India guidance"],
  [Handshake, "Partnerships"],
];

export default function DraaCorporateContact() {
  const [searchParams] = useSearchParams();
  const requestedSubject = useMemo(
    () => searchParams.get("subject") || "",
    [searchParams],
  );
  const [status, setStatus] = useState<FormStatus>({ type: "idle" });
  const submitEnquiry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const interestsSelected = data.getAll("interest").join(", ");
    const subject = String(
      data.get("subject") || interestsSelected || "DRAA website enquiry",
    );
    const body = [
      `Name: ${data.get("name")}`,
      `Organisation: ${data.get("organisation") || "Not provided"}`,
      `Email: ${data.get("email")}`,
      `Phone: ${data.get("phone") || "Not provided"}`,
      `Interests: ${interestsSelected || "Not specified"}`,
      "",
      String(data.get("message") || ""),
    ].join("\n");
    window.location.href = `mailto:admin@draa.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus({
      type: "success",
      message:
        "Your email application has opened with the enquiry details prepared.",
    });
  };
  return (
    <div className="draa-corp contact-editorial">
      <SEO
        title="Contact DRAA"
        siteName="DRAA"
        description="Connect with DRAA for education services, institutional partnerships, learning programmes, events and Study in India guidance."
        ogImage="/brand/draa-mark.png"
      />
      <DraaCorporateHeader />
      <main>
        <section className="contact-ed-hero">
          <div className="draa-corp-shell contact-ed-hero-grid">
            <div>
              <span>We’re here to listen and help.</span>
              <h1>
                Let’s create meaningful
                <br />
                impact <em>together.</em>
              </h1>
              <p>
                Have a question, idea or partnership in mind? Reach out and
                let’s start a focused conversation.
              </p>
            </div>
            <div className="contact-ed-graphic" aria-label="Connect with DRAA">
              <span className="contact-bubble bubble-one">
                Let’s
                <br />
                Connect
              </span>
              <span className="contact-bubble bubble-two">
                <MessageCircle size={37} />
              </span>
              <span className="contact-bubble bubble-three">
                <Mail size={43} />
              </span>
              <span className="contact-bubble bubble-four">
                <Phone size={38} />
              </span>
              <div>
                <img src="/brand/draa-mark.png" alt="DRAA" />
              </div>
              <i />
              <i />
              <i />
            </div>
          </div>
        </section>

        <section className="contact-ed-main">
          <div className="draa-corp-shell contact-ed-grid">
            <section className="contact-ed-form-card">
              <div>
                <span>Send us an inquiry</span>
                <h2>Tell us what you want to achieve.</h2>
                <p>
                  Fill in the details and our team will get back to you shortly.
                </p>
              </div>
              {status.type === "success" ? (
                <div className="contact-ed-success">
                  <CheckCircle2 size={38} />
                  <h3>Email prepared</h3>
                  <p>{status.message}</p>
                  <button onClick={() => setStatus({ type: "idle" })}>
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <form id="contact-form" onSubmit={submitEnquiry}>
                  <div className="contact-ed-form-row">
                    <label>
                      Full name *
                      <input
                        name="name"
                        required
                        placeholder="Enter your full name"
                      />
                    </label>
                    <label>
                      Work email *
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="name@organisation.com"
                      />
                    </label>
                  </div>
                  <div className="contact-ed-form-row">
                    <label>
                      Phone number
                      <input
                        name="phone"
                        type="tel"
                        placeholder="+91 98710 84500"
                      />
                    </label>
                    <label>
                      Organisation
                      <input
                        name="organisation"
                        placeholder="Enter organisation name"
                      />
                    </label>
                  </div>
                  <div className="contact-ed-form-row">
                    <label>
                      Inquiry type
                      <select name="subject" defaultValue={requestedSubject}>
                        <option value="">Select inquiry type</option>
                        <option>Educational Content & Publishing</option>
                        <option>Professional Learning & Training</option>
                        <option>Educational Events</option>
                        <option>Institutional Advisory</option>
                        <option>Digital Learning Solutions</option>
                        <option>Website Development</option>
                        <option>Mobile App Development</option>
                        <option>LMS &amp; Learning Platforms</option>
                        <option>Institution Portals &amp; ERP</option>
                        <option>UI/UX &amp; Product Design</option>
                        <option>Cloud, Maintenance &amp; Support</option>
                        <option>Study in India Guidance</option>
                        <option>Partnership Opportunity</option>
                        <option value="Career Expression of Interest">Career Expression of Interest</option>
                      </select>
                    </label>
                    <label>
                      Your message *
                      <textarea
                        name="message"
                        required
                        rows={5}
                        placeholder="Tell us about your requirement..."
                      />
                    </label>
                  </div>
                  <button type="submit">
                    Send message <Send size={15} />
                  </button>
                  <small>Your information is secure and confidential.</small>
                </form>
              )}
            </section>

            <aside className="contact-ed-side">
              <section>
                <h2>What are you interested in?</h2>
                <p>Select all that apply to help us serve you better.</p>
                <div className="contact-interest-grid">
                  {interests.map(([Icon, text]) => {
                    const I = Icon as typeof BookOpen;
                    return (
                      <label key={String(text)}>
                        <I size={16} />
                        <span>{String(text)}</span>
                        <input
                          type="checkbox"
                          name="interest"
                          value={String(text)}
                          form="contact-form"
                        />
                      </label>
                    );
                  })}
                </div>
              </section>
              <section className="contact-channel-section">
                <h2>Connect with us</h2>
                <p>Choose the way that works best for you.</p>
                <div>
                  {[
                    [Phone, "Call us", "+91 11 4100 8450"],
                    [Mail, "Email us", "admin@draa.in"],
                    [MessageCircle, "WhatsApp", "+91 98710 84500"],
                    [
                      CalendarClock,
                      "Schedule a call",
                      "Book a convenient time",
                    ],
                  ].map(([Icon, title, text]) => {
                    const I = Icon as typeof Phone;
                    return (
                      <article key={String(title)}>
                        <I size={20} />
                        <strong>{String(title)}</strong>
                        <span>{String(text)}</span>
                        <small>Mon–Sat, 9:30 AM–6:30 PM</small>
                      </article>
                    );
                  })}
                </div>
              </section>
            </aside>
          </div>
        </section>

        <section className="contact-office-map">
          <div className="draa-corp-shell">
            <div>
              <MapPin size={20} />
              <span>
                <h2>Our office</h2>
                <strong>DRAA (OPC) Private Limited</strong>
                <p>
                  B-62, First Floor, Defence Colony,
                  <br />
                  New Delhi – 110024, India
                </p>
                <small>
                  <Clock3 size={13} /> Mon–Sat: 9:30 AM–6:30 PM IST
                </small>
              </span>
            </div>
            <div className="contact-map-real">
              <iframe
                title="DRAA office location in Defence Colony, New Delhi"
                src="https://www.google.com/maps?q=B-62%2C%20First%20Floor%2C%20Defence%20Colony%2C%20New%20Delhi%2C%20110024%2C%20India&z=15&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <a
                className="contact-map-label"
                href="https://www.google.com/maps/search/?api=1&query=B-62%2C%20Defence%20Colony%2C%20New%20Delhi%2C%20110024%2C%20India"
                target="_blank"
                rel="noreferrer"
                aria-label="Open DRAA office location in Google Maps"
              >
                <MapPin size={26} />
                <span>
                  <strong>DRAA (OPC) Private Limited</strong>
                  <small>B-62, Defence Colony · New Delhi 110024</small>
                </span>
              </a>
            </div>
          </div>
        </section>
        <section className="contact-faq">
          <div className="draa-corp-shell">
            <h2>Frequently asked questions</h2>
            {[
              "What is the typical response time?",
              "Can I schedule a meeting with your team?",
              "Do you offer customised solutions?",
              "Where are you located?",
            ].map((q) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>
                  Our team responds with the most useful next step based on your
                  requirement, audience and timeline.
                </p>
              </details>
            ))}
          </div>
        </section>
        <section className="contact-ed-cta">
          <div className="draa-corp-shell">
            <div>
              <h2>
                Let’s work together to create <em>lasting impact.</em>
              </h2>
              <p>
                Collaborate with DRAA to design solutions that educate, empower
                and create measurable change.
              </p>
            </div>
            <a href="mailto:admin@draa.in">
              Explore partnership opportunities <ArrowRight size={16} />
            </a>
          </div>
        </section>
      </main>
      <DraaCorporateFooter />
      <ScrollToTop />
      <ScrollTop />
    </div>
  );
}
