 

import HeaderOne from'../../layouts/headers/HeaderOne'
import Breadcrumb from'../common/Breadcrumb'
import ScrollToTop from'../common/ScrollToTop'
import ScrollTop from'../common/ScrollTop'
import'../../styles/index.css'

// import InquiryPopUp from'../common/studentInqury'
import TermsConditionsPage from'./TnCArea'
import MainFooter from'../../layouts/footers/MainFooter'
import usePageTitle from '../../hooks/usePageTitle';
export default function TermsandConditionsIndex() {
  usePageTitle('Terms & Conditions | Draa');
  return (
    <>
      <HeaderOne />
      <Breadcrumb 
        title="Terms & Conditions" 
        subtitle="Please read our terms and conditions carefully to understand the rules of using our platform." 
        category="Legal"
        paths={[
          { pathName:"Terms & Conditions" }
        ]}
      />
      {/* <FeatureHomeOne /> */}
      <TermsConditionsPage />
      {/* <CounterHomeOne /> */}
      {/* <InstructorsHomeOne/> */}
      <MainFooter/>
      {/* <InquiryPopUp/> */}
      <ScrollToTop />
      <ScrollTop />
    </>
  )
}
