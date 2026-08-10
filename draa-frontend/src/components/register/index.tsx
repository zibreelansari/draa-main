
import MainFooter from"../../layouts/footers/MainFooter";
import HeaderOne from"../../layouts/headers/HeaderOne";
import ScrollTop from"../common/ScrollTop";
import ScrollToTop from"../common/ScrollToTop";
import RegisterForm from"./RegisterForm";
import usePageTitle from"../../hooks/usePageTitle";

 
export default function Register() {
  usePageTitle('Student Registration');
  return (
    <>
    <HeaderOne />
    <RegisterForm />
    <MainFooter />
    <ScrollToTop />
    <ScrollTop />

    </>
  )
}
