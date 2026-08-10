import React, { useEffect, useState } from'react';
import { Link } from'react-router-dom';
import { ChevronUp } from'lucide-react';
import url from'../../url';
import'./DynamicFooter.css';

interface FooterLink {
  _id: string;
  label: string;
  url: string;
  linkType:'internal' |'external' |'topic';
  isActive: boolean;
}

interface FooterSection {
  _id: string;
  title: string;
  isActive: boolean;
  links: FooterLink[];
}

const VISIBLE_LIMIT = 4;

const DynamicFooter: React.FC = () => {
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const response = await fetch(`${url}/admin/footer`);
        const data = await response.json();
        if (data.success) {
          setSections(data.data.filter((s: FooterSection) => s.isActive));
        }
      } catch (error) {
        console.error('Failed to fetch dynamic footer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  if (loading || sections.length === 0) return null;

  const toggleSection = (id: string) => {
    setExpandedMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="dynamic-footer-wrapper">
      <div className="container">
        <div className="dynamic-footer-grid">
          {sections.map((section) => {
            const activeLinks = section.links
              .filter(link => link.isActive)
              .sort((a, b) => a.order - b.order);

            const isExpanded = !!expandedMap[section._id];
            const visibleLinks = isExpanded ? activeLinks : activeLinks.slice(0, VISIBLE_LIMIT);
            const hiddenCount = activeLinks.length - VISIBLE_LIMIT;

            return (
              <div key={section._id} className="dynamic-footer-col">
                <h4 className="dynamic-footer-title">{section.title}</h4>
                <ul className="dynamic-footer-list">
                  {visibleLinks.map(link => {
                    let destination = link.url;

                    if (link.linkType ==='topic') {
                      destination = `/explore/${encodeURIComponent(link.url)}`;
                    }

                    return (
                      <li key={link._id}>
                        {link.linkType ==='external' ? (
                          <a href={destination} target="_blank" rel="noopener noreferrer">
                            {link.label}
                          </a>
                        ) : (
                          <Link to={destination}>{link.label}</Link>
                        )}
                      </li>
                    );
                  })}

                  {!isExpanded && hiddenCount > 0 && (
                    <li>
                      <button
                        className="df-toggle"
                        onClick={() => toggleSection(section._id)}
                      >
                        More ({hiddenCount}) <ChevronUp size={12} />
                      </button>
                    </li>
                  )}

                  {isExpanded && hiddenCount > 0 && (
                    <li>
                      <button
                        className={`df-toggle expanded`}
                        onClick={() => toggleSection(section._id)}
                      >
                        Show less <ChevronUp size={12} />
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Developer Credits */}
        <div className="dynamic-footer-credits-container">
          <div className="dynamic-footer-credits-badge">
            <span>Design &amp; Developed with</span>
            <span className="heart-icon">❤️</span>
            <span>by</span>
            <a href="https://staticconsultancy.com" target="_blank" rel="noopener noreferrer" className="dynamic-footer-credits-link">
              Static Consultancy LLP
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicFooter;