 

import AboutHomeOne from'../homes/home/AboutHomeOne'

import HeaderOne from'../../layouts/headers/HeaderOne'
import Breadcrumb from'../common/Breadcrumb'
// import FooterOne from'../../layouts/footers/FooterOne'
import ScrollToTop from'../common/ScrollToTop'
import ScrollTop from'../common/ScrollTop'
// import Preloader from'../common/Preloader'
import'../../styles/index.css'
import MainFooter from'../../layouts/footers/MainFooter'
import NumbersSpeak from'../homes/home/NumbersSpeak'
import SEO from'../common/SEO'
import usePageTitle from '../../hooks/usePageTitle';

export default function About() {
  usePageTitle('About Us | Draa');
  return (
    <>
      <SEO 
        title="About Us" 
        description="Learn more about Draa, our mission, expert educators, and our commitment to helping students succeed in competitive exams." 
      />
      {/* <Preloader /> */}
      <HeaderOne />
      <Breadcrumb 
        title="About Draa" 
        subtitle="Empowering learners with quality education resources and expert guidance." 
        category="About"
      />
      {/* <FeatureHomeOne /> */}
      <AboutHomeOne />
      <NumbersSpeak />
      {/* <InstructorsHomeOne/> */}
      <MainFooter />
      <ScrollToTop />
      <ScrollTop />
    </>
  )
}
