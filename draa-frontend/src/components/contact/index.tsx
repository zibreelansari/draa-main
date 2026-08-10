
import MainFooter from"../../layouts/footers/MainFooter";
import HeaderOne from"../../layouts/headers/HeaderOne";
import Breadcrumb from"../common/Breadcrumb";
// import Preloader from"../common/Preloader";
import ScrollTop from"../common/ScrollTop";
import ScrollToTop from"../common/ScrollToTop";
import ContactForm from"./ContactForm";
import GoogleMap from"./GoogleMap";

 

import SEO from"../common/SEO";
import usePageTitle from '../../hooks/usePageTitle';

export default function Contact() {
  usePageTitle('Contact Us | Draa');
  return (
    <>
      <SEO 
        title="Contact Us" 
        description="Get in touch with the Draa support team. Reach out to us for queries regarding courses, books, test series, or partnerships." 
      />
      {/* <Preloader /> */}
      <HeaderOne />
      {/* <Breadcrumb 
        title="Get in Touch" 
        subtitle="Have questions? Our team is here to help you with your exam preparation needs." 
        category="Contact"
        paths={[
          { pathName:"Contact" }
        ]}
      /> */}
      <ContactForm />
      <GoogleMap />
      <MainFooter />
      <ScrollToTop />
      <ScrollTop />
    </>
  )
}
