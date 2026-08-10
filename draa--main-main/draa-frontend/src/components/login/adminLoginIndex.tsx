
import MainFooter from"../../layouts/footers/MainFooter.js";
import HeaderOne from"../../layouts/headers/HeaderOne.js";
import ScrollTop from"../common/ScrollTop.js";
import ScrollToTop from"../common/ScrollToTop.js";
import AdminLoginForm from"./adminLogin.js";

import'./login.css'
 

import usePageTitle from"../../hooks/usePageTitle.js";

export default function AdminLoginIndex() {
  usePageTitle('Admin Login');
  return (
    <>
    <HeaderOne />
    <AdminLoginForm />
    <MainFooter />
    <ScrollToTop />
    <ScrollTop />

    </>
  )
}
