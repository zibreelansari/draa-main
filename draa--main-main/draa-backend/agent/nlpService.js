const axios = require('axios');

/**
 * Clean up text markdown code blocks to avoid JSON parsing issues.
 */
function cleanJSONString(str) {
  return str.replace(/```json/g, '').replace(/```/g, '').trim();
}

/**
 * Call Gemini via REST API. Tries the primary model first, then falls back
 * to other stable models if the API returns 404 (retired) or 429 (rate-limited).
 */
async function parseWithGemini(prompt, apiKey) {
  // Ordered list of Gemini models — newest first. Different model families
  // have separate quota buckets. Starts with gemini-3.1-flash-lite because
  // that's what Google's free tier actually grants to new users today.
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
    const systemInstruction = `
      You are an AI admin/teacher assistant for the Draa web application. Your job is to parse natural language requests and identify the intent and fields to automate dashboard tasks.

      =========================================================
      SUPPORTED INTENTS — CREATION
      =========================================================
      - "CREATE_JOB"
      - "CREATE_JOB_CATEGORY"
      - "CREATE_COURSE"
      - "CREATE_COURSE_CATEGORY"
      - "CREATE_COURSE_CONTENT"
      - "CREATE_EXAM"
      - "CREATE_TEST_SERIES"
      - "CREATE_EXAMINATION_CATEGORY"
      - "CREATE_SUBJECT"
      - "CREATE_TOPIC"
      - "CREATE_LIVE_SESSION"
      - "CREATE_COUPON"
      - "CREATE_BOOK"
      - "CREATE_BOOK_CATEGORY"
      - "CREATE_PYQ"
      - "CREATE_SYLLABUS"
      - "CREATE_CURRENT_AFFAIRS"
      - "CREATE_VIDEOGRAPHY"
      - "CREATE_BANNER"
      - "CREATE_FAQ"
      - "CREATE_TEACHER"
      - "CREATE_STUDENT"

      =========================================================
      SUPPORTED INTENTS — MANAGEMENT (approve / reject / delete / suspend / search / list)
      =========================================================
      - "APPROVE_TEACHER"      → approve a pending teacher by name or email
      - "REJECT_TEACHER"       → reject a teacher by name or email (include reason if stated)
      - "SUSPEND_TEACHER"      → suspend a teacher by name or email
      - "DELETE_TEACHER"       → permanently delete a teacher by name or email
      - "APPROVE_STUDENT"      → approve or activate a student account
      - "REJECT_STUDENT"       → reject a student account
      - "SUSPEND_STUDENT"      → suspend a student account
      - "DELETE_STUDENT"       → permanently delete a student by name or email
      - "APPROVE_COURSE"       → approve a course pending review by title
      - "REJECT_COURSE"        → reject a course by title (include reason if stated)
      - "DELETE_COURSE"        → delete a course by title
      - "DELETE_JOB"           → delete a job posting by title
      - "DELETE_BOOK"          → delete a book by title
      - "LIST_PENDING_TEACHERS" → list/show all pending teacher applications
      - "LIST_PENDING_COURSES"  → list/show all courses pending approval
      - "LIST_STUDENTS"        → list/search students
      - "LIST_TEACHERS"        → list/search teachers
      - "LIST_JOBS"            → list/search job postings
      - "LIST_COURSES"         → list/search courses
      - "SEARCH"               → general search across the platform
      - "UNKNOWN"              → if no intent matches

      =========================================================
      FIELD SCHEMAS — CREATION INTENTS
      =========================================================

      1. CREATE_JOB:
         - "title" (string)
         - "job_type" ("Government" | "Private", default "Private")
         - "organization_name" (string)
         - "location" (string)
         - "salary_min" (number)
         - "salary_max" (number)
         - "salary_type" ("Monthly" | "Annual", default "Monthly")
         - "qualifications_required" (array of strings)
         - "experience_required" (string)
         - "application_fee_general" (number)
         - "application_fee_obc" (number)
         - "application_fee_sc" (number)
         - "application_fee_st" (number)
         - "deadline" (string, YYYY-MM-DD)
         - "job_description" (string)
         - "application_link" (string)
         - "official_website" (string)

      2. CREATE_JOB_CATEGORY: { "name" }

      3. CREATE_COURSE:
         - "title", "short_desc", "long_desc"
         - "actual_price" (number), "discounted_price" (number)

      4. CREATE_COURSE_CATEGORY: { "name" }

      5. CREATE_COURSE_CONTENT:
         - "chapter_name", "youtube_video"

      6. CREATE_EXAM:
         - "title", "duration_min" (number), "passing_marks" (number)

      7. CREATE_TEST_SERIES:
         - "title", "price" (number), "description", "duration" (minutes, number)

      8. CREATE_EXAMINATION_CATEGORY: { "name" }

      9. CREATE_SUBJECT: { "name" }

      10. CREATE_TOPIC: { "name" }

      11. CREATE_LIVE_SESSION:
          - "title", "date" (YYYY-MM-DD), "time" (HH:MM), "duration" (minutes, number), "meeting_link"

      12. CREATE_COUPON:
          - "code", "discountType" ("Percentage" | "Flat"), "discountValue" (number), "expiryDate" (YYYY-MM-DD)

      13. CREATE_BOOK:
          - "title", "author", "price" (number), "description", "category"

      14. CREATE_BOOK_CATEGORY: { "name" }

      15. CREATE_PYQ:
          - "title", "year" (number), "description"

      16. CREATE_SYLLABUS:
          - "title", "description", "category"

      17. CREATE_CURRENT_AFFAIRS:
          - "title", "description"
          - "category" ("Daily" | "Weekly" | "Monthly" | "Quarterly" | "Yearly", default "Daily")
          - "date" (YYYY-MM-DD)

      18. CREATE_VIDEOGRAPHY:
          - "title", "description", "video_url"

      19. CREATE_BANNER:
          - "title", "subtitle"

      20. CREATE_FAQ:
          - "question", "answer"

      21. CREATE_TEACHER:
          - "tname", "T_email", "password", "qualifications"

      22. CREATE_STUDENT:
          - "name", "email", "password", "phone"

      =========================================================
      FIELD SCHEMAS — MANAGEMENT INTENTS
      =========================================================

      APPROVE_TEACHER / REJECT_TEACHER / SUSPEND_TEACHER / DELETE_TEACHER:
        - "identifier" (string — the teacher's name or email as given)
        - "reason" (string, optional — only for reject/suspend)
        - "search_term" (string — same as identifier, used to find the teacher)

      APPROVE_STUDENT / REJECT_STUDENT / SUSPEND_STUDENT / DELETE_STUDENT:
        - "identifier" (string — student name or email)
        - "reason" (string, optional)
        - "search_term" (string)

      APPROVE_COURSE / REJECT_COURSE / DELETE_COURSE:
        - "identifier" (string — course title)
        - "reason" (string, optional — for reject)
        - "search_term" (string)

      DELETE_JOB / DELETE_BOOK:
        - "identifier" (string — title)
        - "search_term" (string)

      LIST_PENDING_TEACHERS / LIST_PENDING_COURSES / LIST_STUDENTS / LIST_TEACHERS / LIST_JOBS / LIST_COURSES:
        - "filter" (string, optional — e.g. status filter or keyword)
        - "limit" (number, optional — default 10)

      SEARCH:
        - "query" (string — the search keyword)

      =========================================================
      RESPONSE FORMAT (strict JSON only, no markdown)
      =========================================================
      {
        "intent": "<INTENT>",
        "fields": { ... },
        "explanation": "Human-friendly message explaining what was detected and what action will happen"
      }

      For DESTRUCTIVE intents (DELETE_*, REJECT_*, SUSPEND_*), the explanation MUST include a clear warning like:
      "⚠️ This action is irreversible. Please confirm..."
    `;

    const response = await axios.post(url, {
      contents: [{
        parts: [{ text: `${systemInstruction}\n\nUser request: "${prompt}"` }]
      }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    }, { timeout: 30000 });

    const candidate = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidate) {
      return JSON.parse(cleanJSONString(candidate));
    }
    throw new Error("No response text from Gemini");
    } catch (err) {
      lastError = err;
      const status = err.response?.status;
      // Only fall back on 404 (model retired/unavailable) or 429 (rate-limited).
      // For other errors (400 bad request, 401 bad key, etc.) fail fast.
      if (status !== 404 && status !== 429) {
        console.error("Gemini API parsing failed, falling back to local:", err.message);
        return parseLocally(prompt);
      }
      console.warn(`Gemini model "${model}" unavailable (${status}); trying next model.`);
    }
  }
  // All models exhausted — fall back to local parser.
  console.error("All Gemini models failed, falling back to local:", lastError?.message);
  return parseLocally(prompt);
}

/**
 * Fallback local heuristic parser using regular expressions.
 */
function parseLocally(prompt) {
  const text = prompt.toLowerCase();

  let result = {
    intent: "UNKNOWN",
    fields: {},
    explanation: "I was unable to determine what action to perform. Try asking me to 'post a job', 'create a course', 'approve teacher John', 'delete student Jane', etc."
  };

  const extractNumbers = (str) => {
    const matches = str.match(/\b\d+\b/g);
    return matches ? matches.map(Number) : [];
  };

  const extractDate = (str) => {
    const dateMatch = str.match(/\b(\d{4})[-/](\d{2})[-/](\d{2})\b/) || str.match(/\b(\d{2})[-/](\d{2})[-/](\d{4})\b/);
    if (dateMatch) {
      if (dateMatch[1].length === 4) return `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
      return `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
    }
    if (str.includes('deadline') || str.includes('expire') || str.includes('last date')) {
      const d = new Date();
      d.setDate(d.getDate() + 21);
      return d.toISOString().split('T')[0];
    }
    return undefined;
  };

  // ─── MANAGEMENT INTENTS ────────────────────────────────────────

  // APPROVE TEACHER
  if ((text.includes('approve') || text.includes('accept')) && text.includes('teacher')) {
    const nameMatch = prompt.match(/(?:approve|accept)\s+teacher\s+([A-Za-z0-9\s@.]+)/i);
    const identifier = nameMatch ? nameMatch[1].trim() : '';
    result.intent = "APPROVE_TEACHER";
    result.fields = { identifier, search_term: identifier };
    result.explanation = `I'll search for a teacher named/emailed "${identifier || '(unspecified)'}" and approve their account. Please confirm.`;
    return result;
  }

  // REJECT TEACHER
  if ((text.includes('reject') || text.includes('decline')) && text.includes('teacher')) {
    const nameMatch = prompt.match(/(?:reject|decline)\s+teacher\s+([A-Za-z0-9\s@.]+)/i);
    const identifier = nameMatch ? nameMatch[1].trim() : '';
    const reasonMatch = prompt.match(/(?:reason|because|due to)\s+(.+)/i);
    result.intent = "REJECT_TEACHER";
    result.fields = { identifier, search_term: identifier, reason: reasonMatch ? reasonMatch[1].trim() : '' };
    result.explanation = `⚠️ I'll reject teacher "${identifier || '(unspecified)'}". This action will deny their access. Please confirm.`;
    return result;
  }

  // SUSPEND TEACHER
  if (text.includes('suspend') && text.includes('teacher')) {
    const nameMatch = prompt.match(/suspend\s+teacher\s+([A-Za-z0-9\s@.]+)/i);
    const identifier = nameMatch ? nameMatch[1].trim() : '';
    result.intent = "SUSPEND_TEACHER";
    result.fields = { identifier, search_term: identifier };
    result.explanation = `⚠️ I'll suspend teacher "${identifier || '(unspecified)'}". Their access will be revoked. Please confirm.`;
    return result;
  }

  // DELETE TEACHER
  if (text.includes('delete') && text.includes('teacher')) {
    const nameMatch = prompt.match(/delete\s+teacher\s+([A-Za-z0-9\s@.]+)/i);
    const identifier = nameMatch ? nameMatch[1].trim() : '';
    result.intent = "DELETE_TEACHER";
    result.fields = { identifier, search_term: identifier };
    result.explanation = `⚠️ This is IRREVERSIBLE. I'll permanently delete teacher "${identifier || '(unspecified)'}". Please confirm.`;
    return result;
  }

  // APPROVE STUDENT
  if ((text.includes('approve') || text.includes('activate')) && text.includes('student')) {
    const nameMatch = prompt.match(/(?:approve|activate)\s+student\s+([A-Za-z0-9\s@.]+)/i);
    const identifier = nameMatch ? nameMatch[1].trim() : '';
    result.intent = "APPROVE_STUDENT";
    result.fields = { identifier, search_term: identifier };
    result.explanation = `I'll activate the student account for "${identifier || '(unspecified)'}". Please confirm.`;
    return result;
  }

  // DELETE STUDENT
  if (text.includes('delete') && text.includes('student')) {
    const nameMatch = prompt.match(/delete\s+student\s+([A-Za-z0-9\s@.]+)/i);
    const identifier = nameMatch ? nameMatch[1].trim() : '';
    result.intent = "DELETE_STUDENT";
    result.fields = { identifier, search_term: identifier };
    result.explanation = `⚠️ This is IRREVERSIBLE. I'll permanently delete student "${identifier || '(unspecified)'}". Please confirm.`;
    return result;
  }

  // SUSPEND STUDENT
  if (text.includes('suspend') && text.includes('student')) {
    const nameMatch = prompt.match(/suspend\s+student\s+([A-Za-z0-9\s@.]+)/i);
    const identifier = nameMatch ? nameMatch[1].trim() : '';
    result.intent = "SUSPEND_STUDENT";
    result.fields = { identifier, search_term: identifier };
    result.explanation = `⚠️ I'll suspend student "${identifier || '(unspecified)'}". Their access will be blocked. Please confirm.`;
    return result;
  }

  // LIST PENDING TEACHERS
  if ((text.includes('pending') || text.includes('waiting')) && text.includes('teacher')) {
    result.intent = "LIST_PENDING_TEACHERS";
    result.fields = { filter: 'pending', limit: 10 };
    result.explanation = `I'll fetch all teachers with pending approval status.`;
    return result;
  }

  // LIST TEACHERS
  if (text.includes('list') && text.includes('teacher')) {
    result.intent = "LIST_TEACHERS";
    result.fields = { limit: 10 };
    result.explanation = `I'll fetch the teacher list for you.`;
    return result;
  }

  // LIST STUDENTS
  if (text.includes('list') && text.includes('student')) {
    result.intent = "LIST_STUDENTS";
    result.fields = { limit: 10 };
    result.explanation = `I'll fetch the student list for you.`;
    return result;
  }

  // APPROVE COURSE
  if ((text.includes('approve') || text.includes('publish')) && text.includes('course')) {
    const titleMatch = prompt.match(/(?:approve|publish)\s+course\s+([A-Za-z0-9\s]+)/i);
    const identifier = titleMatch ? titleMatch[1].trim() : '';
    result.intent = "APPROVE_COURSE";
    result.fields = { identifier, search_term: identifier };
    result.explanation = `I'll approve and publish the course "${identifier || '(unspecified)'}". Please confirm.`;
    return result;
  }

  // REJECT COURSE
  if (text.includes('reject') && text.includes('course')) {
    const titleMatch = prompt.match(/reject\s+course\s+([A-Za-z0-9\s]+)/i);
    const identifier = titleMatch ? titleMatch[1].trim() : '';
    result.intent = "REJECT_COURSE";
    result.fields = { identifier, search_term: identifier, reason: '' };
    result.explanation = `⚠️ I'll reject course "${identifier || '(unspecified)'}". Please confirm.`;
    return result;
  }

  // DELETE COURSE
  if (text.includes('delete') && text.includes('course')) {
    const titleMatch = prompt.match(/delete\s+course\s+([A-Za-z0-9\s]+)/i);
    const identifier = titleMatch ? titleMatch[1].trim() : '';
    result.intent = "DELETE_COURSE";
    result.fields = { identifier, search_term: identifier };
    result.explanation = `⚠️ IRREVERSIBLE. I'll permanently delete course "${identifier || '(unspecified)'}". Please confirm.`;
    return result;
  }

  // ─── CREATION INTENTS ──────────────────────────────────────────

  // CREATE_JOB
  if (text.includes("job") || text.includes("hiring") || text.includes("vacancy") || text.includes("post a job")) {
    result.intent = "CREATE_JOB";
    let org = "My Company";
    const orgMatch = prompt.match(/\bat\s+([A-Za-z0-9\s.]+)\b/i) || prompt.match(/\bfor\s+([A-Za-z0-9\s.]+)\b/i);
    if (orgMatch && !['job', 'hiring', 'vacancy', 'me', 'us'].includes(orgMatch[1].trim().toLowerCase())) {
      org = orgMatch[1].split('in')[0].split('salary')[0].trim();
    }
    let title = "Job vacancy";
    const titleMatch = prompt.match(/\b(?:hiring|job for|role of|position of|as)\s+([A-Za-z0-9\s.-]+)\b/i);
    if (titleMatch) {
      title = titleMatch[1].split('at')[0].split('in')[0].split('for')[0].trim();
    }
    const numbers = extractNumbers(text);
    let salaryMin, salaryMax;
    const salaries = numbers.filter(n => n >= 5000 && n <= 5000000);
    if (salaries.length >= 2) { salaryMin = Math.min(salaries[0], salaries[1]); salaryMax = Math.max(salaries[0], salaries[1]); }
    else if (salaries.length === 1) { salaryMin = salaries[0]; }
    let location = "Remote / India";
    const locMatch = prompt.match(/\bin\s+([A-Za-z\s]+)\b/i);
    if (locMatch && !['government', 'private', 'annual', 'monthly'].includes(locMatch[1].trim().toLowerCase())) {
      location = locMatch[1].split('salary')[0].split('deadline')[0].trim();
    }
    result.fields = {
      title, organization_name: org,
      job_type: text.includes("government") || text.includes("govt") ? "Government" : "Private",
      location, salary_min: salaryMin, salary_max: salaryMax,
      salary_type: text.includes("annual") || text.includes("year") ? "Annual" : "Monthly",
      deadline: extractDate(text) || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      job_description: `We are hiring a ${title} at ${org} located in ${location}. Apply now!`
    };
    result.explanation = `I detected that you want to post a Job for "${title}" at "${org}". Please verify the fields below.`;
    return result;
  }

  // CREATE_COURSE
  if (text.includes("course") || text.includes("class") || text.includes("batch")) {
    result.intent = "CREATE_COURSE";
    let title = "New Course";
    const titleMatch = prompt.match(/\b(?:course|class|batch)\s+(?:named|titled|for|on)?\s*([A-Za-z0-9\s.-]+)\b/i);
    if (titleMatch) title = titleMatch[1].split('price')[0].split('cost')[0].trim();
    const numbers = extractNumbers(text);
    let actualPrice = 1999, discountedPrice = 999;
    if (numbers.length >= 2) { actualPrice = Math.max(numbers[0], numbers[1]); discountedPrice = Math.min(numbers[0], numbers[1]); }
    else if (numbers.length === 1) { actualPrice = numbers[0]; discountedPrice = Math.floor(numbers[0] * 0.8); }
    result.fields = {
      title,
      short_desc: `Learn ${title} in-depth with certified mentors.`,
      long_desc: `Comprehensive masterclass on ${title}. Covers all topics from basics to advanced levels with practice sets.`,
      actual_price: actualPrice, discounted_price: discountedPrice
    };
    result.explanation = `I detected that you want to create a Course named "${title}" priced at ₹${discountedPrice} (was ₹${actualPrice}).`;
    return result;
  }

  // CREATE_COUPON
  if (text.includes("coupon") || text.includes("discount code") || text.includes("promo")) {
    result.intent = "CREATE_COUPON";
    let code = "DISCOUNT50";
    const codeMatch = prompt.match(/\b([A-Z0-9]{4,15})\b/);
    if (codeMatch) code = codeMatch[1];
    const numbers = extractNumbers(text);
    let discountVal = 10;
    if (numbers.length > 0) discountVal = numbers.find(n => n < 100) || numbers[0];
    result.fields = {
      code,
      discountType: text.includes("flat") || text.includes("rupees") || text.includes("rs") ? "Flat" : "Percentage",
      discountValue: discountVal,
      expiryDate: extractDate(text) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    result.explanation = `I detected you want to create Coupon "${code}" with ${discountVal}% discount.`;
    return result;
  }

  // CREATE_LIVE_SESSION
  if (text.includes("live") || text.includes("session") || text.includes("webinar")) {
    result.intent = "CREATE_LIVE_SESSION";
    const titleMatch = prompt.match(/(?:live|session|webinar)\s+(?:on|for|titled|named)?\s*([A-Za-z0-9\s]+)/i);
    const title = titleMatch ? titleMatch[1].trim() : "Live Class";
    result.fields = {
      title,
      date: extractDate(text) || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: "17:00", duration: 60,
      meeting_link: "https://meet.google.com/abc-defg-hij"
    };
    result.explanation = `I detected you want to schedule a Live Session titled "${title}". Please verify the date and meeting link.`;
    return result;
  }

  // CREATE_TEST_SERIES
  if (text.includes("test series") || text.includes("mock test") || text.includes("test pack")) {
    result.intent = "CREATE_TEST_SERIES";
    const titleMatch = prompt.match(/(?:test series|mock test|test pack)\s+(?:for|on|titled)?\s*([A-Za-z0-9\s]+)/i);
    const title = titleMatch ? titleMatch[1].trim() : "Practice Test Series";
    const numbers = extractNumbers(text);
    result.fields = {
      title,
      price: numbers.find(n => n > 0) || 299,
      description: `Full practice test series for ${title}`,
      duration: 120
    };
    result.explanation = `I detected you want to create a Test Series titled "${title}".`;
    return result;
  }

  // CREATE_BOOK
  if (text.includes("book") || text.includes("pdf")) {
    result.intent = "CREATE_BOOK";
    const titleMatch = prompt.match(/(?:book|pdf)\s+(?:titled|named|on|for)?\s*([A-Za-z0-9\s]+)/i);
    const title = titleMatch ? titleMatch[1].trim() : "Study Book";
    const numbers = extractNumbers(text);
    result.fields = {
      title, author: "EduDocs Expert",
      price: numbers.find(n => n > 0) || 150,
      description: `A comprehensive study book on ${title}`, category: "General"
    };
    result.explanation = `I detected you want to create a Book titled "${title}".`;
    return result;
  }

  // CREATE_EXAM
  if (text.includes("exam") || text.includes("quiz") || text.includes("test")) {
    result.intent = "CREATE_EXAM";
    const titleMatch = prompt.match(/(?:exam|quiz|test)\s+(?:for|on|titled|named)?\s*([A-Za-z0-9\s]+)/i);
    const title = titleMatch ? titleMatch[1].trim() : "Practice Quiz";
    const numbers = extractNumbers(text);
    result.fields = {
      title,
      duration_min: numbers.find(n => n >= 10 && n <= 300) || 60,
      passing_marks: numbers.find(n => n >= 1 && n <= 100) || 33
    };
    result.explanation = `I detected you want to create an Exam titled "${title}".`;
    return result;
  }

  // CREATE_BANNER
  if (text.includes("banner") || text.includes("slider")) {
    result.intent = "CREATE_BANNER";
    result.fields = { title: "Special Offer", subtitle: "Enroll now and save big!" };
    result.explanation = "I detected you want to create a homepage Banner. Please fill in the title and subtitle.";
    return result;
  }

  // CREATE_FAQ
  if (text.includes("faq") || text.includes("frequently asked") || (text.includes("question") && text.includes("answer"))) {
    result.intent = "CREATE_FAQ";
    result.fields = { question: "What is Draa?", answer: "Draa is an online education platform." };
    result.explanation = "I detected you want to create a FAQ entry. Please fill in the question and answer.";
    return result;
  }

  // SEARCH fallback
  if (text.includes("search") || text.includes("find") || text.includes("show me")) {
    result.intent = "SEARCH";
    result.fields = { query: prompt.replace(/search|find|show me/gi, '').trim() };
    result.explanation = `I'll search the platform for: "${result.fields.query}"`;
    return result;
  }

  return result;
}

// ─── RECOMMENDATION SYSTEM ───────────────────────────────────────

/**
 * Parses a student's recommendation query to extract intent and keywords.
 */
async function parseRecommendationQuery(prompt, apiKey) {
  const MODELS = [
    'gemini-3.1-flash-lite',
    'gemini-3-flash-preview',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-pro'
  ];

  const systemInstruction = `
    You are an AI assistant for Draa. A student is asking for recommendations.
    Extract the following from their query:
    1. "types": an array of content types they are looking for. Allowed values: "course", "book", "exam", "test-series". If they don't specify, default to ["course", "book", "exam", "test-series"].
    2. "keywords": an array of specific topics, exams, or subjects they mentioned (e.g., ["UPSC"], ["banking"], ["teaching"]).

    Return ONLY a valid JSON object:
    {
      "types": ["book", "course"],
      "keywords": ["UPSC", "prelims"]
    }
  `;

  let lastError;
  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const response = await axios.post(url, {
        contents: [{ parts: [{ text: `${systemInstruction}\n\nStudent: "${prompt}"` }] }],
        generationConfig: { responseMimeType: "application/json" }
      }, { timeout: 30000 });

      const candidate = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidate) {
        return JSON.parse(cleanJSONString(candidate));
      }
      throw new Error("No response text from Gemini");
    } catch (err) {
      lastError = err;
      const status = err.response?.status;
      if (status !== 404 && status !== 429) {
        return _fallbackRecommendationParser(prompt);
      }
    }
  }
  return _fallbackRecommendationParser(prompt);
}

function _fallbackRecommendationParser(prompt) {
  const text = prompt.toLowerCase();
  const types = [];
  if (text.includes('book') || text.includes('ebook')) types.push('book');
  if (text.includes('course') || text.includes('class')) types.push('course');
  if (text.includes('exam')) types.push('exam');
  if (text.includes('test') || text.includes('mock')) types.push('test-series');
  
  if (types.length === 0) types.push('course', 'book', 'exam', 'test-series');

  const stopWords = ['what', 'is', 'the', 'best', 'for', 'my', 'preparation', 'i', 'want', 'to', 'know', 'are', 'in', 'peak', 'enrolled'];
  const words = text.replace(/[^a-z0-9\\s]/g, '').split('\\s+');
  const keywords = words.filter(w => w.length > 2 && !stopWords.includes(w) && !types.includes(w) && w !== 'ebook' && w !== 'class' && w !== 'mock');

  return { types, keywords };
}

/**
 * Generates a conversational summary explaining the recommendations to the student.
 */
async function generateRecommendationSummary(results, studentQuery, apiKey) {
  if (!apiKey) return "Here are the top recommendations I found for you:";

  const MODELS = [
    'gemini-3.1-flash-lite',
    'gemini-3-flash-preview',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-pro'
  ];

  const systemInstruction = `
    You are a friendly, encouraging educational counselor for Draa.
    A student asked: "${studentQuery}"
    
    Based on their query, our system found the following top items in our database:
    ${JSON.stringify(results.map(r => ({ title: r.title, type: r.typeLabel, description: (r.description || '').substring(0, 100) })))}
    
    Write a short, friendly conversational response (2-3 sentences) explaining why these specific items are great for their goals.
    Do NOT use markdown lists or output raw JSON. Just write a warm, guiding paragraph. If no items were found, apologize and suggest they try different keywords.
  `;

  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const response = await axios.post(url, {
        contents: [{ parts: [{ text: systemInstruction }] }]
      }, { timeout: 30000 });

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text.trim();
    } catch (err) {
      const status = err.response?.status;
      if (status !== 404 && status !== 429) break;
    }
  }
  
  return "Here are the top recommendations tailored for your goals. Check them out below!";
}


module.exports = {
  parseWithGemini,
  parseLocally,
  parseRecommendationQuery,
  generateRecommendationSummary
};
