import ReactGA from "react-ga4";

export const initGA = () => {
  ReactGA.initialize("G-2836VH8ZH1");
};

export const pageView = () => {
  ReactGA.send({
    hitType: "pageview",
    page: window.location.pathname + window.location.search,
  });
};
