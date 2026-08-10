import FooterOne from"../../layouts/footers/FooterOne";
import HeaderOne from"../../layouts/headers/HeaderOne";
import Breadcrumb from"../common/Breadcrumb";
import ScrollToTop from"../common/ScrollToTop";
import StandardBlogArea from"./StandardBlogArea";


 

import usePageTitle from"../../hooks/usePageTitle";

export default function StandardBlog() {
  usePageTitle('Expert Blog');
  return (
    <>
      <HeaderOne />
      <Breadcrumb 
        title="Our Experts' Blog" 
        subtitle="In-depth articles and guides to help you master every subject." 
        category="Blog"
      />
      <StandardBlogArea />
      <FooterOne />
      <ScrollToTop />
    </>
  )
}
