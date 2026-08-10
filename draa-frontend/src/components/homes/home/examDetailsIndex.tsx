import MainFooter from"../../../layouts/footers/MainFooter";
import HeaderOne from"../../../layouts/headers/HeaderOne";
import ScrollToTop from"../../common/ScrollToTop";
// import InquiryPopUp from"../../common/studentInqury";

import ExamDetails from"./ExamDetails";
import usePageTitle from '../../../hooks/usePageTitle';

 

export default function ExamDetailsIndex() {
  usePageTitle('Exam Details | Draa');
  return (
    <>
      {/* <Preloader /> */}
      <HeaderOne />

      <ExamDetails />

      {/* <InquiryPopUp/> */}
      <MainFooter />
      <ScrollToTop />
    
    </>
  )
}
