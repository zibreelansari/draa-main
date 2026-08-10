/**
 * emailAlertScheduler.js
 * ──────────────────────────────────────────────────────
 * Sends periodic email digest alerts to all active newsletter
 * subscribers using the no-reply@draa.in SMTP transporter.
 *
 * Schedule:
 *   • Weekly digest  — every Monday at 9:00 AM IST  (cron: 0 9 * * 1)
 *   • Daily jobs alert — every day at 8:00 AM IST   (cron: 0 8 * * *)
 */

const cron = require('node-cron');
const NewsletterSubscription = require('../Models/NewsletterSubscription');
const { noReplyTransporter } = require('../utils/mailConfig');

// ── Models for digest content ──────────────────────────────
const { Job } = require('../Models/jobsModel');
const CurrentAffair = require('../Models/CurrentAffair');
const CourseContent = require('../Models/CourseConjtent');   // blogs
const Course = require('../Models/CourseModel');

const FROM = '"Draa Alerts" <no-reply@draa.in>';
const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://draa.in'
  : 'http://localhost:5173';

// ── Helpers ────────────────────────────────────────────────
const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

const sendBatch = async (subscribers, subject, htmlFn) => {
  let sent = 0, failed = 0;
  const batches = chunk(subscribers, 20); // 20 at a time to avoid rate limits
  for (const batch of batches) {
    await Promise.allSettled(
      batch.map(async (sub) => {
        try {
          const unsubLink = `${BASE_URL}/unsubscribe?email=${encodeURIComponent(sub.email)}`;
          await noReplyTransporter.sendMail({
            from: FROM,
            to: sub.email,
            subject,
            html: htmlFn(sub.email, unsubLink),
          });
          sent++;
        } catch (err) {
          failed++;
          console.error(`[EmailAlert] Failed to send to ${sub.email}:`, err.message);
        }
      })
    );
    // Small delay between batches
    await new Promise(r => setTimeout(r, 500));
  }
  console.log(`[EmailAlert] Sent: ${sent}, Failed: ${failed}`);
};

// ── Email Templates ────────────────────────────────────────

const buildWeeklyDigestHtml = (jobs, affairs, courses, blogs) => (email, unsubLink) => {
  const jobRows = jobs.slice(0, 5).map(j => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
        <a href="${BASE_URL}/jobs-notifications" style="font-size:14px;font-weight:700;color:#1e293b;text-decoration:none;">
          ${j.title || 'New Job Notification'}
        </a>
        <div style="font-size:12px;color:#64748b;margin-top:2px;">
          ${j.lastDate ? `Last Date: ${new Date(j.lastDate).toLocaleDateString('en-IN')}` : ''}
          ${j.vacancy ? ` • ${j.vacancy} Vacancies` : ''}
        </div>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;text-align:right;vertical-align:top;">
        <a href="${BASE_URL}/jobs-notifications" style="font-size:11px;font-weight:700;background:#eef2ff;color:#5b6cff;padding:4px 10px;border-radius:20px;text-decoration:none;">Apply</a>
      </td>
    </tr>`).join('');

  const affairRows = affairs.slice(0, 4).map(a => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
        <a href="${BASE_URL}/current-affairs" style="font-size:14px;font-weight:700;color:#1e293b;text-decoration:none;">
          ${a.title || 'Current Affairs Update'}
        </a>
        <div style="font-size:12px;color:#64748b;margin-top:2px;">
          ${a.categoryId?.name || ''} ${a.type ? `• ${a.type}` : ''}
        </div>
      </td>
    </tr>`).join('');

  const blogRows = blogs.slice(0, 3).map(b => `
    <div style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
      <a href="${BASE_URL}/grid-blog" style="font-size:14px;font-weight:700;color:#1e293b;text-decoration:none;">
        ${b.content_subject || 'New Blog Post'}
      </a>
      <div style="font-size:12px;color:#64748b;margin-top:2px;">${b.content_category || ''}</div>
    </div>`).join('');

  const courseRows = courses.slice(0, 3).map(c => `
    <div style="display:inline-block;width:30%;min-width:140px;vertical-align:top;margin:0 1% 12px;background:#f8fafc;border-radius:10px;padding:12px;border:1px solid #e2e8f0;">
      <div style="font-size:13px;font-weight:700;color:#1e293b;">${c.title || 'New Course'}</div>
      <div style="font-size:11px;color:#64748b;margin-top:4px;">${c.course_category || ''}</div>
      <a href="${BASE_URL}/courses" style="display:inline-block;margin-top:8px;font-size:11px;font-weight:700;color:#5b6cff;text-decoration:none;">View Course →</a>
    </div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Weekly Digest – Draa</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <!-- Logo -->
      <tr><td align="center" style="padding-bottom:24px;">
        <a href="${BASE_URL}"><img src="https://draa.in/EduDocsNewLogo.png" alt="Draa" height="44" style="border:0;display:block;"></a>
      </td></tr>

      <!-- Hero banner -->
      <tr><td style="background:linear-gradient(135deg,#5b6cff 0%,#7c3aed 100%);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
        <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;">Weekly Digest</div>
        <h1 style="margin:0 0 10px;font-size:26px;font-weight:800;color:#fff;line-height:1.25;">Your Weekly Exam Prep Update</h1>
        <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.85);line-height:1.6;">Latest job alerts, current affairs, new courses & blogs — curated just for you.</p>
      </td></tr>

      <!-- Main card -->
      <tr><td style="background:#fff;padding:32px 40px;border:1px solid #e2e8f0;border-top:none;">

        ${jobs.length > 0 ? `
        <!-- Jobs Section -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
          <tr><td style="padding-bottom:16px;border-bottom:2px solid #5b6cff;margin-bottom:16px;">
            <span style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#5b6cff;">🔔 Latest Job Notifications</span>
          </td></tr>
          ${jobRows}
          <tr><td style="padding-top:16px;text-align:center;">
            <a href="${BASE_URL}/jobs-notifications" style="font-size:13px;font-weight:700;color:#5b6cff;text-decoration:none;">View All Notifications →</a>
          </td></tr>
        </table>` : ''}

        ${affairs.length > 0 ? `
        <!-- Current Affairs Section -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
          <tr><td style="padding-bottom:16px;border-bottom:2px solid #10b981;margin-bottom:16px;">
            <span style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#10b981;">📰 Current Affairs</span>
          </td></tr>
          ${affairRows}
          <tr><td style="padding-top:16px;text-align:center;">
            <a href="${BASE_URL}/current-affairs" style="font-size:13px;font-weight:700;color:#10b981;text-decoration:none;">View All Current Affairs →</a>
          </td></tr>
        </table>` : ''}

        ${courses.length > 0 ? `
        <!-- New Courses -->
        <div style="margin-bottom:32px;">
          <div style="padding-bottom:16px;border-bottom:2px solid #f59e0b;margin-bottom:16px;">
            <span style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#f59e0b;">🎓 New Courses</span>
          </div>
          <div style="font-size:0;">${courseRows}</div>
        </div>` : ''}

        ${blogs.length > 0 ? `
        <!-- Blog Posts -->
        <div style="margin-bottom:24px;">
          <div style="padding-bottom:16px;border-bottom:2px solid #ec4899;margin-bottom:16px;">
            <span style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#ec4899;">✍️ Latest Blogs</span>
          </div>
          ${blogRows}
          <div style="text-align:center;margin-top:16px;">
            <a href="${BASE_URL}/grid-blog" style="font-size:13px;font-weight:700;color:#ec4899;text-decoration:none;">Read All Blogs →</a>
          </div>
        </div>` : ''}

        <!-- CTA -->
        <div style="background:#eef2ff;border-radius:12px;padding:24px;text-align:center;margin-top:8px;">
          <p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#3730a3;">Ready to level up your preparation?</p>
          <a href="${BASE_URL}" style="display:inline-block;background:linear-gradient(135deg,#5b6cff,#7c3aed);color:#fff;padding:13px 32px;border-radius:50px;font-size:14px;font-weight:700;text-decoration:none;">Explore Draa</a>
        </div>
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#f8fafc;padding:24px 40px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;text-align:center;">
        <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;line-height:1.6;">
          You're receiving this because you subscribed to Draa alerts.<br>
          © ${new Date().getFullYear()} Draa. All rights reserved.
        </p>
        <a href="${unsubLink}" style="font-size:12px;color:#ef4444;text-decoration:none;font-weight:600;">Unsubscribe</a>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`;
};

const buildDailyJobsHtml = (jobs) => (email, unsubLink) => {
  const rows = jobs.slice(0, 8).map(j => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;">
        <div style="font-size:14px;font-weight:700;color:#1e293b;">${j.title || 'New Notification'}</div>
        <div style="font-size:12px;color:#64748b;margin-top:3px;">
          ${j.lastDate ? `Last Date: <b>${new Date(j.lastDate).toLocaleDateString('en-IN')}</b>` : ''}
          ${j.vacancy ? ` • ${j.vacancy} Posts` : ''}
        </div>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;text-align:right;vertical-align:middle;">
        <a href="${BASE_URL}/jobs-notifications" style="font-size:11px;font-weight:700;background:#eef2ff;color:#5b6cff;padding:5px 12px;border-radius:20px;text-decoration:none;white-space:nowrap;">Apply Now</a>
      </td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Daily Job Alerts – Draa</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <tr><td align="center" style="padding-bottom:20px;">
        <a href="${BASE_URL}"><img src="https://draa.in/EduDocsNewLogo.png" alt="Draa" height="44" style="border:0;display:block;"></a>
      </td></tr>

      <tr><td style="background:linear-gradient(135deg,#1e293b,#334155);border-radius:16px 16px 0 0;padding:28px 40px;text-align:center;">
        <div style="font-size:11px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;">Daily Alert</div>
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#fff;">🔔 Today's Job & Exam Notifications</h1>
        <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.75);">${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </td></tr>

      <tr><td style="background:#fff;padding:28px 40px;border:1px solid #e2e8f0;border-top:none;">
        ${jobs.length > 0 ? `
        <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
        <div style="text-align:center;margin-top:24px;">
          <a href="${BASE_URL}/jobs-notifications" style="display:inline-block;background:linear-gradient(135deg,#5b6cff,#7c3aed);color:#fff;padding:12px 30px;border-radius:50px;font-size:14px;font-weight:700;text-decoration:none;">View All Notifications</a>
        </div>` : `
        <p style="text-align:center;color:#64748b;font-size:14px;">No new notifications today. Check back tomorrow!</p>`}
      </td></tr>

      <tr><td style="background:#f8fafc;padding:20px 40px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;text-align:center;">
        <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;">© ${new Date().getFullYear()} Draa. All rights reserved.</p>
        <a href="${unsubLink}" style="font-size:12px;color:#ef4444;text-decoration:none;font-weight:600;">Unsubscribe</a>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`;
};

// ── Content fetchers ───────────────────────────────────────

const getLatestJobs = async (since) => {
  try {
    return await Job.find({ createdAt: { $gte: since }, isActive: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .select('title lastDate vacancy category')
      .lean();
  } catch (e) {
    console.error('[EmailAlert] Jobs fetch error:', e.message);
    return [];
  }
};

const getLatestAffairs = async (since) => {
  try {
    return await CurrentAffair.find({ createdAt: { $gte: since }, status: 'published' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('categoryId', 'name')
      .select('title type categoryId')
      .lean();
  } catch (e) {
    console.error('[EmailAlert] CurrentAffairs fetch error:', e.message);
    return [];
  }
};

const getLatestCourses = async (since) => {
  try {
    return await Course.find({ createdAt: { $gte: since } })
      .sort({ createdAt: -1 })
      .limit(4)
      .select('title course_category coverphoto')
      .lean();
  } catch (e) {
    console.error('[EmailAlert] Courses fetch error:', e.message);
    return [];
  }
};

const getLatestBlogs = async (since) => {
  try {
    return await CourseContent.find({ createdAt: { $gte: since }, approved: true })
      .sort({ createdAt: -1 })
      .limit(4)
      .select('content_subject content_category')
      .lean();
  } catch (e) {
    console.error('[EmailAlert] Blogs fetch error:', e.message);
    return [];
  }
};

const getActiveSubscribers = async () => {
  try {
    return await NewsletterSubscription.find({ status: 'active' })
      .select('email')
      .lean();
  } catch (e) {
    console.error('[EmailAlert] Subscriber fetch error:', e.message);
    return [];
  }
};

// ── Scheduler registration ─────────────────────────────────

const registerEmailAlertScheduler = () => {

  // ── 1. Daily Jobs Alert — every day at 8:00 AM IST (UTC+5:30 → 2:30 UTC) ──
  cron.schedule('30 2 * * *', async () => {
    console.log('[EmailAlert] Running daily jobs alert...');
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [subscribers, jobs] = await Promise.all([
      getActiveSubscribers(),
      getLatestJobs(since),
    ]);

    if (!subscribers.length) {
      console.log('[EmailAlert] No active subscribers, skipping.');
      return;
    }

    // Only send if there are fresh jobs today
    if (!jobs.length) {
      console.log('[EmailAlert] No new jobs today, skipping daily alert.');
      return;
    }

    const subject = `🔔 Today's Job Alerts – ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    await sendBatch(subscribers, subject, buildDailyJobsHtml(jobs));
    console.log(`[EmailAlert] Daily alert dispatched to ${subscribers.length} subscribers.`);
  }, { timezone: 'UTC' });

  // ── 2. Weekly Digest — every Monday at 9:00 AM IST (UTC+5:30 → 3:30 UTC) ──
  cron.schedule('30 3 * * 1', async () => {
    console.log('[EmailAlert] Running weekly digest...');
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [subscribers, jobs, affairs, courses, blogs] = await Promise.all([
      getActiveSubscribers(),
      getLatestJobs(since),
      getLatestAffairs(since),
      getLatestCourses(since),
      getLatestBlogs(since),
    ]);

    if (!subscribers.length) {
      console.log('[EmailAlert] No active subscribers, skipping weekly digest.');
      return;
    }

    const hasContent = jobs.length || affairs.length || courses.length || blogs.length;
    if (!hasContent) {
      console.log('[EmailAlert] No new content this week, skipping digest.');
      return;
    }

    const weekStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const subject = `📚 Your Weekly Draa Digest – Week of ${weekStr}`;
    await sendBatch(
      subscribers,
      subject,
      buildWeeklyDigestHtml(jobs, affairs, courses, blogs)
    );
    console.log(`[EmailAlert] Weekly digest dispatched to ${subscribers.length} subscribers.`);
  }, { timezone: 'UTC' });

  console.log('[EmailAlert] Scheduler registered: daily jobs (8AM IST), weekly digest (Mon 9AM IST)');
};

module.exports = { registerEmailAlertScheduler };
