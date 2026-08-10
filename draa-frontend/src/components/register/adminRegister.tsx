import { Link, useNavigate } from"react-router-dom";
import { useEffect } from"react";
import toast from'../../utils/toast';
import url from"../../url"
import axios from"axios";

export default function AdminRegister() {
  const Navigate = useNavigate();
  const SubmitHandler = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    // Get form data correctly
    const formData = new FormData(e.currentTarget);
    const aname = formData.get("aname") as string;
    const aemail = formData.get("aemail") as string;
    const apassword = formData.get("apassword") as string;
   
  
    try {
      await axios.post(`${url}/admin/adminRegister`, { aname, aemail, apassword });
      toast.success("Registration Successful");
  
      // Correcting Navigate usage
      Navigate('/');
    } catch (error) {
      toast.error("Error Encountered !! Registration Unsuccessful");
      console.log(error);
    }
  };

  // Prevent users from registering if they are already logged in

  useEffect(()=>{
    if(localStorage.getItem('edudocs')){
      toast.warning("You are already logged in ! Welcome To Draa",5)
      Navigate('/')
    }
},[Navigate])

return (
  <>
    <section className="login_register section-padding">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 offset-lg-3 col-xs-12 wow fadeIn">
            <div className="register">
              <h4 className="login_register_title">Admin:</h4>
              <form onSubmit={SubmitHandler}>
                <div className="form-group">
                  <label htmlFor="fullname">Admin Name</label>
                  <input type="text" placeholder="Enter Full Name" id="fullname" className=" form-control" name="aname"  required={true} />
                </div>

                <div className="form-group">
                  <label htmlFor="email-address">Admin Email Address</label>
                  <input type="email" placeholder="Enter Email Address" id="email-address" className="form-control" name="aemail" required={true}  />
                </div>

                <div className="form-group">
                  <label htmlFor="cpwd">Password</label>
                  <input type="password" placeholder="Enter Password" id="apwd" className="form-control" name="apassword" max={10} min={10} required={true} />
                </div>

                <div className="form-group col-lg-12">
                  <button className="bg_btn bt" type="submit" name="submit">Signup now</button>
                </div>
              </form>
              <p>Already have an account? <Link to="/admin-login">Login</Link></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </>
)
}
