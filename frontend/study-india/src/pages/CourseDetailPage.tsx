import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Building2, CalendarDays, Check, Clock3, GraduationCap, IndianRupee, MapPin, Monitor } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../lib/api";
import type { Course } from "./CoursesPage";

type CourseDetail = Course & { instituteDescription:string; imageUrl:string };
const label = (value:string) => value.replace(/_/g," ").toLowerCase().replace(/\b\w/g,(letter)=>letter.toUpperCase());
const money = (value:number) => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(value);

export default function CourseDetailPage(){
  const {slug=""}=useParams();
  const [course,setCourse]=useState<CourseDetail|null>(null);
  const [error,setError]=useState("");
  useEffect(()=>{apiRequest<{course:CourseDetail}>(`/api/catalog/courses/${slug}`).then(data=>setCourse(data.course)).catch(e=>setError(e.message))},[slug]);
  if(error)return <section className="dashboard-state"><h1>Programme unavailable</h1><p>{error}</p><Link to="/courses">Return to catalogue</Link></section>;
  if(!course)return <section className="dashboard-state"><p>Loading programme details…</p></section>;
  return <>
    <section className="course-detail-hero"><img src={course.imageUrl} alt=""/><div className="course-detail-shade"/><div className="portal-shell">
      <Link to="/courses"><ArrowLeft size={15}/> Back to all programmes</Link><span>{course.discipline}</span><h1>{course.title}</h1><p><Building2 size={17}/>{course.instituteName}</p>
    </div></section>
    <section className="course-detail-page"><div className="portal-shell course-detail-grid">
      <main>
        <div className="course-detail-facts">
          <div><GraduationCap/><span>Level<strong>{label(course.level)}</strong></span></div>
          <div><Clock3/><span>Duration<strong>{course.durationMonths} months</strong></span></div>
          <div><Monitor/><span>Study mode<strong>{label(course.mode)}</strong></span></div>
          <div><MapPin/><span>Location<strong>{course.city}, {course.state}</strong></span></div>
        </div>
        <article><span>PROGRAMME OVERVIEW</span><h2>What to know before applying</h2><p>This {label(course.courseType).toLowerCase()} programme is listed in the DRAA demonstration catalogue to show how learners can compare academic opportunities. Curriculum, recognition, intake and final fees must be confirmed with the institution.</p></article>
        <article><span>ELIGIBILITY</span><h2>Academic preparation</h2><p>{course.eligibility}</p><ul><li><Check/>Verified academic transcripts and certificates</li><li><Check/>Valid passport and consistent personal information</li><li><Check/>Any programme-specific language, portfolio or entrance evidence</li></ul></article>
        <article><span>INSTITUTION</span><h2>{course.instituteName}</h2><p>{course.instituteDescription}</p><small><MapPin size={14}/>{course.city}, {course.state} · {course.instituteType}</small></article>
      </main>
      <aside>
        <span>APPLICATION SUMMARY</span><div><IndianRupee/><small>Indicative tuition</small><strong>{money(course.tuitionFeeInr)}</strong></div>
        <p><CalendarDays size={15}/>Indicative start: {course.startDate ? new Date(course.startDate).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}) : "Confirm with institution"}</p>
        {Boolean(course.scholarshipAvailable)&&<em>Institutional fee support may be available</em>}
        <Link to="/login/student">Apply through your dashboard <ArrowRight size={15}/></Link>
        <small>This is an illustrative programme record. DRAA does not guarantee admission, fees, funding or an intake date.</small>
      </aside>
    </div></section>
  </>;
}
