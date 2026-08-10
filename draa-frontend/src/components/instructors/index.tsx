import MainFooter from"../../layouts/footers/MainFooter";
import HeaderOne from"../../layouts/headers/HeaderOne";
import Breadcrumb from"../common/Breadcrumb";
import ScrollToTop from"../common/ScrollToTop";
import InstructorsHomeOne from"../homes/home/InstructorsHomeOne";
import usePageTitle from '../../hooks/usePageTitle';

 

export default function Instructors() {
  usePageTitle('Instructors | Draa');
  return (
    <>
      <HeaderOne />
      <Breadcrumb 
        title="Meet Our Instructors" 
        subtitle="Learn from the best educators in the industry who are dedicated to your success." 
        category="Team"
        paths={[{ pathName:"Instructors" }]}
      />
      <InstructorsHomeOne />
      {/* <InstructorsHomeOne style_2={true} style_3={true} /> */}
      <MainFooter />
      <ScrollToTop />
    </>
  )
}
