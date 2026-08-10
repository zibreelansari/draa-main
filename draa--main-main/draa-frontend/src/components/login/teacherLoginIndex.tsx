import MainFooter from"../../layouts/footers/MainFooter.js";
import HeaderOne from"../../layouts/headers/HeaderOne.js";
import ScrollTop from"../common/ScrollTop.js";
import ScrollToTop from"../common/ScrollToTop.js";
import'./login.css'
import teacherLogin from'./teacherLogin'

import usePageTitle from"../../hooks/usePageTitle.js";

export default function TeacherLoginForm() {
  usePageTitle('Teacher Login');
  return (
    <>
    <HeaderOne />
    {teacherLogin()}
    <MainFooter />
    <ScrollToTop />
    <ScrollTop />

    </>
  )
}
