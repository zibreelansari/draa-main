// import FooterOne from"../../layouts/footers/FooterOne";
import MainFooter from"../../layouts/footers/MainFooter";
import HeaderOne from"../../layouts/headers/HeaderOne";
import Breadcrumb from"../common/Breadcrumb";
// import Preloader from"../common/Preloader";
import ScrollTop from"../common/ScrollTop";
import ScrollToTop from"../common/ScrollToTop";
import CartArea from"./CartArea";
import usePageTitle from '../../hooks/usePageTitle';



export default function Cart() {
  usePageTitle('My Cart | Draa');
  return (
    <>
      {/* <Preloader /> */}
      <HeaderOne />
      <Breadcrumb 
        title="Your Cart" 
        subtitle="Review your selected resources before proceeding to checkout." 
        category="Shop"
        paths={[{ pathName:"Cart" }]}
      />
      <CartArea />
      <MainFooter />
      <ScrollToTop />
      <ScrollTop />

    </>
  )
}
