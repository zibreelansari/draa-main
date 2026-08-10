import React, { useState, useEffect } from'react';
import { useParams } from'react-router-dom';
import {
  Search, Calendar,
  FileText, Clock, ChevronRight,
  ChevronLeft, BookOpen, Download, Eye
} from'lucide-react';
import axios from'axios';
import url from'../../../url';
import'../currentAffairs.css';
import CAReaderModal from'../CAReaderModal';
import StylishEmptyState from'../../common/StylishEmptyState';
import usePageTitle from'../../../hooks/usePageTitle';

const TYPE_LABELS: Record<string, string> = {
  DAILY:'Daily',
  WEEKLY:'Weekly',
  MONTHLY:'Monthly',
  QUARTERLY:'Quarterly',
  YEARLY:'Yearly',
};

const TYPE_DESCRIPTIONS: Record<string, string> = {
  DAILY:'Daily current affairs updates covering the latest events for your exam preparation.',
  WEEKLY:'Weekly current affairs compilation with all important events of the week.',
  MONTHLY:'Monthly current affairs roundup with comprehensive coverage of all key events.',
  QUARTERLY:'Quarterly current affairs summary covering three months of important updates.',
  YEARLY:'Yearly current affairs compilation with complete coverage of annual events.',
};

const TYPE_MAP: Record<string, string> = {
  daily:'DAILY',
  weekly:'WEEKLY',
  monthly:'MONTHLY',
  quarterly:'QUARTERLY',
  yearly:'YEARLY',
};

const CurrentAffairsCategorywise: React.FC = () => {
  const { type: slug } = useParams<{ type: string }>();
  const type = slug ? (TYPE_MAP[slug.toLowerCase()] || slug.toUpperCase()) :'';

  const typeLabel = TYPE_LABELS[type ||''] || (type ? type.charAt(0) + type.slice(1).toLowerCase() :'All');
  usePageTitle(`${typeLabel} Current Affairs`);
  const [loading, setLoading] = useState(true);
  const [affairs, setAffairs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Reader Modal State
  const [readerOpen, setReaderOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const typeDesc = TYPE_DESCRIPTIONS[type ||''] || `${typeLabel} current affairs`;

  useEffect(() => {
    if (!type) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${url}/current-affairs/approved`);
        // Filter by type from all approved affairs
        const data = response.data.affairs.filter((item: any) => item.type === type);
        setAffairs(data);
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [type]);

  // Filter Logic
  const filteredData = affairs.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = !selectedYear ||
      (item.publishDate && new Date(item.publishDate).getFullYear().toString() === selectedYear);
    return matchesSearch && matchesYear;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior:'smooth' });
  };

  // Generate year options from publish dates
  const years = [...new Set(
    affairs
      .map((item: any) => item.publishDate ? new Date(item.publishDate).getFullYear() : null)
      .filter(Boolean)
  )].sort((a, b) => b - a);

  const getTypeColor = (t: string) => {
    switch (t) {
      case'DAILY': return { bg:'#f7f1e5', color:'#bd7b20' };
      case'WEEKLY': return { bg:'#f0fdf4', color:'#16a34a' };
      case'MONTHLY': return { bg:'#fffbeb', color:'#d97706' };
      case'QUARTERLY': return { bg:'#fdf4ff', color:'#9333ea' };
      case'YEARLY': return { bg:'#fef2f2', color:'#dc2626' };
      default: return { bg:'#f3f4f6', color:'#374151' };
    }
  };

  const typeStyle = getTypeColor(type);

  const openReader = (item: any) => {
    setSelected(item);
    setReaderOpen(true);
  };

  return (
    <div className="ca-wrapper">
      <div className="ca-container">

        {/* Breadcrumb */}
        <nav className="ca-breadcrumb">
          <span>Home</span>
          <ChevronRight size={14} />
          <a href="/ca" style={{ color:'#6b7280', fontWeight: 500 }}>Current Affairs</a>
          <ChevronRight size={14} />
          <span className="active">{typeLabel}</span>
        </nav>

        {/* Header */}
        <header className="ca-header">
          <div className="ca-header-type-badge" style={{ background: typeStyle.bg, color: typeStyle.color }}>
            {typeLabel} Current Affairs
          </div>
          <h1>{typeLabel} Current Affairs {new Date().getFullYear()}</h1>
          <p>{typeDesc}</p>
          <div className="ca-header-count">
            <FileText size={16} />
            <span>{filteredData.length} {typeLabel.toLowerCase()} {filteredData.length === 1 ?'edition' :'editions'} available</span>
          </div>
        </header>

        {/* Search & Filters Bar */}
        <div className="ca-filter-bar-wrapper">
          <div className="ca-search-input-group">
            <Search size={20} className="ca-search-icon" />
            <input
              type="text"
              placeholder={`Search ${typeLabel.toLowerCase()} current affairs...`}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="ca-dropdown-group">
            <div className="ca-custom-select">
              <Calendar size={18} />
              <select onChange={(e) => { setSelectedYear(e.target.value); setCurrentPage(1); }}>
                <option value="">All Years</option>
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="ca-loading">
            {[...Array(6)].map((_, i) => (
              <div className="ca-card ca-skeleton" key={i}>
                <div className="ca-skeleton-badge"></div>
                <div className="ca-skeleton-title"></div>
                <div className="ca-skeleton-text"></div>
                <div className="ca-skeleton-pills"></div>
                <div className="ca-skeleton-footer"></div>
              </div>
            ))}
          </div>
        ) : currentItems.length === 0 ? (
          <div style={{ padding:'40px 0' }}>
            <StylishEmptyState 
              title={`No ${typeLabel} Affairs Found`}
              description={`We haven't updated the ${typeLabel.toLowerCase()} current affairs for this section yet. Please check our other updates or come back later!`}
              actionText="Explore All Affairs"
              actionPath="/current-affairs"
              showBack={false}
            />
          </div>
        ) : (
          <div className="ca-grid">
            {currentItems.map((item, index) => (
              <div className="ca-card" key={index}>
                <div className="ca-card-top">
                  <span
                    className="ca-badge-type"
                    style={{ background: typeStyle.bg, color: typeStyle.color }}
                  >
                    {item.type}
                  </span>
                  <span className="ca-featured-text">{item.isFeatured ?'FEATURED' :''}</span>
                </div>

                <div className="ca-card-mid">
                  <h3>{item.title}</h3>
                  <p className="ca-subject-text">{item.shortDescription || `${typeLabel} current affairs update`}</p>

                  <div className="ca-info-pills">
                    <div className="ca-pill">
                      <BookOpen size={14} /> <span>{item.categoryId?.name ||'General'}</span>
                    </div>
                    <div className="ca-pill">
                      <Calendar size={14} />
                      <span>
                        {item.publishDate
                          ? new Date(item.publishDate).toLocaleDateString('en-IN', {
                              day:'numeric', month:'short', year:'numeric'
                            })
                          :'N/A'}
                      </span>
                    </div>
                    <div className="ca-pill">
                      <Clock size={14} /> <span>{item.views || 0} Views</span>
                    </div>
                  </div>
                </div>

                <div className="ca-card-footer">
                  <button
                    className="ca-btn-view"
                    onClick={() => window.open(`/view-resource/current-affairs/${item._id}`,'_blank')}
                  >
                    <Eye size={16} /> Read More
                  </button>
                  {item.pdfFile && (
                    <a
                      href={`${url}${item.pdfFile}`}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ca-btn-download"
                      title="Download PDF"
                    >
                      <Download size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Section */}
        {!loading && totalPages > 1 && (
          <div className="ca-pagination-wrapper">
            <button
              className="ca-page-nav"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={18} />
            </button>

            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                className={`ca-page-num ${currentPage === idx + 1 ?'active' :''}`}
                onClick={() => handlePageChange(idx + 1)}
              >
                {idx + 1}
              </button>
            ))}

            <button
              className="ca-page-nav"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

      </div>

      {/* Reader Modal */}
      {selected && (
        <CAReaderModal
          open={readerOpen}
          onClose={() => setReaderOpen(false)}
          item={selected}
          pdfUrl={selected.pdfFile ? `${url}${selected.pdfFile}` :''}
        />
      )}
    </div>
  );
};

export default CurrentAffairsCategorywise;
