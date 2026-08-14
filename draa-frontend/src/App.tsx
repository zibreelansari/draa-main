import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import CorporateContentPage from './components/corporate/CorporateContentPage';
import ServiceDetailPage from './components/corporate/ServiceDetailPage';
import DraaCorporateContact from './components/corporate/DraaCorporateContact';
import DraaCorporateHome from './components/corporate/DraaCorporateHome';
import MotionEnhancer from './components/corporate/MotionEnhancer';
import EventsPage from './components/corporate/EventsPage';
import WhoWeSupportPage from './components/corporate/WhoWeSupportPage';
import DigitalLearningPage from './components/corporate/DigitalLearningPage';
import AboutDraaPage from './components/corporate/AboutDraaPage';
import CareersPage from './components/corporate/CareersPage';

export default function App() {
  return (
    <BrowserRouter>
      <MotionEnhancer />
      <Routes>
        <Route path="/" element={<DraaCorporateHome />} />
        <Route path="/about-draa" element={<AboutDraaPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/capabilities" element={<CorporateContentPage slug="capabilities" />} />
        <Route path="/services/digital-learning" element={<DigitalLearningPage />} />
        <Route path="/services/:serviceSlug" element={<ServiceDetailPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/learning-programs" element={<CorporateContentPage slug="learning-programs" />} />
        <Route path="/learning-events" element={<Navigate to="/learning-programs" replace />} />
        <Route path="/who-we-support" element={<WhoWeSupportPage />} />
        <Route path="/resources" element={<CorporateContentPage slug="resources" />} />
        <Route path="/contact" element={<DraaCorporateContact />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
