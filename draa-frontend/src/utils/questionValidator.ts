/**
 * Shared utility for validating question data from bulk uploads (Excel/CSV).
 * Supports different modes for Test Series and Exams.
 */

export interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface ParsedQuestion {
  questionText: string;
  type:'mcq' |'short' |'paragraph';
  options: QuestionOption[] | string[];
  correctAnswer?: string;
  correctOption?: number;
  marks: number;
  negativeMarks?: number;
  difficulty:'easy' |'medium' |'hard';
  explanation?: string;
}

export interface ValidationConfig {
  mode:'test-series' |'exam';
  requireQuestionText?: boolean;
  maxOptions?: number;
  allowShortAnswer?: boolean;
}

export const validateQuestionRow = (
  row: any,
  index: number,
  config: ValidationConfig
): { question?: any; errors: string[] } => {
  const rowNum = index + 2; // Excel row number
  const errors: string[] = [];

  // Helper to safely get string values
  const getStr = (val: any) => (val !== undefined && val !== null) ? String(val).trim() :"";

  // Helper for flexible header matching (case-insensitive, ignore spaces/underscores)
  const rowKeys = Object.keys(row);
  const getValFlexible = (targetKey: string) => {
    const normalizedTarget = targetKey.toLowerCase().replace(/[\s_-]/g,'');
    const actualKey = rowKeys.find(k => k.toLowerCase().replace(/[\s_-]/g,'') === normalizedTarget);
    return actualKey ? row[actualKey] : undefined;
  };

  // Check if row is completely empty before validating
  const hasAnyData = rowKeys.some(key => getStr(row[key]) !=="");
  if (!hasAnyData) {
    return { errors: [] }; // Skip empty rows without error
  }

  const qText = getStr(getValFlexible('questionText') || getValFlexible('question'));
  const qType = getStr(getValFlexible('type') ||'mcq').toLowerCase();
  
  // 1. Validate Question Text
  if (config.requireQuestionText !== false && !qText) {
    errors.push(`Row ${rowNum}: Missing question text`);
  }

  // 2. Validate Type
  if (qType !=='mcq' && qType !=='short' && qType !=='paragraph') {
    errors.push(`Row ${rowNum}: Invalid question type"${qType}". Use mcq, short, or paragraph.`);
    return { errors };
  }

  // 3. Handle MCQ Validation
  let options: any[] = [];
  let correctOptionIndex = -1;

  if (qType ==='mcq') {
    const maxOpts = config.maxOptions || 6;
    
    for (let i = 1; i <= maxOpts; i++) {
      const val = getStr(getValFlexible(`option${i}`));
      if (val !=="") {
        options.push(val);
      }
    }

    if (options.length < 2) {
      errors.push(`Row ${rowNum}: MCQ requires at least 2 options (option1, option2, etc.)`);
    }

    // Determine correct option
    const correctOptionVal = getValFlexible('correctOption');
    const correctOptionStr = getStr(correctOptionVal);
    const correctAnswerVal = getValFlexible('correctAnswer');
    const correctAnswerText = getStr(correctAnswerVal);

    if (correctOptionStr !=="") {
      const num = parseInt(correctOptionStr);
      if (isNaN(num) || num < 1 || num > options.length) {
        errors.push(`Row ${rowNum}: Correct option (${correctOptionStr}) is invalid. Must be between 1 and ${options.length}.`);
      } else {
        correctOptionIndex = num - 1;
      }
    } else if (correctAnswerText !=="") {
      // Find matching option text
      correctOptionIndex = options.findIndex(opt => opt === correctAnswerText);
      if (correctOptionIndex === -1) {
        errors.push(`Row ${rowNum}: Correct answer text does not match any provided options.`);
      }
    } else {
      errors.push(`Row ${rowNum}: Correct option or correct answer text is required for MCQ.`);
    }
  }

  // 4. Validate Marks
  const marks = parseFloat(getStr(getValFlexible('marks') || 1));
  if (isNaN(marks) || marks <= 0) {
    errors.push(`Row ${rowNum}: Marks must be a positive number.`);
  }

  const negativeMarks = parseFloat(getStr(getValFlexible('negativeMarks') || 0));
  if (config.mode ==='test-series' && (isNaN(negativeMarks) || negativeMarks < 0)) {
    errors.push(`Row ${rowNum}: Negative marks must be 0 or greater.`);
  }

  // 5. Validate Difficulty
  let difficulty = getStr(getValFlexible('difficulty') ||'medium').toLowerCase();
  if (!['easy','medium','hard'].includes(difficulty)) {
    difficulty ='medium'; // Default fallback instead of error
  }

  if (errors.length > 0) {
    return { errors };
  }

  // Build the result based on mode
  if (config.mode ==='test-series') {
    return {
      question: {
        questionText: qText,
        options: options.map((opt, i) => ({
          text: opt,
          isCorrect: i === correctOptionIndex
        })),
        marks: marks,
        negativeMarks: negativeMarks,
        difficulty: difficulty,
        explanation: getStr(getValFlexible('explanation'))
      },
      errors: []
    };
  } else {
    // Exam mode
    return {
      question: {
        questionText: qText,
        type: qType,
        options: options, // string array for exams
        correctAnswer: qType ==='mcq' ? options[correctOptionIndex] :"",
        marks: marks,
        explanation: getStr(getValFlexible('explanation')),
        difficulty: difficulty
      },
      errors: []
    };
  }
};

