import { Outlet } from "react-router-dom";
import PortalFooter from "./PortalFooter";
import PortalHeader from "./PortalHeader";

export default function PortalLayout(){return <div className="portal-app"><a className="skip-link" href="#portal-main">Skip to main content</a><PortalHeader/><main id="portal-main"><Outlet/></main><PortalFooter/></div>}
