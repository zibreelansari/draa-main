import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, Building2, CalendarDays, GraduationCap, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { useReveal } from "../hooks/useReveal";

export type Course = {
  id: number; title: string; slug: string; discipline: string; level: string;
  durationMonths: number; tuitionFeeInr: number; mode: string; courseType: string;
  scholarshipAvailable: number; eligibility: string; startDate?: string;
  instituteName: string; instituteSlug: string; instituteType: string; city: string; state: string;
};

type Institute = { id:number; name:string; slug:string; city:string; state:string; type:string; description:string; imageUrl:string };
type Filters = { discipline:string; level:string; state:string; mode:string; courseType:string; scholarship:boolean };
const emptyFilters:Filters = {discipline:"",level:"",state:"",mode:"",courseType:"",scholarship:false};
const formatLabel = (value:string) => value.replace(/_/g," ").toLowerCase().replace(/\b\w/g,(letter)=>letter.toUpperCase());
const formatFee = (fee:number) => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(fee);

export default function CoursesPage() {
  useReveal();
  const [courses,setCourses]=useState<Course[]>([]);
  const [institutes,setInstitutes]=useState<Institute[]>([]);
  const [query,setQuery]=useState("");
  const [filters,setFilters]=useState<Filters>(emptyFilters);
  const [view,setView]=useState<"courses"|"institutes">("courses");
  const [error,setError]=useState("");

  useEffect(()=>{
    Promise.all([
      apiRequest<{courses:Course[]}>("/api/catalog/courses"),
      apiRequest<{institutes:Institute[]}>("/api/catalog/institutes"),
    ]).then(([courseData,instituteData])=>{setCourses(courseData.courses);setInstitutes(instituteData.institutes)}).catch((e)=>setError(e.message));
  },[]);

  const options = useMemo(()=>({
    disciplines:[...new Set(courses.map(c=>c.discipline))].sort(),
    states:[...new Set(courses.map(c=>c.state))].sort(),
  }),[courses]);

  const visibleCourses = useMemo(()=>courses.filter((course)=>{
    const haystack = `${course.title} ${course.discipline} ${course.instituteName} ${course.city} ${course.state}`.toLowerCase();
    return haystack.includes(query.toLowerCase())
      && (!filters.discipline || course.discipline===filters.discipline)
      && (!filters.level || course.level===filters.level)
      && (!filters.state || course.state===filters.state)
      && (!filters.mode || course.mode===filters.mode)
      && (!filters.courseType || course.courseType===filters.courseType)
      && (!filters.scholarship || Boolean(course.scholarshipAvailable));
  }),[courses,query,filters]);

  const visibleInstitutes = useMemo(()=>institutes.filter((institute)=>`${institute.name} ${institute.type} ${institute.city} ${institute.state}`.toLowerCase().includes(query.toLowerCase())),[institutes,query]);
  const setFilter=(name:keyof Filters,value:string|boolean)=>setFilters(current=>({...current,[name]:value}));

  return <>
    <section className="catalogue-hero"><div className="portal-shell" data-reveal>
      <span>DRAA PROGRAMME DISCOVERY</span>
      <h1>Explore courses and institutions across India.</h1>
      <p>Search an illustrative DRAA catalogue using the same decision points students need: discipline, level, location, format, course type and fee support.</p>
      <label className="catalogue-search"><Search size={20}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={view==="courses"?"Search by course, discipline or institution":"Search by institution, city or type"}/></label>
      <div className="catalogue-switch" role="tablist" aria-label="Catalogue view">
        <button role="tab" aria-selected={view==="courses"} onClick={()=>setView("courses")}><BookOpen size={16}/> Courses <strong>{courses.length}</strong></button>
        <button role="tab" aria-selected={view==="institutes"} onClick={()=>setView("institutes")}><Building2 size={16}/> Institutes <strong>{institutes.length}</strong></button>
      </div>
    </div></section>

    <section className="catalogue-page"><div className="portal-shell">
      {error&&<p className="form-error">{error}</p>}
      {view==="courses" ? <div className="catalogue-layout">
        <aside className="catalogue-filters" data-reveal>
          <header><SlidersHorizontal size={18}/><strong>Filter programmes</strong></header>
          <label>Discipline<select value={filters.discipline} onChange={e=>setFilter("discipline",e.target.value)}><option value="">All disciplines</option>{options.disciplines.map(value=><option key={value}>{value}</option>)}</select></label>
          <label>Programme level<select value={filters.level} onChange={e=>setFilter("level",e.target.value)}><option value="">All levels</option>{["UNDERGRADUATE","POSTGRADUATE","DOCTORAL","CERTIFICATE"].map(value=><option key={value} value={value}>{formatLabel(value)}</option>)}</select></label>
          <label>State<select value={filters.state} onChange={e=>setFilter("state",e.target.value)}><option value="">All states</option>{options.states.map(value=><option key={value}>{value}</option>)}</select></label>
          <label>Study mode<select value={filters.mode} onChange={e=>setFilter("mode",e.target.value)}><option value="">All modes</option>{["OFFLINE","BLENDED","ONLINE"].map(value=><option key={value} value={value}>{formatLabel(value)}</option>)}</select></label>
          <label>Course type<select value={filters.courseType} onChange={e=>setFilter("courseType",e.target.value)}><option value="">All course types</option>{["REGULAR","SHORT_TERM","SKILL_BASED"].map(value=><option key={value} value={value}>{formatLabel(value)}</option>)}</select></label>
          <label className="filter-checkbox"><input type="checkbox" checked={filters.scholarship} onChange={e=>setFilter("scholarship",e.target.checked)}/> Fee support indicated</label>
          <button onClick={()=>{setFilters(emptyFilters);setQuery("")}}>Clear all filters</button>
        </aside>
        <div className="catalogue-results">
          <header><div><span>PROGRAMMES</span><h2>{visibleCourses.length} opportunities found</h2></div><small>Demonstration catalogue · Verify directly before applying</small></header>
          <div className="programme-results">{visibleCourses.map(course=><article key={course.id} data-reveal>
            <div className="programme-card-top"><span>{formatLabel(course.courseType)}</span>{Boolean(course.scholarshipAvailable)&&<em>Fee support indicated</em>}</div>
            <h3>{course.title}</h3><p>{course.instituteName}</p>
            <div className="programme-meta"><span><GraduationCap size={14}/>{formatLabel(course.level)}</span><span><MapPin size={14}/>{course.city}, {course.state}</span><span><CalendarDays size={14}/>{course.durationMonths} months · {formatLabel(course.mode)}</span></div>
            <div className="programme-card-bottom"><div><small>Indicative tuition</small><strong>{formatFee(course.tuitionFeeInr)}</strong></div><Link to={`/courses/${course.slug}`}>View programme <ArrowRight size={14}/></Link></div>
          </article>)}</div>
          {!visibleCourses.length&&<div className="catalogue-empty"><Search size={28}/><h3>No programmes match these filters.</h3><p>Clear one or more filters and try again.</p></div>}
        </div>
      </div> : <div className="institute-results">
        <header data-reveal><span>INSTITUTION DIRECTORY</span><h2>{visibleInstitutes.length} demonstration profiles</h2><p>These profiles show how participating institutions will appear after DRAA verification and onboarding.</p></header>
        <div>{visibleInstitutes.map(institute=><article key={institute.id} data-reveal><img src={institute.imageUrl} alt=""/><div><span>{institute.type}</span><h3>{institute.name}</h3><p>{institute.description}</p><small><MapPin size={14}/>{institute.city}, {institute.state}</small><button onClick={()=>{setView("courses");setQuery(institute.name)}}>View programmes <ArrowRight size={14}/></button></div></article>)}</div>
      </div>}
    </div></section>
  </>;
}
