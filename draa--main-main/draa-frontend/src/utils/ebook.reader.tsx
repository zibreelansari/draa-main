import { useState } from"react";
import { Document, Page } from"react-pdf";
import { X } from"lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
}

export default function EbookReaderModal({
  open,
  onClose,
  pdfUrl,
}: Props) {
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.2);

  if (!open) return null;

  return (
    <div
      className="pyq-modal-overlay"
      onContextMenu={(e) => e.preventDefault()}
      style={{ userSelect:"none" }}
    >
      <div className="pyq-modal">

        {/* HEADER */}
        <div className="pyq-modal-header">
          <strong> Reading Mode</strong>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* BODY */}
        <div
          className="pyq-modal-body"
          tabIndex={0}
          onKeyDown={(e) => {
            if (
              (e.ctrlKey || e.metaKey) &&
              ["c","x","s","p","u"].includes(e.key.toLowerCase())
            ) {
              e.preventDefault();
            }
          }}
        >
          <Document
            file={pdfUrl}
            onLoadSuccess={(pdf) => setNumPages(pdf.numPages)}
            loading={<p>Loading book</p>}
            error={<p>Failed to load PDF</p>}
          >
            <Page
              pageNumber={page}
              scale={scale}
              renderTextLayer={false}        //  NO COPY
              renderAnnotationLayer={false} //  NO LINKS
            />
          </Document>
        </div>

        {/* FOOTER */}
        <div className="pyq-modal-footer">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            Prev
          </button>

          <span>
            Page {page} / {numPages}
          </span>

          <button disabled={page >= numPages} onClick={() => setPage(p => p + 1)}>
            Next
          </button>

          <button onClick={() => setScale(s => Math.max(0.8, s - 0.1))}></button>
          <button onClick={() => setScale(s => Math.min(2, s + 0.1))}>+</button>
        </div>

      </div>
    </div>
  );
}