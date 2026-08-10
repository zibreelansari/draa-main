import React, { useState, useEffect } from'react';
import { Link } from'react-router-dom';
import {
  ShieldCheck, Clock, FileText, Globe, Scale,
  ChevronRight, Printer, Mail, Loader2,
  CheckCircle, BookOpen, Lock, AlignLeft, ShieldAlert
} from'lucide-react';
import toast from'../../utils/toast';
import url from'../../url';
import'./TermsConditions.css';

interface TermsConditionsData {
  _id: string;
  title: string;
  version: string;
  status:'draft' |'published' |'archived';
  isActive: boolean;
  effectiveDate: string;
  content: string;
  companyName: string;
  contactEmail: string;
  jurisdiction: string;
  governingLaw: string;
  minimumAge: number;
  acceptanceRequired: boolean;
  lastReviewDate: string;
  nextReviewDate: string;
  createdAt: string;
  updatedAt: string;
}

/*  CONTENT PARSER  */
const renderStructuredContent = (text: string) => {
  const lines = text.split('\n').filter(l => l.trim() !=='');

  return lines.map((line, idx) => {
    const trimmed = line.trim();

    // Main section heading  e.g."1. ACCEPTANCE"
    if (/^\d+\.\s/.test(trimmed)) {
      const num = trimmed.match(/^(\d+)\./)?.[1] ??'';
      const heading = trimmed.replace(/^\d+\.\s*/,'');
      return (
        <h2 key={idx} className="legal-section-title">
          <span className="section-num">{num}</span>
          {heading}
        </h2>
      );
    }

    // Sub-section  e.g."A. Eligibility"
    if (/^[A-Z]\.\s/.test(trimmed)) {
      const letter = trimmed[0];
      const body   = trimmed.slice(3);
      return (
        <div key={idx} className="legal-sub-point">
          <span className="sub-letter">{letter}.</span> {body}
        </div>
      );
    }

    // Bullet
    if (trimmed.startsWith('') || trimmed.startsWith('-')) {
      return (
        <div key={idx} className="legal-bullet-item">
          <span className="bullet-dot" />
          <span>{trimmed.substring(1).trim()}</span>
        </div>
      );
    }

    // Normal paragraph
    return (
      <p key={idx} className="legal-standard-para">{trimmed}</p>
    );
  });
};

/*  COMPONENT  */
export default function TermsAndConditionsManagement() {
  const [termsData, setTermsData] = useState<TermsConditionsData | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [accepted,  setAccepted]  = useState(false);

  useEffect(() => { fetchTermsConditions(); }, []);

  const fetchTermsConditions = async () => {
    try {
      setLoading(true);
      const res    = await fetch(`${url}/admin/tnc`);
      const result = await res.json();
      if (result.success && result.data?.length > 0) {
        setTermsData(result.data[0]);
      } else {
        throw new Error('No terms found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message :'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    setAccepted(true);
    toast.success('Terms of Service signed successfully');
  };

  /*  loading  */
  if (loading) return (
    <div className="tnc-loading">
      <Loader2 size={36} strokeWidth={1.5} />
      <span>Loading document</span>
    </div>
  );

  /*  error  */
  if (error || !termsData) return (
    <div className="tnc-error">Document Not Found</div>
  );

  /*  TOC items (sections detected)  */
  const tocItems = termsData.content
    .split('\n')
    .filter(l => /^\d+\.\s/.test(l.trim()))
    .slice(0, 8)
    .map(l => ({ num: l.trim().match(/^(\d+)\./)?.[1] ??'', label: l.trim().replace(/^\d+\.\s*/,'') }));

  return (
    <div className="tnc-portal-wrapper">

      {/*  TOPBAR  */}
      <nav className="tnc-topbar">
        <div className="tnc-topbar-inner">
          <div className="tnc-breadcrumb">
            <Link to="/">Home</Link>
            {/* <span className="sep"><ChevronRight size={14} /></span>
            <Link to="/legal">Legal Center</Link>
            <span className="sep"><ChevronRight size={14} /></span> */}
            <span className="current">Terms &amp; Conditions</span>
          </div>
          <div className="tnc-topbar-actions">
            <button className="btn-ghost" onClick={() => window.print()}>
              <Printer size={14} /> Print
            </button>
          </div>
        </div>
      </nav>

      {/*  HERO  */}
      {/* <header className="tnc-hero">
        <div className="tnc-hero-inner">
          <div className="tnc-eyebrow">
            <ShieldCheck size={13} />
            Verified Compliance Document
          </div>
          <h1 className="tnc-hero-title">
            {termsData.title.split('').slice(0, -1).join('')}{''}
            <span>{termsData.title.split('').slice(-1)}</span>
          </h1>
          <div className="tnc-meta-row">
            <span className="meta-chip">
              <Clock size={13} />
              Revised: {new Date(termsData.updatedAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}
            </span>
            <span className="meta-chip">
              <FileText size={13} />
              Version {termsData.version}
            </span>
            <span className="meta-chip">
              <Globe size={13} />
              {termsData.jurisdiction}
            </span>
            <span className="meta-chip">
              <Scale size={13} />
              {termsData.governingLaw}
            </span>
          </div>
        </div>
      </header> */}

      {/*  MAIN LAYOUT  */}
      <div className="tnc-layout">

        {/* LEFT  DOCUMENT CARD */}
        <main>
          <article className="tnc-main-card">
            <div className="card-banner" />
            <div className="card-body">

              {/* Preamble callout */}
              <div className="preamble-block">
                <div className="preamble-icon">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3>Official Preamble</h3>
                  <p>
                    Please read this agreement carefully before using our services. By accessing or
                    using the platform, you confirm that you have read, understood, and agreed to be
                    bound by these terms. If you do not agree, please discontinue use immediately.
                  </p>
                </div>
              </div>

              {/* Parsed content */}
              {renderStructuredContent(termsData.content)}

              {/*  SIGN-OFF  */}
              <div className="tnc-signoff">
                <div className={`signoff-card ${accepted ?'is-signed' :''}`}>
                  <div className="signoff-body">
                    <div className="signoff-card-icon">
                      {accepted
                        ? <CheckCircle size={24} />
                        : <Lock size={24} />
                      }
                    </div>
                    <div className="signoff-text">
                      <h4>
                        {accepted
                          ?'Agreement Record Created'
                          :'Legal Acknowledgment Required'}
                      </h4>
                      <p>
                        {accepted
                          ? `A record of this agreement was created on ${new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })} for your account.`
                          :'By clicking below, you confirm your legal capacity to enter this binding agreement and that you have read it in full.'}
                      </p>
                    </div>
                  </div>

                  {accepted ? (
                    <span className="signed-badge">
                      <CheckCircle size={16} /> Signed
                    </span>
                  ) : (
                    <button className="btn-sign" onClick={handleAccept}>
                      <ShieldCheck size={16} />
                      Sign &amp; Accept Terms
                    </button>
                  )}
                </div>
              </div>

            </div>
          </article>
        </main>

        {/* RIGHT  SIDEBAR */}
        <aside className="tnc-sidebar">

          {/* Table of contents */}
          {tocItems.length > 0 && (
            <div className="sidebar-card">
              <div className="sidebar-card-head">
                <AlignLeft size={14} /> Document Map
              </div>
              <div className="sidebar-card-body">
                {tocItems.map((item, i) => (
                  <div key={i} className="toc-item">
                    <span className="toc-num">{item.num}</span>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legal summary */}
          <div className="sidebar-card">
            <div className="sidebar-card-head">
              <Scale size={14} /> Legal Summary
            </div>
            <div>
              <div className="info-row">
                <span className="info-label">Governing Law</span>
                <span className="info-val">{termsData.governingLaw}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Jurisdiction</span>
                <span className="info-val">{termsData.jurisdiction}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Minimum Age</span>
                <span className="info-val">{termsData.minimumAge}+ yrs</span>
              </div>
              <div className="info-row">
                <span className="info-label">Status</span>
                <span className="info-val" style={{ color:'#059669', textTransform:'capitalize' }}>
                  {termsData.status}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Last Review</span>
                <span className="info-val">
                  {new Date(termsData.lastReviewDate).toLocaleDateString('en-US', { month:'short', year:'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Contact card */}
          <div className="sidebar-card contact-card">
            <div className="sidebar-card-head">
              <Mail size={14} /> Legal Queries?
            </div>
            <div className="contact-body">
              <p>Have questions about these terms? Our legal team is here to help.</p>
              <a className="contact-link" href={`mailto:${termsData.contactEmail}`}>
                <Mail size={14} />
                {termsData.contactEmail}
              </a>
            </div>
            <button className="btn-export" onClick={() => window.print()}>
              <Printer size={14} /> Export to PDF
            </button>
          </div>

        </aside>
      </div>

      {/* FOOTER SEAL */}
      <div className="tnc-seal">
        <span className="tnc-seal-dot" />
        © {new Date().getFullYear()} Draa Governance  All rights reserved
      </div>

    </div>
  );
}