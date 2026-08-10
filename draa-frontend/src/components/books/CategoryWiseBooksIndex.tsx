
import MainFooter from "../../layouts/footers/MainFooter";
import HeaderOne from "../../layouts/headers/HeaderOne";
import Breadcrumb from "../common/Breadcrumb";
// import Preloader from "../common/Preloader";
import ScrollTop from "../common/ScrollTop";
import ScrollToTop from "../common/ScrollToTop";

// import './courses.css'
import InquiryPopUp from "../common/studentInqury";
import BooksCategoryPage from "./CategoryWiseBooks";
import usePageTitle from '../../hooks/usePageTitle';


export default function CategoryWiseBooks() {
  usePageTitle('Books by Category | Draa');

  return (
    <>
      {/* <Preloader /> */}
      <HeaderOne />
      <Breadcrumb 
        title="Books by Category" 
        subtitle="Hand-picked books and study materials to help you excel in your exams."
        category="Books"
      />
      <BooksCategoryPage />
      <MainFooter />
      {/* <InquiryPopUp/> */}
      <ScrollToTop />
      <ScrollTop />
    </>
  )
}
