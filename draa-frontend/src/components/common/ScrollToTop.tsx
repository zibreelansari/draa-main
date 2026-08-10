
import { useState, useEffect } from "react";
import UseSticky from "../../hooks/UseSticky";


const ScrollToTop = () => {
  const { sticky }: { sticky: boolean } = UseSticky();

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 480px)").matches;
  });

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 480px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const styles = {
    position: "fixed" as const,
    bottom: isMobile ? "15px" : "70px",
    left: isMobile ? "15px" : "30px",
    right: "auto",
    width: "60px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    lineHeight: "1",
    opacity: sticky ? 1 : 0,
    cursor: sticky ? "pointer" : "default",
    pointerEvents: sticky ? "auto" as const : "none" as const,
    transition: "all 0.3s ease",
  };

  return (
    <>

      <div id="topcontrol" className="topcontrol" onClick={scrollTop} style={styles}>
        <i className="fa-solid fa-arrow-up scrolltop"></i>
      </div>

    </>
  );
};

export default ScrollToTop;
