import React, { useState, useEffect, useCallback } from'react';
import { X, ChevronLeft, ChevronRight, Calendar, Eye, FileText, Newspaper, ArrowLeft, ArrowRight } from'lucide-react';
import url, { BACKEND_UPLOAD_URL } from'../../url';
import'./caReader.css';

interface CAReaderModalProps {
  open: boolean;
  onClose: () => void;
  items: any[];
  startIndex: number;
}

const CAReaderModal: React.FC<CAReaderModalProps> = ({ open, onClose, items, startIndex }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [currentSlide, setCurrentSlide] = useState(0);

  const item = items[currentIndex];

  // Build slides for CURRENT post: content  pdf  ppt
  interface Slide {
    type: string;
    label: string;
  }
  const slides: Slide[] = [];
  if (item?.content) slides.push({ type:'content', label:' Article' });
  if (item?.pdfFile) slides.push({ type:'pdf', label:' PDF' });
  if (item?.pptFile) slides.push({ type:'ppt', label:' Presentation' });
  if (slides.length === 0) slides.push({ type:'empty', label:'Info' });

  // Navigation between SLIDES (within a post)
  const goNextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else if (currentIndex < items.length - 1) {
      // Auto-advance to NEXT POST if at last slide
      setCurrentIndex(prev => prev + 1);
      setCurrentSlide(0);
    }
  }, [currentSlide, slides.length, currentIndex, items.length]);

  const goPrevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    } else if (currentIndex > 0) {
      // Auto-retreat to PREVIOUS POST if at first slide
      const prevIdx = currentIndex - 1;
      const prevItem = items[prevIdx];
      const prevSlidesCount = (prevItem.content ? 1 : 0) + (prevItem.pdfFile ? 1 : 0) + (prevItem.pptFile ? 1 : 0);
      setCurrentIndex(prevIdx);
      setCurrentSlide(Math.max(0, prevSlidesCount - 1));
    }
  }, [currentSlide, currentIndex, items]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key ==='ArrowRight') goNextSlide();
      if (e.key ==='ArrowLeft') goPrevSlide();
      if (e.key ==='Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, goNextSlide, goPrevSlide, onClose]);

  if (!open || !item) return null;

  const currentType = slides[currentSlide]?.type;
  const rawPdfUrl = item?.pdfFile ? `${BACKEND_UPLOAD_URL}${item.pdfFile}` :'';
  const rawPptUrl = item?.pptFile ? `${BACKEND_UPLOAD_URL}${item.pptFile}` :'';

  return (
    <div className="ca-modal-overlay" onClick={onClose}>
      
      {/*  Inter-Post Controls (Floating)  */}
      <button 
        className="ca-post-nav-btn prev" 
        onClick={(e) => { e.stopPropagation(); if (currentIndex > 0) { setCurrentIndex(v => v - 1); setCurrentSlide(0); } }}
        disabled={currentIndex === 0}
      >
        <ArrowLeft size={20} />
        <span>Prev Post</span>
      </button>

      <div className="ca-modal-shell" onClick={(e) => e.stopPropagation()}>

        {/*  Story Header  */}
        <div className="ca-modal-header">
          <div className="ca-modal-meta">
            <div className="ca-modal-avatar">
              {item.type?.charAt(0) ||'CA'}
            </div>
            <div>
              <p className="ca-modal-title-text">{item.title}</p>
              <p className="ca-modal-sub-text">
                <Calendar size={11} />
                {item.publishDate
                  ? new Date(item.publishDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
                  :'Recent'}
                &nbsp;·&nbsp;
                <Eye size={11} /> {item.views || 0} views
              </p>
            </div>
          </div>
          <button className="ca-modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/*  Progress Bars (Combined Post + Slide indicators)  */}
        <div className="ca-progress-container">
          {/* Post indicator */}
          <p className="ca-post-indicator">Post {currentIndex + 1} of {items.length}</p>
          
          <div className="ca-progress-bar-row">
            {slides.map((_, i) => (
              <div key={i} className="ca-progress-bar">
                <div className={`ca-progress-fill ${i < currentSlide ?'done' : i === currentSlide ?'active' :''}`} />
              </div>
            ))}
          </div>
        </div>

        {/*  Slide Tabs  */}
        {slides.length > 1 && (
          <div className="ca-slide-tabs">
            {slides.map((s, i) => (
              <button
                key={i}
                className={`ca-slide-tab ${i === currentSlide ?'active' :''}`}
                onClick={() => setCurrentSlide(i)}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/*  Slide Content  */}
        <div className="ca-modal-body">

          {/* Article / Rich Content */}
          {currentType ==='content' && (
            <div className="ca-ck-content">
              <div dangerouslySetInnerHTML={{ __html: item.content }} />
            </div>
          )}

          {/* PDF Viewer  View only, no download via #toolbar=0 */}
          {currentType ==='pdf' && rawPdfUrl && (
            <div className="ca-pdf-viewer">
              <iframe
                src={`${rawPdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                title="PDF Viewer"
                style={{ width:'100%', height:'100%', border:'none' }}
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          )}

          {/* PPT Viewer  via Google Docs embed (view only) */}
          {currentType ==='ppt' && rawPptUrl && (
            <div className="ca-pdf-viewer">
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(`https://draa.in${rawPptUrl}`)}&embedded=true`}
                title="PPT Viewer"
                style={{ width:'100%', height:'100%', border:'none' }}
              />
              <p className="ca-ppt-note"> Presentation (View Only)</p>
            </div>
          )}

          {/* Empty fallback */}
          {currentType ==='empty' && (
            <div className="ca-modal-empty">
              <Newspaper size={48} strokeWidth={1} />
              <p>No text content available.</p>
            </div>
          )}

          {/* Invisible click areas for IG-style navigation */}
          <div className="ca-nav-touch-left" onClick={goPrevSlide} />
          <div className="ca-nav-touch-right" onClick={goNextSlide} />
        </div>


        {/*  Footer Tags  */}
        {item.tags && item.tags.length > 0 && (
          <div className="ca-modal-tags">
            {item.tags.slice(0, 5).map((tag: string, i: number) => (
              <span key={i} className="ca-modal-tag">#{tag}</span>
            ))}
          </div>
        )}

      </div>

      <button 
        className="ca-post-nav-btn next" 
        onClick={(e) => { e.stopPropagation(); if (currentIndex < items.length - 1) { setCurrentIndex(v => v + 1); setCurrentSlide(0); } }}
        disabled={currentIndex === items.length - 1}
      >
        <span>Next Post</span>
        <ArrowRight size={20} />
      </button>

      {/*  Slide Arrows (Overlay Level)  */}
      <button className="ca-arrow ca-arrow-left" onClick={(e) => { e.stopPropagation(); goPrevSlide(); }} disabled={currentIndex === 0 && currentSlide === 0}>
        <ChevronLeft size={22} />
      </button>
      <button className="ca-arrow ca-arrow-right" onClick={(e) => { e.stopPropagation(); goNextSlide(); }} disabled={currentIndex === items.length - 1 && currentSlide === slides.length - 1}>
        <ChevronRight size={22} />
      </button>

    </div>
  );
};

export default CAReaderModal;
