import MainFooter from"../../layouts/footers/MainFooter";
import HeaderOne from"../../layouts/headers/HeaderOne";
import Breadcrumb from"../common/Breadcrumb";
import ScrollTop from"../common/ScrollTop";
import ScrollToTop from"../common/ScrollToTop";
// import InquiryPopUp from"../common/studentInqury";
import CategoryWiseTestSeries from"./CategoryWiseTestSeries";
import usePageTitle from '../../hooks/usePageTitle';

 

export default function CategoryWiseOnlineTestSeries() {
  usePageTitle('Test Series | Draa');
  return (
    <>
      <HeaderOne />
      <Breadcrumb 
        title="Category Specific Test Series" 
        subtitle="Practice with tests specifically designed for your target examination." 
        category="Test Series"
      />
      <CategoryWiseTestSeries/>
      <MainFooter />
      {/* <InquiryPopUp /> */}
      <ScrollToTop />
      <ScrollTop />
    </>
  )
}
