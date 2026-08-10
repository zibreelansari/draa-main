import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Calendar, Filter, Clock, ChevronRight, ChevronLeft, BookOpen, Eye,
  FileText, Newspaper, X, Landmark, Atom, Palette, HeartHandshake, ArrowRight, ChevronDown
} from 'lucide-react';
import axios from 'axios';
import url from '../../url';
import './currentAffairs.css';
import CAReaderModal from './CAReaderModal';
import ShareButton from '../common/ShareButton';
import StylishEmptyState from '../common/StylishEmptyState';

const CATEGORY_META: Record<string, {
  description: string;
  colorClass: string;
  icon: React.ReactNode;
}> = {
  'Current Affairs': {
    description: 'Daily national & international updates',
    colorClass: 'cat-current-affairs',
    icon: <Newspaper size={22} />
  },
  'Governance': {
    description: 'Policies, administration & public systems',
    colorClass: 'cat-governance',
    icon: <Landmark size={22} />
  },
  'Science & Technology': {
    description: 'Recent developments & discoveries',
    colorClass: 'cat-science-tech',
    icon: <Atom size={22} />
  },
  'Art & Culture': {
    description: 'Heritage, literature & fine arts',
    colorClass: 'cat-art-culture',
    icon: <Palette size={22} />
  },
  'Ethics': {
    description: 'Integrity, aptitude & moral philosophy',
    colorClass: 'cat-ethics',
    icon: <HeartHandshake size={22} />
  }
};

const CurrentAffairs = () => {
  const [loading, setLoading] = useState(true);
  const [affairs, setAffairs] = useState<any[]>([]);

  const [selectedTab, setSelectedTab] = useState('All Articles');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  const [readerOpen, setReaderOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${url}/current-affairs/approved`);
        const data = response.data.affairs;
        setAffairs(data);
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return affairs.filter(item => {
      // 1. Matches Type (subject): selectedTab
      const matchesType = selectedTab === 'All Articles' || item.categoryId?.name === selectedTab;

      // 2. Matches Category (timeframe): selectedCategory
      const dbTypeMap: Record<string, string> = {
        'Daily': 'DAILY',
        'Weekly': 'WEEKLY',
        'Monthly': 'MONTHLY',
        'Yearly': 'YEARLY'
      };
      const matchesCategory = selectedCategory === 'All Categories' || 
        (item.type && dbTypeMap[selectedCategory] === item.type);

      // 3. Matches Search
      const matchesSearch = !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.shortDescription && item.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()));

      // 4. Matches Year
      const matchesYear = !selectedYear ||
        (item.publishDate && new Date(item.publishDate).getFullYear().toString() === selectedYear);

      return matchesType && matchesCategory && matchesSearch && matchesYear;
    });
  }, [affairs, selectedTab, selectedCategory, searchQuery, selectedYear]);

  const sortedAndFilteredData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const dateA = a.publishDate ? new Date(a.publishDate).getTime() : 0;
      const dateB = b.publishDate ? new Date(b.publishDate).getTime() : 0;
      return sortBy === 'latest' ? dateB - dateA : dateA - dateB;
    });
  }, [filteredData, sortBy]);

  const years = useMemo(() => {
    return [...new Set(
      affairs
        .map((item: any) => item.publishDate ? new Date(item.publishDate).getFullYear() : null)
        .filter((y): y is number => y !== null)
    )].sort((a, b) => b - a);
  }, [affairs]);

  const openReader = (item: any) => {
    const idx = sortedAndFilteredData.findIndex(i => i._id === item._id);
    setSelectedIndex(idx >= 0 ? idx : 0);
    setReaderOpen(true);
  };

  return (
    <div className="ca-wrapper">
      <div className="ca-container">

        {/* Latest Opportunities / Articles Section */}
        <div className="latest-opportunities-section">
          <div className="latest-section-header-row">
            <h2 className="latest-title">Latest Articles</h2>
            
            <div className="ca-category-scroll">
              {['All Categories', 'Daily', 'Weekly', 'Monthly', 'Yearly'].map((cat) => (
                <button
                  key={cat}
                  className={`ca-cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="ca-filters-right-controls">
              <div className="ca-dropdown-group">
                <div className="ca-custom-select">
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="latest">Latest</option>
                    <option value="oldest">Oldest</option>
                  </select>
                  <ChevronDown className="sort-select-chevron" size={16} />
                </div>
              </div>

              <div className="ca-search-input-group">
                <Search className="ca-search-icon" size={18} />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                />
                {searchQuery && (
                  <button
                    className="ca-search-clear-btn"
                    onClick={() => {
                      setSearchQuery('');
                    }}
                    aria-label="Clear Search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="ca-total-badge">
                <span className="count-num">{sortedAndFilteredData.length}</span>
                <span className="count-label">Articles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Articles Grid / Loading / Empty state */}
        {loading ? (
          <div className="ca-bifurcation-grid">
            {[...Array(4)].map((_, i) => (
              <div className="ca-col-box" key={i}>
                <div className="ca-col-header" style={{ backgroundColor:'#e2e8f0' }}>&nbsp;</div>
                <div className="ca-col-body">
                  {[...Array(6)].map((_, j) => (
                    <div className="ca-col-item" key={j}>
                      <div className="ca-col-item-accent" style={{ backgroundColor:'#cbd5e1' }}></div>
                      <div className="ca-col-item-content">
                        <div style={{ width:'80%', height:'14px', backgroundColor:'#f1f5f9', borderRadius:'4px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : sortedAndFilteredData.length === 0 ? (
          <div className="ca-empty-state-wrapper">
            <StylishEmptyState
              title="No Articles Found"
              description="We couldn't find any articles matching your search or filters."
              actionText="Clear Filters & Search"
              onAction={() => { 
                setSelectedTab('All Articles'); 
                setSelectedCategory('All Categories'); 
                setSearchQuery(''); 
              }}
              showBack={false}
            />
          </div>
        ) : (
          <div className="ca-listings-grid">
            {sortedAndFilteredData.map((item) => {
              // Find metadata for category
              const catMeta = CATEGORY_META[item.categoryId?.name] || CATEGORY_META['Current Affairs'];
              return (
                <div key={item._id} className={`ca-card-premium ${catMeta.colorClass}`}>
                  <div className="ca-card-header">
                    <div className="ca-card-badges-row">
                      <div className="ca-card-badges-primary">
                        <span className="ca-category-badge">
                          {item.categoryId?.name || 'Current Affairs'}
                        </span>
                        <span className="ca-type-badge">
                          {item.type}
                        </span>
                      </div>
                    </div>
                    <ShareButton
                      url={`/view-resource/current-affairs/${item._id}`}
                      title={item.title}
                      className="ca-card-share-btn"
                    />
                  </div>

                  <div className="ca-card-body-wrapper" onClick={() => window.open(`/view-resource/current-affairs/${item._id}`, '_blank')}>
                    <div className="ca-card-org-row">
                      <div className="ca-logo-fallback">
                        {catMeta.icon}
                      </div>
                      <span className="ca-publish-date">
                        {item.publishDate ? new Date(item.publishDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                      </span>
                    </div>

                    <h3 className="ca-title" title={item.title}>{item.title}</h3>
                    <p className="ca-desc">{item.shortDescription || 'Read details for national competitive exam preparation.'}</p>
                  </div>

                  <div className="ca-details-horizontal-rows">
                    <div className="ca-detail-row-item">
                      <Eye size={14} className="ca-detail-icon" />
                      <span className="ca-detail-text">
                        {item.views || 0} Views
                      </span>
                    </div>
                  </div>

                  <div className="ca-card-footer-row">
                    <div className="ca-footer-actions">
                      <button onClick={() => window.open(`/view-resource/current-affairs/${item._id}`, '_blank')} className="ca-read-btn-modern">
                        Read Article <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {readerOpen && sortedAndFilteredData[selectedIndex] && (
        <CAReaderModal
          open={readerOpen}
          onClose={() => setReaderOpen(false)}
          items={sortedAndFilteredData}
          startIndex={selectedIndex}
        />
      )}
    </div>
  );
};

export default CurrentAffairs;
