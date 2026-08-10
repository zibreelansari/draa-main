import React, { useState, useEffect } from'react';
import { Link } from'react-router-dom';
import {
  ChevronRight, ShieldCheck, Clock, FileText, Globe,
  Mail, Printer, CheckCircle, Loader2, Lock,
  BookOpen, Fingerprint, ShieldAlert, Eye, Users
} from'lucide-react';
import toast from'../../utils/toast';
import url from'../../url';
import'./PrivacyPolicyPage.css';

interface PrivacyPolicyData {
  _id: string;
  title: string;
  version: string;
  status:'draft' |'published' |'archived';
  isActive: boolean;
  effectiveDate: string;
  updatedAt: string;
  content: string;
  wordCount: number;
  sections: Array<{
    title: string;
    content: string;
    order: number;
  }>;
  metadata: {
    language: string;
    jurisdiction: string;
    companyName: string;
    contactEmail: string;
  };
  compliance: {
    gdprCompliant: boolean;
    ccpaCompliant: boolean;
    dataProcessingPurposes: string[];
  };
  analytics: {
    views: number;
    acceptances: number;
  };
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
  __v: number;
}

/*  CONTENT PARSER  */
const formatContent = (text: string) => {
  return text.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return null;

    if (/^[A-Z]\.\s/.test(trimmed)) {
      return (
        <div key={i} className="legal-sub-item">
          <span className="alpha-prefix">{trimmed[0]}.</span>
          <p>{trimmed.slice(3)}</p>
        </div>
      );
    }

    if (trimmed.startsWith('') || trimmed.startsWith('-')) {
      return <li key={i} className="legal-bullet">{trimmed.substring(1).trim()}</li>;
    }

    return <p key={i} className="legal-paragraph">{trimmed}</p>;
  });
};

/*  COMPONENT  */
export default function PrivacyPolicyPage() {
  const [policyData, setPolicyData] = useState<PrivacyPolicyData | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [accepted,   setAccepted]   = useState(false);

  useEffect(() => { fetchPrivacyPolicy(); }, []);

  const fetchPrivacyPolicy = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${url}/admin/cms`);
      const result   = await response.json();
      if (result.success && result.data?.length > 0) setPolicyData(result.data[0]);
      else throw new Error('No policy found');
    } catch {
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="loader-full">
      <Loader2 className="spin-icon" size={38} strokeWidth={1.5} />
    </div>
  );

  if (error || !policyData) return (
    <div className="loader-full" style={{ color:'#e11d48', fontWeight: 700, fontSize: 20 }}>
      Document Not Found
    </div>
  );

  const sortedSections = [...(policyData.sections ?? [])].sort((a, b) => a.order - b.order);

  return (
    <main className="policy-v3-wrapper">

      {/*  TOPBAR  */}
      <nav className="policy-topbar">
        <div className="policy-topbar-inner">
          <div className="legal-breadcrumb">
            <Link to="/">Home</Link>
            {/* <ChevronRight size={13} />
            <span>Legal Center</span> */}
            <ChevronRight size={13} />
            <span className="bc-current">Privacy Policy</span>
          </div>
          <button className="topbar-action" onClick={() => window.print()}>
            <Printer size={13} /> Print
          </button>
        </div>
      </nav>

      {/*  HERO  */}
      {/* <header className="policy-hero">
        <div className="policy-hero-inner">
          <div className="hero-eyebrow">
            <ShieldCheck size={12} /> Official Privacy Governance
          </div>

          <h1 className="policy-hero-title">
            Your <em>Privacy</em>,<br />Our Commitment
          </h1>

          <p className="policy-hero-sub">
            A clear, honest explanation of how we collect, use, and protect your data at {policyData.metadata.companyName}.
          </p>

          <div className="hero-meta-row">
            <span className="hero-chip">
              <Clock size={13} />
              Updated {new Date(policyData.effectiveDate).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}
            </span>
            <span className="hero-chip">
              <Fingerprint size={13} />
              v{policyData.version}
            </span>
            <span className="hero-chip">
              <Globe size={13} />
              {policyData.metadata.jurisdiction}
            </span>
            {policyData.compliance.gdprCompliant && (
              <span className="hero-chip hero-tag gdpr">GDPR</span>
            )}
            {policyData.compliance.ccpaCompliant && (
              <span className="hero-chip hero-tag ccpa">CCPA</span>
            )}
          </div>
        </div>
      </header> */}

      {/*  MAIN GRID  */}
      <div className="container">
        <div className="legal-grid">

          {/*  SIDEBAR  */}
          <aside className="legal-sidebar">

            {/* TOC */}
            {sortedSections.length > 0 && (
              <div className="sidebar-panel">
                <div className="sidebar-panel-head">
                  <BookOpen size={13} /> Table of Contents
                </div>
                <nav className="toc-list">
                  {sortedSections.map(s => (
                    <a key={s.order} href={`#section-${s.order}`} className="toc-item">
                      <span className="n">{s.order}</span>
                      {s.title}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Trust card */}
            <div className="sidebar-panel">
              <div className="sidebar-panel-head">
                <Lock size={13} /> Trust Summary
              </div>
              <div className="trust-panel-body">
                <div className="compliance-chips">
                  {policyData.compliance.gdprCompliant && (
                    <span className="c-chip gdpr"><ShieldCheck size={11} /> GDPR</span>
                  )}
                  {policyData.compliance.ccpaCompliant && (
                    <span className="c-chip ccpa"><ShieldCheck size={11} /> CCPA</span>
                  )}
                </div>

                <div className="trust-stat">
                  <span className="ts-label">Language</span>
                  <span className="ts-val">{policyData.metadata.language}</span>
                </div>
                <div className="trust-stat">
                  <span className="ts-label">Word Count</span>
                  <span className="ts-val">{policyData.wordCount?.toLocaleString() ??''}</span>
                </div>
                <div className="trust-stat">
                  <span className="ts-label">Sections</span>
                  <span className="ts-val">{sortedSections.length}</span>
                </div>
                {policyData.analytics?.views > 0 && (
                  <div className="trust-stat">
                    <span className="ts-label">Total Views</span>
                    <span className="ts-val">{policyData.analytics.views.toLocaleString()}</span>
                  </div>
                )}

                <button className="btn-print" onClick={() => window.print()}>
                  <Printer size={13} /> Export to PDF
                </button>
              </div>
            </div>

          </aside>

          {/*  CONTENT CARD  */}
          <div className="legal-content-card">
            <div className="card-accent-bar" />
            <div className="card-inner">

              {/* Document header */}
              <header className="content-header">
                <div className="document-badge">
                  <ShieldCheck size={12} /> Official Privacy Governance
                </div>
                <h1>{policyData.title}</h1>
                <div className="document-meta">
                  <div className="m-item"><Clock size={14} /> Updated: {new Date(policyData.effectiveDate).toLocaleDateString()}</div>
                  <div className="m-item"><Fingerprint size={14} /> ID: {policyData.version}</div>
                  <div className="m-item"><Globe size={14} /> {policyData.metadata.jurisdiction}</div>
                </div>
              </header>

              <div className="pp-divider" />

              {/* Intro callout */}
              <div className="intro-callout">
                <div className="intro-callout-icon">
                  <Eye size={20} />
                </div>
                <div>
                  <h3>Before You Continue</h3>
                  <div className="intro-content">
                    {formatContent(policyData.content)}
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div className="document-body">
                {sortedSections.map(section => (
                  <div
                    key={section.order}
                    id={`section-${section.order}`}
                    className="legal-section-block"
                  >
                    <div className="section-title-area">
                      <span className="section-index">{section.order}</span>
                      <h2>{section.title}</h2>
                    </div>
                    <div className="section-body-text">
                      {formatContent(section.content)}
                    </div>
                  </div>
                ))}
              </div>

              {/*  ACCEPTANCE  */}
              <div className="legal-agreement-footer">
                <div className={`agreement-card ${accepted ?'agreed' :''}`}>
                  <div className="agreement-body">
                    <div className="agreement-icon">
                      {accepted ? <CheckCircle size={24} /> : <ShieldAlert size={24} />}
                    </div>
                    <div className="agreement-text">
                      <h4>
                        {accepted
                          ?'Acknowledgment Recorded'
                          :'Your Acknowledgment Required'}
                      </h4>
                      <p>
                        {accepted
                          ? `You acknowledged this Privacy Policy on ${new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}.`
                          : `Reviewing this document is essential for understanding your data rights at Draa LLP.`}
                      </p>
                    </div>
                  </div>

                  {accepted ? (
                    <span className="accepted-badge">
                      <CheckCircle size={15} /> Acknowledged
                    </span>
                  ) : (
                    <button
                      className="btn-accept-premium"
                      onClick={() => {
                        setAccepted(true);
                        toast.success('Agreement Logged');
                      }}
                    >
                      <ShieldCheck size={15} />
                      Acknowledge &amp; Accept
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </main>
  );
}