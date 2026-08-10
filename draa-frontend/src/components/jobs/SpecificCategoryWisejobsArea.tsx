import React, { useState, useEffect, useMemo, useCallback } from'react';
import { Link, useParams, useNavigate, useSearchParams } from'react-router-dom';
import {
  ChevronRight, MapPin, Users, GraduationCap, Bookmark, ArrowRight,
  ChevronDown, Loader2, Share2
} from'lucide-react';
import axios from'axios';
import url from'../../url';
import'./JobsByCategory.css';
import StylishEmptyState from'../common/StylishEmptyState';

export default function JobsByCategory() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const categoryId = useMemo(() => {
    const idFromQuery = searchParams.get('id');
    if (idFromQuery) return idFromQuery;
    if (categorySlug && /^[0-9a-fA-F]{24}$/.test(categorySlug)) return categorySlug;
    return null;
  }, [searchParams, categorySlug]);

  const [allJobsInCategory, setAllJobsInCategory] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [masterCategories, setMasterCategories] = useState<any[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //  DYNAMIC FILTER STATES
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [selectedLocs, setSelectedLocs] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedExp, setSelectedExp] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['subcategory','location','type','experience']);

  const fetchData = useCallback(async () => {
    if (!categorySlug || !categoryId) {
      setError("Category reference missing.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [jobsRes, masterCatRes] = await Promise.all([
        axios.get(`${url}/jobs/category/${categoryId}?limit=100`),
        axios.get(`${url}/jobs/categories/fetch`)
      ]);
      if (jobsRes.data.success) {
        const fetchedJobs = jobsRes.data.data?.jobs || [];
        setAllJobsInCategory(fetchedJobs);
        setJobs(fetchedJobs);
        setCategoryInfo(jobsRes.data.data?.category || { name: categorySlug });
      }
      setMasterCategories(masterCatRes.data.categories || []);
    } catch (err) {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [categoryId, categorySlug]);

  useEffect(() => { fetchData(); }, [fetchData]);

  //  GENERATE DYNAMIC COUNTS FOR ALL FILTERS
  const filterStats = useMemo(() => {
    const stats = { sub: {} as any, loc: {} as any, type: {} as any, exp: {} as any };
    allJobsInCategory.forEach(j => {
      const s = j.subcategory ||'General';
      const l = j.location ||'Remote';
      const t = j.job_type ||'Other';
      const e = j.experience_required ||'Not Specified';
      stats.sub[s] = (stats.sub[s] || 0) + 1;
      stats.loc[l] = (stats.loc[l] || 0) + 1;
      stats.type[t] = (stats.type[t] || 0) + 1;
      stats.exp[e] = (stats.exp[e] || 0) + 1;
    });
    return stats;
  }, [allJobsInCategory]);

  //  FULL MULTI-FILTER LOGIC WITH PRIORITY SORTING
  useEffect(() => {
    let filtered = [...allJobsInCategory];
    if (selectedSubs.length > 0) filtered = filtered.filter(j => selectedSubs.includes(j.subcategory ||'General'));
    if (selectedLocs.length > 0) filtered = filtered.filter(j => selectedLocs.includes(j.location));
    if (selectedTypes.length > 0) filtered = filtered.filter(j => selectedTypes.includes(j.job_type));
    if (selectedExp.length > 0) filtered = filtered.filter(j => selectedExp.includes(j.experience_required));

    const now = new Date();
    filtered.sort((a, b) => {
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
        // Active: Newest posted first (descending)
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      } else {
        // Expired: Most recently expired first (deadline descending)
        const timeA = deadlineA ? deadlineA.getTime() : 0;
        const timeB = deadlineB ? deadlineB.getTime() : 0;
        if (timeA !== timeB) {
          return timeB - timeA;
        }
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }
    });

    setJobs(filtered);
  }, [selectedSubs, selectedLocs, selectedTypes, selectedExp, allJobsInCategory]);

  const toggleFilter = (list: string[], setList: Function, value: string) => {
    setList(list.includes(value) ? list.filter(i => i !== value) : [...list, value]);
  };

  const clearAll = () => {
    setSelectedSubs([]); setSelectedLocs([]); setSelectedTypes([]); setSelectedExp([]);
  };

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  };

  const getClosingTag = (deadline: string) => {
    const diff = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return <span className="closing-tag today">CLOSED</span>;
    if (diff <= 3) return <span className="closing-tag imminent">CLOSING IN {diff} DAYS</span>;
    return null;
  };

  if (loading) return <div className="job-loader"><Loader2 className="spinner" size={40} /></div>;

  return (
    <main className="category-jobs-page">
      <div className="container">
        {/* <nav className="job-breadcrumb">
          <Link to="/">Home</Link> <ChevronRight size={14} />
          <Link to="/jobs">Jobs</Link> <ChevronRight size={14} />
          <span className="active">{categoryInfo?.name}</span>
        </nav> */}

        {/* <header className="job-header">
          <div className="header-text">
            <h1 className="job-main-title">{categoryInfo?.name} Notifications</h1>
            <p className="job-sub-text">Daily updates on vacancies in this sector.</p>
          </div>
          <div className="job-stats">Showing <strong>{jobs.length}</strong> Results</div>
        </header> */}

        <div className="job-category-tabs">
          <button className="cat-tab" onClick={() => navigate('/jobs')}>All Jobs</button>
          {masterCategories.map(cat => (
            <button key={cat._id} className={`cat-tab ${categoryId === cat._id ?'active' :''}`} onClick={() => navigate(`/jobs/category/${cat.slug}?id=${cat._id}`)}>{cat.name}</button>
          ))}
        </div>

        <div className="job-marketplace-layout">
          {/*  FULLY DYNAMIC SIDEBAR */}
          <aside className="job-filters-sidebar">
            <div className="filter-header-row">
              <span className="filter-main-label">Filters</span>
              <button className="clear-link" onClick={clearAll}>Clear all</button>
            </div>

            {/* Sub-Category Group */}
            <div className={`filter-group ${expandedGroups.includes('subcategory') ?'open' :''}`}>
              <div className="group-label" onClick={() => toggleGroup('subcategory')}>Sub-Category <ChevronDown size={16} /></div>
              <div className="group-options">
                {Object.entries(filterStats.sub).map(([name, count]) => (
                  <label key={name}><input type="checkbox" checked={selectedSubs.includes(name)} onChange={() => toggleFilter(selectedSubs, setSelectedSubs, name)} /> {name} ({count})</label>
                ))}
              </div>
            </div>

            {/* Location Group */}
            <div className={`filter-group ${expandedGroups.includes('location') ?'open' :''}`}>
              <div className="group-label" onClick={() => toggleGroup('location')}>Location <ChevronDown size={16} /></div>
              <div className="group-options">
                {Object.entries(filterStats.loc).map(([name, count]) => (
                  <label key={name}><input type="checkbox" checked={selectedLocs.includes(name)} onChange={() => toggleFilter(selectedLocs, setSelectedLocs, name)} /> {name} ({count})</label>
                ))}
              </div>
            </div>

            {/* Job Type Group */}
            <div className={`filter-group ${expandedGroups.includes('type') ?'open' :''}`}>
              <div className="group-label" onClick={() => toggleGroup('type')}>Job Type <ChevronDown size={16} /></div>
              <div className="group-options">
                {Object.entries(filterStats.type).map(([name, count]) => (
                  <label key={name}><input type="checkbox" checked={selectedTypes.includes(name)} onChange={() => toggleFilter(selectedTypes, setSelectedTypes, name)} /> {name} ({count})</label>
                ))}
              </div>
            </div>

            {/* Experience Group */}
            <div className={`filter-group ${expandedGroups.includes('experience') ?'open' :''}`}>
              <div className="group-label" onClick={() => toggleGroup('experience')}>Experience <ChevronDown size={16} /></div>
              <div className="group-options">
                {Object.entries(filterStats.exp).map(([name, count]) => (
                  <label key={name}><input type="checkbox" checked={selectedExp.includes(name)} onChange={() => toggleFilter(selectedExp, setSelectedExp, name)} /> {name} ({count})</label>
                ))}
              </div>
            </div>
          </aside>

          <section className="job-listings-grid">
            {jobs.map((job) => (
              <div key={job._id} className="job-card-figma">
                {getClosingTag(job.deadline)}
                <div className="job-card-top">
                  <span className={`org-tag ${job.job_type?.toLowerCase()}`}>{job.organization_name.split('')[0]}</span>
                  <span className="post-time">Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="job-title-text">{job.title}</h3>
                <div className="job-meta-row">
                  <span><MapPin size={16} /> {job.location}</span>
                  <span className="dot"></span>
                  <span><Users size={16} /> {job.total_vacancies} Vacancies</span>
                  <span className="dot"></span>
                  <span><GraduationCap size={16} /> {job.qualifications_required?.[0] ||'Any Degree'}</span>
                </div>
                <div className="job-card-footer">
                  <Link to={`/job-details/${job._id}`} className="view-details-link">View Details <ArrowRight size={18} /></Link>
                  <div className="action-btns">
                    <button className="icon-action-btn"><Share2 size={20} /></button>
                    <button className="icon-action-btn"><Bookmark size={20} /></button>
                  </div>
                </div>
              </div>
            ))}
            {jobs.length === 0 && (
              <div style={{ gridColumn:'1 / -1', padding:'40px 0', width:'100%' }}>
                <StylishEmptyState 
                  title="No Jobs Found"
                  description="We couldn't find any job notifications matching your current filters. Try adjusting your preferences or clear all filters to see all available openings."
                  actionText="Clear All Filters"
                  actionPath="#"
                  onAction={clearAll}
                  showBack={false}
                />
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}