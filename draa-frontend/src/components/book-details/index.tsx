import MainFooter from"../../layouts/footers/MainFooter";
import HeaderOne from"../../layouts/headers/HeaderOne";
import ScrollTop from"../common/ScrollTop";
import ScrollToTop from"../common/ScrollToTop";
// import InquiryPopUp from"../common/studentInqury";
import BookDetailsArea from"./bookDetails";
import usePageTitle from '../../hooks/usePageTitle';

 

export default function BookDetails() {
  usePageTitle('Book Details | Draa');
  return (
    <>
      <HeaderOne />
      <BookDetailsArea />
      <MainFooter />
      {/* <InquiryPopUp/> */}
      <ScrollToTop />
      <ScrollTop />
    </>
  )
}
