import React, { useEffect, useState } from'react';
import toast from '../../utils/toast';
import {Link, useParams } from'react-router-dom'




import axios from"axios";
import Topbar from'./Topbar';
import Sidebar2 from'./Sidebar2';
import url from'../../url';
interface Teacher {
  tname: string;
  temail: string;
  tphn: string;
  tpassword: string;
  tspecialization: string;
  texp: string;
  tcity: string;
  tprofile?: File | string;
  tdesc: string;
}

const EditTeacherProfile = () => {


  // const Navigate = useNavigate();

  const [teacher, setTeacher] = useState<Teacher>({
    tname:'',
    temail:'',
    tphn:'',
    tpassword:'',
    tspecialization:'',
    texp:'',
    tcity:'',
    tprofile:'',
    tdesc:''
  });
  const {id}=useParams();
  useEffect(() => {
      fetch(`${url}/course/Teacher/MyProfile/${id}`)
          .then(res => res.json())
          .then(data => {
              setTeacher(data.teacher);
          })
          .catch(err => {
              console.error('Error fetching teacher profile:', err);
          });
  }, [id]);

  console.log(teacher);





  const updateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      try {
          await axios.post(`${url}/teachers/teacherRegister`, formData, {
              headers: {
'Content-Type':'multipart/form-data',
              },
          });
          toast.success("Teacher Registered Successfully")
          setTimeout(() => {
              window.location.href ="/";
          }, 2000);

      } catch (error) {
          toast.error("Error Encountered !!")
          console.log(error);
      }
  }
  return (
    <>
      <div>
        {/* Begin page */}
        <div className="wrapper">
          {/* ========== Topbar Start ========== */}
          <Topbar />

          {/* ========== Topbar End ========== */}
          {/* ========== Left Sidebar Start ========== */}
          <Sidebar2 />
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
                    <div className="page-title-box">
                      <div className="page-title-right">

                      </div>
                      <h4 className="page-title">Edit My Profile</h4>
                    </div>
                  </div>
                </div>

                {/* end row */}

                {/* end row */}

                {/* end row */}
              </div>
              <div className="container">
                <div className="row">
                   
                    <div className="col-lg-6 offset-lg-3 col-xs-12 wow fadeIn">
                            <div className="register">
                                <h4 className="login_register_title">Create a new account For Teachers:</h4>
                                <form onSubmit={updateProfile} encType="multipart/form-data">
                                    <div className="form-group">
                                        <label htmlFor="fullname">Full Name</label>
                                        <input type="text" placeholder="Enter Full Name" id="fullname" className=" form-control" name="tname" value={teacher.tname} required={true} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email-address">Email Address</label>
                                        <input type="email" placeholder="Enter Email Address" id="email-address" className="form-control" name="temail" value={teacher.temail} required={true} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="phn">Phone</label>
                                        <input type="number" placeholder="Enter Phone number" id="phn" className="form-control" name="tphn" value={teacher.tphn} required={true} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="cpwd">Password</label>
                                        <input type="password" placeholder="Enter Password" id="cpwd" className="form-control" name="tpassword" value={teacher.tpassword} max={10} min={10} required={true} />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="tspecialization">Your Specialization</label>
                                        <select className="form-select" aria-label="Default select example" name="tspecialization" value={teacher.tspecialization}>
                                            <option value="Maths">Maths</option>
                                            <option value="English">English</option>
                                            <option value="Hindi">Hindi</option>
                                            <option value="Reasoning">Reasoning</option>
                                            <option value="Apptitude">Apptitude</option>
                                            <option value="GS">General Science</option>
                                            <option value="History">History</option>
                                            <option value="Geography">Geography</option>
                                            <option value="Political">Political Science</option>
                                            <option value="Accounts">Accounts</option>
                                            <option value="Statistics">Statistics</option>
                                            <option value="chemistry">chemistry</option>
                                            <option value="Physics">Physics</option>
                                            <option value="Biology">Biology</option>
                                            <option value="Computer">Computer</option>
                                            <option value="Bengali">Bengali</option>

                                        </select>
                                    </div>
                                    <br />
                                    <div className="form-group">
                                        <label htmlFor="texp">Your Total Experience(in Years)</label>
                                        <input type="number" placeholder="Enter Your Total Experience" id="texp" className="form-control" name="texp" value={teacher.texp} required={true} />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="tcity">Your City</label>
                                        <select className="form-select" aria-label="Default select example" name="tcity" value={teacher.tcity}>
                                            <option value="">Select City</option>
                                            <option value="Ahmedabad">Ahmedabad</option>
                                            <option value="Amritsar">Amritsar</option>
                                            <option value="Bangalore">Bangalore</option>
                                            <option value="Bhopal">Bhopal</option>
                                            <option value="Bhubaneswar">Bhubaneswar</option>
                                            <option value="Chandigarh">Chandigarh</option>
                                            <option value="Chennai">Chennai</option>
                                            <option value="Coimbatore">Coimbatore</option>
                                            <option value="Dehradun">Dehradun</option>
                                            <option value="Delhi">Delhi</option>
                                            <option value="Ernakulam">Ernakulam</option>
                                            <option value="Faridabad">Faridabad</option>
                                            <option value="Ghaziabad">Ghaziabad</option>
                                            <option value="Goa">Goa</option>
                                            <option value="Gurgaon">Gurgaon</option>
                                            <option value="Guwahati">Guwahati</option>
                                            <option value="Hyderabad">Hyderabad</option>
                                            <option value="Indore">Indore</option>
                                            <option value="Jaipur">Jaipur</option>
                                            <option value="Jammu">Jammu</option>
                                            <option value="Jamshedpur">Jamshedpur</option>
                                            <option value="Kanpur">Kanpur</option>
                                            <option value="Kochi">Kochi</option>
                                            <option value="Kolkata">Kolkata</option>
                                            <option value="Lucknow">Lucknow</option>
                                            <option value="Ludhiana">Ludhiana</option>
                                            <option value="Madurai">Madurai</option>
                                            <option value="Mangalore">Mangalore</option>
                                            <option value="Mumbai">Mumbai</option>
                                            <option value="Mysore">Mysore</option>
                                            <option value="Nagpur">Nagpur</option>
                                            <option value="Nashik">Nashik</option>
                                            <option value="Noida">Noida</option>
                                            <option value="Patna">Patna</option>
                                            <option value="Puducherry">Puducherry</option>
                                            <option value="Pune">Pune</option>
                                            <option value="Raipur">Raipur</option>
                                            <option value="Rajkot">Rajkot</option>
                                            <option value="Ranchi">Ranchi</option>
                                            <option value="Shillong">Shillong</option>
                                            <option value="Shimla">Shimla</option>
                                            <option value="Srinagar">Srinagar</option>
                                            <option value="Surat">Surat</option>
                                            <option value="Thane">Thane</option>
                                            <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                                            <option value="Udaipur">Udaipur</option>
                                            <option value="Vadodara">Vadodara</option>
                                            <option value="Varanasi">Varanasi</option>
                                            <option value="Vijayawada">Vijayawada</option>
                                            <option value="Visakhapatnam">Visakhapatnam</option>
                                        </select>
                                    </div>
                                    <br />
                                    <div className="form-group">
                                        <label htmlFor="tprofile">Profile Image</label>
                                        <input type="file" placeholder="Upload Your Profile Picture" id="tprofile" className="form-control" name="tprofile" required={true} />
                                    </div>
                                    <br />

                                    <div className="form-group">
                                        <label htmlFor="tdesc">Tell Me Something about You </label>
                                        <textarea id="tdesc" className="form-control" name="tdesc" value={teacher.tdesc} rows={5} required={true} />
                                    </div>
                                    <br />
                                    <div className="form-group col-lg-12">
                                        <button className="bg_btn bt" type="submit" name="submit">Signup now</button>
                                    </div>
                                </form>
                                <p>Already have an account? <Link to="/teacher-login">Login</Link></p>
                            </div>
                       

                    </div>
                </div>
              </div>
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
    </div>

    </>
  );
}

export default EditTeacherProfile;
