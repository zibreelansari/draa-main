import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import './DraaHero.css';

interface DraaHeroProps {
  language?: 'en' | 'hi';
}

export default function DraaHero({ language = 'en' }: DraaHeroProps) {
  const isHindi = language === 'hi';
  const copy = isHindi
    ? {
        eyebrow: 'गंभीर अभ्यर्थियों के लिए बनाया गया',
        kicker: 'लक्ष्य स्पष्ट • तैयारी सुव्यवस्थित • प्रगति निरंतर',
        headline: 'सही दिशा में तैयारी।',
        headlineAccent: 'चयन की ओर प्रगति।',
        description:
          'पहली अवधारणा से अंतिम मॉक टेस्ट तक—विशेषज्ञ कोर्स, विश्वसनीय पुस्तकें और परीक्षा-केंद्रित अभ्यास एक ही मंच पर, ताकि आपका हर अध्ययन सत्र आपको चयन के और निकट ले जाए।',
        primaryAction: 'आज से तैयारी शुरू करें',
        secondaryAction: 'अध्ययन सामग्री देखें',
        proof: [
          { value: '50+', label: 'परीक्षा श्रेणियाँ' },
          { value: 'विशेषज्ञ-निर्देशित', label: 'कोर्स और मार्गदर्शन' },
          { value: 'स्मार्ट अभ्यास', label: 'मॉक टेस्ट और विश्लेषण' },
        ],
        tagline: 'आपका लक्ष्य। आपकी तैयारी। DRAA की सही दिशा।',
      }
    : {
        eyebrow: 'Designed for serious aspirants',
        kicker: 'CLEAR GOALS • STRUCTURED PREPARATION • STEADY PROGRESS',
        headline: 'Prepare with direction.',
        headlineAccent: 'Progress towards selection.',
        description:
          'From the first concept to the final mock test, access expert-led courses, trusted books and exam-focused practice in one place—so every study session moves you closer to selection.',
        primaryAction: 'Start your preparation',
        secondaryAction: 'Explore study material',
        proof: [
          { value: '50+', label: 'Exam categories' },
          { value: 'Expert-led', label: 'Courses and guidance' },
          { value: 'Practice-first', label: 'Tests and analysis' },
        ],
        tagline: 'Your goal. Your preparation. The right direction.',
      };

  return (
    <section
      className={`draa-hero ${isHindi ? 'draa-hero--hi' : 'draa-hero--en'}`}
      aria-labelledby="draa-hero-title"
      lang={language}
    >
      <div className="draa-hero-glow draa-hero-glow-one" />
      <div className="draa-hero-glow draa-hero-glow-two" />

      <div className="container draa-hero-inner">
        <div className="draa-hero-copy">
          <div className="draa-hero-eyebrow">
            <Sparkles size={15} />
            <span>{copy.eyebrow}</span>
          </div>

          <p className="draa-hero-kicker">{copy.kicker}</p>
          <h1 id="draa-hero-title">
            {copy.headline}
            <span>{copy.headlineAccent}</span>
          </h1>
          <p className="draa-hero-description">{copy.description}</p>

          <div className="draa-hero-actions">
            <Link to="/courses" className="draa-hero-primary">
              {copy.primaryAction} <ArrowRight size={18} />
            </Link>
            <Link to="/all-books" className="draa-hero-secondary">
              <BookOpen size={18} /> {copy.secondaryAction}
            </Link>
          </div>

          <div className="draa-hero-proof" aria-label="Draa learning benefits">
            <div>
              <strong>{copy.proof[0].value}</strong>
              <span>{copy.proof[0].label}</span>
            </div>
            <i />
            <div>
              <strong>{copy.proof[1].value}</strong>
              <span>{copy.proof[1].label}</span>
            </div>
            <i />
            <div>
              <strong>{copy.proof[2].value}</strong>
              <span>{copy.proof[2].label}</span>
            </div>
          </div>
        </div>

        <div className="draa-hero-brand-card" aria-label="Draa">
          <div className="draa-hero-card-grid" />
          <span className="draa-hero-orbit draa-hero-orbit-one" />
          <span className="draa-hero-orbit draa-hero-orbit-two" />
          <div className="draa-hero-logo-wrap">
            <img src="/brand/draa-mark.png" alt="Draa logo" />
          </div>
          <div className="draa-hero-wordmark">DRAA</div>
          <p>{copy.tagline}</p>
        </div>
      </div>
    </section>
  );
}
