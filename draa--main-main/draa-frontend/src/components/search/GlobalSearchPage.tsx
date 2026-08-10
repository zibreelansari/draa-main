import React, { useState, useEffect, useMemo } from'react';
import { useSearchParams, useNavigate } from'react-router-dom';
import axios from'axios';
import HeaderOne from'../../layouts/headers/HeaderOne';
import LowerFooter from'../../layouts/footers/LowerFooter';
import url, { getImageUrl } from'../../url';
import'./GlobalSearchPage.css';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Book, 
  Layers, 
  Briefcase, 
  FileText, 
  Star, 
  Clock, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from'lucide-react';
import StylishEmptyState from'../common/StylishEmptyState';
import usePageTitle from'../../hooks/usePageTitle';

const CATEGORIES = [
  { id:'all', label:'All Results', icon: <Layers size={16} /> },
  { id:'course', label:'Courses', icon: <BookOpen size={16} /> },
  { id:'book', label:'Books', icon: <Book size={16} /> },
  { id:'test-series', label:'Test Series', icon: <Layers size={16} /> },
  { id:'examination', label:'Exams', icon: <TrendingUp size={16} /> },
  { id:'job', label:'Notifications', icon: <Briefcase size={16} /> },
  { id:'pyq', label:'PYQs', icon: <FileText size={16} /> },
  { id:'syllabus', label:'Syllabus', icon: <FileText size={16} /> },
  { id:'current-affair', label:'Current Affairs', icon: <TrendingUp size={16} /> },
  { id:'blog', label:'Blogs', icon: <Star size={16} /> },
];

export default function GlobalSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') ||'';
  
  usePageTitle(query ? `Search: ${query}` :"Global Search");
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filters
  const [selectedType, setSelectedType] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all'); // all, free, paid
  const [difficultyFilter, setDifficultyFilter] = useState('all'); // all, beginner, intermediate, advanced
  
  useEffect(() => {
    if (query) {
      fetchDeepResults();
    }
  }, [query]);

  const fetchDeepResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${url}/search/global?q=${encodeURIComponent(query)}&limit=50`);
      if (res.data.success) {
        setResults(res.data.data.results || []);
      }
    } catch (err: any) {
      console.error("Deep search error:", err);
      setError(err.message ||"Failed to fetch results");
    } finally {
      setLoading(false);
    }
  };

  //  FILTERING LOGIC 
  const filteredResults = useMemo(() => {
    return results.filter(item => {
      // Type Filter
      const matchesType = selectedType ==='all' || item.type === selectedType;
      
      // Price Filter
      let matchesPrice = true;
      if (priceFilter ==='free') matchesPrice = (item.price === 0 || !item.price);
      if (priceFilter ==='paid') matchesPrice = (item.price > 0);
      
      // Difficulty Filter
      let matchesDifficulty = true;
      if (difficultyFilter !=='all') {
        matchesDifficulty = (item.difficulty ||'').toLowerCase() === difficultyFilter;
      }
      
      return matchesType && matchesPrice && matchesDifficulty;
    });
  }, [results, selectedType, priceFilter, difficultyFilter]);

  // Group by type for'all' view
  const groupedResults = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredResults.forEach(r => {
      if (!groups[r.type]) groups[r.type] = [];
      groups[r.type].push(r);
    });
    return groups;
  }, [filteredResults]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = (e.target as any).search.value;
    if (input) {
      setSearchParams({ q: input });
    }
  };

  return (
    <div className="gsp-page">
      <HeaderOne />
      
      <section className="gsp-hero">
        <div className="gsp-hero-inner">
          <h1 className="gsp-title">
            Research & Explore <span className="gsp-highlight">Content</span>
          </h1>
          <p className="gsp-subtitle">
            {query ? (
              <>Found {filteredResults.length} results for <span className="gsp-highlight">"{query}"</span></>
            ) : (
"Search across all platform resources"
            )}
          </p>
          
          <form className="gsp-hero-search" onSubmit={handleSearchSubmit}>
            <div className="gsp-search-input-wrap">
              <Search size={20} className="gsp-s-icon" />
              <input 
                name="search" 
                type="text" 
                defaultValue={query} 
                placeholder="Find Courses, Books, Jobs, PYQs..." 
                className="gsp-hero-input"
              />
              <button type="submit" className="gsp-hero-btn">Search Now</button>
            </div>
          </form>
        </div>
      </section>

      <main className="gsp-main">
        {/*  SIDEBAR: STRONG FILTERS  */}
        <aside className="gsp-sidebar">
          <div className="gsp-filter-card">
            <div className="gsp-filter-section">
              <span className="gsp-filter-label">Content Type</span>
              <div className="gsp-check-group">
                {CATEGORIES.map(cat => (
                  <label key={cat.id} className="gsp-check-item">
                    <input 
                      type="radio" 
                      name="cat" 
                      checked={selectedType === cat.id}
                      onChange={() => setSelectedType(cat.id)}
                    />
                    {cat.icon}
                    <span>{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="gsp-filter-section">
              <span className="gsp-filter-label">Access / Price</span>
              <div className="gsp-check-group">
                {['all','free','paid'].map(p => (
                  <label key={p} className="gsp-check-item">
                    <input 
                      type="radio" 
                      name="price" 
                      checked={priceFilter === p}
                      onChange={() => setPriceFilter(p)}
                    />
                    <span>{p.charAt(0).toUpperCase() + p.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="gsp-filter-section">
              <span className="gsp-filter-label">Difficulty Level</span>
              <div className="gsp-check-group">
                {['all','beginner','intermediate','advanced'].map(d => (
                  <label key={d} className="gsp-check-item">
                    <input 
                      type="radio" 
                      name="diff" 
                      checked={difficultyFilter === d}
                      onChange={() => setDifficultyFilter(d)}
                    />
                    <span>{d.charAt(0).toUpperCase() + d.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <button className="gsp-reset-btn" onClick={() => {
              setSelectedType('all');
              setPriceFilter('all');
              setDifficultyFilter('all');
            }}>Reset All Filters</button>
          </div>
        </aside>

        {/*  RESULTS PANEL  */}
        <div className="gsp-results-panel">
          {loading && (
            <div className="gsp-loading">
              <div className="gsp-loader"></div>
              <p>Fetching intelligent results...</p>
            </div>
          )}

          {!loading && filteredResults.length === 0 && (
            <div style={{ padding:'40px 0', width:'100%' }}>
              <StylishEmptyState 
                title={query ? `No results for"${query}"` :"No matches found"}
                description="We couldn't find any resources matching your search query or the current filters. Please try broad keywords or reset your filters."
                actionText="Reset All Filters"
                onAction={() => {
                  setSelectedType('all');
                  setPriceFilter('all');
                  setDifficultyFilter('all');
                }}
                showBack={false}
              />
            </div>
          )}

          {!loading && selectedType ==='all' && Object.keys(groupedResults).map(type => (
            <div key={type} className="gsp-section">
              <div className="gsp-section-head">
                <div className="gsp-section-info">
                  <div className="gsp-section-dot" style={{ background: CATEGORIES.find(c => c.id === type)?.id ?'var(--primary)' :'#ccc' }} />
                  <h2>{CATEGORIES.find(c => c.id === type)?.label || type}</h2>
                </div>
                <span className="gsp-section-count">{groupedResults[type].length} found</span>
              </div>
              <div className="gsp-grid">
                {groupedResults[type].map(item => (
                  <ResultCard key={item._id} item={item} navigate={navigate} />
                ))}
              </div>
            </div>
          ))}

          {!loading && selectedType !=='all' && (
            <div className="gsp-section">
              <div className="gsp-grid">
                {filteredResults.map(item => (
                  <ResultCard key={item._id} item={item} navigate={navigate} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <LowerFooter />
    </div>
  );
}

function ResultCard({ item, navigate }: { item: any; navigate: any }) {
  const isJob = item.type ==='job';
  const isPYQ = item.type ==='pyq' || item.type ==='syllabus';

  return (
    <div className={`gsp-card ${isJob ?'gsp-job-card' :''} ${isPYQ ?'gsp-pyq-card' :''}`}>
      <div className="gsp-card-thumb">
        {item.thumbnail ? (
          <img src={getImageUrl(item.thumbnail)} alt={item.plainTitle} />
        ) : (
          <div className="gsp-thumb-placeholder">
            {CATEGORIES.find(c => c.id === item.type)?.icon}
          </div>
        )}
        <span className="gsp-card-type">{item.typeLabel || item.type}</span>
      </div>
      <div className="gsp-card-body">
        <div className="gsp-card-meta">
          {item.category || item.author || item.organization ||'Educational Resource'}
        </div>
        <h3 className="gsp-card-title">{item.plainTitle}</h3>
        <p className="gsp-card-desc">{item.plainDescription}</p>
        
        <div className="gsp-card-footer">
          <div className="gsp-card-price">
            {item.price === 0 || !item.price ? (
              <span className="free">FREE</span>
            ) : (
              `${item.price}`
            )}
          </div>
          <button className="gsp-card-btn" onClick={() => navigate(item.url ||'/')}>
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
