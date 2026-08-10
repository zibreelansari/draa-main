import { useEffect, useState } from 'react';
import toast from '../../utils/toast';
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import Sidebar2 from './Sidebar2';
import url from '../../url';


const CourseContentDetails = () => {


  const Navigate = useNavigate();


  // Get user from local storage
  const [loginUser, setLoginuser] = useState<{ name?: string, tname?: string, aname?: string }>({})
  useEffect(() => {
    const user = localStorage.getItem('edudocs') ? JSON.parse(localStorage.getItem('edudocs') as string) : null
    if (user) {
      setLoginuser(user)
    }
  }, [])

  // Get user from local storage
  interface User {
    content_subject?: String;
    content_category?: String;
    content?: String;
    author?: String;
    approved?: String;
  }



  // preventing admin to access dashboard if they are not looged in 
  useEffect(() => {
    if (!localStorage.getItem('edudocs')) {
      toast.warning("You are not already logged in ! First Log in to your account", 7)
      Navigate('/admin-login')
    }
  }, [Navigate])



  // get Specificuser data from backend 
  const { id } = useParams()
  const [CourseContent, setCourseContent] = useState<User>({})

  useEffect(() => {
    fetch(`${url}/course/courseContentDetails/${id}`) // Update with your backend URL
      .then((response) => response.json())
      .then((data) => {
        setCourseContent(data.contents);
      })
      .catch((error) => {
        console.error("Error fetching Course:", error);
      });
  }, []);

  console.log(CourseContent);

  return (
    <>

      <div>
        {/* Begin page */}
        <div className="wrapper">
          {/* ========== Topbar Start ========== */}

          <Topbar />

          {/* ========== Topbar End ========== */}
          {/* ========== Left Sidebar Start ========== */}
          {"aname" in loginUser ? <Sidebar /> : <Sidebar2 />}
          {/* ========== Left Sidebar End ========== */}
          {/* ============================================================== */}
          {/* Start Page Content Here */}
          {/* ============================================================== */}
          <div className="content-page">
            <div className="content">
              {/* Start Content*/}
              <div className="container-fluid">
                <div className="row">
                  <div className="col-12">

                  </div>
                </div>


                {/* end row */}
              </div>
              {/* container */}
            </div>
            <div className="container mt-5">
              <div className="row d-flex justify-content-center">
                <div className="col-md-12 d-flex justify-content-center">

                </div>

                <div className="col-md-4">
                  <div className="card mt-4 shadow-lg border-0 rounded-4 course-card h-100">
                    <div className="card-body p-4 text-dark bg-light rounded-4">
                      <h4 className="card-title mb-4 text-primary fw-bold">
                        <i className="bi bi-journal-text me-2"></i> Course Details
                      </h4>
                      <ul className="list-unstyled lh-lg">
                        <li>
                          <i className="bi bi-book-fill text-info me-2"></i>
                          <strong>Subject:</strong> {CourseContent.content_subject}
                        </li>
                        {/* 
                        <li>
                          <i className="bi bi-tags-fill text-warning me-2"></i>
                          <strong>Category:</strong> {CourseContent.content_category}
                        </li>
                        */}
                        <li>
                          <i className="bi bi-file-text-fill text-success me-2"></i>
                          <strong>Content:</strong> {CourseContent.content}
                        </li>
                        <li>
                          <i className="bi bi-person-circle text-secondary me-2"></i>
                          <strong>Author:</strong> {CourseContent.author}
                        </li>
                        <li>
                          <i className="bi bi-check2-circle text-primary me-2"></i>
                          <strong>Status:</strong> {CourseContent.approved}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            {/* content */}
            {/* Footer Start */}
            <footer className="bg-secondary text-light pt-4">
              <div className="container text-center text-md-start p-3">
                <div className="row">
                  {/* About Section */}
                  <div className="col-md-4">
                    <h5 className="fw-bold text-light">About Us</h5>
                    <p className="small">We provide high-quality services and ensure customer satisfaction with innovative solutions.</p>
                  </div>
                  {/* Quick Links in a Single Line */}
                  <div className="col-md-4 text-center">
                    <h5 className="fw-bold text-light">Quick Links</h5>
                    <div className="d-flex justify-content-center gap-3">
                      <a href="/" className="text-decoration-none text-light">Home</a>
                      <a href="/about" className="text-decoration-none text-light">About</a>
                      <a href="/services" className="text-decoration-none text-light">Services</a>
                      <a href="/contact" className="text-decoration-none text-light">Contact</a>
                    </div>
                  </div>
                  {/* Social Media */}
                  <div className="col-md-4 text-center text-md-end">
                    <h5 className="fw-bold text-light">Follow Us</h5>
                    <a href="#" className="bg-primary btn btn-outline-light btn-sm me-2"><i className="bi bi-facebook" /></a>
                    <a href="#" className="btn btn-outline-light btn-sm me-2"><i className="bi bi-twitter" /></a>
                    <a href="#" className="bg-danger btn btn-outline-light btn-sm me-2"><i className="bi bi-instagram" /></a>
                    <a href="#" className="bg-primary btn btn-outline-light btn-sm"><i className="bi bi-linkedin" /></a>
                  </div>
                </div>
                <hr className="my-3 text-secondary" />
                {/* Copyright */}
                <div className="text-center pb-3 small">
                  <b> &copy; 2025 Draa. All Rights Reserved.</b>
                </div>
              </div>
            </footer>

            {/* end Footer */}
          </div>
          {/* ============================================================== */}
          {/* End Page content */}
          {/* ============================================================== */}
        </div>
        {/* END wrapper */}
        {/* Theme Settings */}

      </div>


    </>
  );
}

export default CourseContentDetails;
