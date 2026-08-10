
import MainFooter from"../../layouts/footers/MainFooter";
import HeaderOne from"../../layouts/headers/HeaderOne";
import Breadcrumb from"../common/Breadcrumb";
// import Preloader from"../common/Preloader";
import ScrollTop from"../common/ScrollTop";
import ScrollToTop from"../common/ScrollToTop";
import GridBlogArea from"./GridBlogArea";
import SEO from"../common/SEO";
import usePageTitle from '../../hooks/usePageTitle';

export default function GridBlog() {
  usePageTitle('Blog | Draa');
  return (
    <>
      <SEO 
        title="Blogs" 
        description="Read insightful articles, study tips, competitive exam strategies, and academic updates on the Draa Blog." 
      />
      {/* <Preloader /> */}
      <HeaderOne />
      <Breadcrumb 
        title="Blogs" 
        subtitle="Insights and tips for competitive exam preparation." 
        category="Blogs"
      />
      <GridBlogArea />
      <MainFooter />
      <ScrollToTop />
      <ScrollTop />
    </>
  )
}
