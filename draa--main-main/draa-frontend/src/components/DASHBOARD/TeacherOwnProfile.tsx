import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout, Avatar, Button, Space, Tag, Tooltip, Spin, Progress, Statistic, Divider
} from 'antd';
import {
  EditOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined,
  UserOutlined, CalendarOutlined, CheckCircleOutlined, BookOutlined,
  TeamOutlined, TrophyOutlined, FileTextOutlined, BulbOutlined,
  ExperimentOutlined, LogoutOutlined, SettingOutlined, StarFilled,
  SafetyCertificateOutlined, HomeOutlined, IdcardOutlined } from '@ant-design/icons';
import Topbar from './Topbar';
import Sidebar2 from './Sidebar2';
import url from '../../url';
import { getAuthHeaders } from '../../utils/global_auth';
import toast from '../../utils/toast';

const { Content } = Layout;

interface User {
  _id?: string; id?: string; name?: string; aname?: string;
  tname?: string; temail?: string; tphn?: string; Status?: string;
  tspecialization?: string; texp?: string; tcity?: string; tstate?: string;
  tprofile?: string; updatedAt?: string; createdAt?: string;
  tbio?: string; trating?: number; taddress?: string;
  tdesc?: string; tqualification?: string;
  socialLinks?: { github?: string; linkedin?: string; twitter?: string };
}

interface DashboardStats {
  courses: number; students: number; exams: number;
  rating: number; reviews: number; earnings: number;
}

// ─── small helpers ──────────────────────────────────────────────────────────

const statusMeta = (s?: string) => {
  switch (s?.toLowerCase()) {
    case 'verified': case 'approved': case 'active':
      return { color: '#10b981', bg: '#d1fae5', label: s };
    case 'pending':
      return { color: '#f59e0b', bg: '#fef3c7', label: 'Pending' };
    case 'rejected': case 'inactive':
      return { color: '#ef4444', bg: '#fee2e2', label: s };
    default:
      return { color: '#6b7280', bg: '#f3f4f6', label: 'Unknown' };
  }
};

const expMeta = (exp?: string) => {
  const y = parseInt(exp || '0') || 0;
  if (y >= 10) return { label: 'Senior Expert',  color: '#7c3aed', pct: 100 };
  if (y >= 5)  return { label: 'Experienced',    color: '#2563eb', pct: 75  };
  if (y >= 2)  return { label: 'Intermediate',   color: '#16a34a', pct: 50  };
  return           { label: 'Beginner',        color: '#d97706', pct: 25  };
};

// ─── stat pill ──────────────────────────────────────────────────────────────
const StatPill = ({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: number | string; color: string;
}) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 4, padding: '16px 20px',
    background: '#fff', borderRadius: 16,
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    flex: 1, minWidth: 80 }}>
    <div style={{
      width: 40, height: 40, borderRadius: 12,
      background: `${color}18`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 18, color }}>{icon}</div>
    <span style={{ fontSize: 20, fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>{value}</span>
    <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
  </div>
);

// ─── info row ───────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value, accent }: {
  icon: React.ReactNode; label: string; value: React.ReactNode; accent: string;
}) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', gap: 14,
    padding: '14px 20px',
    borderRadius: 14,
    background: '#fafafa',
    border: '1px solid #f1f5f9',
    transition: 'background 0.15s' }}>
    <div style={{
      width: 36, height: 36, flexShrink: 0, borderRadius: 10,
      background: `${accent}15`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 15, color: accent }}>{icon}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', wordBreak: 'break-word' }}>{value || <span style={{ color: '#d1d5db', fontWeight: 400 }}>Not provided</span>}</div>
    </div>
  </div>
);

// ────────────────────────────────────────────────────────────────────────────

const TeacherOwnProfile: React.FC = () => {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<User>({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    courses: 0, students: 0, exams: 0, rating: 4.8, reviews: 0, earnings: 0 });

  useEffect(() => {
    const userStr = localStorage.getItem('edudocs');
    if (!userStr) { toast.warning('Please log in first!'); navigate('/teacher-login'); return; }
    try {
      const userData = JSON.parse(userStr);
      setTeacher(userData);
      loadStats(userData.id || userData._id);
    } catch {
      navigate('/teacher-login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const loadStats = async (tid: string) => {
    try {
      const res = await fetch(`${url}/teacher/dashboard/analytics/stats/${tid}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const d = await res.json();
        if (d.success) setStats(prev => ({
          ...prev,
          courses: d.data.courses?.total ?? prev.courses,
          students: d.data.students?.total ?? prev.students,
          exams: d.data.exams?.total ?? prev.exams }));
      }
    } catch { /* use defaults */ }
  };

  if (loading) return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar2 />
      <Layout>
        <Topbar />
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    </Layout>
  );

  const sm = statusMeta(teacher.Status);
  const em = expMeta(teacher.texp);
  const avatarSrc = teacher.tprofile ? `${url}/${teacher.tprofile}` : undefined;
  const joinDate = teacher.createdAt
    ? new Date(teacher.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Recently joined';

  return (
    <Layout style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      <Sidebar2 />
      <Layout style={{ background: '#f1f5f9' }}>
        <Topbar />
        <Content style={{ margin: '0', padding: 0 }}>

          {/* ── HERO BANNER ─────────────────────────────────────── */}
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 70%, #6366f1 100%)',
            padding: '36px 32px 100px',
            position: 'relative',
            overflow: 'hidden' }}>
            {/* decorative blobs */}
            <div style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(99,102,241,0.18)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -40, left: 80, width: 180, height: 180, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, position: 'relative', zIndex: 1 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <HomeOutlined style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }} />
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Dashboard</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>/</span>
                  <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 600 }}>My Profile</span>
                </div>
                <h1 style={{ color: '#fff', margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>My Profile</h1>
                <p style={{ color: 'rgba(255,255,255,0.65)', margin: '4px 0 0', fontSize: 14 }}>View and manage your professional information</p>
              </div>
              <Space wrap>
                <button
                  onClick={() => navigate('/teacher-profile')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: 12, padding: '10px 20px',
                    color: '#fff', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <EditOutlined /> Edit Profile
                </button>
                <button
                  onClick={() => navigate('/teacher-settings')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 12, padding: '10px 20px',
                    color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer' }}
                >
                  <SettingOutlined /> Settings
                </button>
                <button
                  onClick={() => { localStorage.removeItem('edudocs'); toast.success('Logged out'); navigate('/teacher-login'); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(239,68,68,0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(239,68,68,0.35)',
                    borderRadius: 12, padding: '10px 20px',
                    color: '#fca5a5', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer' }}
                >
                  <LogoutOutlined /> Logout
                </button>
              </Space>
            </div>
          </div>

          {/* ── BODY ────────────────────────────────────────────── */}
          <div style={{ padding: '0 24px 40px', maxWidth: 1200, margin: '0 auto' }}>

            {/* profile card floats up over hero */}
            <div style={{
              display: 'flex', gap: 24, flexWrap: 'wrap',
              marginTop: -64, position: 'relative', zIndex: 2 }}>

              {/* ── LEFT: Identity card ── */}
              <div style={{ width: 300, flexShrink: 0 }}>
                <div style={{
                  background: '#fff', borderRadius: 24,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
                  overflow: 'hidden' }}>
                  {/* gradient top strip */}
                  <div style={{
                    height: 80,
                    background: 'linear-gradient(135deg, #4338ca, #7c3aed)' }} />

                  <div style={{ padding: '0 24px 28px', textAlign: 'center', marginTop: -44 }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <Avatar
                        size={88}
                        src={avatarSrc}
                        icon={<UserOutlined />}
                        style={{
                          border: '4px solid #fff',
                          boxShadow: '0 8px 24px rgba(67,56,202,0.35)',
                          background: 'linear-gradient(135deg,#4338ca,#7c3aed)',
                          fontSize: 32 }}
                      />
                      <div
                        onClick={() => navigate('/teacher-profile')}
                        style={{
                          position: 'absolute', bottom: 2, right: 2,
                          width: 24, height: 24, borderRadius: '50%',
                          background: '#4338ca', border: '2px solid #fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', fontSize: 11, color: '#fff' }}
                      >
                        <EditOutlined />
                      </div>
                    </div>

                    <h2 style={{ margin: '12px 0 2px', fontSize: 18, fontWeight: 800, color: '#111827' }}>
                      {teacher.tname || teacher.name || 'Teacher Name'}
                    </h2>
                    <p style={{ margin: '0 0 8px', fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
                      {teacher.tspecialization || 'Subject Specialist'}
                    </p>
                    {teacher.tcity && (
                      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <EnvironmentOutlined /> {[teacher.tcity, teacher.tstate].filter(Boolean).join(', ')}
                      </p>
                    )}

                    {/* status badge */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: sm.bg, borderRadius: 20, padding: '5px 14px', marginBottom: 20 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: sm.color }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: sm.color, textTransform: 'capitalize' }}>{sm.label}</span>
                    </div>

                    <Divider style={{ margin: '0 0 16px' }} />

                    {/* rating */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
                      <StarFilled style={{ color: '#f59e0b', fontSize: 16 }} />
                      <span style={{ fontSize: 22, fontWeight: 800, color: '#1f2937' }}>{stats.rating.toFixed(1)}</span>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>/ 5.0</span>
                    </div>

                    {/* social links */}
                    {(teacher.socialLinks?.github || teacher.socialLinks?.linkedin || teacher.socialLinks?.twitter) && (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
                        {teacher.socialLinks?.github && (
                          <a href={teacher.socialLinks.github} target="_blank" rel="noopener noreferrer"
                            title="GitHub"
                            style={{ width: 36, height: 36, borderRadius: 10, background: '#f3f4f6', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'all 0.2s' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#111827')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#f3f4f6')}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#374151"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/></svg>
                          </a>
                        )}
                        {teacher.socialLinks?.linkedin && (
                          <a href={teacher.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                            title="LinkedIn"
                            style={{ width: 36, height: 36, borderRadius: 10, background: '#f3f4f6', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'all 0.2s' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#0077b5')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#f3f4f6')}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#0077b5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                          </a>
                        )}
                        {teacher.socialLinks?.twitter && (
                          <a href={teacher.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                            title="Twitter / X"
                            style={{ width: 36, height: 36, borderRadius: 10, background: '#f3f4f6', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'all 0.2s' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#1da1f2')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#f3f4f6')}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1da1f2"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                          </a>
                        )}
                      </div>
                    )}
                    {/* no links yet → prompt */}
                    {!teacher.socialLinks?.github && !teacher.socialLinks?.linkedin && !teacher.socialLinks?.twitter && (
                      <div style={{ marginBottom: 16 }}>
                        <button
                          onClick={() => navigate('/teacher-profile')}
                          style={{ background: 'none', border: '1.5px dashed #d1d5db', borderRadius: 10, padding: '8px 16px', color: '#9ca3af', fontSize: 12, cursor: 'pointer', width: '100%' }}
                        >
                          + Add Social Links
                        </button>
                      </div>
                    )}

                    {/* stat pills */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <StatPill icon={<BookOutlined />}    label="Courses"  value={stats.courses}  color="#4338ca" />
                      <StatPill icon={<TeamOutlined />}    label="Students" value={stats.students} color="#16a34a" />
                      <StatPill icon={<ExperimentOutlined />} label="Exams" value={stats.exams}    color="#d97706" />
                    </div>
                  </div>
                </div>

                {/* experience card */}
                <div style={{
                  background: '#fff', borderRadius: 20, padding: 20, marginTop: 16,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Teaching Experience</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: em.color, background: `${em.color}15`, borderRadius: 8, padding: '3px 10px' }}>{em.label}</span>
                  </div>
                  <Progress
                    percent={em.pct}
                    strokeColor={{ from: em.color, to: `${em.color}99` }}
                    trailColor="#f1f5f9"
                    showInfo={false}
                    strokeWidth={8}
                    strokeLinecap="round"
                  />
                  <p style={{ margin: '8px 0 0', fontSize: 12, color: '#9ca3af' }}>
                    {teacher.texp || '0'} years of teaching experience
                  </p>
                </div>
              </div>

              {/* ── RIGHT: Info panels ── */}
              <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Personal Info */}
                <div style={{
                  background: '#fff', borderRadius: 20, padding: 24,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', fontSize: 16 }}>
                      <IdcardOutlined />
                    </div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#111827' }}>Personal Information</h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                    <InfoRow icon={<UserOutlined />}        label="Full Name"       value={teacher.tname || teacher.name}     accent="#7c3aed" />
                    <InfoRow icon={<MailOutlined />}        label="Email"           value={teacher.temail}                    accent="#2563eb" />
                    <InfoRow icon={<PhoneOutlined />}       label="Phone"           value={teacher.tphn}                      accent="#16a34a" />
                    <InfoRow icon={<TrophyOutlined />}      label="Specialization"  value={teacher.tspecialization}           accent="#d97706" />
                    <InfoRow icon={<BulbOutlined />}        label="Qualification"   value={teacher.tqualification}            accent="#7c3aed" />
                    <InfoRow icon={<EnvironmentOutlined />} label="City & State"    value={[teacher.tcity, teacher.tstate].filter(Boolean).join(', ')} accent="#16a34a" />
                    <InfoRow icon={<HomeOutlined />}        label="Address"         value={teacher.taddress}                  accent="#d97706" />
                    <InfoRow icon={<CalendarOutlined />}    label="Member Since"    value={joinDate}                          accent="#2563eb" />
                  </div>
                </div>

                {/* About */}
                <div style={{
                  background: '#fff', borderRadius: 20, padding: 24,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontSize: 16 }}>
                      <FileTextOutlined />
                    </div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#111827' }}>About / Bio</h3>
                  </div>
                  <p style={{
                    margin: 0, lineHeight: 1.75, fontSize: 14,
                    color: teacher.tdesc ? '#374151' : '#d1d5db',
                    fontStyle: teacher.tdesc ? 'normal' : 'italic' }}>
                    {teacher.tdesc || 'No bio added yet. Click "Edit Profile" to add a description.'}
                  </p>
                </div>

                {/* Social Links */}
                <div style={{
                  background: '#fff', borderRadius: 20, padding: 24,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🔗</div>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#111827' }}>Social Links</h3>
                    </div>
                    <button
                      onClick={() => navigate('/teacher-profile')}
                      style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#4338ca', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                    >
                      <EditOutlined style={{ fontSize: 11 }} /> Edit
                    </button>
                  </div>

                  {(teacher.socialLinks?.github || teacher.socialLinks?.linkedin || teacher.socialLinks?.twitter) ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[
                        {
                          key: 'github', link: teacher.socialLinks?.github,
                          label: 'GitHub', color: '#24292e', bg: '#f3f4f6',
                          icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/></svg> },
                        {
                          key: 'linkedin', link: teacher.socialLinks?.linkedin,
                          label: 'LinkedIn', color: '#0077b5', bg: '#eff8ff',
                          icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
                        {
                          key: 'twitter', link: teacher.socialLinks?.twitter,
                          label: 'Twitter / X', color: '#1da1f2', bg: '#eff9ff',
                          icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg> },
                      ].filter(item => !!item.link).map(({ key, link, label, color, bg, icon }) => (
                        <a
                          key={key}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '12px 16px', borderRadius: 12,
                            background: bg, border: `1px solid ${color}22`,
                            textDecoration: 'none', transition: 'all 0.2s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateX(4px)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 4px 12px ${color}25`; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'none'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none'; }}
                        >
                          <div style={{ color, flexShrink: 0 }}>{icon}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {link!.replace(/^https?:\/\/(www\.)?/, '')}
                            </div>
                          </div>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>🔗</div>
                      <p style={{ margin: '0 0 12px', fontSize: 13, color: '#9ca3af' }}>No social links added yet</p>
                      <button
                        onClick={() => navigate('/teacher-profile')}
                        style={{ background: 'linear-gradient(135deg,#4338ca,#7c3aed)', border: 'none', borderRadius: 10, padding: '9px 20px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                      >
                        + Add Social Links
                      </button>
                    </div>
                  )}
                </div>

                {/* Account Status */}                <div style={{
                  background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                  border: '1px solid #e2e8f0',
                  borderRadius: 20, padding: 24,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: `${sm.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: sm.color }}>
                      <SafetyCertificateOutlined />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Account Status</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: sm.color, textTransform: 'capitalize', marginTop: 2 }}>{sm.label}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/teacher-profile')}
                    style={{
                      background: 'linear-gradient(135deg,#4338ca,#7c3aed)',
                      border: 'none', borderRadius: 12,
                      padding: '11px 24px', color: '#fff',
                      fontSize: 14, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 8,
                      boxShadow: '0 4px 15px rgba(67,56,202,0.35)' }}
                  >
                    <EditOutlined /> Edit Profile
                  </button>
                </div>

              </div>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default TeacherOwnProfile;
