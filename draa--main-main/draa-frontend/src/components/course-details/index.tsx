import MainFooter from"../../layouts/footers/MainFooter";
import HeaderOne from"../../layouts/headers/HeaderOne";
import ScrollTop from"../common/ScrollTop";
import ScrollToTop from"../common/ScrollToTop";
import InquiryPopUp from"../common/studentInqury";
import CourseDetailsArea from"./CourseDetailsArea";
import usePageTitle from '../../hooks/usePageTitle';
import'./courseDetailsarea.css'
 

export default function CourseDetails() {
  usePageTitle('Course Details | Draa');
  return (
    <>
      <HeaderOne />
      <CourseDetailsArea />
      {/* <InquiryPopUp/> */}
      <MainFooter />
      <ScrollToTop />
      <ScrollTop />
    </>
  )
}
