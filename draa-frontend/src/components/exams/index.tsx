
import MainFooter from"../../layouts/footers/MainFooter";
import HeaderOne from"../../layouts/headers/HeaderOne";
// import Breadcrumb from"../common/Breadcrumb";
// import Preloader from"../common/Preloader";
import ScrollTop from"../common/ScrollTop";
import ScrollToTop from"../common/ScrollToTop";
import ExamsPage from"./ExamsPage";
import SEO from"../common/SEO";
import usePageTitle from '../../hooks/usePageTitle';

export default function ExamIndexPage() {
  usePageTitle('Exams | Draa');
    return (
        <>
            <SEO 
                title="Exams" 
                description="Stay updated with all upcoming competitive exam alerts, syllabus updates, exam dates, cutoffs, and preparation resources on Draa." 
            />
            {/* <Preloader /> */}
            <HeaderOne />
            {/* <Breadcrumb title="Grid Blog" subtitle="Grid Blog" /> */}
            <ExamsPage />
            <MainFooter />
            <ScrollToTop />
            <ScrollTop />
        </>
    )
}
