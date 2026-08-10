import React, { useState, useEffect, useRef } from'react';
import {
  Search, Calendar, Filter, Eye, Download,
  FileText, Clock, ChevronRight, Layout,
  ChevronLeft, ChevronRight as ChevRight, BookOpen, GraduationCap, X
} from'lucide-react';
import axios from'axios';
import url from'../../url';
import'../courses/CoursesArea.css';
import'./syllabus.css';
import PYQPreviewModal from'../pyqs/PYQPreviewModal';
import DownloadPopupModal from'../jobs/DownloadPopupModal';
import StylishEmptyState from'../common/StylishEmptyState';
import ShareButton from'../common/ShareButton';

const Syllabus = () => {
  const [loading, setLoading] = useState(true);
  const [syllabuses, setSyllabuses] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Filters State
  const [activeCategory, setActiveCategory] = useState('All Exams');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [preview, setPreview] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Lead Generation Modal State
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [downloadTarget, setDownloadTarget] = useState('');
  const [downloadTitle, setDownloadTitle] = useState('');

  const handleDownloadTrigger = (e: React.MouseEvent, urlPath: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDownloadTarget(urlPath);
    setDownloadTitle(title);
    setDownloadModalOpen(true);
  };

  // Category Slider
  const catSliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateCatScroll = () => {
    if (!catSliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = catSliderRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  const scrollCatSlider = (dir:'left' |'right') => {
    if (!catSliderRef.current) return;
    catSliderRef.current.scrollBy({ left: dir ==='right' ? 240 : -240, behavior:'smooth' });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${url}/syllabus/approved`);
        const data = response.data.syllabuses;
        setSyllabuses(data);

        // Extract unique categories dynamically
        const cats = ['All Exams', ...new Set(data.map((item: any) => item.examCategory))];
        setCategories(cats as string[]);
      } catch (err) {
        console.error("Error fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter Logic
  const filteredData = syllabuses.filter(item => {
    const matchesCat = activeCategory === 'All Exams' || item.examCategory === activeCategory;
    const matchesSearch = item.examName.toLowerCase().includes(searchQuery.toLowerCase());
    // Note: If syllabus model doesn't have a year, you can default this or filter by tags
    return matchesCat && matchesSearch;
  });

  // Pagination Logic - Disabled as per request to display all data on same single page
  const currentItems = filteredData;
  const totalPages = 1;

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="syl-wrapper">
      <div className="syl-container">

        {/* Breadcrumb */}
        {/* <nav className="syl-breadcrumb">
          <span>Home</span>
          <ChevronRight size={14} />
          <span className="active">Syllabus</span>
        </nav> */}

        {/* Header */}
        {/* <header className="syl-header">
          <h1>Complete Exam Syllabus</h1>
          <p>Get the most updated subject-wise breakdown, exam patterns, and recommended books for your preparation.</p>
        </header> */}

        {/* Search Input Filter */}
        <div className="filters-row-new">
          <div className="search-input-wrapper-new" style={{ marginLeft: 0, maxWidth: '100%', width: '100%' }}>
            <Search size={16} className="search-icon-new" />
            <input
              type="text"
              placeholder="Search by exam name..."
              className="course-search-input-new"
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
            {searchQuery && (
              <button className="clear-search-btn-new" onClick={() => { setSearchQuery(''); setCurrentPage(1); }}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="syl-filter-bar-wrapper">
          <div className="syl-dropdown-group">
            <div className="syl-custom-select">
              <Calendar size={18} />
              <select onChange={() => setCurrentPage(1)}>
                <option value="">Year</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
            <div className="syl-custom-select">
              <Filter size={18} />
              <select>
                <option value="">Exam Stage</option>
                <option value="prelims">Prelims</option>
                <option value="mains">Mains</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="syl-grid">
          {currentItems.length > 0 ? (
            currentItems.map((item, index) => (
              <div className="syl-card" key={index}>
                <div className="syl-card-top">
                  <span className="syl-badge-official">
                    {item.examPattern?.examMode ? item.examPattern.examMode.toUpperCase() :'LATEST SYLLABUS'}
                  </span>
                  {item.isFeatured && (
                    <span className="syl-featured-text">FEATURED</span>
                  )}
                  <ShareButton 
                    url={`/view-resource/syllabus/${item._id}`} 
                    title={`${item.examName} Syllabus`}
                    className="syl-card-share"
                  />
                </div>

                <div className="syl-card-mid">
                  <h3 title={item.examName}>{item.examName?.toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())}</h3>
                  <p className="syl-subject-text">{item.title?.toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase()) ||'Comprehensive Syllabus Guide'}</p>

                  <div className="syl-info-pills">
                    {(item.subjects?.length > 0) && (
                      <div className="syl-pill">
                        <BookOpen size={14} /> <span>{item.subjects.length} Subjects</span>
                      </div>
                    )}
                    {(item.examPattern?.numberOfQuestions > 0) && (
                      <div className="syl-pill">
                        <GraduationCap size={14} /> <span>{item.examPattern.numberOfQuestions} Qs</span>
                      </div>
                    )}
                    {(item.examPattern?.duration > 0) && (
                      <div className="syl-pill">
                        <Clock size={14} /> <span>{item.examPattern.duration} Mins</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="syl-card-footer">
                  <button 
                    className="syl-btn-view-ghost" 
                    onClick={() => window.open(`/view-resource/syllabus/${item._id}`,'_blank')}
                  >
                    <Eye size={16} /> Preview
                  </button>
                  <button
                    className="syl-btn-download-primary"
                    onClick={(e) => handleDownloadTrigger(e, item.syllabusPDF, item.examName ||"Syllabus")}
                  >
                    <Download size={16} /> Download PDF
                  </button>
                </div>
              </div>
            ))
          ) : !loading && (
            <div style={{ gridColumn:'1 / -1' }}>
              <StylishEmptyState 
                title="No Syllabus Found"
                description={searchQuery ? `No results for"${searchQuery}" in ${activeCategory}.` : `No syllabus uploaded for ${activeCategory} yet.`}
                actionText="Clear All Filters"
                onAction={() => {
                  setActiveCategory('All Exams');
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                icon={FileText}
              />
            </div>
          )}
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="syl-pagination-wrapper">
            <button
              className="syl-page-nav"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={18} />
            </button>

            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                className={`syl-page-num ${currentPage === idx + 1 ?'active' :''}`}
                onClick={() => handlePageChange(idx + 1)}
              >
                {idx + 1}
              </button>
            ))}

            <button
              className="syl-page-nav"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

      </div>
      {selected && (
        <PYQPreviewModal
          open={preview}
          onClose={() => setPreview(false)}
          pdfUrl={`${url}/${selected.syllabusPDF}`}
          title={selected.examName}
          subtitle="Official Syllabus"
        />
      )}

      <DownloadPopupModal 
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        targetUrl={downloadTarget}
        resourceTitle={downloadTitle}
        resourceType="Syllabus"
      />

    </div>
  );
};

export default Syllabus;