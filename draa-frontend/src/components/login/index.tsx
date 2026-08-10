import HeaderOne from"../../layouts/headers/HeaderOne.js";
import ScrollTop from"../common/ScrollTop.js";
import ScrollToTop from"../common/ScrollToTop.js";
import LoginForm from"./LoginForm.js";
import MainFooter from"../../layouts/footers/MainFooter.js";
import usePageTitle from"../../hooks/usePageTitle.js";


export default function Login() {
  usePageTitle('Student Login');
  return (
    <>
      <HeaderOne />
      <LoginForm />
      <MainFooter />
      <ScrollToTop />
      <ScrollTop />

    </>
  )
}
