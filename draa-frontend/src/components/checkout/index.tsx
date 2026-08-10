
import MainFooter from"../../layouts/footers/MainFooter";
import HeaderOne from"../../layouts/headers/HeaderOne";
import Breadcrumb from"../common/Breadcrumb";
// import Preloader from"../common/Preloader";
import ScrollTop from"../common/ScrollTop";
import ScrollToTop from"../common/ScrollToTop";
import CheckoutArea from"./CheckoutArea";
import usePageTitle from '../../hooks/usePageTitle';

 

export default function Checkout() {
  usePageTitle('Checkout | Draa');
  return (
    <>
      {/* <Preloader /> */}
      <HeaderOne />
      <Breadcrumb 
        title="Checkout" 
        subtitle="Complete your purchase securely and gain instant access to your resources." 
        category="Shop"
        paths={[
          { pathName:"Cart", url:"/cart" },
          { pathName:"Checkout" }
        ]}
      />
      <CheckoutArea />
      <MainFooter />
      <ScrollToTop />
      <ScrollTop />
    </>
  )
}
