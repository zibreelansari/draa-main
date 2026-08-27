import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  BookOpenText,
  CalendarDays,
  ChevronRight,
  Clock3,
  GraduationCap,
  MapPin,
  Play,
  Search,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { educationalBlogs, notifications, recordedVideos } from "../data/resources";
import { useReveal } from "../hooks/useReveal";

const notificationCategories = ["All updates", "Admissions", "Scholarships", "Events", "Guidance"];
const blogCategories = ["All articles", "Programme planning", "Indian education", "Student life", "Applications", "Admissions"];

function ResourceHero({
  eyebrow,
  title,
  accent,
  description,
  icon: Icon,
  stats,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  icon: typeof Bell;
  stats: { value: string; label: string }[];
}) {
  return (
    <section className="resource-hero">
      <div className="portal-shell resource-hero-grid">
        <div className="resource-hero-copy" data-reveal>
          <div className="resource-breadcrumb"><Link to="/">Home</Link><ChevronRight size={14}/><span>{eyebrow}</span></div>
          <span className="resource-kicker"><Sparkles size={14}/>{eyebrow}</span>
          <h1>{title} <em>{accent}</em></h1>
          <p>{description}</p>
          <div className="resource-stats" aria-label={`${eyebrow} overview`}>
            {stats.map((stat) => <span key={stat.label}><strong>{stat.value}</strong><small>{stat.label}</small></span>)}
          </div>
        </div>
        <div className="resource-hero-art" aria-hidden="true" data-reveal>
          <span className="art-orbit art-orbit-one"/><span className="art-orbit art-orbit-two"/>
          <div className="art-icon"><Icon size={64}/></div>
          <span className="art-note note-one">DRAA updates</span>
          <span className="art-note note-two">Student resources</span>
        </div>
      </div>
    </section>
  );
}

function NotificationsPage() {
  const [category, setCategory] = useState("All updates");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("Latest");
  const visible = useMemo(() => {
    const filtered = notifications.filter((item) =>
      (category === "All updates" || item.category === category) &&
      `${item.title} ${item.organisation} ${item.summary}`.toLowerCase().includes(query.toLowerCase()),
    );
    return sort === "Oldest" ? [...filtered].reverse() : filtered;
  }, [category, query, sort]);

  return <>
    <ResourceHero eyebrow="Notifications" title="Important updates," accent="clearly explained." description="Follow DRAA guidance on admissions, scholarships, student events and practical planning for your study journey in India." icon={Bell} stats={[{value:"6",label:"Published updates"},{value:"4",label:"Guidance areas"},{value:"Weekly",label:"Editorial review"}]}/>
    <section className="opportunity-strip">
      <div className="portal-shell" data-reveal>
        <div><span>Explore updates</span><h2>Find what matters to your journey</h2></div>
        <div className="resource-category-row" role="group" aria-label="Filter notification categories">
          {notificationCategories.map((item, index) => <button key={item} className={category===item?"active":""} onClick={()=>setCategory(item)}><span>{index===0?<Bell size={17}/>:index===1?<GraduationCap size={17}/>:index===2?<Sparkles size={17}/>:index===3?<CalendarDays size={17}/>:<BookOpenText size={17}/>}</span>{item}</button>)}
        </div>
      </div>
    </section>
    <section className="resource-list-section">
      <div className="portal-shell">
        <div className="resource-list-header" data-reveal>
          <div><span>LATEST INFORMATION</span><h2>{category}</h2><p>{visible.length} relevant {visible.length===1?"update":"updates"}</p></div>
          <div className="resource-tools">
            <label><Search size={18}/><span className="sr-only">Search notifications</span><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Search updates…"/></label>
            <select aria-label="Sort notifications" value={sort} onChange={(event)=>setSort(event.target.value)}><option>Latest</option><option>Oldest</option></select>
          </div>
        </div>
        {visible.length ? <div className="notification-grid">
          {visible.map((item) => <article key={item.title} className="notification-card" data-reveal>
            <header><span className="notification-icon"><Bell size={19}/></span><em>{item.status}</em></header>
            <div className="notification-card-body">
              <span className="notification-org">{item.organisation}</span><h3>{item.title}</h3>
              <div className="notification-meta"><span><MapPin size={14}/>{item.location}</span><span><CalendarDays size={14}/>{item.date}</span></div>
              <p>{item.summary}</p><ul>{item.points.map((point)=><li key={point}>{point}</li>)}</ul>
              <Link to="/contact">Ask DRAA for guidance <ArrowRight size={16}/></Link>
            </div>
          </article>)}
        </div>:<div className="resource-empty"><Search size={28}/><h3>No matching updates</h3><p>Try another search term or choose a different category.</p></div>}
      </div>
    </section>
  </>;
}

function BlogsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All articles");
  const [sort, setSort] = useState("Latest");
  const visible = useMemo(() => {
    const filtered = educationalBlogs.filter((item)=>
      (category === "All articles" || item.category === category) &&
      `${item.title} ${item.category} ${item.excerpt}`.toLowerCase().includes(query.toLowerCase()),
    );
    return sort === "Oldest" ? [...filtered].reverse() : filtered;
  }, [category, query, sort]);
  const featured = educationalBlogs[0];
  return <>
    <ResourceHero eyebrow="Educational Blogs" title="Useful thinking for" accent="better decisions." description="Read practical, professionally reviewed guidance created to help international students compare options and plan with confidence." icon={BookOpenText} stats={[{value:"6",label:"Guidance articles"},{value:"5",label:"Student topics"},{value:"DRAA",label:"Editorial desk"}]}/>
    <section className="featured-resource-section"><div className="portal-shell">
      <article className="featured-blog" data-reveal><img src={featured.image} alt={featured.alt}/><div><span>FEATURED GUIDE · {featured.readTime}</span><h2>{featured.title}</h2><p>{featured.excerpt}</p><button type="button">Read featured guide <ArrowRight size={17}/></button></div></article>
    </div></section>
    <section className="blog-explore-section"><div className="portal-shell" data-reveal>
      <div><span>EXPLORE BY TOPIC</span><h2>Articles built around student decisions</h2><p>Move from broad discovery to the guidance you need right now.</p></div>
      <div className="blog-category-row" role="group" aria-label="Filter blog topics">
        {blogCategories.map((item, index)=><button key={item} className={category===item?"active":""} onClick={()=>setCategory(item)}><span>{index===0?<BookOpenText size={17}/>:index===1?<GraduationCap size={17}/>:index===2?<Sparkles size={17}/>:index===3?<MapPin size={17}/>:index===4?<CalendarDays size={17}/>:<Bell size={17}/>}</span>{item}</button>)}
      </div>
    </div></section>
    <section className="resource-list-section blog-list-section"><div className="portal-shell">
      <div className="resource-list-header" data-reveal><div><span>DRAA EDITORIAL</span><h2>{category}</h2><p>Clear guidance without unnecessary jargon.</p></div><div className="resource-tools"><select aria-label="Sort educational blogs" value={sort} onChange={(event)=>setSort(event.target.value)}><option>Latest</option><option>Oldest</option></select><label><Search size={18}/><span className="sr-only">Search educational blogs</span><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Search articles…"/></label><span className="resource-count"><strong>{visible.length}</strong> Articles</span></div></div>
      <div className="blog-grid">{visible.map((item)=><article className="blog-card" key={item.title} data-reveal><div className="blog-card-media"><img src={item.image} style={{objectPosition:"imagePosition" in item?item.imagePosition:"center"}} alt={item.alt}/><span>{item.category}</span></div><div><div className="blog-card-meta"><span>{item.date}</span><span><Clock3 size={14}/>{item.readTime}</span></div><h3>{item.title}</h3><p>{item.excerpt}</p><button type="button">Read article <ArrowRight size={16}/></button></div></article>)}</div>
      {!visible.length&&<div className="resource-empty"><Search size={28}/><h3>No matching articles</h3><p>Try another search term or choose a different topic.</p></div>}
    </div></section>
  </>;
}

function VideosPage() {
  const [query, setQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<(typeof recordedVideos)[number] | null>(null);
  useEffect(()=>{
    if(!selectedVideo)return;
    const closeOnEscape=(event:KeyboardEvent)=>{if(event.key==="Escape")setSelectedVideo(null)};
    document.addEventListener("keydown",closeOnEscape);
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    return()=>{document.removeEventListener("keydown",closeOnEscape);document.body.style.overflow=previousOverflow};
  },[selectedVideo]);
  const visible = recordedVideos.filter((item)=>`${item.title} ${item.category} ${item.description}`.toLowerCase().includes(query.toLowerCase()));
  const featured = recordedVideos[0];
  return <>
    <ResourceHero eyebrow="Recorded Videos" title="See learning environments" accent="come to life." description="Explore short, authentic university moments showing classroom learning, research, collaboration and digital study." icon={Video} stats={[{value:"4",label:"Campus videos"},{value:"4",label:"Learning settings"},{value:"Free",label:"Student access"}]}/>
    <section className="featured-resource-section"><div className="portal-shell">
      <article className="featured-video" data-reveal><img src={featured.image} alt="University students collaborating around a study table"/><div className="featured-video-shade"/><button type="button" onClick={()=>setSelectedVideo(featured)} aria-label={`Play ${featured.title}`}><Play fill="currentColor" size={25}/></button><div className="featured-video-copy"><span>FEATURED VIDEO · {featured.duration}</span><h2>{featured.title}</h2><p>{featured.description}</p></div></article>
    </div></section>
    <section className="resource-list-section video-list-section"><div className="portal-shell">
      <div className="resource-list-header" data-reveal><div><span>DRAA VIDEO LIBRARY</span><h2>Recorded guidance</h2><p>Focused explanations for each stage of your journey.</p></div><div className="resource-tools"><label><Search size={18}/><span className="sr-only">Search recorded videos</span><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Search videos…"/></label></div></div>
      <div className="video-grid">{visible.map((item)=><article className="video-card" key={item.title} data-reveal><div className="video-card-media"><img src={item.image} alt=""/><button type="button" onClick={()=>setSelectedVideo(item)} aria-label={`Play ${item.title}`}><Play fill="currentColor" size={18}/></button><span>{item.duration}</span></div><div><span>{item.category}</span><h3>{item.title}</h3><p>{item.description}</p><button type="button" onClick={()=>setSelectedVideo(item)}>Watch video <ArrowRight size={16}/></button></div></article>)}</div>
    </div></section>
    {selectedVideo&&<div className="video-modal" role="dialog" aria-modal="true" aria-label={selectedVideo.title} onMouseDown={(event)=>{if(event.target===event.currentTarget)setSelectedVideo(null)}}>
      <div className="video-modal-panel">
        <button className="video-modal-close" type="button" autoFocus onClick={()=>setSelectedVideo(null)} aria-label="Close video"><X size={20}/></button>
        <video key={selectedVideo.video} controls autoPlay playsInline preload="metadata" poster={selectedVideo.image}><source src={selectedVideo.video} type="video/mp4"/>Your browser does not support HTML video.</video>
        <div><span>{selectedVideo.category} · {selectedVideo.duration}</span><h2>{selectedVideo.title}</h2><p>{selectedVideo.description}</p><a href={selectedVideo.source} target="_blank" rel="noreferrer">{selectedVideo.credit} <ArrowRight size={15}/></a></div>
      </div>
    </div>}
  </>;
}

export default function ResourcesPage() {
  useReveal();
  const { pathname } = useLocation();
  if (pathname === "/educational-blogs") return <BlogsPage/>;
  if (pathname === "/recorded-videos") return <VideosPage/>;
  return <NotificationsPage/>;
}
