import React, { useState } from"react";
import { X, Download, ZoomIn, ZoomOut, FileText, AlertCircle, ExternalLink } from"lucide-react";
import { Document, Page, pdfjs } from"react-pdf";
import workerSrc from"pdfjs-dist/build/pdf.worker.min?url";
import { BACKEND_UPLOAD_URL } from"../../url";

import"react-pdf/dist/esm/Page/TextLayer.css";
import"react-pdf/dist/esm/Page/AnnotationLayer.css";

import"./pyqPreview.css";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;


interface Props {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  title: string;
  subtitle: string;
  paper?: string;
}

const PYQPreviewModal: React.FC<Props> = ({
  open,
  onClose,
  pdfUrl,
  title,
  subtitle,
  paper,
}) => {

  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);

  if (!open) return null;

  const isPdf = pdfUrl?.toLowerCase().endsWith('.pdf');
  const isPpt = pdfUrl?.toLowerCase().endsWith('.ppt') || pdfUrl?.toLowerCase().endsWith('.pptx');
  
  const fullUrl = pdfUrl?.startsWith('http') ? pdfUrl : `${BACKEND_UPLOAD_URL}/${pdfUrl}`;
  
  // Dev-Mode Check: Google Docs Viewer MUST have a public URL
  const isLocalHost = fullUrl.includes('localhost') || fullUrl.includes('127.0.0.1');
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`;

  return (
    <div className="pyq-modal-overlay">
      <div className="pyq-modal">

        {/* HEADER */}
        <div className="pyq-modal-header">
          <div>
            <h3>{title}</h3>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <p>{subtitle}</p>
              {paper && <span className="modal-paper-badge">{paper}</span>}
            </div>
          </div>

          <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
            <button onClick={onClose} className="close-btn">
              <X size={22} />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="pyq-modal-body">
          {isPdf ? (
            <Document
              file={fullUrl}
              onLoadSuccess={(pdf) => setNumPages(pdf.numPages)}
              loading={<div className="loading-container">
                <div className="spinner"></div>
                <p>Loading document...</p>
              </div>}
              error={<div className="error-container">
                <AlertCircle size={40} color="#d92d20" />
                <h3>Failed to load PDF</h3>
                <p>There was an error loading this document.</p>
              </div>}
            >
              <Page pageNumber={pageNumber} scale={scale} />
            </Document>
          ) : isPpt ? (
            isLocalHost ? (
              <div className="dev-notice-container">
                <AlertCircle size={48} color="#f79009" style={{ marginBottom:'20px' }} />
                <h2>Local Environment Notice</h2>
                <p>
                  PPT previews utilize the Google Docs Viewer service, across a public URL. 
                  Since you are on <strong>localhost</strong>, external services cannot reach your file.
                  <br /><br />
                  This preview will work perfectly once deployed to the production server.
                </p>
              </div>
            ) : (
              <div className="ppt-viewer-container" style={{ width:'100%', height:'100%', position:'relative' }}>
                <div className="external-viewer-banner" style={{ 
                  position:'absolute', top: 0, left: 0, right: 0, 
                  background:'rgba(91, 108, 255, 0.1)', padding:'8px', 
                  fontSize:'12px', textAlign:'center', color:'#bd7b20',
                  borderBottom:'1px solid rgba(91, 108, 255, 0.2)'
                }}>
                  <ExternalLink size={12} style={{ marginRight:'4px' }} />
                  Rendering via Google Docs Viewer
                </div>
                <iframe
                  src={googleViewerUrl}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  title="PPT Viewer"
                  style={{ paddingTop:'32px' }}
                >
                  <div className="error-container">
                    <h3>Iframe Blocked</h3>
                    <p>Your browser doesn't support iframes.</p>
                  </div>
                </iframe>
              </div>
            )
          ) : (
            <div className="unsupported-container">
              <FileText size={56} color="#475467" />
              <h3>No Preview Available</h3>
              <p>Direct preview is only supported for PDF and PPT files.</p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="pyq-modal-footer">
          {isPdf ? (
            <>
              <div className="pyq-modal-footer-left">
                <button className="footer-btn-secondary" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>
                  <ZoomOut size={16} />
                </button>
                <span>{Math.round(scale * 100)}%</span>
                <button className="footer-btn-secondary" onClick={() => setScale(s => Math.min(3, s + 0.1))}>
                  <ZoomIn size={16} />
                </button>
                <div style={{ marginLeft:'12px', paddingLeft:'12px', borderLeft:'1px solid #eaecf0', color:'#667085', fontSize:'14px' }}>
                  Page {pageNumber} of {numPages}
                </div>
              </div>

              <div className="pyq-modal-footer-right">
                <button className="footer-btn-secondary" onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber <= 1}>
                  Previous
                </button>
                <button className="footer-btn-secondary" onClick={() => setPageNumber(p => Math.min(numPages, p + 1))} disabled={pageNumber >= numPages}>
                  Next
                </button>
                <button onClick={onClose} className="close-action-btn">Close</button>
              </div>
            </>
          ) : (
            <div className="footer-simple" style={{ display:'flex', width:'100%', justifyContent:'flex-end', gap:'12px' }}>
              <button onClick={onClose} className="close-action-btn">Close Page</button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PYQPreviewModal;
