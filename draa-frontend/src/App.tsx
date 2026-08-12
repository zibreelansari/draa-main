import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import CorporateContentPage from './components/corporate/CorporateContentPage';
import ServiceDetailPage from './components/corporate/ServiceDetailPage';
import StudyInIndiaHub from './components/corporate/StudyInIndiaHub';
import DraaCorporateContact from './components/corporate/DraaCorporateContact';
import DraaCorporateHome from './components/corporate/DraaCorporateHome';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DraaCorporateHome />} />
        <Route path="/about-draa" element={<CorporateContentPage slug="about-draa" />} />
        <Route path="/capabilities" element={<CorporateContentPage slug="capabilities" />} />
        <Route path="/services/:serviceSlug" element={<ServiceDetailPage />} />
        <Route path="/study-in-india" element={<StudyInIndiaHub />} />
        <Route path="/learning-events" element={<CorporateContentPage slug="learning-events" />} />
        <Route path="/who-we-support" element={<CorporateContentPage slug="who-we-support" />} />
        <Route path="/contact" element={<DraaCorporateContact />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
