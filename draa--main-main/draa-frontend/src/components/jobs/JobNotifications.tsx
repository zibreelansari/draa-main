import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight, MapPin, Users, GraduationCap, Bookmark, ArrowRight,
  ChevronDown, Loader2, ChevronLeft, Search, X, Briefcase,
  Award, Globe, BookOpen, Calendar
} from 'lucide-react';
import axios from 'axios';
import url from '../../url';
import '../courses/CoursesArea.css';
import './JobNotifications.css';
import '../common/SkeletonLoader.css';

import StylishEmptyState from '../common/StylishEmptyState';
import ShareButton from '../common/ShareButton';

interface Job {
  _id: string;
  title: string;
  organization_name: string;
  job_category: { name: string; _id: string };
  location: string;
  total_vacancies: number;
  qualifications_required: string[];
  deadline: string;
  createdAt: string;
  job_type: string;
  featured?: boolean;
}

const CATEGORY_META: Record<string, {
  description: string;
  colorClass: string;
  icon: React.ReactNode;
}> = {
  'Jobs': {
    description: 'Government & Private Jobs',
    colorClass: 'cat-jobs',
    icon: <Briefcase size={22} />
  },
  'Admissions': {
    description: 'College & University Admissions',
    colorClass: 'cat-admissions',
    icon: <GraduationCap size={22} />
  },
  'Scholarships': {
    description: 'National & State Scholarships',
    colorClass: 'cat-scholarships',
    icon: <Award size={22} />
  },
  'Foreign University admissions & scholarships': {
    description: 'Study Abroad Opportunities',
    colorClass: 'cat-foreign',
    icon: <Globe size={22} />
  },
  'Scholarly contributions': {
    description: 'Journals, Patents & Research Work',
    colorClass: 'cat-scholarly',
    icon: <BookOpen size={22} />
  }
};

const JobNotifications: React.FC = () => {
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  //  DYNAMIC FILTER STATES
  const [selectedTab, setSelectedTab] = useState('All Jobs');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  const scrollCategories = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - 300 : scrollLeft + 300;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobRes, catRes] = await Promise.all([
          axios.get(`${url}/jobs/approved/all`),
          axios.get(`${url}/jobs/categories/fetch`)
        ]);
        setAllJobs(jobRes.data.jobs || []);
        setCategories(catRes.data.categories || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  //  COMBINED SEARCH & FILTERING LOGIC WITH PRIORITY SORTING
  const filteredJobs = useMemo(() => {
    const filtered = allJobs.filter(job => {
      const matchesCategory = selectedTab === 'All Jobs' || job.job_category?.name === selectedTab;
      const matchesSearch = !searchQuery.trim() ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.organization_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.location && job.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (job.job_type && job.job_type.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });

    const now = new Date();
    return [...filtered].sort((a, b) => {
      const deadlineA = a.deadline ? new Date(a.deadline) : null;
      const deadlineB = b.deadline ? new Date(b.deadline) : null;

      const isExpiredA = deadlineA ? (deadlineA.getTime() < now.getTime()) : false;
      const isExpiredB = deadlineB ? (deadlineB.getTime() < now.getTime()) : false;

      // 1. Active jobs first, Expired jobs last
      if (isExpiredA !== isExpiredB) {
        return isExpiredA ? 1 : -1;
      }

      // 2. Featured first within their group
      const featA = a.featured ? 1 : 0;
      const featB = b.featured ? 1 : 0;
      if (featA !== featB) {
        return featB - featA;
      }

      // 3. Sorting within the group
      if (!isExpiredA) {
        // Active
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return sortBy === 'latest' ? dateB - dateA : dateA - dateB;
      } else {
        // Expired
        const timeA = deadlineA ? deadlineA.getTime() : 0;
        const timeB = deadlineB ? deadlineB.getTime() : 0;
        if (timeA !== timeB) {
          return sortBy === 'latest' ? timeB - timeA : timeA - timeB;
        }
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return sortBy === 'latest' ? dateB - dateA : dateA - dateB;
      }
    });
  }, [selectedTab, allJobs, searchQuery, sortBy]);

  // Show all filtered jobs - no pagination
  const paginatedJobs = filteredJobs;

  const getClosingTag = (deadline: string) => {
    const diff = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return <span className="closing-tag today">CLOSED</span>;
    if (diff <= 3) return <span className="closing-tag imminent">CLOSING IN {diff} DAYS</span>;
    return null;
  };

  const isRecent = (createdAt: string) => {
    const diff = Math.ceil((new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return diff <= 7;
  };

  if (loading) return (
    <main className="job-notifications-modern">
      <div className="container">
        <div className="sk-jobs-grid" style={{ marginTop: '24px' }}>
          {[...Array(9)].map((_, i) => (
            <div key={i} className="sk-job-card">
              <div className="sk-job-badge sk-shimmer" />
              <div className="sk-job-org">
                <div className="sk-job-logo sk-shimmer" />
                <div className="sk-job-oname sk-shimmer" />
              </div>
              <div className="sk-job-title sk-shimmer" />
              <div className="sk-job-meta">
                <div className="sk-job-meta-row sk-shimmer" />
                <div className="sk-job-meta-row sk-shimmer" />
                <div className="sk-job-meta-row sk-shimmer" />
              </div>
              <div className="sk-job-footer">
                <div className="sk-job-btn sk-shimmer" />
                <div className="sk-job-save sk-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );

  return (
    <main className="job-notifications-modern">
      <div className="container">
        
        {/* Explore Opportunities Section */}
        <div className="explore-opportunities-section">
          <div className="explore-section-header">
            <h2 className="explore-title">Explore Opportunities</h2>
            <p className="explore-subtitle">Discover the right opportunity for your career</p>
          </div>

          <div className="explore-slider-wrapper">
            <button
              className="explore-slider-arrow left"
              onClick={() => scrollCategories('left')}
              aria-label="Scroll Left"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="explore-scroll-container" ref={scrollRef}>
              {Object.keys(CATEGORY_META).map((catName) => {
                const meta = CATEGORY_META[catName];
                const isActive = selectedTab === catName;
                return (
                  <div
                    key={catName}
                    className={`explore-pill-card ${meta.colorClass}${isActive ? ' active' : ''}`}
                    onClick={() => setSelectedTab(isActive ? 'All Jobs' : catName)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedTab(isActive ? 'All Jobs' : catName);
                      }
                    }}
                  >
                    <div className="explore-pill-icon-circle">
                      {meta.icon}
                    </div>
                    <span className="explore-pill-card-title">{catName}</span>
                  </div>
                );
              })}
            </div>

            <button
              className="explore-slider-arrow right"
              onClick={() => scrollCategories('right')}
              aria-label="Scroll Right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Latest Opportunities Section */}
        <div className="latest-opportunities-section">
          <div className="latest-section-header-row">
            <h2 className="latest-title">Latest Opportunities</h2>
            
            <div className="latest-filters-controls">
              <div className="sort-wrapper">
                <span className="sort-label">Sort by:</span>
                <div className="sort-select-wrapper">
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select"
                  >
                    <option value="latest">Latest</option>
                    <option value="oldest">Oldest</option>
                  </select>
                  <ChevronDown className="sort-select-chevron" size={16} />
                </div>
              </div>

              <div className="job-search-wrapper">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  className="job-search-input"
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                />
                {searchQuery && (
                  <button
                    className="search-clear-btn"
                    onClick={() => {
                      setSearchQuery('');
                    }}
                    aria-label="Clear Search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="total-jobs-badge">
                <span className="count-num">{filteredJobs.length}</span>
                <span className="count-label">Jobs</span>
              </div>
            </div>
          </div>
        </div>

        <div className="job-marketplace-layout">
          <section className="job-listings-grid">
            <div className="listings-wrapper">
              {paginatedJobs.length > 0 ? (
                paginatedJobs.map((job) => {
                  const catMeta = CATEGORY_META[job.job_category?.name] || CATEGORY_META['Jobs'];
                  return (
                    <div key={job._id} className={`job-card-premium ${catMeta.colorClass}`} style={{ minWidth: 0 }}>
                      <div className="job-card-header">
                        <div className="job-card-badges-row">
                          <div className="job-card-badges-primary">
                            <span className="job-category-badge">
                              {job.job_category?.name || 'Jobs'}
                            </span>
                            {isRecent(job.createdAt) && <span className="new-badge">NEW</span>}
                          </div>
                          {getClosingTag(job.deadline)}
                        </div>
                        <ShareButton
                          url={`/job-details/${job._id}`}
                          title={`${job.title} Job Opportunity`}
                          className="job-card-share-btn"
                        />
                      </div>

                      <div className="job-card-body-wrapper">
                        <div className="job-card-org-row">
                          <div className="org-logo-fallback">
                            {catMeta.icon}
                          </div>
                          <span className="org-name" title={job.organization_name}>
                            {job.organization_name}
                          </span>
                        </div>

                        <h3 className="job-title" title={job.title}>{job.title}</h3>
                      </div>

                      <div className="job-details-horizontal-rows">
                        <div className="detail-row-item">
                          <MapPin size={14} className="detail-icon" />
                          <span className="detail-text" title={`${job.organization_name} • ${job.location}`}>
                            {job.organization_name} • {job.location || 'Remote'}
                          </span>
                        </div>
                        <div className="detail-row-item">
                          <GraduationCap size={14} className="detail-icon" />
                          <span className="detail-text">
                            {job.total_vacancies ? `${job.total_vacancies} Openings` : 'Multiple Openings'}
                            {job.qualifications_required?.length ? ` • ${job.qualifications_required[0]}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="job-card-footer-row">
                        <div className="deadline-wrapper">
                          <Calendar size={14} className="detail-icon" style={{ marginRight: '6px' }} />
                          <span className="deadline-label">
                            Last Date: {job.deadline ? new Date(job.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                          </span>
                        </div>
                        
                        <div className="footer-actions">
                          <Link to={`/job-details/${job._id}`} className="apply-btn-modern">
                            View Details <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state-wrapper">
                  <StylishEmptyState
                    title="No Jobs Found"
                    description="We couldn't find any job notifications matching this criteria."
                    actionText="Clear Filters & Search"
                    onAction={() => { setSelectedTab('All Jobs'); setSearchQuery(''); }}
                    showBack={false}
                  />
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default JobNotifications;