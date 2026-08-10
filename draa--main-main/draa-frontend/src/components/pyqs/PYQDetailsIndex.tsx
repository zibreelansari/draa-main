import HeaderOne from'../../layouts/headers/HeaderOne'
import Breadcrumb from'../common/Breadcrumb'
import ScrollToTop from'../common/ScrollToTop'
import ScrollTop from'../common/ScrollTop'
import MainFooter from'../../layouts/footers/MainFooter'
import PYQDetails from'./PYQDetails'
import SEO from'../common/SEO';
import { useParams } from'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';

export default function PYQDetailsIndex() {
  usePageTitle('PYQ Details | Draa');
  const { examName } = useParams<{ examName: string }>();
  const decodedName = decodeURIComponent(examName ||'Exam Papers');

  return (
    <>
      <SEO 
        title={`${decodedName} Previous Year Papers`} 
        description={`Download free PDF collections of official previous year question papers (PYQs) with solutions for ${decodedName} exams on Draa.`} 
      />
      <HeaderOne />
      {/* <Breadcrumb 
        title={`${decodedName} PYQs`} 
        subtitle="Explore specific previous year question papers categorized by year and stage." 
        category="Study Materials"
        isFree={true}
      /> */}
      <PYQDetails />
      <MainFooter />
      <ScrollToTop />
      <ScrollTop />
    </>
  )
}
