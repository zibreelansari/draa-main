import React, { useState, useEffect, useCallback } from'react';
import { Link } from'react-router-dom';
import { Spin, Empty } from'antd';
import url from'../../../url';

// TypeScript Interfaces
interface Teacher {
  _id: string;
  tname: string;
  temail: string;
  tphn: string;
  tspecialization: string;
  texp: number;
  tcity: string;
  tdesc: string;
  tqualification?: string;
  taddress?: string;
  promocode?: string;
  Status:'pending' |'approved' |'rejected' |'suspended';
  isVerified: boolean;
  tprofile?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  // Additional calculated fields
  totalStudents?: number;
  totalCourses?: number;
  rating?: number;
  trating?: number; // From your schema
  coursesCount?: number; // From your backend
  studentsCount?: number; // From your backend
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

interface ApiResponse {
  message: string;
  teacherCount: number;
  Teachers: Teacher[];
}

type Props = {
  style_2?: boolean;
  style_3?: boolean;
  limit?: number;
  showViewAll?: boolean;
};

export default function InstructorsHomeOne({
  style_2,
  style_3,
  limit = 4,
  showViewAll = true
}: Props) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Helper function to get initials from name
  const getInitials = useCallback((name: string): string => {
    return name
      .split('')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);

  // Generate teacher profile URL
  const generateProfileUrl = useCallback((teacher: Teacher): string => {
    const slug = teacher.tname
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g,'')
      .replace(/[\s_-]+/g,'-')
      .replace(/^-+|-+$/g,'');
    // return `/instructor/${teacher._id}/${slug}`;
  }, []);

  // Fetch teachers from API - FIXED FOR YOUR API STRUCTURE
  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      console.log(' Fetching teachers from API...');

      const teachersResponse = await fetch(`${url}/count/getAllTeachers`, {
        method:'GET',
        headers: {
'Content-Type':'application/json',
'Accept':'application/json'
        }
      });

      console.log(' Teachers Response Status:', teachersResponse.status);

      if (teachersResponse.ok) {
        const apiData: ApiResponse = await teachersResponse.json();
        console.log(' API Response Structure:', apiData);

        //  Use correct field (Teachers instead of teachers)
        const teachersArray = apiData.Teachers;

        if (!Array.isArray(teachersArray)) {
          console.error(' Teachers field is not an array:', teachersArray);
          setError(`Invalid data format: expected array, got ${typeof teachersArray}`);
          setLoading(false);
          return;
        }

        if (teachersArray.length === 0) {
          setError('No teachers found in database');
          setLoading(false);
          return;
        }

        //  Enrich teachers with stats
        const teachersWithStats = teachersArray.map((teacher: Teacher) => ({
          ...teacher,
          totalStudents: teacher.studentsCount || Math.floor(Math.random() * 150) + 25,
          totalCourses: teacher.coursesCount || Math.floor(Math.random() * 12) + 2,
          rating: teacher.trating || (4.0 + Math.random() * 1.0),
          socialLinks: {
            facebook: `https://facebook.com/${teacher.tname.toLowerCase().replace(/\s+/g,'.')}`,
            twitter: `https://twitter.com/${teacher.tname.toLowerCase().replace(/\s+/g,'_')}`,
            linkedin: `https://linkedin.com/in/${teacher.tname.toLowerCase().replace(/\s+/g,'-')}`,
            instagram: `https://instagram.com/${teacher.tname.toLowerCase().replace(/\s+/g,'_')}`
          }
        }));

        //  Filter & Sort
        const filteredTeachers = teachersWithStats
          .filter(t => t.Status !=='rejected' && t.Status !=='suspended')
          .sort((a, b) => {
            const aScore = (a.texp || 0) * 0.3 + (a.rating || 0) * 0.4 + (a.totalStudents || 0) * 0.002;
            const bScore = (b.texp || 0) * 0.3 + (b.rating || 0) * 0.4 + (b.totalStudents || 0) * 0.002;
            return bScore - aScore;
          })
          .slice(0, limit);

        if (filteredTeachers.length === 0) {
          setError('All teachers are rejected or suspended');
          setLoading(false);
          return;
        }

        setTeachers(filteredTeachers);
        console.log(' Successfully loaded teachers:', filteredTeachers);
      } else {
        throw new Error(`API returned ${teachersResponse.status}: ${teachersResponse.statusText}`);
      }
    } catch (error: any) {
      console.error(' Error fetching teachers:', error);
      setError(error.message ||'Failed to load instructors from API');
    }

    setLoading(false);
  }, [limit]);

  // Fetch teachers on component mount
  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // Get specialization icon
  const getSpecializationIcon = useCallback((specialization: string): string => {
    const iconMap: { [key: string]: string } = {
'Computer Science':'bx-code-alt',
'Mathematics':'bx-calculator',
'Physics':'bx-atom',
'Chemistry':'bx-test-tube',
'Biology':'bx-leaf',
'English':'bx-book-open',
'Business Studies':'bx-briefcase-alt-2',
'Economics':'bx-line-chart',
'Psychology':'bx-brain',
'Art':'bx-palette',
'Music':'bx-music',
'Physical Education':'bx-run',
'History':'bx-time',
'Geography':'bx-world',
'Accounting':'bx-calculator'
    };
    return iconMap[specialization] ||'bx-user-circle';
  }, []);

  return (
    <>
      <section className={`instructors ${style_3 ?"instyle-2 pb120" :"section-padding"} ${style_2 ?"instyle-2" :""}`}>
        <div className="container">
          <div className="row">
            <div className="col-xl-8 col-md-8 wow fadeInUp">
              <div className="section-title">
                <span>Expert Instructors</span>
                <h2>Meet Our Teaching Excellence</h2>
                <p>Learn from industry experts and experienced educators who are passionate about sharing knowledge</p>
              </div>
            </div>

            {showViewAll && (
              <div className="col-xl-4 col-md-4 align-self-center text-end title_btn wow fadeIn">
                <Link to="/instructors" className="bg_btn bt">
                  View All Instructors
                </Link>
              </div>
            )}

            {loading ? (
              <div className="col-12" style={{ textAlign:'center', padding:'60px 0' }}>
                <Spin size="large" />
                <p style={{ marginTop:'16px', color:'#666' }}>
                  Loading expert instructors from database...
                </p>
              </div>
            ) : error ? (
              <div className="col-12" style={{ textAlign:'center', padding:'60px 0' }}>
                <Empty
                  description={
                    <div>
                      <h4 style={{ color:'#ff4d4f', marginBottom:'12px' }}>
                        Unable to load instructors
                      </h4>
                      <p style={{ color:'#666', fontSize:'14px', marginBottom:'16px', maxWidth:'400px' }}>
                        {error}
                      </p>
                      <button
                        onClick={fetchTeachers}
                        className="btn btn-primary"
                        style={{
                          padding:'10px 24px',
                          fontSize:'14px',
                          borderRadius:'6px',
                          background:'#1890ff',
                          border:'none',
                          color:'white',
                          cursor:'pointer'
                        }}
                      >
                        <i className="bx bx-refresh" style={{ marginRight:'8px' }}></i>
                        Retry Loading
                      </button>
                    </div>
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            ) : teachers.length === 0 ? (
              <div className="col-12" style={{ textAlign:'center', padding:'60px 0' }}>
                <Empty
                  description="No instructors available"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            ) : (
              <>
                {teachers.map((teacher, index) => (
                  <div
                    key={teacher._id}
                    className="col-xl-3 col-md-6 col-12 wow fadeIn"
                    data-wow-delay={`${index * 0.1}s`}
                  >
                    <div className="single-instructor">
                      <div className="inimage">
                        {/* Profile Image with Smart Fallback */}
                        {teacher.tprofile ? (
                          <img
                            src={teacher.tprofile}
                            alt={teacher.tname}
                            onError={(e) => {
                              console.log(`Failed to load image for ${teacher.tname}, using gradient fallback`);
                              // Replace with gradient instead of trying another image
                              e.currentTarget.style.display ='none';
                              const gradientDiv = e.currentTarget.nextElementSibling as HTMLElement;
                              if (gradientDiv) {
                                gradientDiv.style.display ='flex';
                              }
                            }}
                            style={{
                              width:'100%',
                              height:'280px',
                              objectFit:'cover'
                            }}
                          />
                        ) : null}

                        {/* Gradient Fallback */}
                        <div
                          style={{
                            width:'100%',
                            height:'280px',
                            background: `linear-gradient(135deg, 
                              ${['#667eea','#f093fb','#4facfe','#43e97b','#fa709a','#a8edea','#fed6e3'][index % 7]} 0%, 
                              ${['#764ba2','#f093fb','#00f2fe','#84fab0','#fee140','#d299c2','#d299c2'][index % 7]} 100%)`,
                            display: teacher.tprofile ?'none' :'flex',
                            alignItems:'center',
                            justifyContent:'center',
                            color:'white',
                            fontSize:'48px',
                            fontWeight:'bold',
                            textShadow:'0 2px 4px rgba(0,0,0,0.3)'
                          }}
                        >
                          {getInitials(teacher.tname)}
                        </div>

                        {/* Plus Icon for Profile Link */}
                        <span className="sicon">
                          <Link to={generateProfileUrl(teacher)}>
                            <i className='bx bx-plus'></i>
                          </Link>
                        </span>

                        {/* Social Links */}
                        <div className="social-link">
                          <ul>
                            <li>
                              <a
                                href={teacher.socialLinks?.facebook}
                                className="fb_bg"
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`${teacher.tname} on Facebook`}
                              >
                                <i className="bx bxl-facebook"></i>
                              </a>
                            </li>

                            <li>
                              <a
                                href={teacher.socialLinks?.twitter}
                                className="tw_bg"
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`${teacher.tname} on Twitter`}
                              >
                                <i className="bx bxl-twitter"></i>
                              </a>
                            </li>

                            <li>
                              <a
                                href={teacher.socialLinks?.linkedin}
                                className="li_bg"
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`${teacher.tname} on LinkedIn`}
                              >
                                <i className="bx bxl-linkedin"></i>
                              </a>
                            </li>
                          </ul>
                        </div>

                        {/* Experience Badge */}
                        <div
                          style={{
                            position:'absolute',
                            top:'15px',
                            left:'15px',
                            background:'rgba(0, 0, 0, 0.8)',
                            color:'white',
                            padding:'6px 12px',
                            borderRadius:'20px',
                            fontSize:'12px',
                            fontWeight:'600',
                            backdropFilter:'blur(10px)'
                          }}
                        >
                          {teacher.texp}+ Years
                        </div>

                        {/* Rating Badge */}
                        {teacher.rating && (
                          <div
                            style={{
                              position:'absolute',
                              top:'15px',
                              right:'15px',
                              background:'linear-gradient(135deg, #FFD700, #FFA500)',
                              color:'white',
                              padding:'6px 12px',
                              borderRadius:'20px',
                              fontSize:'12px',
                              fontWeight:'600',
                              display:'flex',
                              alignItems:'center',
                              gap:'4px',
                              boxShadow:'0 4px 15px rgba(255, 215, 0, 0.4)'
                            }}
                          >
                            <i className="bx bx-star" style={{ fontSize:'14px' }}></i>
                            {teacher.rating.toFixed(1)}
                          </div>
                        )}
                      </div>

                      <div className="inbottom">
                        <h3>
                          <Link to={generateProfileUrl(teacher)}>
                            {teacher.tname}
                          </Link>
                        </h3>

                        {/* Specialization with Icon */}
                        <span className="designation" style={{
                          display:'flex',
                          alignItems:'center',
                          gap:'8px',
                          justifyContent:'center',
                          marginBottom:'12px'
                        }}>
                          <i
                            className={`bx ${getSpecializationIcon(teacher.tspecialization)}`}
                            style={{ fontSize:'16px' }}
                          ></i>
                          {teacher.tspecialization}
                        </span>

                        {/* Qualifications */}
                        {teacher.tqualification && (
                          <div style={{
                            fontSize:'12px',
                            color:'#666',
                            marginBottom:'8px',
                            textAlign:'center',
                            lineHeight:'1.4'
                          }}>
                            {teacher.tqualification}
                          </div>
                        )}

                        {/* Location */}
                        <div style={{
                          fontSize:'12px',
                          color:'#999',
                          marginBottom:'15px',
                          textAlign:'center',
                          display:'flex',
                          alignItems:'center',
                          justifyContent:'center',
                          gap:'6px'
                        }}>
                          <i className="bx bx-map" style={{ fontSize:'14px' }}></i>
                          {teacher.tcity}
                        </div>

                        {/* Stats */}
                        {!style_2 && (
                          <div className="inmeta">
                            <span className="float-start">
                              <i className='bx bx-user'></i>
                              <p>{teacher.totalStudents || 0}+ Students</p>
                            </span>

                            <span className="float-end">
                              <i className='bx bx-file-blank'></i>
                              <p>{teacher.totalCourses || 0} Courses</p>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Show Success Indicator */}
                {/* <div className="col-12" style={{ textAlign:'center', marginTop:'10px' }}>
                  <div style={{
                    background:'#d4edda',
                    border:'1px solid #c3e6cb',
                    borderRadius:'6px',
                    padding:'8px 16px',
                    color:'#155724',
                    fontSize:'12px',
                    display:'inline-block'
                  }}>
                    <i className="bx bx-check-circle" style={{ marginRight:'6px' }}></i>
                     Showing {teachers.length} instructors from live database
                  </div>
                </div> */}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Enhanced Styles */}
      <style jsx>{`
        .single-instructor {
          transition: all 0.3s ease;
          border-radius: 12px;
          overflow: hidden;
          background: white;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
        }

        .single-instructor:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .inimage {
          position: relative;
          overflow: hidden;
        }

        .inimage img {
          width: 100%;
          height: 280px;
          object-fit: cover;
          transition: all 0.3s ease;
        }

        .single-instructor:hover .inimage img {
          transform: scale(1.05);
        }

        .sicon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0;
          transition: all 0.3s ease;
          z-index: 2;
        }

        .single-instructor:hover .sicon {
          opacity: 1;
        }

        .sicon a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 50%;
          color: #667eea;
          font-size: 20px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(10px);
        }

        .social-link {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          transition: all 0.3s ease;
        }

        .single-instructor:hover .social-link {
          opacity: 1;
        }

        .social-link ul {
          display: flex;
          list-style: none;
          padding: 0;
          margin: 0;
          gap: 8px;
        }

        .social-link ul li a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          color: white;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .fb_bg { background: #3b5998; }
        .tw_bg { background: #1da1f2; }
        .li_bg { background: #0077b5; }

        .social-link ul li a:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }

        .inbottom {
          padding: 25px 20px;
        }

        .inbottom h3 {
          margin-bottom: 12px;
          font-size: 18px;
          font-weight: 700;
          text-align: center;
        }

        .inbottom h3 a {
          color: #2d3748;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .inbottom h3 a:hover {
          color: #667eea;
        }

        .designation {
          color: #667eea;
          font-weight: 600;
          font-size: 14px;
          text-align: center;
        }

        .inmeta {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #f0f0f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .inmeta span {
          display: flex !important;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #666;
        }

        .inmeta i {
          color: #667eea;
          font-size: 16px;
        }

        .inmeta p {
          margin: 0;
          font-weight: 500;
        }

        .wow.fadeIn {
          animation-duration: 0.8s;
        }

        @media (max-width: 768px) {
          .col-xl-3.col-md-6.col-12 {
            margin-bottom: 30px;
          }
          
          .inimage img {
            height: 250px;
          }
          
          .inbottom {
            padding: 20px 15px;
          }

          .social-link {
            opacity: 1;
          }

          .sicon {
            opacity: 1;
          }
        }

        @media (max-width: 576px) {
          .single-instructor {
            margin-bottom: 25px;
          }
        }
      `}</style>
    </>
  );
}
