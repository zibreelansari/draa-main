 
import HeaderOne from'../../layouts/headers/HeaderOne';
import Breadcrumb from'../common/Breadcrumb';
import ScrollToTop from'../common/ScrollToTop'
import ScrollTop from'../common/ScrollTop'
import'../../styles/index.css'
import PrivacyPolicyPage from'./PrivacyPoliciesArea'
// import InquiryPopUp from'../common/studentInqury'
import MainFooter from'../../layouts/footers/MainFooter'
import usePageTitle from '../../hooks/usePageTitle';
export default function PrivacyPolicy() {
  usePageTitle('Privacy Policy | Draa');
  return (
    <>
      {/* <Preloader /> */}
      <HeaderOne />
      <Breadcrumb 
        title="Privacy Policy" 
        subtitle="Your privacy is important to us. Read how we protect and manage your personal data." 
        category="Legal"
        paths={[
          { pathName:"Privacy Policy" }
        ]}
      />
      {/* <FeatureHomeOne /> */}
      <PrivacyPolicyPage />
      {/* <CounterHomeOne /> */}
      {/* <InstructorsHomeOne/> */}
      {/* <InquiryPopUp/> */}
      <MainFooter />
      <ScrollToTop />
      <ScrollTop />
    </>
  )
}
