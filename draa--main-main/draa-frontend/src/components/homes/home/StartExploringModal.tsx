import React from'react';
import { motion, AnimatePresence } from'framer-motion';
import { 
  X, BookOpen, ClipboardList, Book, 
  Sparkles, LayoutGrid, ArrowRight 
} from'lucide-react';
import { useNavigate } from'react-router-dom';

interface StartExploringModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StartExploringModal: React.FC<StartExploringModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const options = [
    {
      title:"Online Courses",
      desc:"Live classes by top educators",
      icon: <BookOpen size={24} />,
      url:"/courses",
      color:"#bd7b20"
    },
    {
      title:"Test Series",
      desc:"Practice with realistic mocks",
      icon: <ClipboardList size={24} />,
      url:"/online-test-series",
      color:"#10b981"
    },
    {
      title:"E-Books & Books",
      desc:"Comprehensive study material",
      icon: <Book size={24} />,
      url:"/all-books",
      color:"#f59e0b"
    },
    {
      title:"Free Resources",
      desc:"PDFs, PYQs & more",
      icon: <Sparkles size={24} />,
      url:"/free-resources",
      color:"#66735b"
    },
    {
      title:"Exams Guide",
      desc:"Details for all exams",
      icon: <LayoutGrid size={24} />,
      url:"/exams-page",
      color:"#ef4444"
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="miui-modal-wrapper">
          <motion.div 
            className="miui-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div 
            className="miui-modal-content"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type:"spring", damping: 25, stiffness: 300 }}
          >
            <button className="miui-modal-close" onClick={onClose}>
              <X size={20} />
            </button>

            <div className="miui-modal-header">
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                What are you looking for today?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Choose your learning path and start preparing.
              </motion.p>
            </div>

            <div className="exploration-grid">
              {options.map((option, index) => (
                <motion.div
                  key={option.title}
                  className="exploration-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  onClick={() => {
                    onClose();
                    navigate(option.url);
                  }}
                  whileHover={{ y: -5, boxShadow:"0 12px 30px rgba(0,0,0,0.08)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="card-icon-wrap" style={{ backgroundColor: `${option.color}15`, color: option.color }}>
                    {option.icon}
                  </div>
                  <div className="card-text">
                    <h3>{option.title}</h3>
                    <p>{option.desc}</p>
                  </div>
                  <div className="card-arrow">
                    <ArrowRight size={18} />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="miui-modal-footer">
              <p>© Draa Excellence Ecosystem</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default StartExploringModal;
