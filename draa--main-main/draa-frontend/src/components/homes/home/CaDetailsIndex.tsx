import MainFooter from"../../../layouts/footers/MainFooter";
import HeaderOne from"../../../layouts/headers/HeaderOne";
import ScrollToTop from"../../common/ScrollToTop";
// import InquiryPopUp from"../../common/studentInqury";
import CurrentAffairDetails from"./CaDetails";
import usePageTitle from '../../../hooks/usePageTitle';


 

export default function CADetailsIndex() {
  usePageTitle('Current Affairs | Draa');
  return (
    <>
      {/* <Preloader /> */}
      <HeaderOne />

      <CurrentAffairDetails />

      {/* <InquiryPopUp/> */}
      <MainFooter />
      <ScrollToTop />
    
    </>
  )
}
