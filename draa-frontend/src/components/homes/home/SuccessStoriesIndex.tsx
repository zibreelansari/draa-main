import MainFooter from"../../../layouts/footers/MainFooter";
import HeaderOne from"../../../layouts/headers/HeaderOne";
import Breadcrumb from"../../common/Breadcrumb";
// import ScrollTop from"../common/ScrollTop";
import ScrollToTop from"../../common/ScrollToTop";
import SuccessStories from"./SuccessStories";
import usePageTitle from '../../../hooks/usePageTitle';

export default function SuccessStoriesIndex() {
  usePageTitle('Success Stories | Draa');
  return (
    <>
      <HeaderOne />
      <Breadcrumb
        title="Success Stories"
        subtitle="Real students. Real results. Join thousands who cracked their dream exams with Draa."
        category="Success Stories"
      />
      <SuccessStories />
      <MainFooter />
      <ScrollToTop />
      {/* <ScrollTop /> */}
    </>
  );
}
