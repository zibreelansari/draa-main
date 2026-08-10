import { Link } from"react-router-dom";
import HeaderOne from"../../layouts/headers/HeaderOne";
import Breadcrumb from"../common/Breadcrumb";
// import FooterOne from"../../layouts/footers/FooterOne";
import ScrollToTop from"../common/ScrollToTop";
import ScrollTop from"../common/ScrollTop";
// import Preloader from"../common/Preloader";
import MainFooter from"../../layouts/footers/MainFooter";
import StylishEmptyState from"../common/StylishEmptyState";
import { AlertTriangle } from"lucide-react";
import usePageTitle from '../../hooks/usePageTitle';

 
export default function Error() {
  usePageTitle('Page Not Found | Draa');
  return (
    <>
      <HeaderOne />
      <StylishEmptyState 
        title="404 - Page Not Found"
        description="Oops! The page you are looking for doesn't exist. It might have been moved or deleted."
        actionText="Back To Home"
        actionPath="/"
        image="/assets/img/404.svg"
        showBack={true}
        is404={true}
      />
      <MainFooter />
      <ScrollToTop />
      <ScrollTop />
    </>
  )
}
