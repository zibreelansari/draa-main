
import MainFooter from"../../layouts/footers/MainFooter";
import HeaderOne from"../../layouts/headers/HeaderOne";
// import Breadcrumb from"../common/Breadcrumb";
// import Preloader from"../common/Preloader";
import ScrollTop from"../common/ScrollTop";
import ScrollToTop from"../common/ScrollToTop";


// import InquiryPopUp from"../common/studentInqury";
import JobsByCategory from"./SpecificCategoryWisejobsArea";
 

export default function JobsCategoryWise() {
  return (
    <>
      {/* <Preloader /> */}
      <HeaderOne />
      {/* <Breadcrumb title="Job Category" subtitle="Job Category" /> */}
      <JobsByCategory />
      <MainFooter/>
      {/* <InquiryPopUp /> */}
      <ScrollToTop />
      <ScrollTop />
    </>
  )
}
