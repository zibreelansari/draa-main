
import HeaderOne from"../../layouts/headers/HeaderOne";
// import Breadcrumb from"../common/Breadcrumb";
// import Preloader from"../common/Preloader";
import ScrollTop from"../common/ScrollTop";
import ScrollToTop from"../common/ScrollToTop";
import BlogDetailsArea from"./BlogDetailsArea";

// import InquiryPopUp from"../common/studentInqury";
import MainFooter from"../../layouts/footers/MainFooter";

 
import usePageTitle from"../../hooks/usePageTitle";

export default function BlogDetails() {
  usePageTitle('Blog Details');
  return (
    <>
      {/* <Preloader /> */}
      <HeaderOne />
      {/* <Breadcrumb title="Blog Details" subtitle="Blog Details" /> */}
      <BlogDetailsArea />
       {/* <InquiryPopUp/> */}
      <MainFooter />
      <ScrollToTop />
      <ScrollTop />
    </>
  )
}
