import { useEffect, useState } from'react';
import toast from '../../utils/toast';
import { useNavigate } from'react-router-dom'
import { useParams } from'react-router-dom';
import Topbar from'./Topbar';
import Sidebar from'./Sidebar';
import url from'../../url';


const CourseDetails = () => {


  const Navigate = useNavigate();


  // Get user from local storage
  interface User {
    cname?: String;
    cinstructor?: String;
    cdur?: Number;
    clesson?: Number;
    cskill_level?: String;
    clanguage: String;
    cprice: Number;
    cdesc: String;
    c_category: String;
    
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
  const [course, setCourse] = useState<User>({
    cname:'',
    cinstructor:'',
    cdur: 0,
    clesson: 0,
    cskill_level:'',
    clanguage:'',
    cprice: 0,
    cdesc:'',
    c_category:''
  })

  useEffect(() => {
    fetch(`${url}/course/courseDetails/${id}`) // Update with your backend URL
      .then((response) => response.json())
      .then((data) => {
        setCourse(data.course);
      })
      .catch((error) => {
        console.error("Error fetching Course:", error);
      });
  }, []);

  console.log(course);

  return (
    <>

      <div>
        {/* Begin page */}
        <div className="wrapper">
          {/* ========== Topbar Start ========== */}

          <Topbar />

          {/* ========== Topbar End ========== */}
          {/* ========== Left Sidebar Start ========== */}
          <Sidebar />
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
              <div className="row">
                <div className="col-md-12 d-flex justify-content-center">

                </div>

                <div className="col-md-12">
                  <div className="card mt-4 shadow-lg border-0 rounded-4 course-info-card h-100">
                    <div className="card-body p-5 text-dark bg-light rounded-4">
                      <h4 className="card-title text-primary fw-bold mb-4">
                        <i className="bi bi-info-circle-fill me-2"></i> Course Details
                      </h4>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <i className="bi bi-journal-bookmark-fill text-secondary me-2"></i>
                          <strong>Course Name:</strong> {course.cname}
                        </div>
                        <div className="col-md-6 mb-3">
                          <i className="bi bi-person-badge-fill text-info me-2"></i>
                          <strong>Instructor:</strong> {course.cinstructor}
                        </div>
                        <div className="col-md-6 mb-3">
                          <i className="bi bi-clock-history text-warning me-2"></i>
                          <strong>Duration:</strong> {course.cdur !== undefined ? String(course.cdur) :'N/A'} Hours
                        </div>
                        <div className="col-md-6 mb-3">
                          <i className="bi bi-collection-play-fill text-success me-2"></i>
                          <strong>Total Lessons:</strong> {course.clesson !== undefined ? Number(course.clesson).toString() :'N/A'}
                        </div>
                        <div className="col-md-6 mb-3">
                          <i className="bi bi-graph-up-arrow text-danger me-2"></i>
                          <strong>Skill Level:</strong> {course.cskill_level}
                        </div>
                        <div className="col-md-6 mb-3">
                          <i className="bi bi-tags-fill text-primary me-2"></i>
                          <strong>Category:</strong> {course.c_category}
                        </div>
                        <div className="col-md-6 mb-3">
                          <i className="bi bi-translate text-muted me-2"></i>
                          <strong>Language:</strong> {course.clanguage}
                        </div>
                        <div className="col-md-6 mb-3">
                          <i className="bi bi-currency-rupee text-success me-2"></i>
                          <strong>Price:</strong> {course.cprice !== undefined ? Number(course.cprice).toString() :'N/A'}
                        </div>
                        <div className="col-md-12 mb-3">
                          <i className="bi bi-card-text text-dark me-2"></i>
                          <strong>Description:</strong> <br /> {course.cdesc}
                        </div>
                        <div className="col-md-12">
                          <i className="bi bi-people-fill text-secondary me-2"></i>
                          <strong>Enrolled Students:</strong> 5
                        </div>
                      </div>
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

export default CourseDetails;
