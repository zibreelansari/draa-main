import React from'react';
import { Headphones, MessageSquare, PhoneCall, ArrowRight } from'lucide-react';
import'./NeedHelp.css';

const NeedHelp: React.FC = () => {
  const helpOptions = [
    {
      icon: <Headphones size={24} color="#bd7b20" />,
      title:"24×7 Customer Support",
      description:"Get assistance anytime, day or night.",
      linkText:"Contact Us",
      linkUrl:"/contact"
    },
    {
      icon: <MessageSquare size={24} color="#bd7b20" />,
      title:"Chat with Us Instantly",
      description:"Quick answers to your questions on WhatsApp.",
      linkText:"Chat on WhatsApp",
      linkUrl:"https://wa.me/80760 03728"
    },
    {
      icon: <PhoneCall size={24} color="#bd7b20" />,
      title:"Call for Purchase Queries",
      description:"Talk to our team directly.",
      subDesc:"MonSun | 7:00 AM  11:00 PM",
      linkText:"Call Now",
      linkUrl:"tel:+91 8076003728"
    }
  ];

  return (
    <section className="need-help-section">
      <div className="container">
        
        {/* HEADER CLONE */}
        <div className="help-header">
          <h2 className="help-main-title">Built for Serious Exam Aspirants</h2>
          <p className="help-sub-text">
            Experience a platform designed to streamline your preparation with precision-engineered 
            resources and expert-led insights.
          </p>
        </div>

        {/* HELP CARDS GRID */}
        <div className="help-grid">
          {helpOptions.map((item, index) => (
            <div key={index} className="help-card-figma">
              <div className="help-icon-wrapper">
                {item.icon}
              </div>
              
              <div className="help-card-body">
                <h3 className="help-card-title">{item.title}</h3>
                <p className="help-card-desc">{item.description}</p>
                {item.subDesc && <p className="help-card-timing">{item.subDesc}</p>}
                
                <a href={item.linkUrl} className="help-action-link">
                  {item.linkText} <ArrowRight size={18} />
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default NeedHelp;