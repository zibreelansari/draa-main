import React, { useState, useEffect } from'react';
import { Link, useNavigate } from'react-router-dom';
import {
  Search, Calendar, Filter, Eye,
  FileText, Clock, ChevronRight, Layout,
  ChevronLeft, Loader2, X
} from'lucide-react';
import axios from'axios';
import url from'../../url';
import'./pyq.css';
import PYQPreviewModal from'./PYQPreviewModal';
import StylishEmptyState from'../common/StylishEmptyState';
import ShareButton from'../common/ShareButton';

const PYQs = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pyqs, setPyqs] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [preview, setPreview] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  // Filters
  const [activeCategory, setActiveCategory] = useState('All Exams');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedPaper, setSelectedPaper] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${url}/pyq/approved`);
        const data = response.data.pyqs || [];
        setPyqs(data);
        const cats = [...new Set(data.map((item: any) => item.examCategory))];
        setCategories(cats as string[]);
      } catch (err) {
        console.error('Error fetching PYQ data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Dynamic year options from data
  const yearOptions = [...new Set(pyqs.map(p => p.year?.toString()).filter(Boolean))].sort((a, b) => Number(b) - Number(a));
  const paperOptions = [...new Set(pyqs.map(p => p.paper).filter(Boolean))].sort();

  // Filter
  const filteredData = pyqs.filter(item => {
    const matchesCat = activeCategory ==='All Exams' || item.examCategory === activeCategory;
    const matchesSearch = !searchQuery || item.examName.toLowerCase().includes(searchQuery.toLowerCase()) || (item.title ||'').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = !selectedYear || item.year?.toString() === selectedYear;
    const matchesStage = !selectedStage || (item.examStage ||'').toLowerCase() === selectedStage;
    const matchesPaper = !selectedPaper || item.paper === selectedPaper;
    return matchesCat && matchesSearch && matchesYear && matchesStage && matchesPaper;
  });

  // Group by examName
  const groupedData = React.useMemo(() => {
    const map = new Map<string, any>();
    filteredData.forEach(item => {
      if (!map.has(item.examName)) {
        map.set(item.examName, {
          ...item,
          papersCount: 1,
        });
      } else {
        const existing = map.get(item.examName);
        existing.papersCount += 1;
        // Keep the latest year for display purposes
        if (item.year > existing.year) {
          existing.year = item.year;
        }
      }
    });
    return Array.from(map.values());
  }, [filteredData]);

  // Pagination - Disabled as per request to display all data on same single page
  const totalPages = 1;
  const currentItems = groupedData;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAll = () => {
    setActiveCategory('All Exams');
    setSearchQuery('');
    setSelectedYear('');
    setSelectedStage('');
    setSelectedPaper('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || activeCategory !=='All Exams' || selectedYear || selectedStage || selectedPaper;

  if (loading) {
    return (
      <div className="pyq-wrapper">
        <div className="pyq-loader"><Loader2 className="pyq-spin" size={40} /></div>
      </div>
    );
  }

  return (
    <div className="pyq-wrapper">
      <div className="pyq-container">

        {/* Breadcrumb */}
        {/* <nav className="pyq-breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={14} />
          <span className="active">Previous Year Papers</span>
        </nav> */}

        {/* Header */}
        {/* <div className="pyq-header-section">
          <div className="pyq-header-text">
            <h1>Previous Year Question Papers</h1>
            <p>Access a comprehensive archive of official question papers to boost your preparation.</p>
          </div>
          <div className="pyq-showing-text">
            Showing <strong>{groupedData.length}</strong> Exams
          </div>
        </div> */}

        {/* Unified Search & Dropdown Filters Row */}
        <div className="pyq-unified-filters-row">
          <div className="pyq-filters-right-controls" style={{ width: '100%' }}>
            <div className="pyq-search-wrapper">
              <Search className="pyq-search-icon" size={18} />
              <input
                type="text"
                className="pyq-search-input"
                placeholder="Search exams, subjects..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
              {searchQuery && (
                <button className="pyq-clear-search" onClick={() => { setSearchQuery(''); setCurrentPage(1); }} aria-label="Clear Search">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="pyq-select-wrapper">
              <Calendar size={16} />
              <select
                className="pyq-select"
                value={selectedYear}
                onChange={(e) => { setSelectedYear(e.target.value); setCurrentPage(1); }}
              >
                <option value="">All Years</option>
                {yearOptions.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="pyq-select-wrapper">
              <Filter size={16} />
              <select
                className="pyq-select"
                value={selectedStage}
                onChange={(e) => { setSelectedStage(e.target.value); setCurrentPage(1); }}
              >
                <option value="">All Stages</option>
                <option value="mains">Mains</option>
                <option value="interview">Interview</option>
              </select>
            </div>

            <div className="pyq-select-wrapper">
              <FileText size={16} />
              <select
                className="pyq-select"
                value={selectedPaper}
                onChange={(e) => { setSelectedPaper(e.target.value); setCurrentPage(1); }}
              >
                <option value="">All Papers</option>
                {paperOptions.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="pyq-total-badge">
              <span className="count-num">{groupedData.length}</span>
              <span className="count-label">Exams</span>
            </div>
          </div>
        </div>

        {/* Grid */}
        {currentItems.length > 0 ? (
          <div className="pyq-grid">
            {currentItems.map((item, index) => (
              <div className="pyq-card" key={item._id || index}>
                <div className="card-top">
                  <span className={`badge-official ${item.memoryBasedPaper ?'memory-badge' :''}`}>
                    {item.memoryBasedPaper ?'MEMORY BASED' :'DRAA'}
                  </span>
                  <span className="year-val">{item.year}</span>
                  <ShareButton 
                    url={`/previous-year-questions/details/${encodeURIComponent(item.examName)}`} 
                    title={`${item.examName} Previous Year Papers`}
                    className="pyq-card-share"
                  />
                </div>

                <div className="card-mid">
                  <h3 title={item.examName}>{item.examName?.toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())}</h3>
                  <p className="subject-text">{item.title?.toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase()) ||'Complete PYQ Collection'}</p>

                  <div className="info-pills">
                    <div className="pill paper-pill" style={{ background:'#f7f1e5', color:'#bd7b20' }}>
                      <FileText size={13} /> <span>{item.papersCount} {item.papersCount === 1 ?'Paper' :'Papers'} Available</span>
                    </div>
                    <div className="pill">
                      <Layout size={13} /> <span>{item.examCategory ||'Common'}</span>
                    </div>
                   
                    <div className="pill">
                      <Clock size={13} /> 
                      <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short' }) :'Recently'}</span>
                    </div>
                  </div>
                </div>

                <button
                  className="pyq-btn-view-ghost"
                  onClick={() => navigate(`/previous-year-questions/details/${encodeURIComponent(item.examName)}`)}
                >
                  <Eye size={16} /> View All Papers
                </button>
              </div>
            ))}
          </div>
        ) : (
          <StylishEmptyState 
            title="No Papers Found"
            description="We couldn't find any question papers matching your criteria. Try adjusting your filters or search query."
            actionText="Clear All Filters"
            onAction={clearAll}
            showBack={false}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pyq-pagination">
            <button
              className="p-arrow"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`p-num ${currentPage === i + 1 ?'active' :''}`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="p-arrow"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

      </div>

    </div>
  );
};

export default PYQs;