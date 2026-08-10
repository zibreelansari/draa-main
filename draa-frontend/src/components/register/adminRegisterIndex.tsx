import FooterOne from"../../layouts/footers/FooterOne";
import HeaderOne from"../../layouts/headers/HeaderOne";
import Breadcrumb from"../common/Breadcrumb";
import ScrollTop from"../common/ScrollTop";
import ScrollToTop from"../common/ScrollToTop";
import AdminRegister from"./adminRegister";

 
import usePageTitle from"../../hooks/usePageTitle";

export default function AdminRegisterIndex() {
  usePageTitle('Admin Registration');
  return (
    <>
    <HeaderOne />
    <Breadcrumb title="Register" subtitle="Register" />
    <AdminRegister />
    <FooterOne />
    <ScrollToTop />
    <ScrollTop />

    </>
  )
}