import './Footer.css'
import { useEffect, useState } from 'react';
import url from '../../url';
import { Link } from 'react-router-dom';

interface Book {
  _id: string;
  title: string;
  category: {
    name: string;
  };
}

interface Course {
  _id: string;
  title: string;
  course_category: string;
}

interface ExaminationCategory {
  _id: string;
  name: string;
  code: string;
  year: number;
  description?: string;
  examDate?: string;
  isActive: boolean;
  priority?: number;
  bannerImage?: string;
  statistics?: {
    totalSubjects: number;
    totalTestSeries: number;
  };
}

interface BlogPost {
  _id: string;
  content_subject: string;
  content_category: string;
  approved: boolean;
}

interface SyllabusType {
  _id: string;
  examName: string;
  title: string;
  examCategory: string;
  isApproved: boolean;
}

interface PYQType {
  _id: string;
  examName: string;
  title: string;
  examCategory: string;
  year: number;
}

export default function FooterOne() {
  const [books, setBooks] = useState<Book[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [examinationCategories, setExaminationCategories] = useState<ExaminationCategory[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [syllabus, setSyllabus] = useState<SyllabusType[]>([]);
  const [pyqs, setPyqs] = useState<PYQType[]>([]);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState<string | null>(null);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) {
      setNewsletterError('Please enter an email address.');
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(newsletterEmail)) {
      setNewsletterError('Please enter a valid email address.');
      return;
    }

    setNewsletterLoading(true);
    setNewsletterSuccess(null);
    setNewsletterError(null);

    try {
      const response = await fetch(`${url}/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = await response.json();
      if (data.success) {
        setNewsletterSuccess(data.message || 'Verification link sent!');
        setNewsletterEmail('');
        setTimeout(() => setNewsletterSuccess(null), 8000);
      } else {
        setNewsletterError(data.message || 'Subscription failed. Please try again.');
        setTimeout(() => setNewsletterError(null), 8000);
      }
    } catch (err) {
      console.error('Newsletter Signup Error:', err);
      setNewsletterError('Failed to connect to the server. Please try again later.');
      setTimeout(() => setNewsletterError(null), 8000);
    } finally {
      setNewsletterLoading(false);
    }
  };

  useEffect(() => {
    // Fetch Books
    fetch(`${url}/books/approved?page=1&limit=8`)
      .then(res => res.json())
      .then(data => setBooks(data.books || []))
      .catch(err => console.error('Error fetching books:', err));

    // Fetch Courses
    fetch(`${url}/course/allCourses?page=1&limit=8`)
      .then(res => res.json())
      .then(data => setCourses(data.data.courses || []))
      .catch(err => console.error('Error fetching courses:', err));

    // Fetch Examination Categories
    fetch(`${url}/test-series/navigation/examinations`)
      .then(res => res.json())
      .then(data => {
        const categoriesData = data?.data?.examinationCategories ||
          data?.examinationCategories ||
          data?.data ||
          data ||
          [];

        const validCategories = Array.isArray(categoriesData)
          ? categoriesData
            .filter(cat => cat && cat._id && cat.name && cat.code && cat.isActive)
            .sort((a, b) => (a.priority || 999) - (b.priority || 999))
            .slice(0, 8)
          : [];

        setExaminationCategories(validCategories);
      })
      .catch(err => console.error('Error fetching examination categories:', err));

    // Fetch Blogs
    fetch(`${url}/course/allCourseContent`)
      .then(res => res.json())
      .then(data => {
        const approvedBlogs = data.result?.filter((blog: BlogPost) => blog.approved) || [];
        setBlogs(approvedBlogs.slice(0, 8));
      })
      .catch(err => console.error('Error fetching blogs:', err));

    // Fetch Syllabus
    fetch(`${url}/syllabus/approved`)
      .then(res => res.json())
      .then(data => {
        const approvedSyllabus = data.syllabuses || [];
        setSyllabus(approvedSyllabus.slice(0, 8));
      })
      .catch(err => console.error('Error fetching syllabus:', err));

    // Fetch PYQs
    fetch(`${url}/pyq/approved`)
      .then(res => res.json())
      .then(data => {
        const approvedPYQs = data.pyqs || [];
        setPyqs(approvedPYQs.slice(0, 8));
      })
      .catch(err => console.error('Error fetching PYQs:', err));
  }, []);

  const generateSlug = (title: string, id: string): string => {
    const slug = title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `${slug}-${id}`;
  };

  return (
    <>


      {/* Help Section */}
      <section className="help-section py-5" style={{ backgroundColor: "#ffffff" }}>
        <div className="container">
          <div className="row text-center">
            <div className="col-12 mb-4">
              <h3 className="text-dark">
                Need any <span className="text-danger">help?</span>
              </h3>
            </div>

            {/* CONTACT US */}
            <div className="col-md-4 mb-3">
              <div className="help-card p-4 h-100">
                <i className="fa-solid fa-headset fa-2x text-primary mb-3"></i>
                <h6 className="text-dark mb-2">
                  Get help with our 24x7 Customer Service
                </h6>
                <p className="text-muted small mb-3">
                  Our support team is available round the clock
                </p>

                <button
                  className="btn-join-now"
                  onClick={() => (window.location.href = "/contact")}
                >
                  <span className="btn-text">Contact Us</span>
                  <span className="btn-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path
                        d="M5 12H19M19 12L12 5M19 12L12 19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              </div>
            </div>

            {/* WHATSAPP CHAT */}
            <div className="col-md-4 mb-3">
              <div className="help-card p-4 h-100">
                <i className="fa-solid fa-comments fa-2x text-success mb-3"></i>
                <h6 className="text-dark mb-2">Chat with us for any queries</h6>
                <p className="text-muted small mb-3">
                  Get instant answers through WhatsApp
                </p>

                <button
                  className="btn-join-now"
                  onClick={() =>
                    window.open(
                      "https://wa.me/918076003728?text=Hello%20I%20need%20assistance",
                      "_blank"
                    )
                  }
                >
                  <span className="btn-text">Chat on WhatsApp</span>
                  <span className="btn-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path
                        d="M5 12H19M19 12L12 5M19 12L12 19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              </div>
            </div>

            {/* CALL */}
            <div className="col-md-4 mb-3">
              <div className="help-card p-4 h-100">
                <i className="fa-solid fa-phone fa-2x text-info mb-3"></i>
                <h6 className="text-dark mb-2">
                  Call us directly for purchase related queries
                </h6>
                <p className="text-muted small mb-1">
                  Mon - Sun | 7:00 am - 11:00 pm
                </p>

                <button
                  className="btn-join-now"
                  onClick={() => (window.location.href = "tel:+918076003728")}
                >
                  <span className="btn-text">Call: 8076003728</span>
                  <span className="btn-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path
                        d="M5 12H19M19 12L12 5M19 12L12 19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* FOOTER */}
      <section>
        <footer className="footer-sec text-white py-5 text-light">
          <div className="container">
            <div className="row mt-4">
              <div className="col-md-3">
                <h5 className="text-light"> <i className="fa-solid fa-book"></i> &nbsp; Draa</h5>
                <p>
                  We believe that every learner deserves the right tools, guidance, and motivation to achieve their academic goals. Draa bridges the gap between learning and success with expertly designed courses, books, and test series that prepare you for excel...
                </p>
              </div>

              <div className="col-md-3">
                <h5 className="text-light"><i className="fa-solid fa-link"></i> &nbsp; Useful Links</h5>
                <ul className="list-unstyled">
                  <li><a href="/" className='text-light text-decoration-none'>Home</a></li>
                  <li><a href="/about" className='text-light text-decoration-none'>About Us</a></li>
                  <li><a href="/privacy-policy" className='text-light text-decoration-none'>Privacy Policy</a></li>
                  <li><a href="/tnc" className='text-light text-decoration-none'>Terms and Conditions</a></li>
                  <li><a href="/contact" className='text-light text-decoration-none'>Contact</a></li>
                </ul>
              </div>

              <div className="col-md-3">
                <h5 className="text-light"><i className="fa-solid fa-paperclip"></i> &nbsp;Resources</h5>
                <ul className="list-unstyled">
                  <li><a href="/courses" className='text-light text-decoration-none'>Courses</a></li>
                  <li><a href="/all-books" className='text-light text-decoration-none'>Books</a></li>
                  <li><a href="/online-test-series" className='text-light text-decoration-none'>Test Series</a></li>
                  <li><a href="/grid-blog" className='text-light text-decoration-none'>Blogs</a></li>
                  <li><a href="/previous-year-questions" className='text-light text-decoration-none'>PYQs</a></li>
                  <li><a href="/syllabus" className='text-light text-decoration-none'>Syllabus</a></li>
                </ul>
              </div>

              <div className="col-md-3">
                <h5 className="text-light"> <i className="fa-solid fa-address-book" /> &nbsp; Contact Us</h5>
                <ul className="list-unstyled">
                  <li className="d-flex align-items-center gap-2"><i className="fa-solid fa-location-dot"></i> Building no 1, 3rd floor, opp. Sapna cinema, above Bikanervala Community centre, D Block, East of Kailash, New Delhi, Delhi 110065</li>
                  <li className="d-flex align-items-center gap-2"><i className="fa-solid fa-phone"></i> 080760 03728</li>
                  <li className="d-flex align-items-center gap-2"><i className="fa-solid fa-envelope"></i> contact@draa.in</li>
                </ul>
              </div>
            </div>

            <div className="row border-bottom pb-4 mt-5">
              <div className="col-md-6 text-center text-md-start text-subscribe">
                <h2 className="text-light">Subscribe to Our Newsletter for Latest Update</h2>
              </div>
              <div className="col-md-6 d-flex flex-column align-items-center align-items-md-end mt-3 mt-md-0">
                <form onSubmit={handleNewsletterSubscribe} className="d-flex w-100 justify-content-center justify-content-md-end">
                  <input
                    type="email"
                    className="form-control w-50 me-2 input-subscribe"
                    placeholder="Email Address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    disabled={newsletterLoading}
                    required
                  />
                  <button type="submit" className="btn btn-primary btn-subscribe d-flex align-items-center gap-2" disabled={newsletterLoading}>
                    {newsletterLoading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        <span>Sending...</span>
                      </>
                    ) : (
                      'Subscribe'
                    )}
                  </button>
                </form>
                {newsletterSuccess && (
                  <p className="small mt-2 mb-0" style={{ color: '#10b981', fontWeight: 600 }}>
                    {newsletterSuccess}
                  </p>
                )}
                {newsletterError && (
                  <p className="small mt-2 mb-0" style={{ color: '#ef4444', fontWeight: 600 }}>
                    ⚠️ {newsletterError}
                  </p>
                )}
              </div>
            </div>

            <p className="text-center text-secondary mt-4 text-light">
              <b>Copyright © {new Date().getFullYear()} Draa LLP. All rights reserved.</b>
              <br />
              <span className="small text-muted" style={{ fontSize: '13px', display: 'block', marginTop: '6px', opacity: 0.8 }}>
                Design and Developed by <span style={{ color: '#00a3b1', fontWeight: 600 }}>Static Consultancy LLP</span>
              </span>
            </p>
          </div>
        </footer>
      </section>

      {/* CONTACT STRIP AT THE BOTTOM */}
      <section className="contact-strip">
        <div className="container-fluid">
          <div className="row align-items-center py-2">
            <div className="col-md-3 d-flex justify-content-center justify-content-md-start">
              <div className="social-icons d-flex gap-2">
                <a href="https://tinyurl.com/draa-fb-page" className="social-icon facebook">
                  <i className="fa-brands fa-facebook"></i>
                </a>
                <a href="#" className="social-icon twitter">
                  <i className="fa-brands fa-x-twitter"></i>
                </a>
                <a href="https://tinyurl.com/draa-yt" className="social-icon youtube">
                  <i className="fa-brands fa-youtube"></i>
                </a>
                <a href="https://tinyurl.com/draa-intsa" className="social-icon instagram">
                  <i className="fa-brands fa-instagram"></i>
                </a>
              </div>
            </div>

            <div className="col-md-6 text-center">
              <div className="contact-info d-flex flex-column flex-md-row justify-content-center align-items-center gap-3">
                <div className="contact-item">
                  <i className="fa-solid fa-phone me-2"></i>
                  <span>080760 03728</span>
                  <small className="ms-2 text-muted">Available Mon-Sat (10 AM to 7 PM)</small>
                </div>
                <div className="contact-item">
                  <i className="fa-solid fa-envelope me-2"></i>
                  <span>contact@draa.com</span>
                </div>
              </div>
            </div>

            <div className="col-md-3 text-center text-md-end">
              <small className="copyright-text">
                © DRAA EDUTECH PRIVATE LIMITED<br />
                All rights reserved.
                <br />
                Design and Developed by <span style={{ color: '#00a3b1', fontWeight: 600 }}>Static Consultancy LLP</span>
              </small>
            </div>
          </div>
        </div>
      </section>
      {/* LEARNING RESOURCES SECTION - MOVED TO TOP */}
      <section className="learning-resources-section py-5" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container">
          <div className="row mb-5">
            <div className="col-12 text-center">
              <h2 className="fw-bold text-dark mb-2">
                <i className="fa-solid fa-graduation-cap text-primary me-2"></i>
                Learning Resources
              </h2>
              <p className="text-muted">Explore our comprehensive collection of educational materials</p>
            </div>
          </div>

          <div className="row g-4">
            {/* 1. Draa Books Section */}
            <div className="col-lg-4 col-md-6">
              <div className="resource-card h-100 p-4 border rounded-3 shadow-sm bg-white">
                <div className="resource-header mb-3 d-flex align-items-center justify-content-between">
                  <h5 className="fw-bold text-primary mb-0">
                    <span className="badge-number">8+</span>
                    Draa Books
                  </h5>
                </div>

                <ul className="resource-list list-unstyled">
                  {books.length > 0 ? (
                    books.slice(0, 4).map((book) => (
                      <li key={book._id} className="mb-2">
                        <Link
                          to={`/book-details/${book._id}`}
                          className="text-decoration-none text-dark hover-link d-flex align-items-start"
                        >
                          <i className="fa-solid fa-chevron-right text-primary me-2 mt-1 small"></i>
                          <span className="flex-grow-1">{book.title}</span>
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="text-center text-muted py-4">
                      <i className="fa-solid fa-spinner fa-spin me-2"></i>
                      Loading books...
                    </li>
                  )}
                </ul>

                <div className="text-center mt-3">
                  <Link to="/all-books" className="btn btn-outline-primary btn-sm">
                    View All Books <i className="fa-solid fa-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>

            {/* 2. Test Series Section */}
            <div className="col-lg-4 col-md-6">
              <div className="resource-card h-100 p-4 border rounded-3 shadow-sm bg-white">
                <div className="resource-header mb-3 d-flex align-items-center justify-content-between">
                  <h5 className="fw-bold text-success mb-0">
                    <span className="badge-number">0+</span>
                    Draa Test Series
                  </h5>
                </div>

                <ul className="resource-list list-unstyled">
                  {examinationCategories.length > 0 ? (
                    examinationCategories.slice(0, 4).map((exam) => (
                      <li key={exam._id} className="mb-2">
                        <Link
                          to={`/exam-topics/${exam._id}`}
                          className="text-decoration-none text-dark hover-link d-flex align-items-start"
                        >
                          <i className="fa-solid fa-chevron-right text-success me-2 mt-1 small"></i>
                          <span className="flex-grow-1">
                            {exam.code} {exam.year}
                          </span>
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="text-center text-muted py-4">
                      <i className="fa-solid fa-spinner fa-spin me-2"></i>
                      Loading test series...
                    </li>
                  )}
                </ul>

                <div className="text-center mt-3">
                  <Link to="/online-test-series" className="btn btn-outline-success btn-sm">
                    View All Tests <i className="fa-solid fa-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>

            {/* 3. Courses Section */}
            <div className="col-lg-4 col-md-6">
              <div className="resource-card h-100 p-4 border rounded-3 shadow-sm bg-white">
                <div className="resource-header mb-3 d-flex align-items-center justify-content-between">
                  <h5 className="fw-bold text-warning mb-0">
                    <span className="badge-number">2+</span>
                    Draa Courses
                  </h5>
                </div>

                <ul className="resource-list list-unstyled">
                  {courses.length > 0 ? (
                    courses.slice(0, 4).map((course) => (
                      <li key={course._id} className="mb-2">
                        <Link
                          to={`/course-details/${course._id}`}
                          className="text-decoration-none text-dark hover-link d-flex align-items-start"
                        >
                          <i className="fa-solid fa-chevron-right text-warning me-2 mt-1 small"></i>
                          <span className="flex-grow-1">{course.title}</span>
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="text-center text-muted py-4">
                      <i className="fa-solid fa-spinner fa-spin me-2"></i>
                      Loading courses...
                    </li>
                  )}
                </ul>

                <div className="text-center mt-3">
                  <Link to="/courses" className="btn btn-outline-warning btn-sm">
                    View All Courses <i className="fa-solid fa-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>

            {/* 4. Syllabus Section */}
            <div className="col-lg-4 col-md-6">
              <div className="resource-card h-100 p-4 border rounded-3 shadow-sm bg-white">
                <div className="resource-header mb-3 d-flex align-items-center justify-content-between">
                  <h5 className="fw-bold text-info mb-0">
                    <span className="badge-number">0+</span>
                    Exam Syllabus
                  </h5>
                </div>

                <ul className="resource-list list-unstyled">
                  {syllabus.length > 0 ? (
                    syllabus.slice(0, 4).map((syl) => (
                      <li key={syl._id} className="mb-2">
                        <Link
                          to={`/syllabus/${syl._id}`}
                          className="text-decoration-none text-dark hover-link d-flex align-items-start"
                        >
                          <i className="fa-solid fa-chevron-right text-info me-2 mt-1 small"></i>
                          <span className="flex-grow-1">{syl.title}</span>
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="text-center text-muted py-4">
                      <i className="fa-solid fa-spinner fa-spin me-2"></i>
                      Loading syllabus...
                    </li>
                  )}
                </ul>

                <div className="text-center mt-3">
                  <Link to="/syllabus" className="btn btn-outline-info btn-sm">
                    View All Syllabus <i className="fa-solid fa-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>

            {/* 5. Blogs Section */}
            <div className="col-lg-4 col-md-6">
              <div className="resource-card h-100 p-4 border rounded-3 shadow-sm bg-white">
                <div className="resource-header mb-3 d-flex align-items-center justify-content-between">
                  <h5 className="fw-bold text-danger mb-0">
                    <span className="badge-number">0+</span>
                    Educational Blogs
                  </h5>
                </div>

                <ul className="resource-list list-unstyled">
                  {blogs.length > 0 ? (
                    blogs.slice(0, 4).map((blog) => (
                      <li key={blog._id} className="mb-2">
                        <Link
                          to={`/blog-details/${generateSlug(blog.content_subject, blog._id)}`}
                          className="text-decoration-none text-dark hover-link d-flex align-items-start"
                        >
                          <i className="fa-solid fa-chevron-right text-danger me-2 mt-1 small"></i>
                          <span className="flex-grow-1">{blog.content_subject}</span>
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="text-center text-muted py-4">
                      <i className="fa-solid fa-spinner fa-spin me-2"></i>
                      Loading blogs...
                    </li>
                  )}
                </ul>

                <div className="text-center mt-3">
                  <Link to="/grid-blog" className="btn btn-outline-danger btn-sm">
                    View All Blogs <i className="fa-solid fa-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>

            {/* 6. PYQs Section */}
            <div className="col-lg-4 col-md-6">
              <div className="resource-card h-100 p-4 border rounded-3 shadow-sm bg-white">
                <div className="resource-header mb-3 d-flex align-items-center justify-content-between">
                  <h5 className="fw-bold text-secondary mb-0">
                    <span className="badge-number">0+</span>
                    Previous Year Questions
                  </h5>
                </div>

                <ul className="resource-list list-unstyled">
                  {pyqs.length > 0 ? (
                    pyqs.slice(0, 4).map((pyq) => (
                      <li key={pyq._id} className="mb-2">
                        <Link
                          to={`/previous-year-questions/${pyq._id}`}
                          className="text-decoration-none text-dark hover-link d-flex align-items-start"
                        >
                          <i className="fa-solid fa-chevron-right text-secondary me-2 mt-1 small"></i>
                          <span className="flex-grow-1">{pyq.title}</span>
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="text-center text-muted py-4">
                      <i className="fa-solid fa-spinner fa-spin me-2"></i>
                      Loading PYQs...
                    </li>
                  )}
                </ul>

                <div className="text-center mt-3">
                  <Link to="/previous-year-questions" className="btn btn-outline-secondary btn-sm">
                    View All PYQs <i className="fa-solid fa-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* CUSTOM STYLES - FIXED OVERLAPPING */}
      <style>{`
        /* Learning Resources Section - FIXED */
        .learning-resources-section {
          border-top: 3px solid #e0e0e0;
        }

        .resource-card {
          transition: all 0.3s ease;
          background: #ffffff;
          border: 2px solid #e9ecef !important;
          position: relative;
          z-index: 1;
        }

        .resource-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
          border: 2px solid #d0d0d0 !important;
          z-index: 2;
        }

        .badge-number {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          margin-right: 8px;
        }

        .resource-list {
          max-height: 240px;
          overflow-y: auto;
          padding-right: 10px;
        }

        .resource-list::-webkit-scrollbar {
          width: 6px;
        }

        .resource-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .resource-list::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }

        .resource-list::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        .resource-list li {
          padding: 8px 10px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .resource-list li:hover {
          background-color: rgba(0, 123, 255, 0.05);
          padding-left: 15px;
        }

        .hover-link {
          font-size: 0.9rem;
          line-height: 1.5;
          transition: color 0.2s ease;
        }

        .hover-link:hover {
          color: #007bff !important;
        }

        .resource-header h5 {
          font-size: 1rem;
        }

        /* Help Section */
        .help-card {
          background: white;
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .help-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
        }

        /* Stylish Button Styles */
        .btn-join-now {
          position: relative;
          padding: 12px 30px;
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
          background: #00a3b1;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 8px 20px rgba(0, 163, 177, 0.3);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          letter-spacing: 0.3px;
        }

        .btn-join-now::before {
          content:'';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.6s;
        }

        .btn-join-now:hover::before {
          left: 100%;
        }

        .btn-join-now:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 12px 30px rgba(0, 163, 177, 0.4);
        }

        .btn-text {
          position: relative;
          z-index: 1;
        }

        .btn-icon {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          transition: transform 0.3s ease;
        }

        .btn-join-now:hover .btn-icon {
          transform: translateX(5px);
        }

        @media (max-width: 768px) {
          .resource-card {
            margin-bottom: 20px;
          }
          
          .resource-list {
            max-height: 200px;
          }

          .btn-join-now {
            padding: 10px 25px;
            font-size: 13px;
          }

          .resource-header h5 {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </>
  )
}
