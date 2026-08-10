import React from'react';
import { motion } from'framer-motion';
import { Link, useNavigate } from'react-router-dom';
import { Search, ArrowLeft, LucideIcon, BookOpen, Layers, Zap, Star, Layout } from'lucide-react';
import'./StylishEmptyState.css';

interface StylishEmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionText?: string;
  actionPath?: string;
  onAction?: () => void;
  onBack?: () => void;
  showBack?: boolean;
  image?: string;
  is404?: boolean;
}

const StylishEmptyState: React.FC<StylishEmptyStateProps> = ({
  title ="No Data Found",
  description ="We couldn't find what you're looking for. It might have been moved or renamed.",
  icon: Icon,
  actionText ="Browse All",
  actionPath,
  onAction,
  onBack,
  showBack = true,
  image,
  is404 = false,
}) => {
  const navigate = useNavigate();

  // Common links for 404/Empty states to help users navigate
  const suggestedLinks = [
    { name:"Browse Books", path:"/all-books", icon: BookOpen },
    { name:"Test Series", path:"/online-test-series", icon: Zap },
    { name:"Free Resources", path:"/free-resources", icon: Layers },
    { name:"Success Stories", path:"/success-stories", icon: Star },
  ];

  return (
    <div className="ed-empty-shell">
      <div className="ed-404-container">
        
        {/* LEFT SECTION: VISUAL HERO */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease:"easeOut" }}
          className="ed-404-visual-section"
        >
          {is404 && <div className="ed-404-watermark">404</div>}
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 2, 0]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              ease:"easeInOut" 
            }}
            className={image || (!image && !Icon) ?"ed-empty-image-wrap" :"ed-empty-icon-wrap"}
          >
            {image || (!image && !Icon) ? (
              <img 
                src={image ||"/assets/img/404.svg"} 
                alt={title} 
              />
            ) : (
              Icon && <Icon size={72} strokeWidth={1.5} className="ed-empty-main-icon" />
            )}
          </motion.div>
        </motion.div>

        {/* RIGHT SECTION: CONTENT */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease:"easeOut", delay: 0.2 }}
          className="ed-404-content-section"
        >
          <div className="ed-404-badge">{is404 ?"Error 404" :"Empty State"}</div>
          <h1 className="ed-empty-title">{title}</h1>
          <p className="ed-empty-text">{description}</p>
          
          <div className="ed-empty-actions">
            {onAction ? (
              <button onClick={onAction} className="ed-btn-primary-stylish">
                <ArrowLeft size={20} />
                <span>{actionText}</span>
              </button>
            ) : actionPath ? (
              <Link to={actionPath} className="ed-btn-primary-stylish">
                <ArrowLeft size={20} />
                <span>{actionText}</span>
              </Link>
            ) : (
              <Link to="/" className="ed-btn-primary-stylish">
                <Layout size={20} />
                <span>Back to Home</span>
              </Link>
            )}
            {showBack && (
              <button onClick={onBack || (() => navigate(-1))} className="ed-btn-outline-stylish">
                Go Back
              </button>
            )}
          </div>

          <div className="ed-404-suggestions">
            <h4>{is404 ?"Maybe you were looking for?" :"Quick Links"}</h4>
            <div className="ed-links-grid">
              {suggestedLinks.map((link, index) => (
                <Link key={index} to={link.path} className="ed-suggested-link">
                  <link.icon size={18} />
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

      </div>

      <div className="ed-404-bg-shapes">
        <div className="shape-1" />
        <div className="shape-2" />
      </div>
    </div>
  );
};

export default StylishEmptyState;
