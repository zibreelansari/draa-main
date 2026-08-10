import { useEffect, useState } from'react';
import toast from '../../utils/toast';
import { useParams, useNavigate } from'react-router-dom';
import { Card, Typography, Descriptions, Tag, Row, Col} from'antd';
import { CalendarOutlined, MailOutlined, PhoneOutlined, UserOutlined, CheckCircleOutlined, ClockCircleOutlined } from'@ant-design/icons';
import StudentHeader from"./StudentTopbr";
import StudentSidebar from"./StudentSidebar";
import url from'../../url';

const { Title, Text } = Typography;

interface User {
  name?: string;
  aname?: string;
  tname?: string;
  email?: string;
  phn?: string;
  Status?: string;
  updatedAt?: string;
}

const StudentProfile = () => {
  const { id } = useParams();
  const Navigate = useNavigate();

  const [loginUser, setLoginuser] = useState<User>({});
  const [user, setUser] = useState<User>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('edudocs')
      ? JSON.parse(localStorage.getItem('edudocs') as string)
      : null;
    if (userStr) setLoginuser(userStr);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('edudocs')) {
      toast.warning('You are not already logged in! First log in to your account.', 7);
      Navigate('/student-login');
    }
  }, [Navigate]);

  useEffect(() => {
    setLoading(true);
    fetch(`${url}/userProfile/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setUser(data.user || {});
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching user:', error);
        setLoading(false);
      });
  }, [id]);

  const formattedDate = (user.updatedAt && new Date(user.updatedAt).toLocaleDateString()) ||'N/A';

  const initials = user.name
    ? user.name.split("").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    :"?";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --ink: #0d0c1d; --ink2: #4b4966; --ink3: #9896b8;
          --bg: #f5f4ff; --surface: #fff; --edge: #e8e7f8; --edge2: rgba(99,102,241,.1);
          --accent: #5E6BFF; --accent2: #5E6BFF; --accent-bg: rgba(94,107,255,.07);
          --green: #10b981; --amber: #f59e0b; --red: #ef4444; --sky: #0ea5e9;
          --sh: 0 1px 3px rgba(13,12,29,.05), 0 4px 16px rgba(99,102,241,.07);
          --sh2: 0 4px 24px rgba(99,102,241,.13), 0 1px 4px rgba(13,12,29,.07);
          --r: 7px; --rs: 7px; --tr: .2s cubic-bezier(.4,0,.2,1);
          --sidebar: 250px; --header: 60px;
          --font:'Inter', system-ui, -apple-system, BlinkMacSystemFont,'Segoe UI', Roboto, sans-serif; /* --display removed */
        }
        html, body { height: 100%; font-family: var(--font); background: var(--bg); color: var(--ink); -webkit-font-smoothing: antialiased; }
        * { font-family: var(--font); }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--edge); border-radius: 7px; }

        .app-shell { display: flex; min-height: 100vh; }
        .sidebar { width: var(--sidebar); min-width: var(--sidebar); height: 100vh; position: sticky; top: 0; background: var(--surface); border-right: 1px solid var(--edge); display: flex; flex-direction: column; overflow: hidden; transition: width var(--tr), min-width var(--tr); z-index: 200; }
        .sidebar.closed { width: 0; min-width: 0; }
        .main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .topbar { height: var(--header); position: sticky; top: 0; z-index: 150; background: rgba(245,244,255,.88); backdrop-filter: blur(18px); border-bottom: 1px solid var(--edge); display: flex; align-items: center; gap: 12px; padding: 0 24px; }
        .content { flex: 1; overflow-y: auto; padding: 28px; }

        .card { background: var(--surface); border-radius: var(--r); border: 1px solid var(--edge); box-shadow: var(--sh); }
        .btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 18px; border-radius: 7px; border: none; cursor: pointer; font-size: 13px; font-weight: 600; transition: all var(--tr); font-family: var(--font); }
        .btn-primary { background: #5E6BFF; color: #fff; box-shadow: 0 4px 14px rgba(94,107,255,.35); }
        .btn-primary:hover { box-shadow: 0 4px 14px rgba(94,107,255,.35); }
        .btn-ghost { background: var(--surface); color: var(--ink2); border: 1px solid var(--edge); }
        .btn-ghost:hover { background: var(--accent-bg); color: var(--accent); border-color: rgba(99,102,241,.3); }
        .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 7px; font-size: 11px; font-weight: 700; }

        .display { font-family: var(--font); }
        .stat-val { font-family: var(--font); font-weight: 800; line-height: 1; color: var(--ink); }

        .overlay { position: fixed; inset: 0; background: rgba(13,12,29,.45); z-index: 190; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { opacity: 0; animation: fadeUp .4s cubic-bezier(.4,0,.2,1) forwards; }

        @media(max-width: 768px) {
          .topbar { padding: 0 14px; }
          .content { padding: 16px 12px; }
        }
      `}</style>

      <div className="app-shell">
        <StudentSidebar isOpen={true} setIsOpen={() => {}} loginUser={loginUser} stats={null} />
        <div className="main">
          <StudentHeader sidebarOpen={true} setSidebarOpen={() => {}} loginUser={loginUser} notifications={0} currentPage="Profile" />

          <main className="content">
            <div style={{ maxWidth: 780, margin:"0 auto" }}>

              {/* Page Header */}
              <div className="fade-up" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 24, flexWrap:"wrap", gap: 12 }}>
                <div>
                  <h1 style={{ fontFamily:"var(--font)", fontSize: 24, fontWeight: 800, color:"var(--ink)", lineHeight: 1.2, marginBottom: 4 }}>Your Profile</h1>
                  <p style={{ color:"var(--ink2)", fontSize: 13.5 }}>Manage your account information</p>
                </div>
              </div>

              {loading ? (
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"80px 0", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius:"50%", border:"3px solid var(--edge)", borderTopColor:"var(--accent)" }} className="spinner" />
                  <div style={{ color:"var(--ink2)", fontSize: 14 }}>Loading profile</div>
                </div>
              ) : (
                <>
                  {/* Profile Header Card */}
                  <div className="fade-up card" style={{ padding:"32px", marginBottom: 20, textAlign:"center" }}>
                    {/* Avatar */}
                    <div style={{
                      width: 80, height: 80, borderRadius:"50%",
                      background:"#5E6BFF",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      color:"white", fontSize: 28, fontWeight: 800,
                      margin:"0 auto 16px",
                      boxShadow:"0 4px 14px rgba(94,107,255,.3)",
                    }}>
                      {initials}
                    </div>
                    <h2 style={{ fontFamily:"var(--font)", fontSize: 22, fontWeight: 800, color:"var(--ink)", marginBottom: 4 }}>{user.name ||""}</h2>
                    <p style={{ color:"var(--ink2)", fontSize: 13.5, marginBottom: 6 }}>
                      <CalendarOutlined style={{ marginRight: 5 }} />
                      Joined {formattedDate}
                    </p>
                    <div style={{ display:"flex", justifyContent:"center", gap: 8, flexWrap:"wrap" }}>
                      {user.Status ==='approved' ? (
                        <span className="badge" style={{ background:"#ecfdf5", color:"#10b981" }}>
                          <CheckCircleOutlined /> Verified
                        </span>
                      ) : (
                        <span className="badge" style={{ background:"#fffbeb", color:"#f59e0b" }}>
                          <ClockCircleOutlined /> Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Profile Details Card */}
                  <div className="fade-up card" style={{ padding:"24px" }}>
                    <h3 style={{ fontFamily:"var(--font)", fontSize: 16, fontWeight: 700, color:"var(--ink)", marginBottom: 20 }}>Account Details</h3>

                    <div style={{ display:"grid", gap: 16 }}>
                      {/* Name */}
                      <div style={{ display:"flex", alignItems:"center", gap: 14, padding:"14px 16px", borderRadius: 7, background:"var(--bg)", border:"1px solid var(--edge)" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 7, background:"rgba(99,102,241,.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink: 0 }}>
                          <UserOutlined style={{ color:"#5E6BFF", fontSize: 16 }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color:"var(--ink3)", fontWeight: 700, textTransform:"uppercase", letterSpacing:".06em", marginBottom: 2 }}>Full Name</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color:"var(--ink)" }}>{user.name ||""}</div>
                        </div>
                      </div>

                      {/* Email */}
                      <div style={{ display:"flex", alignItems:"center", gap: 14, padding:"14px 16px", borderRadius: 7, background:"var(--bg)", border:"1px solid var(--edge)" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 7, background:"rgba(16,185,129,.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink: 0 }}>
                          <MailOutlined style={{ color:"#10b981", fontSize: 16 }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color:"var(--ink3)", fontWeight: 700, textTransform:"uppercase", letterSpacing:".06em", marginBottom: 2 }}>Email Address</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color:"var(--ink)" }}>{user.email ||""}</div>
                        </div>
                      </div>

                      {/* Phone */}
                      <div style={{ display:"flex", alignItems:"center", gap: 14, padding:"14px 16px", borderRadius: 7, background:"var(--bg)", border:"1px solid var(--edge)" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 7, background:"rgba(245,158,11,.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink: 0 }}>
                          <PhoneOutlined style={{ color:"#f59e0b", fontSize: 16 }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color:"var(--ink3)", fontWeight: 700, textTransform:"uppercase", letterSpacing:".06em", marginBottom: 2 }}>Phone Number</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color:"var(--ink)" }}>{user.phn ||""}</div>
                        </div>
                      </div>

                      {/* Status */}
                      <div style={{ display:"flex", alignItems:"center", gap: 14, padding:"14px 16px", borderRadius: 7, background:"var(--bg)", border:"1px solid var(--edge)" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 7, background: user.Status ==='approved' ?"rgba(16,185,129,.1)" :"rgba(245,158,11,.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink: 0 }}>
                          <CheckCircleOutlined style={{ color: user.Status ==='approved' ?"#10b981" :"#f59e0b", fontSize: 16 }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color:"var(--ink3)", fontWeight: 700, textTransform:"uppercase", letterSpacing:".06em", marginBottom: 2 }}>Verification Status</div>
                          <div>
                            {user.Status ==='approved' ? (
                              <Tag color="success" style={{ borderRadius: 7 }}>Approved</Tag>
                            ) : (
                              <Tag color="warning" style={{ borderRadius: 7 }}>Pending</Tag>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Account Created */}
                      <div style={{ display:"flex", alignItems:"center", gap: 14, padding:"14px 16px", borderRadius: 7, background:"var(--bg)", border:"1px solid var(--edge)" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 7, background:"rgba(99,102,241,.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink: 0 }}>
                          <CalendarOutlined style={{ color:"#5E6BFF", fontSize: 16 }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color:"var(--ink3)", fontWeight: 700, textTransform:"uppercase", letterSpacing:".06em", marginBottom: 2 }}>Account Created</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color:"var(--ink)" }}>{formattedDate}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default StudentProfile;
