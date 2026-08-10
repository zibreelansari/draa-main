import React from"react";
import HeaderOne from"../../layouts/headers/HeaderOne";
import MainFooter from"../../layouts/footers/MainFooter";
import ScrollTop from"../common/ScrollTop";
import ScrollToTop from"../common/ScrollToTop";
import UnifiedRegisterPortal from"./UnifiedRegisterPortal";
import usePageTitle from"../../hooks/usePageTitle";

export default function UnifiedRegisterIndex() {
  usePageTitle("Login or Register | Draa");

  return (
    <>
      <HeaderOne />
      <UnifiedRegisterPortal />
      <MainFooter />
      <ScrollToTop />
      <ScrollTop />
    </>
  );
}
