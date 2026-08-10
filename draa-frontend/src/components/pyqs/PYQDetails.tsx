import React, { useState, useEffect } from'react';
import { useParams } from'react-router-dom';
import { Loader2 } from'lucide-react';
import axios from'axios';
import url from'../../url';
import PYQPreviewModal from'./PYQPreviewModal';
import DownloadPopupModal from'../jobs/DownloadPopupModal';
import StylishEmptyState from'../common/StylishEmptyState';
import { BookOpen } from'lucide-react';
import'./pyqDetails.css';

const PYQDetails = () => {
  const { examName } = useParams<{ examName: string }>();
  const [loading, setLoading] = useState(true);
  const [papers, setPapers] = useState<any[]>([]);

  // Preview modal state
  const [preview, setPreview] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState('');
  const [selectedTitle, setSelectedTitle] = useState('');

  // Lead capture download modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [downloadTarget, setDownloadTarget] = useState('');
  const [downloadTitle, setDownloadTitle] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${url}/pyq/approved`);
        const allPyqs = response.data.pyqs || [];
        const decodedExamName = decodeURIComponent(examName ||'');
        const filtered = allPyqs.filter((p: any) => p.examName === decodedExamName);
        setPapers(filtered);
      } catch (err) {
        console.error('Error fetching PYQ details');
      } finally {
        setLoading(false);
      }
    };
    if (examName) fetchData();
  }, [examName]);

  const rawName = decodeURIComponent(examName ||'');
  const formattedExamName = rawName
    ? rawName.toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())
    :'Exam';

  // Get all unique exam stages (e.g. Prelims, Mains) to group tables by stage
  const stages = [...new Set(papers.map(p => p.examStage ||'General').filter(Boolean))].sort();

  // For a given stage, compute unique years and unique papers
  const getMatrix = (stage: string) => {
    const stagePapers = papers.filter(p => (p.examStage ||'General') === stage);
    const years = [...new Set(stagePapers.map(p => p.year?.toString()).filter(Boolean))].sort(
      (a, b) => Number(b) - Number(a)
    );
    const cols = [...new Set(stagePapers.map(p => p.paper).filter(Boolean))].sort();
    const displayCols = cols.length > 0 ? cols : ['Paper'];
    return { stagePapers, years, displayCols };
  };

  const handlePreview = (pdfPath: string, title: string) => {
    const finalUrl = pdfPath.startsWith('http') ? pdfPath : `${url}/${pdfPath}`;
    setSelectedPdf(finalUrl);
    setSelectedTitle(title);
    setPreview(true);
  };

  // Opens the lead capture modal instead of direct download
  const handleDownloadClick = (e: React.MouseEvent, pdfPath: string, title: string) => {
    e.preventDefault();
    const finalUrl = pdfPath.startsWith('http') ? pdfPath : `${url}/${pdfPath}`;
    setDownloadTarget(finalUrl);
    setDownloadTitle(title);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="pyq-details-loader">
        <Loader2 size={36} style={{ animation:'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (papers.length === 0) {
    return (
      <StylishEmptyState 
        title="No Question Papers Found"
        description={`We couldn't find any uploaded previous year papers for ${formattedExamName}.`}
        actionText="Back to PYQs"
        actionPath="/previous-year-questions"
        icon={BookOpen}
        showBack={true}
      />
    );
  }

  return (
    <div className="pyq-details-wrapper">
      <div className="pyq-details-container">

        <header className="pyq-details-header">
          <h1>Previous Year {formattedExamName} Question Papers: Prelims &amp; Mains</h1>
          <p>{formattedExamName} Papers</p>
        </header>

        {/* One table block per exam stage */}
        {stages.map(stage => {
          const { stagePapers, years, displayCols } = getMatrix(stage);
          if (years.length === 0) return null;
          return (
            <div className="pyq-table-block" key={stage}>
              <p className="pyq-section-label">{formattedExamName} {stage} Papers</p>

              <div className="pyq-table-responsive">
                <table className="pyq-matrix-table">
                  <thead>
                    <tr>
                      <th className="year-col">Year</th>
                      {displayCols.map(col => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {years.map(yearStr => (
                      <tr key={yearStr}>
                        <td className="year-cell">{yearStr}</td>
                        {displayCols.map(col => {
                          const hit = stagePapers.find(
                            p =>
                              p.year?.toString() === yearStr &&
                              (p.paper === col || (!p.paper && col ==='Paper'))
                          );
                          return (
                            <td key={col}>
                              {hit ? (
                                <div className="action-links">
                                  <button
                                    className="table-btn view-btn"
                                    onClick={() => window.open(`/view-resource/pyq/${hit._id}`,'_blank')}
                                  >
                                    View
                                  </button>
                                  <button
                                    className="table-btn dl-btn"
                                    onClick={(e) => handleDownloadClick(e, hit.questionPaperPDF, `${formattedExamName} ${stage} ${col} ${yearStr}`)}
                                  >
                                    Download
                                  </button>
                                </div>
                              ) : (
                                <span className="empty-cell"></span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

      </div>

      {/* PDF Preview Modal */}
      {preview && (
        <PYQPreviewModal
          open={preview}
          onClose={() => setPreview(false)}
          pdfUrl={selectedPdf}
          title={formattedExamName}
          subtitle={selectedTitle}
        />
      )}

      {/* Lead Capture Download Modal */}
      <DownloadPopupModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        targetUrl={downloadTarget}
        resourceTitle={downloadTitle}
        resourceType="PYQ Paper"
      />
    </div>
  );
};

export default PYQDetails;
