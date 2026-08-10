import React, { useEffect, useState } from"react";
import toast from '../../utils/toast';
import { useParams } from"react-router-dom";
import url from"../../url";
import DownloadPopupModal from"./DownloadPopupModal";
import StylishEmptyState from"../common/StylishEmptyState";
import { Briefcase } from"lucide-react";
import SEO from"../common/SEO";
import"./JobDetails.css";

export default function JobDetailsArea() {
  const { id } = useParams<{ id: string }>();
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [downloadTarget, setDownloadTarget] = useState('');
  const [downloadTitle, setDownloadTitle] = useState('');

  const handleDownloadClick = (e: React.MouseEvent, targetUrl: string, title: string) => {
    e.preventDefault();
    setDownloadTarget(targetUrl.startsWith('http') ? targetUrl : `${url}/${targetUrl}`);
    setDownloadTitle(title);
    setModalOpen(true);
  };

  useEffect(() => {
    if (!id) return;
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${url}/jobs/details/${id}`);
        const data = await response.json();
        setJobDetails(data?.data?.job || null);
      } catch (error) {
        toast.error("Error loading job details");
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [id]);

  if (loading) return <div className="sr-loader">Loading...</div>;
  if (!jobDetails) {
    return (
      <StylishEmptyState 
        title="Job Notification Not Found"
        description="This job notification might have expired or been removed."
        actionText="Back to Jobs"
        actionPath="/jobs-notifications"
        icon={Briefcase}
        showBack={true}
      />
    );
  }

  return (
    <div className="sr-page-wrapper">
      <SEO 
        title={jobDetails.title} 
        description={jobDetails.job_description ? jobDetails.job_description.slice(0, 155) : `Recruitment details for ${jobDetails.title}.`}
        ogImage={jobDetails.cover_image ? `${url}/${jobDetails.cover_image}` : undefined}
      />
      <div className="sr-details-container">
        <div className="sr-header-section">
          <div className="sr-header-table">
            <div className="sr-row">
              <div className="sr-label red-text">Name of Post:</div>
              <div className="sr-value">{jobDetails.title}</div>
            </div>
            <div className="sr-row">
              <div className="sr-label red-text">Post Date / Update:</div>
              <div className="sr-value">{new Date(jobDetails.posted_on).toLocaleString()}</div>
            </div>
            <div className="sr-row">
              <div className="sr-label red-text">Short Information :</div>
              <div className="sr-value">{jobDetails.job_description || `Recruitment for ${jobDetails.title}.`}</div>
            </div>
            {jobDetails.advertisement_number && (
              <div className="sr-row">
                <div className="sr-label red-text">Advertisement No :</div>
                <div className="sr-value">{jobDetails.advertisement_number}</div>
              </div>
            )}
          </div>
          {/* {jobDetails.cover_image && (
            <div className="sr-cover-image-container">
              <div className="sr-cover-image-wrapper">
                <img 
                  src={`${url}/${jobDetails.cover_image}`} 
                  alt="Job Recruitment Cover" 
                  className="sr-cover-image" 
                />
              </div>
            </div>
          )} */}
        </div>

        <div className="sr-main-table">
          <div className="sr-table-header">
            <h2 className="pink-text">{jobDetails.organization_name}</h2>
            <h3 className="green-text">{jobDetails.title}</h3>
            <p className="pink-text">Short Details of Notification</p>
          </div>
          
          <div className="sr-split-section">
            <div className="sr-split-left">
              <h3 className="green-text text-center">Important Dates</h3>
              {/* Now using FLAT fields (not nested important_dates object) */}
              {(jobDetails.start_date || jobDetails.last_date || jobDetails.deadline || jobDetails.fee_last_date || jobDetails.exam_date || jobDetails.admit_card_release || jobDetails.result_date) ? (
                <ul>
                  {jobDetails.start_date && (
                    <li>Application Begin : <strong>{new Date(jobDetails.start_date).toLocaleDateString('en-GB')}</strong></li>
                  )}
                  {(jobDetails.last_date || jobDetails.deadline) && (
                    <li>Last Date for Apply Online : <span className="red-text font-bold">{new Date(jobDetails.last_date || jobDetails.deadline).toLocaleDateString('en-GB')}</span></li>
                  )}
                  {jobDetails.fee_last_date && (
                    <li>Pay Exam Fee Last Date : <strong>{new Date(jobDetails.fee_last_date).toLocaleDateString('en-GB')}</strong></li>
                  )}
                  {jobDetails.exam_date && (
                    <li>Exam Date : <strong>{new Date(jobDetails.exam_date).toLocaleDateString('en-GB')}</strong></li>
                  )}
                  {jobDetails.admit_card_release && (
                    <li>Admit Card Available : <strong>{new Date(jobDetails.admit_card_release).toLocaleDateString('en-GB')}</strong></li>
                  )}
                  {jobDetails.result_date && (
                    <li>Result Declaration : <strong>{new Date(jobDetails.result_date).toLocaleDateString('en-GB')}</strong></li>
                  )}
                </ul>
              ) : jobDetails.deadline ? (
                <ul>
                   <li>Last Date for Apply Online : <span className="red-text font-bold">{new Date(jobDetails.deadline).toLocaleDateString('en-GB')}</span></li>
                </ul>
              ) : (
                <div style={{ padding:'20px', textAlign:'center' }}>
                  <p style={{ color:'#666', fontStyle:'italic', margin: 0 }}>To be announced</p>
                </div>
              )}
            </div>
            <div className="sr-split-right">
              <h3 className="green-text text-center">Application Fee</h3>
              {/* Now using FLAT application_fee fields */}
              {(jobDetails.application_fee_general || jobDetails.application_fee_obc || jobDetails.application_fee_ews || jobDetails.application_fee_sc || jobDetails.application_fee_st || jobDetails.application_fee_pwd || jobDetails.application_fee_female) ? (
                <ul>
                  {jobDetails.application_fee_general && (
                    <li>General / UR : <strong>{jobDetails.application_fee_general}/-</strong></li>
                  )}
                  {jobDetails.application_fee_obc && (
                    <li>OBC : <strong>{jobDetails.application_fee_obc}/-</strong></li>
                  )}
                  {jobDetails.application_fee_ews && (
                    <li>EWS : <strong>{jobDetails.application_fee_ews}/-</strong></li>
                  )}
                  {jobDetails.application_fee_sc && (
                    <li>SC : <strong>{jobDetails.application_fee_sc}/-</strong></li>
                  )}
                  {jobDetails.application_fee_st && (
                    <li>ST : <strong>{jobDetails.application_fee_st}/-</strong></li>
                  )}
                  {jobDetails.application_fee_pwd && (
                    <li>PH / PWD : <strong>{jobDetails.application_fee_pwd}/-</strong></li>
                  )}
                  {jobDetails.application_fee_female && (
                    <li>Female (All Category) : <strong>{jobDetails.application_fee_female}/-</strong></li>
                  )}
                  <li>Pay the Examination Fee Through Online Mode such as upi,credit card,debitcard,net banking,mobile banking.</li>
                </ul>
              ) : (
                <div style={{ padding:'20px', textAlign:'center' }}>
                  <p style={{ color:'#666', fontStyle:'italic', margin: 0 }}>Not Mentioned</p>
                </div>
              )}
            </div>
          </div>

          <div className="sr-section-title">
            <h3 className="green-text">Vacancy Details Total : {jobDetails.total_vacancies} Post</h3>
          </div>
          
          <table className="sr-vacancy-table">
            <thead>
              <tr>
                <th className="green-text">Post Name</th>
                <th className="green-text">Total Post</th>
                <th className="green-text">Eligibility</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{jobDetails.title}</td>
                <td>{jobDetails.total_vacancies}</td>
                <td className="sr-eligibility">
                  {(jobDetails.qualifications_required?.length > 0 || jobDetails.age_limit_min) ? (
                    <ul>
                      {jobDetails.qualifications_required?.map((q: string, i: number) => <li key={i}>{q}</li>)}
                      {jobDetails.age_limit_min && <li>Age Limit: {jobDetails.age_limit_min}-{jobDetails.age_limit_max} Years.</li>}
                    </ul>
                  ) : (
                    <p style={{ color:'#666', fontStyle:'italic', margin: 0 }}>Not Mentioned</p>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="sr-section-title">
            <h3 className="green-text">Important Links</h3>
          </div>
          <table className="sr-links-table">
            <tbody>
              {jobDetails.admit_card_url && (
                <tr>
                  <td className="green-text font-bold">Download Admit Card</td>
                  <td colSpan={2}><a href="#" onClick={(e) => handleDownloadClick(e, jobDetails.admit_card_url,"Admit Card")}>Click Here</a></td>
                </tr>
              )}
              {jobDetails.result_url && (
                <tr>
                  <td className="green-text font-bold">Download Result</td>
                  <td colSpan={2}><a href="#" onClick={(e) => handleDownloadClick(e, jobDetails.result_url,"Result")}>Click Here</a></td>
                </tr>
              )}
              {jobDetails.job_pdf_url && (
                <tr>
                  <td className="green-text font-bold">Download Notification</td>
                  <td><a href="#" onClick={(e) => handleDownloadClick(e, jobDetails.job_pdf_url,"Official Notification")}>Click Here</a></td>
                  {jobDetails.official_website ? (
                    <td style={{width:'30%'}}>
                      <a href={jobDetails.official_website.startsWith('http') ? jobDetails.official_website : `https://${jobDetails.official_website}`} target="_blank" rel="noopener noreferrer">Official Website</a>
                    </td>
                  ) : <td style={{width:'30%'}}></td>}
                </tr>
              )}
              {jobDetails.syllabus_url && (
                <tr>
                  <td className="green-text font-bold">Download Syllabus</td>
                  <td colSpan={2}><a href="#" onClick={(e) => handleDownloadClick(e, jobDetails.syllabus_url,"Exam Syllabus")}>Click Here</a></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <DownloadPopupModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        targetUrl={downloadTarget} 
        resourceTitle={downloadTitle} 
        resourceType="Job Document"
      />
    </div>
  );
}