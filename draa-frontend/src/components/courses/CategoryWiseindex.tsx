
import HeaderOne from"../../layouts/headers/HeaderOne";
import Breadcrumb from"../common/Breadcrumb";
import { useParams } from"react-router-dom";

import ScrollTop from"../common/ScrollTop";
import ScrollToTop from"../common/ScrollToTop";

import'./courses.css'
// import InquiryPopUp from"../common/studentInqury";
import CategoryCourses from"./CategoryWiseCourses";
import MainFooter from"../../layouts/footers/MainFooter";
import usePageTitle from '../../hooks/usePageTitle';
 

export default function CategoryWiseCourses() {
  usePageTitle('Courses by Category | Draa');
  const { category } = useParams<{ category: string }>();

  return (
    <>
      {/* <Preloader /> */}
      <HeaderOne />
      <Breadcrumb 
        title={`${category} Courses`} 
        subtitle={`Master your preparation for ${category} with our expert-designed course materials.`} 
        category="Courses"
      />
      <CategoryCourses/>
      <MainFooter />
      {/* <InquiryPopUp /> */}
      <ScrollToTop />
      <ScrollTop />
    </>
  )
}
