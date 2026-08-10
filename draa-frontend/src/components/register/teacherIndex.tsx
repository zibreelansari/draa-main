import MainFooter from"../../layouts/footers/MainFooter";
import HeaderOne from"../../layouts/headers/HeaderOne";
import ScrollTop from"../common/ScrollTop";
import ScrollToTop from"../common/ScrollToTop";
import TeacherRegistration from"./teacherRegister";

 
import usePageTitle from"../../hooks/usePageTitle";

export default function TeacherRegistrationIndex() {
  usePageTitle('Teacher Registration');
  return (
    <>
    <HeaderOne />
    <TeacherRegistration />
    <MainFooter />
    <ScrollToTop />
    <ScrollTop />

    </>
  )
}