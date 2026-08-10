import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Download, ZoomIn, ZoomOut, FileText, AlertCircle, ExternalLink, ArrowLeft, Calendar, Eye, Star, MessageSquare } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min?url';
import axios from 'axios';
import url, { BACKEND_UPLOAD_URL } from '../../url';
import DownloadPopupModal from '../jobs/DownloadPopupModal';
import ShareButton from './ShareButton';
import Swal from 'sweetalert2';
import { getUserRole, getStoredUser, isAuthenticated } from '../../utils/global_auth';
import toast from '../../utils/toast';
import usePageTitle from '../../hooks/usePageTitle';

import"react-pdf/dist/esm/Page/TextLayer.css";
import"react-pdf/dist/esm/Page/AnnotationLayer.css";

// Register PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

const QuickViewPage: React.FC = () => {
  usePageTitle('Quick View | Draa');
    const { type, id } = useParams<{ type: string; id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [numPages, setNumPages] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.2);
    const [error, setError] = useState<string | null>(null);

    // Download Modal State
    const [modalOpen, setModalOpen] = useState(false);

    // Tab State for Current Affairs
    const [activeTab, setActiveTab] = useState<'content' | 'pdf' | 'ppt'>('content');

    // Comments & Ratings States
    const [reviews, setReviews] = useState<any[]>([]);
    const [averageRating, setAverageRating] = useState<string>('0.0');
    const [totalReviews, setTotalReviews] = useState<number>(0);
    const [rating, setRating] = useState<number>(5);
    const [comment, setComment] = useState<string>('');
    const [submittingReview, setSubmittingReview] = useState<boolean>(false);
    const [reviewsLoading, setReviewsLoading] = useState<boolean>(false);

    // Determine content URL
    const pdfUrl = data?.pdfFile || data?.syllabusPDF || data?.questionPaperPDF || data?.syllabus_url || data?.job_pdf_url || data?.job_pdf_file || data?.pdf_url || data?.syllabus;
    const pptUrl = data?.pptFile || data?.ppt_url;
    const content = data?.content || data?.job_description || data?.description;

    const fullPdfUrl = pdfUrl ? (pdfUrl.startsWith('http') ? pdfUrl : `${BACKEND_UPLOAD_URL}${pdfUrl.startsWith('/') ? '' : '/'}${pdfUrl}`) : null;
    const fullPptUrl = pptUrl ? (pptUrl.startsWith('http') ? pptUrl : `${BACKEND_UPLOAD_URL}${pptUrl.startsWith('/') ? '' : '/'}${pptUrl}`) : null;
    const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fullPdfUrl || fullPptUrl || '')}&embedded=true`;

    const fetchReviews = async () => {
        try {
            setReviewsLoading(true);
            const res = await axios.get(`${url}/current-affairs/${id}/reviews`);
            if (res.data?.success) {
                setReviews(res.data.reviews || []);
                setAverageRating(res.data.averageRating || '0.0');
                setTotalReviews(res.data.total || 0);
            }
        } catch (err) {
            console.error("Failed to load reviews:", err);
        } finally {
            setReviewsLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                let endpoint = '';
                if (type === 'current-affairs') endpoint = `${url}/current-affairs/details/${id}`;
                else if (type === 'syllabus') endpoint = `${url}/syllabus/${id}`;
                else if (type === 'pyq') endpoint = `${url}/pyq/${id}`;
                else if (type === 'course') endpoint = `${url}/course/courseDetails/${id}`;
                
                if (!endpoint) endpoint = `${url}/jobs/details/${id}`; 

                const res = await axios.get(endpoint);
                const resData = res.data;
                
                // Handle both { success: true, data: ... } and { syllabus: ... } raw formats
                if (resData) {
                    const result = resData.data || resData;
                    const extractedData = result.affair || result.syllabus || result.pyq || result.job || result.course || result;
                    setData(extractedData);
                } else {
                    setError('Resource not found');
                }
            } catch (err) {
                console.error('Fetch error:', err);
                setError('Failed to load resource data');
            } finally {
                setLoading(false);
            }
        };

        if (id && type) fetchData();
    }, [id, type]);

    useEffect(() => {
        if (id && type === 'current-affairs') {
            fetchReviews();
        }
    }, [id, type]);

    useEffect(() => {
        if (data) {
            if (type === 'current-affairs') {
                if (data.content) {
                    setActiveTab('content');
                } else if (pdfUrl) {
                    setActiveTab('pdf');
                } else if (pptUrl) {
                    setActiveTab('ppt');
                }
            }
        }
    }, [data, type, pdfUrl, pptUrl]);

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white', flexDirection: 'column', gap: '20px' }}>
            <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#bd7b20', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p>Loading full-page preview...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (error) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>{error}</div>;
    if (!data) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>No data available</div>;

    const availableTabs: { id: 'content' | 'pdf' | 'ppt'; label: string }[] = [];
    if (type === 'current-affairs') {
        if (data?.content) availableTabs.push({ id: 'content', label: 'Editorial Analysis' });
        if (data?.pdfFile) availableTabs.push({ id: 'pdf', label: 'PDF Document' });
        if (data?.pptFile) availableTabs.push({ id: 'ppt', label: 'Presentation' });
    }

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated()) {
            Swal.fire({
                title: 'Login Required',
                text: 'Please log in as a student to comment and rate this current affair.',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Log In Now'
            }).then(res => {
                if (res.isConfirmed) {
                    navigate('/student-login');
                }
            });
            return;
        }
        if (!comment.trim()) {
            toast.warning("Please enter a comment");
            return;
        }
        try {
            setSubmittingReview(true);
            const token = getStoredUser()?.token;
            const res = await axios.post(`${url}/current-affairs/${id}/reviews`, {
                rating,
                comment
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.data?.success) {
                toast.success("Review submitted successfully");
                setComment('');
                fetchReviews();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmittingReview(false);
        }
    };

    const renderStars = (count: number) => {
        return (
            <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map(num => (
                    <Star 
                        key={num} 
                        size={16} 
                        fill={num <= count ? '#eab308' : 'transparent'} 
                        stroke={num <= count ? '#eab308' : '#cbd5e1'} 
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="qv-page-container">
            <header className="qv-header">
                <div className="qv-header-left">
                    <button onClick={() => window.close()} className="qv-back-btn" title="Close Tab">
                        <X size={20} />
                    </button>
                    <div className="qv-title-meta">
                        <h1>{data.title || data.examName}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <p style={{ margin: 0 }}>{type?.replace('-','').toUpperCase()} &nbsp;·&nbsp; {data.publishDate ? new Date(data.publishDate).toLocaleDateString() :'Recent'}</p>
                            {type === 'current-affairs' && data.rating && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>CSE Importance:</span>
                                    {renderStars(data.rating)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="qv-header-right">
                    {fullPdfUrl && (
                        <button 
                            className="qv-download-btn" 
                            style={{ border:'none', cursor:'pointer' }}
                            onClick={() => setModalOpen(true)}
                        >
                            <Download size={18} /> Download PDF
                        </button>
                    )}
                    <ShareButton 
                        url={`/view-resource/${type}/${id}`} 
                        title={data.title || data.examName ||"Resource"}
                        className="qv-share-btn"
                    />
                </div>
            </header>

            {type === 'current-affairs' && availableTabs.length > 1 && (
                <div className="qv-tabs-bar" style={{ display: 'flex', gap: '10px', background: 'white', padding: '10px 24px', borderBottom: '1px solid #e2e8f0', zIndex: 90 }}>
                    {availableTabs.map(tab => (
                        <button
                            key={tab.id}
                            className={activeTab === tab.id ? 'active' : ''}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                background: activeTab === tab.id ? '#bd7b20' : 'transparent',
                                color: activeTab === tab.id ? 'white' : '#475569',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                fontWeight: 700,
                                fontSize: '13px',
                                cursor: 'pointer',
                                transition: 'all 0.2s' }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            )}

            <main className="qv-main">
                {type === 'current-affairs' ? (
                    activeTab === 'content' && data.content ? (
                        <div className="qv-content-viewer" style={{ maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            <div className="qv-rich-text" dangerouslySetInnerHTML={{ __html: data.content }} />
                            
                            {/* Comments & Ratings */}
                            <div className="qv-reviews-section" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '30px', marginTop: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <MessageSquare size={20} /> Discussion & Ratings
                                    </h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {renderStars(Math.round(Number(averageRating)))}
                                        <span style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>{averageRating}</span>
                                        <span style={{ color: '#64748b', fontSize: '13px' }}>({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
                                    </div>
                                </div>

                                {/* Form to submit comment & rating */}
                                {isAuthenticated() ? (
                                    <form onSubmit={handleReviewSubmit} style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
                                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>Write a Review</h3>
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Your Rating:</span>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                {[1, 2, 3, 4, 5].map(num => (
                                                    <button
                                                        key={num}
                                                        type="button"
                                                        onClick={() => setRating(num)}
                                                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                                                    >
                                                        <Star 
                                                            size={24} 
                                                            fill={num <= rating ? '#eab308' : 'transparent'} 
                                                            stroke={num <= rating ? '#eab308' : '#cbd5e1'} 
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <textarea
                                                placeholder="Share your thoughts on this editorial analysis..."
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                required
                                                rows={4}
                                                className="comment-textarea"
                                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical' }}
                                            />
                                            <button 
                                                type="submit" 
                                                disabled={submittingReview}
                                                style={{ alignSelf: 'flex-end', background: '#bd7b20', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' }}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4858e6'}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#bd7b20'}
                                            >
                                                {submittingReview ? 'Submitting...' : 'Submit Review'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px', textAlign: 'center', marginBottom: '30px' }}>
                                        <p style={{ color: '#475569', fontSize: '14px', margin: '0 0 12px 0' }}>You must be signed in as a student to comment and rate this post.</p>
                                        <button 
                                            onClick={() => {
                                                Swal.fire({
                                                    title: "Authentication Required",
                                                    text: "Please sign in to leave a comment or rating.",
                                                    icon: "info",
                                                    showCancelButton: true,
                                                    confirmButtonText: "Sign In as Student",
                                                    cancelButtonText: "Cancel"
                                                }).then((res) => {
                                                    if (res.isConfirmed) navigate("/student-login");
                                                });
                                            }}
                                            style={{ background: '#bd7b20', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                                        >
                                            Sign In to Review
                                        </button>
                                    </div>
                                )}

                                {/* Reviews List */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {reviews.length > 0 ? (
                                        reviews.map((rev, idx) => (
                                            <div key={rev._id || idx} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                                    <div>
                                                        <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '14px', marginRight: '8px' }}>
                                                            {rev.student_id?.name || "Student"}
                                                        </span>
                                                        <span style={{ background: '#eee3d0', color: '#9b6118', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '100px', textTransform: 'uppercase' }}>
                                                            STUDENT
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                                        {renderStars(rev.rating)}
                                                        <span style={{ color: '#64748b', fontSize: '12px' }}>
                                                            {new Date(rev.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p style={{ color: '#334155', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>{rev.comment}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
                                            <p style={{ margin: 0, fontSize: '14px', fontStyle: 'italic' }}>No reviews yet. Be the first to rate and comment on this article!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'pdf' && fullPdfUrl ? (
                        <div className="qv-pdf-viewer">
                            <Document
                                file={fullPdfUrl}
                                onLoadSuccess={(pdf) => setNumPages(pdf.numPages)}
                                loading={<div style={{ padding:'40px', textAlign:'center' }}>Loading PDF Document...</div>}
                            >
                                <Page 
                                    key={`page_${pageNumber}_${scale}`} 
                                    pageNumber={pageNumber} 
                                    scale={scale} 
                                    renderTextLayer={true}
                                    renderAnnotationLayer={true}
                                />
                            </Document>
                        </div>
                    ) : activeTab === 'ppt' && fullPptUrl ? (
                        <iframe src={googleViewerUrl} width="100%" height="100%" frameBorder="0" title="PPT Viewer" style={{ background:'white' }} />
                    ) : (
                        <div className="qv-no-content">No preview available for this item.</div>
                    )
                ) : (
                    fullPdfUrl ? (
                        <div className="qv-pdf-viewer">
                            <Document
                                file={fullPdfUrl}
                                onLoadSuccess={(pdf) => setNumPages(pdf.numPages)}
                                loading={<div style={{ padding:'40px', textAlign:'center' }}>Loading PDF Document...</div>}
                            >
                                <Page 
                                    key={`page_${pageNumber}_${scale}`} 
                                    pageNumber={pageNumber} 
                                    scale={scale} 
                                    renderTextLayer={true}
                                    renderAnnotationLayer={true}
                                />
                            </Document>
                        </div>
                    ) : fullPptUrl ? (
                        <iframe src={googleViewerUrl} width="100%" height="100%" frameBorder="0" title="PPT Viewer" style={{ background:'white' }} />
                    ) : content ? (
                        <div className="qv-content-viewer">
                            <div className="qv-rich-text" dangerouslySetInnerHTML={{ __html: content }} />
                        </div>
                    ) : (
                        <div className="qv-no-content">No preview available for this item.</div>
                    )
                )}
            </main>

            {((type !== 'current-affairs' && fullPdfUrl) || (type === 'current-affairs' && activeTab === 'pdf' && fullPdfUrl)) && (
                <footer className="qv-footer">
                    <div className="qv-controls">
                        <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))}><ZoomOut size={16} /></button>
                        <span>{Math.round(scale * 100)}%</span>
                        <button onClick={() => setScale(s => Math.min(3, s + 0.2))}><ZoomIn size={16} /></button>
                    </div>
                    <div className="qv-pagination">
                        <button onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber <= 1}>Prev</button>
                        <span>Page {pageNumber} of {numPages}</span>
                        <button onClick={() => setPageNumber(p => Math.min(numPages, p + 1))} disabled={pageNumber >= numPages}>Next</button>
                    </div>
                </footer>
            )}

            <style>{`
                .qv-page-container {
                    width: 100vw;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background: #f4f7fa;
                    font-family:'Plus Jakarta Sans', sans-serif;
                    overflow: hidden;
                }
                .qv-header {
                    height: 70px;
                    background: white;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 24px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    z-index: 100;
                }
                .qv-header-left { display: flex; align-items: center; gap: 20px; flex: 1; min-width: 0; }
                .qv-header-right { display: flex; align-items: center; gap: 12px; }
                .qv-back-btn { background: #f1f5f9; border: none; padding: 10px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; color: #475569; }
                .qv-back-btn:hover { background: #fee4e2; color: #d92d20; }
                .qv-title-meta { min-width: 0; }
                .qv-title-meta h1 { font-size: 18px; margin: 0; font-weight: 800; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .qv-title-meta p { font-size: 12px; margin: 2px 0 0; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
                .qv-download-btn { background: #bd7b20; color: white !important; padding: 10px 20px; border-radius: 8px; font-weight: 700; text-decoration: none; display: flex; align-items: center; gap: 8px; font-size: 14px; }
                .qv-download-btn:hover { background: #4858e6; }
                
                .qv-share-btn {
                    width: 40px !important;
                    height: 40px !important;
                    border: 1px solid #e2e8f0 !important;
                    background: #f8fafc !important;
                    color: #64748b !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    border-radius: 8px !important;
                }
                .qv-share-btn:hover {
                    background: #bd7b20 !important;
                    color: white !important;
                    border-color: #bd7b20 !important;
                }
                
                .qv-main { flex: 1; overflow: auto; padding: 40px; display: flex; justify-content: center; background: #f1f5f9; scroll-behavior: smooth; }
                .qv-pdf-viewer { background: white; box-shadow: 0 10px 40px rgba(0,0,0,0.1); border-radius: 4px; height: fit-content; transition: transform 0.2s ease-out; }
                .qv-content-viewer { max-width: 900px; background: white; padding: 60px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); width: 100%; height: fit-content; margin: 0 auto; }
                .qv-rich-text { line-height: 1.8; color: #1e293b; font-size: 17px; }
                .qv-rich-text h1, .qv-rich-text h2 { margin-top: 1.5em; font-weight: 800; }
                
                .qv-footer { 
                    position: fixed; 
                    bottom: 30px; 
                    left: 50%; 
                    transform: translateX(-50%); 
                    background: #1e293b; 
                    color: white; 
                    padding: 12px 24px; 
                    border-radius: 100px; 
                    display: flex; 
                    gap: 30px; 
                    align-items: center; 
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3); 
                    border: 1px solid rgba(255,255,255,0.1); 
                    z-index: 9999;
                    pointer-events: auto;
                }
                .qv-controls, .qv-pagination { display: flex; align-items: center; gap: 15px; }
                .qv-footer button { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: white; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; }
                .qv-footer button:hover:not(:disabled) { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.4); }
                .qv-footer button:disabled { opacity: 0.3; cursor: not-allowed; }
                .qv-footer span { font-size: 14px; font-weight: 600; min-width: 90px; text-align: center; }
                
                .qv-no-content { align-self: center; font-size: 18px; color: #64748b; font-style: italic; }

                /* Mobile Adjustments */
                @media (max-width: 768px) {
                    .qv-main { padding: 10px; }
                    .qv-footer { width: 90%; gap: 10px; padding: 10px; bottom: 20px; }
                    .qv-header-right { display: none; }
                }
                .qv-tabs-bar button {
                    transition: all 0.2s ease-in-out;
                }
                .qv-tabs-bar button:hover {
                    background: #f1f5f9 !important;
                    color: #1e293b !important;
                }
                .qv-tabs-bar button.active:hover {
                    background: #4858e6 !important;
                    color: white !important;
                }
                .comment-textarea:focus {
                    outline: none;
                    border-color: #bd7b20 !important;
                    box-shadow: 0 0 0 3px rgba(91, 108, 255, 0.1);
                }
            `}</style>

            <DownloadPopupModal 
                isOpen={modalOpen} 
                onClose={() => setModalOpen(false)} 
                targetUrl={pdfUrl ||''} 
                resourceTitle={data.title || data.examName ||"Resource"} 
                resourceType={type?.replace('-','').toUpperCase() ||"Resource"}
            />
        </div>
    );
};

export default QuickViewPage;
