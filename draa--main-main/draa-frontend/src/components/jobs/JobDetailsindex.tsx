import MainFooter from"../../layouts/footers/MainFooter";
import HeaderOne from"../../layouts/headers/HeaderOne";
import ScrollTop from"../common/ScrollTop";
import ScrollToTop from"../common/ScrollToTop";


// import InquiryPopUp from"../common/studentInqury";
import JobDetailsArea from"./jobsDetailsArea";
import usePageTitle from '../../hooks/usePageTitle';
 

export default function JobsDetails() {
  usePageTitle('Job Details | Draa');
  return (
    <>
      <HeaderOne />
      <JobDetailsArea />
      <MainFooter />
      {/* <InquiryPopUp /> */}
      <ScrollToTop />
      <ScrollTop />
    </>
  )
}
