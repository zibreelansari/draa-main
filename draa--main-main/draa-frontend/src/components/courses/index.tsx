
import HeaderOne from"../../layouts/headers/HeaderOne";
import Breadcrumb from"../common/Breadcrumb";
// import Preloader from"../common/Preloader";
import ScrollTop from"../common/ScrollTop";
import ScrollToTop from"../common/ScrollToTop";
// import CoursesHomeOne from"../homes/home/CoursesHomeOne";
import'./courses.css'
// import InquiryPopUp from"../common/studentInqury";
import CoursesArea from"./CoursesArea";
import SEO from"../common/SEO";
import MainFooter from "../../layouts/footers/MainFooter";
import usePageTitle from '../../hooks/usePageTitle';

export default function Courses() {
  usePageTitle('Courses | Draa');
  return (
    <>
      <SEO 
        title="Online Courses" 
        description="Browse and explore expert-led online courses on Draa. Find the right preparation program for your target competitive exams." 
      />
      {/* <Preloader /> */}
      <HeaderOne />
      <Breadcrumb 
        theme="courses"
        title="Explore All Courses" 
        subtitle="Enhance your skills with our wide range of professional courses taught by experts." 
        category="Courses"
      />
      <CoursesArea />
      <MainFooter />
      {/* <InquiryPopUp /> */}
      <ScrollToTop />
      <ScrollTop />
    </>
  )
}
