const nlpService = require('./nlpService');

/**
 * Parse the natural language prompt and return structured intent + fields.
 * The actual execution for management intents (delete/approve/reject) happens
 * via /agent/execute on the backend — safer than client-side direct calls.
 */
exports.chat = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    let parsedOutput;

    if (apiKey && apiKey.trim() !== '') {
      parsedOutput = await nlpService.parseWithGemini(prompt.trim(), apiKey.trim());
    } else {
      parsedOutput = nlpService.parseLocally(prompt.trim());
    }

    return res.status(200).json({
      success: true,
      data: parsedOutput,
      isAiPowered: !!(apiKey && apiKey.trim() !== '')
    });

  } catch (error) {
    console.error('Agent chat controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process prompt',
      error: error.message
    });
  }
};

/**
 * Server-side execution of management intents (approve, reject, suspend, delete).
 * This keeps destructive operations securely on the server rather than purely client-driven.
 */
exports.execute = async (req, res) => {
  try {
    const { intent, fields } = req.body;
    if (!intent || !fields) {
      return res.status(400).json({ success: false, message: 'intent and fields are required' });
    }

    // Dynamically load models here to avoid circular dependencies
    const TeacherModel = require('../Models/TeacherModel');
    const UserModel = require('../Models/UserModel');
    const CourseModel = require('../Models/CourseModel');

    let result = null;

    switch (intent) {

      // ─── TEACHER MANAGEMENT ───────────────────────────────────────────

      case 'APPROVE_TEACHER': {
        const teacher = await _findTeacher(TeacherModel, fields.search_term);
        if (!teacher) return _notFound(res, 'Teacher', fields.search_term);
        teacher.Status = 'approved';
        teacher.isVerified = true;
        teacher.isActive = true;
        teacher.approvedAt = new Date();
        await teacher.save();
        result = { message: `Teacher "${teacher.tname}" has been approved successfully.`, id: teacher._id };
        break;
      }

      case 'REJECT_TEACHER': {
        const teacher = await _findTeacher(TeacherModel, fields.search_term);
        if (!teacher) return _notFound(res, 'Teacher', fields.search_term);
        teacher.Status = 'rejected';
        teacher.isActive = false;
        teacher.isVerified = false;
        teacher.rejectedAt = new Date();
        teacher.rejectionReason = fields.reason || 'Rejected by AI Copilot';
        await teacher.save();
        result = { message: `Teacher "${teacher.tname}" has been rejected.`, id: teacher._id };
        break;
      }

      case 'SUSPEND_TEACHER': {
        const teacher = await _findTeacher(TeacherModel, fields.search_term);
        if (!teacher) return _notFound(res, 'Teacher', fields.search_term);
        teacher.Status = 'suspended';
        teacher.isActive = false;
        teacher.rejectionReason = fields.reason || 'Suspended by AI Copilot';
        await teacher.save();
        result = { message: `Teacher "${teacher.tname}" has been suspended.`, id: teacher._id };
        break;
      }

      case 'DELETE_TEACHER': {
        const teacher = await _findTeacher(TeacherModel, fields.search_term);
        if (!teacher) return _notFound(res, 'Teacher', fields.search_term);
        const name = teacher.tname;
        await TeacherModel.findByIdAndDelete(teacher._id);
        result = { message: `Teacher "${name}" has been permanently deleted.` };
        break;
      }

      // ─── STUDENT MANAGEMENT ──────────────────────────────────────────

      case 'APPROVE_STUDENT': {
        const student = await _findStudent(UserModel, fields.search_term);
        if (!student) return _notFound(res, 'Student', fields.search_term);
        student.isActive = true;
        student.status = 'active';
        await student.save();
        result = { message: `Student "${student.name}" has been activated.`, id: student._id };
        break;
      }

      case 'REJECT_STUDENT': {
        const student = await _findStudent(UserModel, fields.search_term);
        if (!student) return _notFound(res, 'Student', fields.search_term);
        student.isActive = false;
        student.status = 'rejected';
        await student.save();
        result = { message: `Student "${student.name}" has been rejected.`, id: student._id };
        break;
      }

      case 'SUSPEND_STUDENT': {
        const student = await _findStudent(UserModel, fields.search_term);
        if (!student) return _notFound(res, 'Student', fields.search_term);
        student.isActive = false;
        student.status = 'suspended';
        await student.save();
        result = { message: `Student "${student.name}" has been suspended.`, id: student._id };
        break;
      }

      case 'DELETE_STUDENT': {
        const student = await _findStudent(UserModel, fields.search_term);
        if (!student) return _notFound(res, 'Student', fields.search_term);
        const name = student.name;
        await UserModel.findByIdAndDelete(student._id);
        result = { message: `Student "${name}" has been permanently deleted.` };
        break;
      }

      // ─── COURSE MANAGEMENT ───────────────────────────────────────────

      case 'APPROVE_COURSE': {
        const course = await _findCourse(CourseModel, fields.search_term);
        if (!course) return _notFound(res, 'Course', fields.search_term);
        course.isApproved = true;
        course.status = 'published';
        course.approvedAt = new Date();
        await course.save();
        result = { message: `Course "${course.title}" has been approved and published.`, id: course._id };
        break;
      }

      case 'REJECT_COURSE': {
        const course = await _findCourse(CourseModel, fields.search_term);
        if (!course) return _notFound(res, 'Course', fields.search_term);
        course.isApproved = false;
        course.status = 'draft';
        course.rejectionReason = fields.reason || 'Rejected by AI Copilot';
        course.rejectedAt = new Date();
        await course.save();
        result = { message: `Course "${course.title}" has been rejected.`, id: course._id };
        break;
      }

      case 'DELETE_COURSE': {
        const course = await _findCourse(CourseModel, fields.search_term);
        if (!course) return _notFound(res, 'Course', fields.search_term);
        const title = course.title;
        await CourseModel.findByIdAndDelete(course._id);
        result = { message: `Course "${title}" has been permanently deleted.` };
        break;
      }

      // ─── LIST INTENTS ─────────────────────────────────────────────────

      case 'LIST_PENDING_TEACHERS': {
        const teachers = await TeacherModel.find({ Status: 'pending' })
          .select('tname temail tphn createdAt')
          .sort({ createdAt: -1 })
          .limit(fields.limit || 10);
        result = {
          message: `Found ${teachers.length} pending teacher application(s).`,
          items: teachers.map(t => ({ id: t._id, name: t.tname, email: t.temail, phone: t.tphn, appliedAt: t.createdAt }))
        };
        break;
      }

      case 'LIST_TEACHERS': {
        const teachers = await TeacherModel.find({})
          .select('tname temail Status createdAt')
          .sort({ createdAt: -1 })
          .limit(fields.limit || 10);
        result = {
          message: `Showing ${teachers.length} teacher(s).`,
          items: teachers.map(t => ({ id: t._id, name: t.tname, email: t.temail, status: t.Status }))
        };
        break;
      }

      case 'LIST_STUDENTS': {
        const students = await UserModel.find({})
          .select('name email phone isActive createdAt')
          .sort({ createdAt: -1 })
          .limit(fields.limit || 10);
        result = {
          message: `Showing ${students.length} student(s).`,
          items: students.map(s => ({ id: s._id, name: s.name, email: s.email, active: s.isActive }))
        };
        break;
      }

      case 'LIST_COURSES': {
        const courses = await CourseModel.find({})
          .select('title isApproved status createdAt')
          .sort({ createdAt: -1 })
          .limit(fields.limit || 10);
        result = {
          message: `Showing ${courses.length} course(s).`,
          items: courses.map(c => ({ id: c._id, title: c.title, status: c.isApproved ? 'approved' : 'pending', published: c.status === 'published' }))
        };
        break;
      }

      case 'LIST_PENDING_COURSES': {
        const courses = await CourseModel.find({ isApproved: false, status: { $in: ['draft', 'pending'] } })
          .select('title isApproved status createdAt')
          .sort({ createdAt: -1 })
          .limit(fields.limit || 10);
        result = {
          message: `Found ${courses.length} course(s) pending approval.`,
          items: courses.map(c => ({ id: c._id, title: c.title, status: 'pending' }))
        };
        break;
      }

      default:
        return res.status(400).json({ success: false, message: `Intent "${intent}" is not supported for server-side execution.` });
    }

    return res.status(200).json({ success: true, data: result });

  } catch (error) {
    console.error('Agent execute controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Execution failed',
      error: error.message
    });
  }
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

async function _findTeacher(TeacherModel, searchTerm) {
  if (!searchTerm) return null;
  const term = searchTerm.trim();
  return TeacherModel.findOne({
    $or: [
      { tname: { $regex: term, $options: 'i' } },
      { temail: { $regex: term, $options: 'i' } },
      { T_email: { $regex: term, $options: 'i' } }
    ]
  });
}

async function _findStudent(UserModel, searchTerm) {
  if (!searchTerm) return null;
  const term = searchTerm.trim();
  return UserModel.findOne({
    $or: [
      { name: { $regex: term, $options: 'i' } },
      { email: { $regex: term, $options: 'i' } }
    ]
  });
}

async function _findCourse(CourseModel, searchTerm) {
  if (!searchTerm) return null;
  return CourseModel.findOne({
    title: { $regex: searchTerm.trim(), $options: 'i' }
  });
}

function _notFound(res, entityType, searchTerm) {
  return res.status(404).json({
    success: false,
    message: `${entityType} "${searchTerm}" was not found. Please check the name/email and try again.`
  });
}


// ─────────────────────────────────────────────────────────────────────────────
// Blog Writing Assistant — /agent/blog-chat
// Only used on the student/teacher blog writing page.
// ─────────────────────────────────────────────────────────────────────────────

exports.blogChat = async (req, res) => {
  try {
    const { prompt, mode } = req.body;
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    let reply;
    let isAiPowered = !!(apiKey && apiKey.trim() !== '');

    if (isAiPowered) {
      try {
        reply = await _callGeminiBlogAssistant(prompt.trim(), apiKey.trim(), mode);
      } catch (geminiErr) {
        // All Gemini models failed (rate-limited, key restricted, etc.).
        // Fall back to the local assistant so the user still gets a helpful reply.
        console.warn('Gemini blog assistant unavailable, falling back to local:', geminiErr.message);
        reply = _localBlogAssistant(prompt.trim(), mode);
        isAiPowered = false;
      }
    } else {
      reply = _localBlogAssistant(prompt.trim(), mode);
    }

    return res.status(200).json({
      success: true,
      data: { reply },
      isAiPowered
    });

  } catch (error) {
    console.error('Blog chat controller error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process request', error: error.message });
  }
};

/**
 * Call Gemini with a blog/course-content writing system prompt.
 * Tries the primary model first, then falls back to other stable models
 * if Google's API returns 404 (model retired) or 429 (rate-limited).
 */
async function _callGeminiBlogAssistant(userPrompt, apiKey, mode) {
  const axios = require('axios');
  // Ordered list of Gemini models — newest first. Different model families
  // have separate quota buckets, so a 429 on one doesn't mean others are
  // also rate-limited. We start with the model Google's free tier actually
  // grants to new users (gemini-3.1-flash-lite); older models are kept as
  // fallbacks in case the new ones are ever retired.
  const MODELS = [
    'gemini-3.1-flash-lite',
    'gemini-3-flash-preview',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-pro'
  ];

  const isCourse = mode === 'course';

  const systemInstruction = isCourse
    ? `You are a friendly and knowledgeable course content writing assistant for Draa, an online education platform. You help teachers write better course lessons and educational content.

You can:
- Suggest engaging lesson topic ideas relevant to education, exams, skills, and career development
- Create structured lesson outlines with clear learning sections and key points
- Write compelling lesson introductions and summaries
- Suggest clear, descriptive lesson titles
- Generate multiple-choice or short-answer quiz questions for a lesson
- Define clear learning objectives/outcomes for a chapter
- Give tips to improve content clarity, depth, and student engagement
- Advise on how to structure a lesson for maximum learning impact

Keep responses practical, teacher-friendly, and structured. Use numbered lists and bullet points. Keep it concise and actionable.`
    : `You are a friendly and knowledgeable blog writing assistant for Draa, an online education platform. You help students and teachers write better blog posts.

You can:
- Suggest engaging blog topic ideas relevant to education, learning, exams, career, and skills
- Create structured blog outlines with clear headings and sub-points
- Write compelling introduction and conclusion paragraphs
- Suggest catchy, SEO-friendly blog titles
- Provide tips to improve writing quality, clarity, and readability
- Give SEO advice specifically for education-focused content
- Help improve existing blog content drafts

Keep responses concise, practical, and encouraging. Use simple language. Format with bullet points or numbered lists where helpful.`;

  let lastError;
  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const response = await axios.post(url, {
        contents: [{ parts: [{ text: `${systemInstruction}\n\nUser: ${userPrompt}` }] }],
        generationConfig: { maxOutputTokens: 800, temperature: 0.8 }
      }, { timeout: 30000 });

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('No response from Gemini');
      return text.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();
    } catch (err) {
      lastError = err;
      const status = err.response?.status;
      // Only fall back on 404 (model retired/unavailable) or 429 (rate-limited).
      // For other errors (400 bad request, 401 bad key, etc.) fail fast.
      if (status !== 404 && status !== 429) throw err;
      console.warn(`Gemini model "${model}" unavailable (${status}); trying next model.`);
    }
  }
  // All models exhausted — throw so the caller (blogChat) can fall back to local.
  throw lastError || new Error('All Gemini models failed');
}

/**
 * Local fallback blog assistant with canned helpful responses.
 */
function _localBlogAssistant(prompt) {
  const text = prompt.toLowerCase();

  if (text.includes('idea') || text.includes('topic') || text.includes('what to write')) {
    return `Here are 5 blog ideas for an education platform:\n\n1. "10 Proven Study Techniques That Actually Work"\n2. "How to Stay Motivated While Preparing for Competitive Exams"\n3. "Top 5 Free Online Tools Every Student Should Use"\n4. "From Beginner to Expert: My Online Learning Journey"\n5. "How to Balance Work, Life, and Online Courses"\n\nPick one and I'll help you build an outline! 📝`;
  }

  if (text.includes('outline') || text.includes('structure') || text.includes('format')) {
    return `Here's a solid blog outline structure:\n\n📌 Title (catchy + keyword-rich)\n\n1. Introduction (2–3 sentences)\n   • Hook the reader with a question or surprising fact\n   • State the problem you're solving\n   • Tell them what they'll learn\n\n2. Main Body (3–5 sections)\n   • Each section = one key point\n   • Use H2/H3 headings\n   • Add examples and bullet points\n\n3. Conclusion\n   • Summarize key takeaways\n   • End with a call-to-action\n\n4. Meta: add a featured image and relevant tags\n\nWant me to fill this in for your specific topic?`;
  }

  if (text.includes('title') || text.includes('heading') || text.includes('name')) {
    return `Here are 5 catchy blog title formulas:\n\n1. "How to [Achieve Goal] in [Timeframe]"\n   → "How to Crack UPSC in 12 Months"\n\n2. "[Number] Tips for [Audience] Who Want [Outcome]"\n   → "7 Tips for Students Who Want Better Grades"\n\n3. "The Ultimate Guide to [Topic]"\n   → "The Ultimate Guide to Online Learning"\n\n4. "Why [Common Belief] Is Wrong (And What to Do Instead)"\n   → "Why Rote Learning Is Wrong (And What Actually Works)"\n\n5. "[Topic]: Everything You Need to Know"\n   → "NEET Preparation: Everything You Need to Know"\n\nTell me your topic and I'll suggest specific titles! 🎯`;
  }

  if (text.includes('intro') || text.includes('introduction') || text.includes('opening')) {
    return `Here's how to write a great blog introduction:\n\n✅ Start with a hook:\n• Ask a question: "Have you ever wondered why some students ace every exam?"\n• Share a surprising stat: "Did you know 70% of students fail not from lack of knowledge, but poor study habits?"\n• Make a bold statement: "Everything you know about studying is probably wrong."\n\n✅ Address the pain point:\n• "If you're struggling with [problem], you're not alone..."\n\n✅ Promise value:\n• "In this post, you'll learn exactly how to..."\n\nKeep your intro under 100 words. Want me to write one for your specific topic?`;
  }

  if (text.includes('seo') || text.includes('search') || text.includes('rank')) {
    return `SEO tips for education blogs:\n\n🔍 Keywords:\n• Use long-tail keywords (e.g., "how to study for UPSC without coaching")\n• Put the keyword in the title, first paragraph, and 2–3 headings\n\n📝 Content:\n• Aim for 800–1500 words\n• Use short paragraphs (2–3 sentences max)\n• Add a FAQ section at the end\n\n🖼️ Technical:\n• Add a descriptive alt text to your cover image\n• Use a clear, descriptive URL slug\n• Add relevant tags/categories\n\n🔗 Engagement:\n• End with a question to encourage comments\n• Link to other related posts on the platform`;
  }

  if (text.includes('improve') || text.includes('better') || text.includes('fix') || text.includes('edit')) {
    return `Tips to improve your blog post:\n\n✂️ Clarity:\n• Use shorter sentences (15–20 words max)\n• Replace complex words with simple ones\n• One idea per paragraph\n\n🎨 Engagement:\n• Add bullet points and numbered lists\n• Use subheadings every 200–300 words\n• Include a real example or personal story\n\n💬 Tone:\n• Write like you're talking to a friend\n• Use "you" to address the reader directly\n• Avoid passive voice\n\n🔚 Ending:\n• Always close with a clear takeaway\n• Ask a question to spark discussion\n\nPaste your draft and I can give more specific feedback! 👀`;
  }

  if (text.includes('checklist') || text.includes('before publish') || text.includes('review')) {
    return `✅ Blog Post Publishing Checklist:\n\n□ Title is catchy and under 60 characters\n□ Introduction hooks the reader in the first line\n□ Content is organized with clear headings (H2, H3)\n□ Each paragraph has one main idea\n□ No spelling or grammar errors\n□ At least one real example or story included\n□ Conclusion summarizes key points\n□ Ends with a call-to-action or question\n□ Cover image added\n□ Relevant tags/categories selected\n□ Read it out loud — does it flow naturally?\n\nGood luck with your post! 🚀`;
  }

  if (text.includes('conclusion') || text.includes('ending') || text.includes('close')) {
    return `How to write a strong blog conclusion:\n\n1. ✏️ Restate your main point (1 sentence)\n   "So we've seen that effective study habits can transform your exam results."\n\n2. 📋 Summarize key takeaways (2–3 bullets)\n   "Here's what to remember:\n   • Study in short bursts with breaks\n   • Test yourself regularly\n   • Review before sleeping"\n\n3. 🎯 Call-to-action\n   "Try one of these techniques tonight and see the difference!"\n\n4. ❓ Engagement question\n   "Which study tip do you already use? Share in the comments!"\n\nThis keeps readers engaged even at the very end. 💪`;
  }

  // Fallback
  return `Here are some ways I can help with your blog:\n\n• 💡 **Blog ideas** — Ask "Give me blog topic ideas"\n• 📝 **Outline** — Ask "Create an outline for [topic]"\n• 🏷️ **Titles** — Ask "Suggest titles for [topic]"\n• 📌 **Introduction** — Ask "Write an intro for [topic]"\n• ✨ **Improve** — Ask "How do I improve my blog?"\n• 🎯 **SEO** — Ask "Give me SEO tips"\n\nAdd your Gemini API key in ⚙️ Settings for smarter, personalized responses!`;
}


// ─────────────────────────────────────────────────────────────────────────────
// Auto-write full blog — /agent/blog-generate
// Drives the "✨ Auto-write with Copilot" flow on the blog editor.
// Returns STRUCTURED JSON (not free text) so the frontend can fill the form.
// ─────────────────────────────────────────────────────────────────────────────

exports.blogGenerate = async (req, res) => {
  try {
    const { topic, tone, length, audience, language } = req.body;
    if (!topic || typeof topic !== 'string' || topic.trim() === '') {
      return res.status(400).json({ success: false, message: 'Topic is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    const isAiPowered = !!(apiKey && apiKey.trim() !== '');

    let generated;
    try {
      generated = isAiPowered
        ? await _callGeminiBlogGenerator(topic.trim(), apiKey.trim(), { tone, length, audience, language })
        : _localBlogGenerator(topic.trim(), language);
    } catch (err) {
      // Gemini failed across all models — fall back to local so the
      // user still gets a usable draft instead of a 500.
      console.warn('Gemini blog generator failed, using local fallback:', err.message);
      generated = _localBlogGenerator(topic.trim(), language);
    }

    return res.status(200).json({
      success: true,
      data: generated,
      isAiPowered: !generated._isLocal
    });
  } catch (error) {
    console.error('Blog generate controller error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate blog', error: error.message });
  }
};

/**
 * Call Gemini and ask for a complete blog as JSON.
 * Uses the same model fallback chain as blogChat (see MODELS above).
 */
async function _callGeminiBlogGenerator(topic, apiKey, opts = {}) {
  const axios = require('axios');
  const tone = opts.tone || 'friendly';
  const length = opts.length || 'medium'; // short ~400 words, medium ~800, long ~1200
  const audience = opts.audience || 'students preparing for exams';
  const language = opts.language || 'english';

  const wordTarget = length === 'short' ? 400 : length === 'long' ? 1200 : 800;
  const isHindi = language === 'hindi' || language === 'hi';

  const systemInstruction = `You are an expert blog writer for Draa, an online education platform.

Your task: Given a topic, generate a complete blog post ${isHindi ? 'written entirely in Hindi (using Devanagari script)' : 'written in English'} and return ONLY valid JSON — no markdown fences, no commentary outside the JSON object.

REQUIREMENTS:
- Tone: ${tone}
- Target audience: ${audience}
- Target length: roughly ${wordTarget} words for the body content
- Title: catchy, SEO-friendly, under 70 characters, no HTML, written in ${isHindi ? 'Hindi' : 'English'}
- Content: valid semantic HTML using only <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote>. No <h1> (the title is rendered separately). No inline styles. No scripts. Written entirely in ${isHindi ? 'Hindi' : 'English'}.
- Meta description: 1-2 sentences, under 160 characters, written in ${isHindi ? 'Hindi' : 'English'}
- Tags: 4-6 lowercase, hyphenated tags relevant to the topic (written in ${isHindi ? 'Hindi or English' : 'English'})
- Image prompt: A highly descriptive, detailed English text prompt suitable for a text-to-image AI model (like Stable Diffusion) to generate a high-quality educational/blog-related header graphic. Focus on clean graphics, high contrast, minimal text. Must be in English even if the blog content is in Hindi.

STRUCTURE of content (use exactly these sections in order):
1. <h2>${isHindi ? 'परिचय' : 'Introduction'}</h2> followed by 2-3 <p> paragraphs that hook the reader
2. 3-5 main sections, each with <h2>Heading</h2> (written in ${isHindi ? 'Hindi' : 'English'}) followed by 1-3 <p> paragraphs. Use <ul>/<ol> where helpful.
3. <h2>${isHindi ? 'निष्कर्ष' : 'Conclusion'}</h2> followed by 1-2 <p> paragraphs that summarize and end with a question or call-to-action

OUTPUT FORMAT (strict JSON, no markdown):
{
  "title": "string",
  "content": "<h2>${isHindi ? 'परिचय' : 'Introduction'}</h2><p>...</p>...",
  "metaDescription": "string",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "imagePrompt": "string"
}`;

  const MODELS = [
    'gemini-3.1-flash-lite',
    'gemini-3-flash-preview',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-pro'
  ];

  let lastError;
  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const response = await axios.post(url, {
        contents: [{ parts: [{ text: `${systemInstruction}\n\nTopic: "${topic}"` }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          maxOutputTokens: 4096,
          temperature: 0.7
        }
      }, { timeout: 45000 });

      const candidate = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidate) throw new Error('No response from Gemini');

      const parsed = JSON.parse(candidate.replace(/```json/g, '').replace(/```/g, '').trim());
      const normalized = _normalizeBlogResponse(parsed);
      const imagePrompt = parsed.imagePrompt || topic;
      normalized.imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt.trim() + ' educational banner flat vector clean graphic')}?width=800&height=500&nologo=true`;
      return normalized;
    } catch (err) {
      lastError = err;
      const status = err.response?.status;
      if (status !== 404 && status !== 429) throw err;
      console.warn(`Gemini model "${model}" unavailable (${status}); trying next model.`);
    }
  }
  throw lastError || new Error('All Gemini models failed');
}

/**
 * Normalize & sanitize the AI's response to make sure it's safe for the editor.
 */
function _normalizeBlogResponse(parsed) {
  const title = String(parsed.title || '').trim().slice(0, 200).replace(/<[^>]+>/g, '');
  let content = String(parsed.content || '').trim();
  // Strip any disallowed tags; keep only the safe semantic set.
  content = content.replace(/<(?!\/?(h2|h3|p|ul|ol|li|strong|em|blockquote)\b)[^>]*>/gi, '');
  // Cap content length so the editor doesn't choke.
  if (content.length > 12000) content = content.slice(0, 12000);
  const metaDescription = String(parsed.metaDescription || parsed.meta_description || '').trim().slice(0, 200);
  const tags = Array.isArray(parsed.tags)
    ? parsed.tags.map(t => String(t).toLowerCase().trim().replace(/[^a-z0-9\u0900-\u097F -]/g, '').slice(0, 30)).filter(Boolean).slice(0, 6)
    : [];
  return { title, content, metaDescription, tags };
}

/**
 * Local fallback blog generator — used when Gemini is unavailable.
 * Produces a templated but topic-aware draft so the user always has something
 * to start from rather than a 500 error.
 */
function _localBlogGenerator(topic, language) {
  const isHindi = language === 'hindi' || language === 'hi';

  if (isHindi) {
    const safeTitle = topic.length > 70 ? topic.slice(0, 67) + '...' : topic;
    const title = safeTitle;

    const content = '<h2>परिचय (Introduction)</h2>'
      + '<p>' + topic + ' एक ऐसा विषय है जो कई छात्रों, शिक्षकों और शिक्षार्थियों के लिए बहुत महत्वपूर्ण है। इस लेख में, हम चर्चा करेंगे कि यह क्यों मायने रखता है और आप इसे अपनी सीखने की यात्रा में कैसे लागू कर सकते हैं।</p>'
      + '<p>चाहे आप अभी शुरुआत कर रहे हों या अपनी समझ को गहरा करना चाहते हों, नीचे दिए गए बिंदु आपको एक स्पष्ट और व्यावहारिक शुरुआत देंगे।</p>'
      + '<h2>' + topic + ' क्यों महत्वपूर्ण है</h2>'
      + '<p>' + topic + ' को समझने से आपको आगे आने वाले समय के लिए एक मजबूत आधार बनाने में मदद मिलती है। यह कक्षा की सीख को वास्तविक दुनिया के परिणामों से जोड़ता है — और यह एक ऐसा कौशल है जो परीक्षा हॉल से परे भी काम आता है।</p>'
      + '<ul><li>सकारात्मक सोच और स्पष्टता लाता है</li><li>दीर्घकालिक स्मृति में सुधार करता है</li><li>सिद्धांत को व्यावहारिक अनुप्रयोग से जोड़ता है</li></ul>'
      + '<h2>' + topic + ' के साथ शुरुआत कैसे करें</h2>'
      + '<p>छोटी शुरुआत करें। इस पोस्ट से एक अवधारणा चुनें और इसे आज ही लागू करें। जब आप कुछ नया सीख रहे हों, तो निरंतरता तीव्रता से बेहतर होती है।</p>'
      + '<ol><li>सबसे महत्वपूर्ण विचार की पहचान करें</li><li>आज 15 मिनट इसका अभ्यास करें</li><li>Reflect on what worked and what did not</li></ol>'
      + '<h2>बचने योग्य सामान्य गलतियाँ</h2>'
      + '<p>कई शिक्षार्थी बुनियादी बातों को छोड़ देते हैं और सीधे उन्नत स्तर पर चले जाते हैं। आप उनमें से एक न बनें। पहले बुनियादी बातों पर महारत हासिल करें — गति अभ्यास के साथ अपने आप आती है।</p>'
      + '<h2>निष्कर्ष (Conclusion)</h2>'
      + '<p>' + topic + ' पहली बार में जितना कठिन लग सकता है, उससे कहीं अधिक सुलभ है। सही दृष्टिकोण और थोड़े से दैनिक प्रयास से, आप कुछ ही हफ्तों में वास्तविक प्रगति देखेंगे।</p>'
      + '<p><strong>आप सबसे पहले क्या करने की कोशिश करेंगे? नीचे टिप्पणी (comments) में साझा करें।</strong></p>';

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(topic.trim() + ' educational banner flat vector clean graphic')}?width=800&height=500&nologo=true`;
    return {
      title,
      content,
      metaDescription: topic.slice(0, 140) + ' के बारे में एक व्यावहारिक मार्गदर्शिका — यह क्या है, क्यों महत्वपूर्ण है, और कैसे शुरुआत करें।',
      tags: ['शिक्षा', 'सीखना'],
      imageUrl,
      _isLocal: true
    };
  }

  const safeTitle = topic.length > 70 ? topic.slice(0, 67) + '...' : topic;
  const title = safeTitle.charAt(0).toUpperCase() + safeTitle.slice(1);

  const content = '<h2>Introduction</h2>'
    + '<p>' + topic + ' is a topic that resonates with many students, teachers, and lifelong learners. In this post, we explore why it matters and how you can apply it in your own learning journey.</p>'
    + '<p>Whether you are just starting out or looking to deepen your understanding, the points below will give you a clear, practical starting point.</p>'
    + '<h2>Why ' + topic + ' Matters</h2>'
    + '<p>Understanding ' + topic + ' helps you build a stronger foundation for whatever comes next. It connects classroom learning with real-world outcomes — and it is a skill that pays off far beyond the exam hall.</p>'
    + '<ul><li>Builds critical thinking and clarity</li><li>Improves long-term retention</li><li>Connects theory to practical application</li></ul>'
    + '<h2>How to Get Started with ' + topic + '</h2>'
    + '<p>Start small. Pick one concept from this post and apply it today. Consistency beats intensity when you are learning something new.</p>'
    + '<ol><li>Identify the single most important idea</li><li>Practice it for 15 minutes today</li><li>Reflect on what worked and what did not</li></ol>'
    + '<h2>Common Mistakes to Avoid</h2>'
    + '<p>Many learners skip the fundamentals and jump to advanced material. Do not be one of them. Master the basics first — speed comes naturally with practice.</p>'
    + '<h2>Conclusion</h2>'
    + '<p>' + topic + ' is more accessible than it might seem at first. With the right approach and a little daily effort, you will see real progress in a matter of weeks.</p>'
    + '<p><strong>What is one thing you will try first? Share in the comments below.</strong></p>';

  // Generate tags from topic words
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'to', 'of', 'for', 'in', 'on', 'at', 'with', 'by', 'how', 'what', 'why', 'when', 'where', 'who', 'this', 'that', 'these', 'those', 'i', 'you', 'we', 'they', 'my', 'your', 'our']);
  const tags = Array.from(new Set(
    topic.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w))
      .slice(0, 4)
  )).map(w => w.replace(/\s+/g, '-'));

  if (tags.length === 0) tags.push('education');
  if (!tags.includes('education')) tags.push('education');

  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(topic.trim() + ' educational banner flat vector clean graphic')}?width=800&height=500&nologo=true`;
  return {
    title,
    content,
    metaDescription: 'A practical guide to ' + topic.toLowerCase().slice(0, 140) + ' — what it is, why it matters, and how to get started.',
    tags,
    imageUrl,
    _isLocal: true
  };
}

// ─── AI RECOMMENDATION SYSTEM ───────────────────────────────────────────────

exports.recommend = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const isAiPowered = !!(apiKey && apiKey.trim() !== '');

    // 1. Extract intent and keywords
    const parsedQuery = await nlpService.parseRecommendationQuery(prompt.trim(), apiKey);
    const { types = [], keywords = [] } = parsedQuery;

    // Build search regex from keywords (or empty if no keywords)
    const regexQuery = keywords.length > 0 ? new RegExp(keywords.join('|'), 'i') : /.*/i;
    
    const Course = require('../Models/CourseModel');
    const Book = require('../Models/booksModel');
    const Exam = require('../Models/Exam');
    const TestSeries = require('../Models/TestSeriesModels');
    
    let results = [];
    const limitPerType = 3;

    // 2. Query respective models based on requested types
    if (types.includes('course') || types.includes('all')) {
      const courses = await Course.find({
        $or: [
          { title: regexQuery },
          { shortDescription: regexQuery },
          { tags: regexQuery },
          { course_category: regexQuery }
        ],
        status: 'published'
      }).limit(limitPerType).lean();
      
      courses.forEach(c => results.push({
        id: c._id,
        title: c.title,
        description: c.shortDescription || c.description,
        type: 'course',
        typeLabel: 'Course',
        thumbnail: c.thumbnail || c.coverImage,
        price: c.discounted_price || c.price,
        url: `/course-details/${c._id}`
      }));
    }

    if (types.includes('book') || types.includes('all')) {
      const books = await Book.find({
        $or: [
          { title: regexQuery },
          { description: regexQuery },
          { tags: regexQuery },
          { category: regexQuery }
        ]
      }).limit(limitPerType).lean();
      
      books.forEach(b => results.push({
        id: b._id,
        title: b.title,
        description: b.description || b.summary,
        type: 'book',
        typeLabel: 'Book',
        thumbnail: b.coverImage || b.thumbnail,
        price: b.digitalPrice || b.physicalPrice,
        url: `/book-details/${b._id}`
      }));
    }

    if (types.includes('test-series') || types.includes('all')) {
      const tests = await TestSeries.find({
        $or: [
          { title: regexQuery },
          { description: regexQuery },
          { tags: regexQuery }
        ]
      }).limit(limitPerType).lean();

      tests.forEach(t => results.push({
        id: t._id,
        title: t.title,
        description: t.description,
        type: 'test-series',
        typeLabel: 'Test Series',
        thumbnail: t.thumbnail,
        price: t.price,
        url: `/test-series/${t._id}`
      }));
    }

    if (types.includes('exam') || types.includes('all')) {
      const exams = await Exam.find({
        $or: [
          { name: regexQuery },
          { description: regexQuery },
          { category: regexQuery }
        ]
      }).limit(limitPerType).lean();

      exams.forEach(e => results.push({
        id: e._id,
        title: e.name,
        description: e.description,
        type: 'exam',
        typeLabel: 'Exam',
        thumbnail: e.examImage,
        url: `/exams/${e.slug || e._id}`
      }));
    }

    // Sort to mix types naturally
    results.sort(() => Math.random() - 0.5);

    // 3. Generate conversational AI summary
    const aiMessage = await nlpService.generateRecommendationSummary(results, prompt, apiKey);

    return res.status(200).json({
      success: true,
      data: {
        aiMessage,
        recommendedItems: results,
        queryExtracted: parsedQuery
      },
      isAiPowered
    });

  } catch (error) {
    console.error('Agent recommend controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process recommendation request',
      error: error.message
    });
  }
};

