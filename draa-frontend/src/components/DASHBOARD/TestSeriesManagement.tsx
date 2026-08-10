// frontend/src/pages/TestSeriesManager.tsx
import React, { useEffect, useState } from"react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  DatePicker,
  Space,
  Typography,
  message,
  Popconfirm,
  Row,
  Col,
  Table,
  Divider,
  Layout,
  Select,
  Switch,
  Tag,
  Card,
  Modal,
  Breadcrumb,
  Steps,
  Collapse,
  Alert,
  Tooltip,
  Badge,
  Statistic, Segmented, Upload,
  Spin
} from"antd";
import { Link, useNavigate } from"react-router-dom";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  HomeOutlined,
  BookOutlined,
  FileTextOutlined,
  NumberOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  UploadOutlined,
  DownloadOutlined
} from"@ant-design/icons";
import moment from"moment";
import axios from"axios";
import { useParams } from"react-router-dom";
import url from"../../url";
import * as XLSX from'xlsx';

import Topbar from'./Topbar';
import Sidebar2 from"./Sidebar2";
import { getUserRole, getAuthHeaders } from"../../utils/global_auth";
import { validateQuestionRow } from"../../utils/questionValidator";
import usePageTitle from '../../hooks/usePageTitle';


const { Title, Text } = Typography;
const { Content, Footer } = Layout;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;
const { Panel } = Collapse;

// Enhanced TypeScript Interfaces
interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

interface Question {
  _id?: string;
  questionText: string;
  options: QuestionOption[];
  marks: number;
  negativeMarks: number;
  difficulty:'easy' |'medium' |'hard';
  explanation?: string;
}

// Hierarchical Interfaces
interface ExaminationCategory {
  _id: string;
  name: string;
  code: string;
  year: number;
  description?: string;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
  examinationCategory: string;
  description?: string;
  icon?: string;
  color?: string;
}

interface TopicCategory {
  _id: string;
  name: string;
  code: string;
  subject: string;
  description?: string;
  difficulty?: string;
  icon?: string;
  color?: string;
}

// Enhanced TestSeries Interface
interface TestSeries {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  subCategory?: string;
  examinationCategory?: ExaminationCategory;
  subject?: Subject;
  topicCategory?: TopicCategory;
  seriesNumber?: number;
  testType?:'practice' |'mock' |'previous_year' |'chapter_wise' |'full_syllabus';
  createdBy: string | { _id: string; name: string; email: string; tname?: string };
  questions: Question[];
  duration: number;
  totalMarks?: number;
  instructions?: string[];
  status:'draft' |'pending' |'approved' |'rejected';
  maxAttempts: number;
  isPaid: boolean;
  price?: number;
  tags?: string[];
  difficulty:'beginner' |'intermediate' |'advanced' |'mixed';
  startDate?: string;
  endDate?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface LoginUser {
  _id?: string;
  name?: string;
  tname?: string;
  aname?: string;
  email?: string;
}

const TestSeriesManager: React.FC = () => {
  usePageTitle('Test Series | Teacher');
  const { teacherId } = useParams();

  // Enhanced state variables
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [testSeries, setTestSeries] = useState<TestSeries[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [viewModal, setViewModal] = useState<boolean>(false);
  const [viewingTest, setViewingTest] = useState<TestSeries | null>(null);
  const [form] = Form.useForm();
  const [questionForm] = Form.useForm();
  const [questionModal, setQuestionModal] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [loginUser, setLoginuser] = useState<LoginUser>({});

  // NEW: Hierarchical state
  const [examinationCategories, setExaminationCategories] = useState<ExaminationCategory[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topicCategories, setTopicCategories] = useState<TopicCategory[]>([]);
  const [selectedExamCategory, setSelectedExamCategory] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTopicCategory, setSelectedTopicCategory] = useState<string>('');
  const [nextSeriesNumber, setNextSeriesNumber] = useState<number>(1);
  const [hierarchicalMode, setHierarchicalMode] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Legacy categories for backward compatibility
  const [legacyCategories, setLegacyCategories] = useState<{ _id: string; name: string }[]>([]);


  //questions mode
  const [questionInputMode, setQuestionInputMode] = useState<'manual' |'excel' |'image' |'ppt' |'latex'>('manual');

  const navigate = useNavigate();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  useEffect(() => {
    const role = getUserRole();

    //  Guest
    if (role ==="GUEST") {
      message.warning("Please login to continue", 6);
      navigate("/teacher-login");
      return;
    }

    //  Student
    if (role ==="STUDENT") {
      message.error("Students are not allowed to manage topic categories.", 6);
      navigate("/student-dashboard");
      return;
    }

    //  Admin
    if (role ==="ADMIN") {
      message.error("Admins are not allowed to manage topic categories.", 6);
      navigate("/admin-dashboard");
      return;
    }

    //  Teacher only
    const raw = localStorage.getItem("edudocs");
    if (!raw) {
      message.error("Session expired. Please login again.");
      navigate("/teacher-login");
      return;
    }

    try {
      const user = JSON.parse(raw);

      if (user.isVerified !== true) {
        message.error("Your account is not verified yet.", 7);
        navigate("/teacher-dashboard");
        return;
      }

      if (user.Status !=="approved") {
        message.error("Your account is not approved yet.", 7);
        navigate("/teacher-dashboard");
        return;
      }

      setLoginuser(user);
      setIsAuthChecked(true);
    } catch {
      message.error("Invalid session. Please login again.");
      navigate("/teacher-login");
    }
  }, [navigate]);
  //  NEW: Download Template Function
  const downloadQuestionTemplate = () => {
    const template = [
      {
        questionText:"What is the time complexity of binary search?",
        option1:"O(n)",
        option2:"O(log n)",
        option3:"O(n^2)",
        option4:"O(1)",
        correctOption:"2",
        marks: 1,
        negativeMarks: 0.25,
        difficulty:"medium",
        explanation:"Binary search divides the search space in half each time, giving O(log n) complexity"
      },
      {
        questionText:"Which data structure uses LIFO principle?",
        option1:"Queue",
        option2:"Stack",
        option3:"Array",
        option4:"Linked List",
        correctOption:"2",
        marks: 1,
        negativeMarks: 0.25,
        difficulty:"easy",
        explanation:"Stack follows Last In First Out (LIFO) principle"
      },
      {
        questionText:"What is polymorphism in OOP?",
        option1:"Data hiding",
        option2:"Inheritance",
        option3:"Multiple forms",
        option4:"Encapsulation",
        correctOption:"3",
        marks: 2,
        negativeMarks: 0.5,
        difficulty:"hard",
        explanation:"Polymorphism allows objects to take multiple forms through method overriding and overloading"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet,"Questions");

    // Set column widths for readability
    const wscols = [
      { wch: 60 }, // questionText
      { wch: 30 }, // option1
      { wch: 30 }, // option2
      { wch: 30 }, // option3
      { wch: 30 }, // option4
      { wch: 15 }, // correctOption
      { wch: 10 }, // marks
      { wch: 15 }, // negativeMarks
      { wch: 12 }, // difficulty
      { wch: 80 }, // explanation
    ];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook,"test_questions_template.xlsx");
    message.success(" Template downloaded successfully!");
  };

  // ppt template download 
  const downloadPPTTemplate = async () => {
    try {
      const response = await axios.get(
        `${url}/test-series/question-export/ppt-template`,
        { 
          responseType:"blob",
          headers: {
            ...getAuthHeaders()
          }
        }
      );

      const blob = new Blob([response.data], {
        type:"application/vnd.openxmlformats-officedocument.presentationml.presentation",
      });

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download ="question_import_template.pptx";
      link.click();
    } catch (err) {
      message.error("Failed to download PPT template");
    }
  };


  //latex download
  const downloadLatexTemplate = async () => {
    try {
      const res = await axios.get(
        `${url}/test-series/question-export/latex-template`,
        { 
          responseType:"blob",
          headers: {
            ...getAuthHeaders()
          }
        }
      );

      const blob = new Blob([res.data], { type:"text/plain" });
      const link = document.createElement("a");

      link.href = window.URL.createObjectURL(blob);
      link.download ="latex_question_template.tex";
      link.click();
    } catch {
      message.error("Failed to download LaTeX template");
    }
  };


  //  NEW: Bulk Upload Handler with Validation
  const handleBulkQuestionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type:"array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          message.warning(" The uploaded file is empty.");
          return;
        }

        // Transform uploaded data to question format with strict validation
        const parsedQuestions: Question[] = [];
        const errors: string[] = [];

        jsonData.forEach((row: any, index: number) => {
          const { question, errors: rowErrors } = validateQuestionRow(row, index, { 
            mode:'test-series',
            maxOptions: 10 // Support up to 10 options if present
          });

          if (rowErrors.length > 0) {
            errors.push(...rowErrors);
          }
          
          if (question) {
            parsedQuestions.push(question);
          }
        });


        // Show errors if any
        if (errors.length > 0) {
          Modal.error({
            title:' Validation Errors Found',
            content: (
              <div style={{ maxHeight: 400, overflowY:'auto' }}>
                <ul style={{ paddingLeft: 20 }}>
                  {errors.map((err, idx) => (
                    <li key={idx} style={{ color:'#ff4d4f', marginBottom: 8 }}>{err}</li>
                  ))}
                </ul>
              </div>
            ),
            width: 600
          });

          if (parsedQuestions.length === 0) {
            e.target.value ="";
            return;
          }
        }

        if (parsedQuestions.length === 0) {
          message.error(" No valid questions found in the file.");
          e.target.value ="";
          return;
        }

        // Append to existing questions
        setQuestions([...questions, ...parsedQuestions]);

        const successMsg = errors.length > 0
          ? ` ${parsedQuestions.length} valid questions uploaded (${errors.length} errors found)`
          : ` ${parsedQuestions.length} questions uploaded successfully!`;

        message.success(successMsg, 5);

        // Reset file input
        e.target.value ="";
      } catch (error) {
        console.error("Upload error:", error);
        message.error(" Error parsing file. Please check the format and try again.");
        e.target.value ="";
      }
    };

    reader.readAsArrayBuffer(file);
  };

  //image bulk 
  const handleImageOCR = async (file: File) => {
    try {
      message.loading({ content:'Extracting text...', key:'ocr' });

      const formData = new FormData();
      formData.append('image', file);

      const res = await axios.post(
        `${url}/test-series/question-import/image-ocr`,
        formData,
        { 
          headers: { 
'Content-Type':'multipart/form-data',
            ...getAuthHeaders()
          } 
        }
      );

      questionForm.setFieldsValue({
        questionText: res.data.data.questionText
      });


      setQuestionModal(true);
      message.success({ content:'Text extracted. Please review.', key:'ocr' });
    } catch {
      message.error('OCR failed. Please type manually.');
    }
  };


  //ppt upload block
  const handlePPTUpload = async (file: File) => {
    try {
      message.loading({ content:'Processing PPT...', key:'ppt' });

      const formData = new FormData();
      formData.append('ppt', file);

      const res = await axios.post(
        `${url}/test-series/question-import/ppt`,
        formData,
        { 
          headers: { 
'Content-Type':'multipart/form-data',
            ...getAuthHeaders()
          } 
        }
      );
      if (!res.data?.data?.questions || res.data.data.questions.length === 0) {
        message.warning('No valid questions found in PPT.');
        return;
      }

      setQuestions(prev => [...prev, ...res.data.data.questions]);


      message.success({
        content: `${res.data.data.questions.length} questions imported`,
        key:'ppt'
      });

    } catch {
      message.error('PPT import failed.');
    }
    // finally{
    //   (document.querySelector('input[type="file"]') as HTMLInputElement)?.value ='';

    // }
  };


  //latex

  const handleLatexUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("latex", file);

      const res = await axios.post(
        `${url}/test-series/question-import/latex`,
        formData,
        { 
          headers: { 
"Content-Type":"multipart/form-data",
            ...getAuthHeaders()
          } 
        }
      );

      setQuestions(prev => [...prev, ...res.data.data.questions]);
      message.success(`${res.data.data.questions.length} LaTeX questions imported`);
    } catch {
      message.error("LaTeX import failed");
    }
  };



  //  NEW: Clear all questions
  const clearAllQuestions = () => {
    if (questions.length === 0) {
      message.info("No questions to clear.");
      return;
    }

    Modal.confirm({
      title:'Clear All Questions?',
      content: `Are you sure you want to remove all ${questions.length} questions? This action cannot be undone.`,
      okText:'Yes, Clear All',
      okType:'danger',
      cancelText:'Cancel',
      onOk() {
        setQuestions([]);
        message.success("All questions cleared successfully.");
      }
    });
  };

  // NEW: Fetch examination categories
  const fetchExaminationCategories = async () => {
    try {
      const response = await axios.get(`${url}/test-series/navigation/examinations`, {
        headers: {
          ...getAuthHeaders()
        }
      });
      if (response.data.success) {
        setExaminationCategories(response.data.data.examinationCategories);
      }
    } catch (error) {
      console.error("Failed to load examination categories:", error);
    }
  };

  // NEW: Fetch subjects by examination category
  const fetchSubjects = async (examCategoryId: string) => {
    try {
      const response = await axios.get(`${url}/test-series/navigation/examinations/${examCategoryId}/subjects`, {
        headers: {
          ...getAuthHeaders()
        }
      });
      if (response.data.success) {
        setSubjects(response.data.data.subjects);
      }
    } catch (error) {
      console.error("Failed to load subjects:", error);
    }
  };

  // NEW: Fetch topic categories by subject
  const fetchTopicCategories = async (subjectId: string) => {
    try {
      const response = await axios.get(`${url}/test-series/navigation/subjects/${subjectId}/topics`, {
        headers: {
          ...getAuthHeaders()
        }
      });
      if (response.data.success) {
        setTopicCategories(response.data.data.topicCategories);
      }
    } catch (error) {
      console.error("Failed to load topic categories:", error);
    }
  };

  // MODIFIED: Fetch next series number
  const fetchNextSeriesNumber = async (topicId: string) => {
    try {
      const response = await axios.get(`${url}/test-series/helper/next-series-number/${topicId}`, {
        headers: {
          ...getAuthHeaders()
        }
      });
      if (response.data.success) {
        setNextSeriesNumber(response.data.data.nextSeriesNumber);
      }
    } catch (error) {
      console.error("Failed to get next series number:", error);
      setNextSeriesNumber(1);
    }
  };

  // Legacy: Fetch categories from API
  const fetchLegacyCategories = async () => {
    try {
      const response = await axios.get(`${url}/course/categories`, {
        headers: {
          ...getAuthHeaders()
        }
      });
      if (response.data.success) {
        setLegacyCategories(response.data.data.categories);
      }
    } catch (error) {
      console.error("Failed to load legacy categories:", error);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    fetchExaminationCategories();
    fetchLegacyCategories();
  }, []);

  // Handle examination category change
  const onExamCategoryChange = (examCategoryId: string) => {
    setSelectedExamCategory(examCategoryId);
    setSelectedSubject('');
    setSelectedTopicCategory('');
    setSubjects([]);
    setTopicCategories([]);
    setCurrentStep(1);
    if (examCategoryId) {
      fetchSubjects(examCategoryId);
    }
  };

  // Handle subject change
  const onSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setSelectedTopicCategory('');
    setTopicCategories([]);
    setCurrentStep(2);
    if (subjectId) {
      fetchTopicCategories(subjectId);
    }
  };

  // Handle topic category change
  const onTopicCategoryChange = (topicId: string) => {
    setSelectedTopicCategory(topicId);
    setCurrentStep(3);
    if (topicId) {
      fetchNextSeriesNumber(topicId);
    }
  };

  // Set the teacherId value in form
  useEffect(() => {
    if (teacherId) {
      form.setFieldsValue({
        createdBy: teacherId
      });
    }
  }, [teacherId, form]);

  // Fetch test series
  const fetchTestSeries = async (): Promise<void> => {
    if (!teacherId) return;

    setLoading(true);
    try {
      interface FetchResponse {
        data: {
          testSeries: TestSeries[];
          hierarchicalGrouping?: any;
        };
      }
      const resp = await axios.get<FetchResponse>(`${url}/test-series/teacher/${teacherId}`, {
        headers: {
          ...getAuthHeaders()
        }
      });
      setTestSeries(resp.data.data.testSeries);
    } catch (error) {
      message.error("Failed to load test series");
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestSeries();
  }, [teacherId]);

  // MODIFIED: Enhanced form submit handler
  const onFinish = async (values: any): Promise<void> => {
    if (questions.length === 0) {
      message.error('Please add at least one question');
      return;
    }

    // Validate all questions have at least one correct answer
    const invalidQuestions = questions.filter(q => !q.options.some(opt => opt.isCorrect));
    if (invalidQuestions.length > 0) {
      message.error(`${invalidQuestions.length} question(s) missing correct answer. Please review.`);
      return;
    }

    // Generate unique title
    let finalTitle = values.title;
    if (hierarchicalMode && selectedTopicCategory) {
      const topicName = topicCategories.find(t => t._id === selectedTopicCategory)?.name ||'';
      const seriesNum = values.seriesNumber || nextSeriesNumber;

      if (!finalTitle || finalTitle === topicName) {
        finalTitle = `${topicName} - Series ${seriesNum}`;
      }
    }

    // Build payload
    const payload = {
      title: finalTitle,
      description: values.description,
      duration: values.duration,
      maxAttempts: values.maxAttempts,
      difficulty: values.difficulty,
      isPaid: values.isPaid,
      price: values.price,
      startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : undefined,
      endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined,
      questions: questions,
      createdBy: teacherId,
      ...(hierarchicalMode ? {
        examinationCategory: selectedExamCategory,
        subject: selectedSubject,
        topicCategory: selectedTopicCategory,
        seriesNumber: values.seriesNumber || nextSeriesNumber,
        testType: values.testType ||'practice',
        uniqueIdentifier: `${selectedTopicCategory}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      } : {
        category: values.category,
        uniqueIdentifier: `${values.category}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })
    };

    try {
      const endpoint = hierarchicalMode ?'hierarchical/create' :'create';

      if (selectedTestId) {
        await axios.put(`${url}/test-series/${selectedTestId}`, payload, {
          headers: {
            ...getAuthHeaders()
          }
        });
        message.success("Test series updated successfully!");
      } else {
        await axios.post(`${url}/test-series/${endpoint}`, payload, {
          headers: {
            ...getAuthHeaders()
          }
        });
        message.success("Test series created successfully!");

        if (hierarchicalMode && selectedTopicCategory) {
          setNextSeriesNumber(nextSeriesNumber + 1);
        }
      }

      // Reset form
      form.resetFields();
      form.setFieldsValue({ createdBy: teacherId });
      setSelectedTestId(null);
      setQuestions([]);
      setCurrentStep(0);
      fetchTestSeries();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message ||"Failed to save test series";
      message.error(errorMessage);
      console.error("Error details:", error.response?.data);
    }
  };

  // Enhanced edit function
  const onEdit = (test: TestSeries): void => {
    const isHierarchicalTest = test.examinationCategory && test.subject && test.topicCategory;

    if (isHierarchicalTest) {
      setHierarchicalMode(true);
      setSelectedExamCategory(test.examinationCategory!._id);
      setSelectedSubject(test.subject!._id);
      setSelectedTopicCategory(test.topicCategory!._id);

      fetchSubjects(test.examinationCategory!._id);
      fetchTopicCategories(test.subject!._id);

      form.setFieldsValue({
        title: test.title,
        description: test.description,
        seriesNumber: test.seriesNumber,
        testType: test.testType,
        duration: test.duration,
        maxAttempts: test.maxAttempts,
        difficulty: test.difficulty,
        isPaid: test.isPaid,
        price: test.price,
        startDate: test.startDate ? moment(test.startDate) : null,
        endDate: test.endDate ? moment(test.endDate) : null,
        createdBy: teacherId
      });
    } else {
      setHierarchicalMode(false);
      form.setFieldsValue({
        title: test.title,
        description: test.description,
        category: test.category,
        duration: test.duration,
        maxAttempts: test.maxAttempts,
        difficulty: test.difficulty,
        isPaid: test.isPaid,
        price: test.price,
        startDate: test.startDate ? moment(test.startDate) : null,
        endDate: test.endDate ? moment(test.endDate) : null,
        createdBy: teacherId
      });
    }

    setQuestions(test.questions || []);
    setSelectedTestId(test._id);
  };

  // Delete function
  const onDelete = async (id: string): Promise<void> => {
    try {
      await axios.delete(`${url}/test-series/${id}`);
      message.success("Test series deleted successfully!");
      if (selectedTestId === id) {
        form.resetFields();
        form.setFieldsValue({ createdBy: teacherId });
        setSelectedTestId(null);
        setQuestions([]);
        setCurrentStep(0);
      }
      fetchTestSeries();
    } catch (error) {
      message.error("Failed to delete test series");
    }
  };

  // View function
  const onView = (test: TestSeries): void => {
    setViewingTest(test);
    setViewModal(true);
  };

  // Question management functions
  const addQuestion = (questionData: Question): void => {
    // Validate at least one correct answer
    const hasCorrectAnswer = questionData.options.some(opt => opt.isCorrect);
    if (!hasCorrectAnswer) {
      message.error("Please mark at least one option as correct!");
      return;
    }

    if (editingQuestion !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingQuestion] = questionData;
      setQuestions(updatedQuestions);
      setEditingQuestion(null);
      message.success("Question updated successfully!");
    } else {
      setQuestions([...questions, questionData]);
      message.success("Question added successfully!");
    }
    questionForm.resetFields();
    setQuestionModal(false);
  };

  const editQuestion = (index: number): void => {
    setEditingQuestion(index);
    questionForm.setFieldsValue(questions[index]);
    setQuestionModal(true);
  };

  const deleteQuestion = (index: number): void => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
    message.success("Question deleted successfully!");
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case'approved': return'green';
      case'pending': return'orange';
      case'rejected': return'red';
      case'draft': return'blue';
      default: return'default';
    }
  };

  // Enhanced table columns
  const columns = [
    {
      title:"Test Details",
      key:"details",
      width: 300,
      render: (_: any, record: TestSeries) => (
        <div>
          <div style={{ fontWeight:'bold', marginBottom: 4, fontSize:'14px' }}>{record.title}</div>
          {record.examinationCategory ? (
            <div style={{ fontSize:'11px', color:'#666' }}>
              <Breadcrumb separator="" style={{ fontSize:'11px' }}>
                <Breadcrumb.Item>{record.examinationCategory.code}</Breadcrumb.Item>
                <Breadcrumb.Item>{record.subject?.code}</Breadcrumb.Item>
                <Breadcrumb.Item>{record.topicCategory?.code}</Breadcrumb.Item>
                {record.seriesNumber && <Breadcrumb.Item>S{record.seriesNumber}</Breadcrumb.Item>}
              </Breadcrumb>
            </div>
          ) : (
            <div style={{ fontSize:'12px', color:'#666' }}>
              Category: {record.category}
            </div>
          )}
          <div style={{ marginTop: 4 }}>
            {record.testType && (
              <Tag size="small" color="blue">{record.testType.replace('_','').toUpperCase()}</Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title:"Stats",
      key:"stats",
      width: 120,
      render: (_: any, record: TestSeries) => (
        <div style={{ textAlign:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap: 4, marginBottom: 4, justifyContent:'center' }}>
            <FileTextOutlined style={{ color:'#1890ff', fontSize: 12 }} />
            <Text style={{ fontSize: 12 }}>{record.questions?.length || 0}</Text>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap: 4, marginBottom: 4, justifyContent:'center' }}>
            <ClockCircleOutlined style={{ color:'#52c41a', fontSize: 12 }} />
            <Text style={{ fontSize: 12 }}>{record.duration}m</Text>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap: 4, justifyContent:'center' }}>
            <TrophyOutlined style={{ color:'#fa8c16', fontSize: 12 }} />
            <Text style={{ fontSize: 12 }}>{record.totalMarks ||'N/A'}</Text>
          </div>
        </div>
      ),
    },
    {
      title:"Difficulty",
      dataIndex:"difficulty",
      key:"difficulty",
      width: 100,
      render: (difficulty: string) => (
        <Tag color={difficulty ==='advanced' ?'red' : difficulty ==='intermediate' ?'orange' :'green'} size="small">
          {difficulty?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title:"Status",
      dataIndex:"status",
      key:"status",
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)} size="small">
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title:"Created",
      dataIndex:"createdAt",
      key:"createdAt",
      width: 100,
      render: (text: string) => (
        <Text style={{ fontSize: 11 }}>{moment(text).format("DD/MM/YY")}</Text>
      ),
    },
    {
      title:"Actions",
      key:"actions",
      width: 120,
      render: (_: any, record: TestSeries) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button size="small" icon={<EyeOutlined />} onClick={() => onView(record)} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this test series?"
            onConfirm={() => onDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Calculate statistics
  const totalTests = testSeries.length;
  const approvedTests = testSeries.filter(t => t.status ==='approved').length;
  const pendingTests = testSeries.filter(t => t.status ==='pending').length;
  const totalQuestions = testSeries.reduce((sum, test) => sum + (test.questions?.length || 0), 0);

  // Calculate current test stats
  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
  const totalNegativeMarks = questions.reduce((sum, q) => sum + q.negativeMarks, 0);

  if (!isAuthChecked) {
    return (
      <Layout style={{ minHeight:"100vh" }}>
        <Content style={{ display:"flex", justifyContent:"center", alignItems:"center" }}>
          <Card>
            <Spin />
            <div style={{ marginTop: 12 }}>Checking permissions</div>
          </Card>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight:"100vh", background:'#f5f5f5' }}>
      <Sidebar2 />

      <Layout>
        <Topbar />

        <Content style={{ margin:"24px 16px", padding: 24 }}>
          {/* Header Section with Statistics */}
          <div style={{ marginBottom: 24 }}>
            <Title level={2} style={{ margin: 0, color:'#262626', marginBottom: 16 }}>
              Test Series Management
            </Title>
            {getUserRole() ==='ADMIN' && (
              <Space style={{ marginBottom: 16 }}>
                <Button type="primary" icon={<PlusOutlined />}>
                  <Link to={`/test-series/categories/${teacherId}`}>Category Management</Link>
                </Button>
                <Button type="primary" icon={<PlusOutlined />}>
                  <Link to={`/test-series/subjects/${teacherId}`}>Subject Management</Link>
                </Button>
                <Button type="primary" icon={<PlusOutlined />}>
                  <Link to={`/test-series/topics/${teacherId}`}>Create Topics</Link>
                </Button>
              </Space>
            )}
            <br />

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={12} sm={6}>
                <Card style={{ borderRadius: 12, textAlign:'center' }}>
                  <Statistic
                    title="Total Tests"
                    value={totalTests}
                    prefix={<BookOutlined style={{ color:'#1890ff' }} />}
                    valueStyle={{ color:'#1890ff', fontSize: 20 }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card style={{ borderRadius: 12, textAlign:'center' }}>
                  <Statistic
                    title="Approved"
                    value={approvedTests}
                    prefix={<CheckCircleOutlined style={{ color:'#52c41a' }} />}
                    valueStyle={{ color:'#52c41a', fontSize: 20 }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card style={{ borderRadius: 12, textAlign:'center' }}>
                  <Statistic
                    title="Pending"
                    value={pendingTests}
                    prefix={<ClockCircleOutlined style={{ color:'#fa8c16' }} />}
                    valueStyle={{ color:'#fa8c16', fontSize: 20 }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card style={{ borderRadius: 12, textAlign:'center' }}>
                  <Statistic
                    title="Questions"
                    value={totalQuestions}
                    prefix={<FileTextOutlined style={{ color:'#722ed1' }} />}
                    valueStyle={{ color:'#722ed1', fontSize: 20 }}
                  />
                </Card>
              </Col>
            </Row>
          </div>

          <Row gutter={24}>
            <Col xs={24} lg={10}>
              <Card style={{ marginBottom: 16, borderRadius: 12 }}>
                <div style={{ marginBottom: 16 }}>
                  <Title level={4} style={{ margin: 0 }}>
                    {selectedTestId ?"Edit Test Series" :"Create Test Series"}
                  </Title>
                </div>

                {/* Hierarchical Steps */}
                {hierarchicalMode && (
                  <div style={{ marginBottom: 24 }}>
                    <Steps current={currentStep} size="small">
                      <Step title="Exam" icon={<HomeOutlined />} />
                      <Step title="Subject" icon={<BookOutlined />} />
                      <Step title="Topic" icon={<FileTextOutlined />} />
                      <Step title="Series" icon={<NumberOutlined />} />
                    </Steps>
                  </div>
                )}

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}                
                  initialValues={{
                    createdBy: teacherId,
                    maxAttempts: 1,
                    difficulty:"intermediate",
                    testType:"practice"
                  }}
                >
                  {/* Created By Field */}
                  <Form.Item name="createdBy" label="Teacher ID">
                    <Input
                      disabled={true}
                      style={{
                        backgroundColor:'#f5f5f5',
                        color:'#8c8c8c',
                        cursor:'not-allowed'
                      }}
                    />
                  </Form.Item>

                  {/* Hierarchical Selection */}
                  {hierarchicalMode ? (
                    <>
                      <Alert
                        message="Multiple Series Allowed"
                        description="You can create multiple test series under the same subject and topic. Each will have a unique series number."
                        type="success"
                        showIcon
                        style={{ marginBottom: 16 }}
                      />

                      {/* Examination Category */}
                      <Form.Item
                        label="Examination Category"
                        rules={[{ required: true, message:"Please select examination category" }]}
                      >
                        <Select
                          placeholder="Select Examination (e.g., GATE 2026, JEE Advanced)"
                          value={selectedExamCategory}
                          onChange={onExamCategoryChange}
                        >
                          {examinationCategories.map(exam => (
                            <Option key={exam._id} value={exam._id}>
                              <Space>
                                <Tag>{exam.code}</Tag>
                                {exam.name} ({exam.year})
                              </Space>
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      {/* Subject */}
                      <Form.Item
                        label="Subject"
                        rules={[{ required: selectedExamCategory, message:"Please select subject" }]}
                      >
                        <Select
                          placeholder="Select Subject"
                          value={selectedSubject}
                          onChange={onSubjectChange}
                          disabled={!selectedExamCategory}
                        >
                          {subjects.map(subject => (
                            <Option key={subject._id} value={subject._id}>
                              <Space>
                                <Tag color={subject.color ||'blue'}>{subject.code}</Tag>
                                {subject.name}
                              </Space>
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      {/* Topic Category */}
                      <Form.Item
                        label="Topic Category"
                        rules={[{ required: selectedSubject, message:"Please select topic category" }]}
                      >
                        <Select
                          placeholder="Select Topic"
                          value={selectedTopicCategory}
                          onChange={onTopicCategoryChange}
                          disabled={!selectedSubject}
                        >
                          {topicCategories.map(topic => (
                            <Option key={topic._id} value={topic._id}>
                              <Space>
                                <Tag color={topic.color ||'green'}>{topic.code}</Tag>
                                {topic.name}
                              </Space>
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      {/* Series Number & Test Type */}
                      {selectedTopicCategory && (
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item
                              name="seriesNumber"
                              label={`Series Number (Suggested: ${nextSeriesNumber})`}
                              rules={[{ required: true, message:"Series number required" }]}
                              initialValue={nextSeriesNumber}
                            >
                              <InputNumber min={1} max={100} style={{ width:"100%" }} />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="testType" label="Test Type">
                              <Select>
                                <Option value="practice">Practice Test</Option>
                                <Option value="mock">Mock Test</Option>
                                <Option value="previous_year">Previous Year</Option>
                                <Option value="chapter_wise">Chapter Wise</Option>
                                <Option value="full_syllabus">Full Syllabus</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>
                      )}
                    </>
                  ) : (
                    /* Legacy Category Selection */
                    <>
                      <Alert
                        message="Legacy Mode"
                        description="Simple category-based test series creation"
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                      />

                      <Form.Item
                        name="category"
                        label="Category"
                        rules={[{ required: true, message:"Please select category" }]}
                      >
                        <Select placeholder="Select category">
                          {legacyCategories.map(cat => (
                            <Option key={cat._id} value={cat.name}>
                              {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </>
                  )}

                  {/* Common Fields */}
                  <Form.Item
                    name="title"
                    label="Test Title"
                    rules={[{ required: true, message:"Please enter the test title" }]}
                  >
                    <Input placeholder="Enter test title (auto-generated if empty)" />
                  </Form.Item>

                  <Form.Item name="description" label="Description">
                    <TextArea rows={3} placeholder="Enter test description" />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="duration"
                        label="Duration (minutes)"
                        rules={[{ required: true, message:"Please enter duration" }]}
                      >
                        <InputNumber min={1} max={300} style={{ width:"100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="maxAttempts" label="Max Attempts">
                        <InputNumber min={1} max={5} style={{ width:"100%" }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item name="difficulty" label="Difficulty">
                    <Select>
                      <Option value="beginner">Beginner</Option>
                      <Option value="intermediate">Intermediate</Option>
                      <Option value="advanced">Advanced</Option>
                      <Option value="mixed">Mixed</Option>
                    </Select>
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="startDate" label="Start Date">
                        <DatePicker style={{ width:"100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="endDate" label="End Date">
                        <DatePicker style={{ width:"100%" }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* PRICING SECTION - REPLACE YOUR EXISTING isPaid/price FIELDS WITH THIS */}
                  {/* 
                  <Divider> Pricing Information</Divider>

                  <Alert
                    message="Pricing Managed at Topic Level"
                    description={
                      <div>
                        <p>
                          <strong>Selected Topic:</strong> {selectedTopicCategory ?
                            topicCategories.find(t => t._id === selectedTopicCategory)?.name :
'Not selected yet'}
                        </p>
                        {selectedTopicCategory && (() => {
                          const topic = topicCategories.find(t => t._id === selectedTopicCategory);
                          return topic?.isPaid ? (
                            <p style={{ color:'#52c41a', fontWeight:'bold', marginTop: 8 }}>
                               This test will be accessible after purchasing"{topic.name}" for {topic.price}
                            </p>
                          ) : (
                            <p style={{ color:'#1890ff', fontWeight:'bold', marginTop: 8 }}>
                               This test will be freely accessible (Topic is free)
                            </p>
                          );
                        })()}
                        <p style={{ marginTop: 8, fontSize:'12px', color:'#666' }}>
                          All tests under the same topic category share the same access control.
                          Students buy the topic once and access all tests.
                        </p>
                      </div>
                    }
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  /> */}

                  {/* REMOVE/COMMENT OUT THESE OLD FIELDS:
<Form.Item name="isPaid" label="Is Paid?" valuePropName="checked">
  <Switch />
</Form.Item>

<Form.Item name="price" label="Price ()">
  <InputNumber />
</Form.Item>
*/}


                  <Divider>
                    Questions ({questions.length})
                    {questions.length > 0 && (
                      <span style={{ fontSize: 12, color:'#666', marginLeft: 8 }}>
                        | Total: +{totalMarks.toFixed(1)} | Negative: -{totalNegativeMarks.toFixed(2)}
                      </span>
                    )}
                  </Divider>

                  <Card size="small" style={{ marginBottom: 16 }}>
                    <Text strong>Select Question Input Method</Text>

                    <Select
                      value={questionInputMode}
                      onChange={(val) => setQuestionInputMode(val)}
                      style={{ width:'100%', marginTop: 8 }}
                    >
                      <Option value="manual">Type Manually</Option>
                      <Option value="excel">Excel Upload</Option>
                      <Option value="image">Image Upload (OCR)</Option>
                      <Option value="ppt">PPT Upload</Option>
                      <Option value="latex">LaTeX Upload</Option>
                    </Select>
                  </Card>


                  {/*  NEW: Bulk Upload Section */}

                  {questionInputMode ==='excel' && (
                    <Card size="small" style={{ marginBottom: 16, backgroundColor:'#f0f5ff' }}>
                      <Space direction="vertical" style={{ width:'100%' }}>
                        <Text strong> Bulk Question Upload</Text>
                        <Space wrap>
                          <Button
                            icon={<DownloadOutlined />}
                            onClick={downloadQuestionTemplate}
                            size="small"
                          >
                            Download Template
                          </Button>

                          <label htmlFor="bulk-question-upload">
                            <Button
                              icon={<UploadOutlined />}
                              type="primary"
                              size="small"
                              onClick={() => document.getElementById('bulk-question-upload')?.click()}
                            >
                              Upload Questions (Excel/CSV)
                            </Button>
                          </label>

                          <input
                            id="bulk-question-upload"
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleBulkQuestionUpload}
                            style={{ display:'none' }}
                          />

                          {questions.length > 0 && (
                            <Button
                              danger
                              size="small"
                              onClick={clearAllQuestions}
                            >
                              Clear All
                            </Button>
                          )}
                        </Space>

                        <Alert
                          message="Template Instructions"
                          description={
                            <ul style={{ marginBottom: 0, paddingLeft: 20, fontSize: 11 }}>
                              <li>Download template and fill with your questions</li>
                              <li>correctOption: 1 for option1, 2 for option2, etc.</li>
                              <li>marks: Positive marks (0.5 to 10)</li>
                              <li>negativeMarks: Penalty for wrong answer (0 to marks)</li>
                              <li>difficulty: easy, medium, or hard</li>
                            </ul>
                          }
                          type="info"
                          showIcon
                          style={{ fontSize: 11 }}
                        />
                      </Space>
                    </Card>
                  )}


                  {/* //image upload   */}
                  {questionInputMode ==='image' && (
                    <Card size="small" style={{ marginBottom: 16 }}>
                      <Text strong>Upload Question Image</Text>

                      <Upload
                        accept="image/*"
                        beforeUpload={(file) => {
                          handleImageOCR(file);
                          return false;
                        }}
                        showUploadList={false}
                      >
                        <Button icon={<UploadOutlined />} style={{ marginTop: 8 }}>
                          Upload Image (OCR)
                        </Button>
                      </Upload>

                      <Alert
                        message="Image will be converted to editable text"
                        type="info"
                        showIcon
                        style={{ marginTop: 8, fontSize: 11 }}
                      />
                    </Card>
                  )}


                  {/* //ppt */}

                  {questionInputMode ==='ppt' && (
                    <Card size="small" style={{ marginBottom: 16 }}>
                      <Text strong>PPT Import (1 Slide = 1 Question)</Text>

                      <Upload
                        accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"

                        beforeUpload={(file) => {
                          handlePPTUpload(file);
                          return false;
                        }}
                        showUploadList={false}
                      >
                        <Button
                          icon={<DownloadOutlined />}
                          onClick={downloadPPTTemplate}
                        >
                          Export PPT Template
                        </Button>


                        <Button icon={<UploadOutlined />} style={{ marginTop: 8 }}>
                          Upload PPT
                        </Button>
                      </Upload>

                      <Alert
                        message="Each slide will be converted into one question"
                        type="info"
                        showIcon
                        style={{ marginTop: 8, fontSize: 11 }}
                      />
                    </Card>
                  )}


                  {/* //latex upload */}

                  {questionInputMode ==="latex" && (
                    <Card size="small" style={{ marginBottom: 16 }}>
                      <Text strong>LaTeX File Import</Text>

                      <Space style={{ marginTop: 8 }}>
                        <Button
                          icon={<DownloadOutlined />}
                          onClick={downloadLatexTemplate}
                        >
                          Download LaTeX Template
                        </Button>

                        <Upload
                          accept=".tex,.txt"
                          beforeUpload={(file) => {
                            handleLatexUpload(file);
                            return false;
                          }}
                          showUploadList={false}
                        >
                          <Button icon={<UploadOutlined />}>
                            Upload LaTeX File
                          </Button>
                        </Upload>
                      </Space>

                      <Alert
                        message="Use the template format exactly (=== separator required)"
                        type="info"
                        showIcon
                        style={{ marginTop: 8, fontSize: 11 }}
                      />
                    </Card>
                  )}

                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() => setQuestionModal(true)}
                    block
                    style={{ marginBottom: 16 }}
                  >
                    Add Question Manually
                  </Button>

                  {questions.length > 0 && (
                    <div style={{ marginBottom: 16, maxHeight: 300, overflowY:'auto' }}>
                      {questions.map((q: Question, index: number) => (
                        <Card
                          key={index}
                          size="small"
                          title={
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                              <span style={{ fontSize: 12 }}>Q{index + 1}: {q.questionText?.substring(0, 50)}...</span>
                              <Space>
                                <Tag color="blue">+{q.marks}</Tag>
                                <Tag color="red">-{q.negativeMarks}</Tag>
                              </Space>
                            </div>
                          }
                          extra={
                            <Space>
                              <Button size="small" icon={<EditOutlined />} onClick={() => editQuestion(index)} />
                              <Button size="small" danger icon={<DeleteOutlined />} onClick={() => deleteQuestion(index)} />
                            </Space>
                          }
                          style={{ marginBottom: 8 }}
                        >
                          <div style={{ fontSize: 11 }}>
                            <Tag color={q.difficulty ==='hard' ?'red' : q.difficulty ==='medium' ?'orange' :'green'}>
                              {q.difficulty.toUpperCase()}
                            </Tag>
                            <Text type="secondary">{q.options.length} options | </Text>
                            <Text type="success">
                              {q.options.filter(opt => opt.isCorrect).length} correct
                            </Text>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  <Form.Item>
                    <Space style={{ width:'100%' }}>
                      <Button type="primary" htmlType="submit" icon={<PlusOutlined />} style={{ flex: 1 }}>
                        {selectedTestId ?"Update Test Series" :"Create Test Series"}
                      </Button>
                      {selectedTestId && (
                        <Button
                          onClick={() => {
                            form.resetFields();
                            form.setFieldsValue({ createdBy: teacherId });
                            setSelectedTestId(null);
                            setQuestions([]);
                            setCurrentStep(0);
                            setSelectedExamCategory('');
                            setSelectedSubject('');
                            setSelectedTopicCategory('');
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </Space>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            {/* Test Series Display */}
            <Col xs={24} lg={14}>
              <Card style={{ borderRadius: 12 }}>
                <Title level={4} style={{ margin: 0, marginBottom: 16 }}>
                  Test Series List
                  <Tag color="blue" style={{ marginLeft: 8 }}>{testSeries.length} Total</Tag>
                </Title>

                <Table
                  columns={columns}
                  dataSource={testSeries}
                  rowKey="_id"
                  loading={loading}
                  scroll={{ x:"100%" }}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} test series`
                  }}
                  size="small"
                />
              </Card>
            </Col>
          </Row>

          {/* Question Modal */}
          <Modal
            title={editingQuestion !== null ?"Edit Question" :"Add Question"}
            open={questionModal}
            onCancel={() => {
              setQuestionModal(false);
              setEditingQuestion(null);
              questionForm.resetFields();
            }}
            footer={null}
            width={900}
          >
            <Form form={questionForm} layout="vertical" onFinish={addQuestion}>
              <Form.Item
                name="questionText"
                label="Question Text"
                rules={[{ required: true, message:'Question text is required' }]}
              >
                <TextArea rows={4} placeholder="Enter your question" />
              </Form.Item>

              <Form.Item label="Options">
                <Form.List name="options" initialValue={[{}, {}, {}, {}]}>
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Space key={key} style={{ display:'flex', marginBottom: 8 }} align="baseline">
                          <Form.Item
                            {...restField}
                            name={[name,'text']}
                            rules={[{ required: true, message:'Option text is required' }]}
                          >
                            <Input placeholder={`Option ${name + 1}`} style={{ width: 300 }} />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name,'isCorrect']}
                            valuePropName="checked"
                          >
                            <Switch checkedChildren="Correct" unCheckedChildren="Wrong" />
                          </Form.Item>
                          {fields.length > 2 && (
                            <Button onClick={() => remove(name)} danger size="small">Remove</Button>
                          )}
                        </Space>
                      ))}
                      {fields.length < 6 && (
                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                          Add Option
                        </Button>
                      )}
                    </>
                  )}
                </Form.List>
              </Form.Item>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="marks"
                    label="Positive Marks"
                    initialValue={1}
                    rules={[
                      { required: true, message:'Marks required' },
                      { type:'number', min: 0.5, max: 10, message:'Marks must be 0.5-10' }
                    ]}
                  >
                    <InputNumber min={0.5} max={10} step={0.5} style={{ width:'100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="negativeMarks"
                    label="Negative Marks"
                    initialValue={0.25}
                    rules={[
                      { type:'number', min: 0, max: 5, message:'Must be 0-5' }
                    ]}
                  >
                    <InputNumber min={0} max={5} step={0.25} style={{ width:'100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="difficulty" label="Difficulty" initialValue="medium">
                    <Select>
                      <Option value="easy">Easy</Option>
                      <Option value="medium">Medium</Option>
                      <Option value="hard">Hard</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="explanation" label="Explanation (Optional)">
                <TextArea rows={3} placeholder="Explain the correct answer" />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    {editingQuestion !== null ?'Update Question' :'Add Question'}
                  </Button>
                  <Button onClick={() => {
                    setQuestionModal(false);
                    setEditingQuestion(null);
                    questionForm.resetFields();
                  }}>
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>

          {/* Enhanced View Test Modal */}
          <Modal
            title="Test Series Details"
            open={viewModal}
            onCancel={() => setViewModal(false)}
            footer={[<Button key="close" onClick={() => setViewModal(false)}>Close</Button>]}
            width={1000}
          >
            {viewingTest && (
              <div>
                {/* Hierarchical Breadcrumb */}
                {viewingTest.examinationCategory && (
                  <div style={{ marginBottom: 16, padding: 12, backgroundColor:'#f5f5f5', borderRadius: 4 }}>
                    <Text strong>Hierarchy:</Text>
                    <br />
                    <Breadcrumb separator="" style={{ marginTop: 8 }}>
                      <Breadcrumb.Item>
                        <Tag color="red">{viewingTest.examinationCategory.code}</Tag>
                        {viewingTest.examinationCategory.name}
                      </Breadcrumb.Item>
                      <Breadcrumb.Item>
                        <Tag color="blue">{viewingTest.subject?.code}</Tag>
                        {viewingTest.subject?.name}
                      </Breadcrumb.Item>
                      <Breadcrumb.Item>
                        <Tag color="green">{viewingTest.topicCategory?.code}</Tag>
                        {viewingTest.topicCategory?.name}
                      </Breadcrumb.Item>
                      <Breadcrumb.Item>
                        <Tag color="purple">Series {viewingTest.seriesNumber}</Tag>
                        {viewingTest.testType?.replace('_','').toUpperCase()}
                      </Breadcrumb.Item>
                    </Breadcrumb>
                  </div>
                )}

                <Row gutter={16}>
                  <Col span={12}>
                    <p><strong>Title:</strong> {viewingTest.title}</p>
                    <p><strong>Category:</strong> {viewingTest.category ||'Hierarchical'}</p>
                    <p><strong>Duration:</strong> {viewingTest.duration} minutes</p>
                    <p><strong>Max Attempts:</strong> {viewingTest.maxAttempts}</p>
                  </Col>
                  <Col span={12}>
                    <p><strong>Questions:</strong> {viewingTest.questions?.length || 0}</p>
                    <p><strong>Total Marks:</strong> {viewingTest.totalMarks}</p>
                    <p><strong>Status:</strong>
                      <Tag color={getStatusColor(viewingTest.status)} style={{ marginLeft: 8 }}>
                        {viewingTest.status?.toUpperCase()}
                      </Tag>
                    </p>
                    <p><strong>Type:</strong> {viewingTest.isPaid ? <Tag color="gold">PAID</Tag> : <Tag color="green">FREE</Tag>}</p>
                  </Col>
                </Row>

                <p><strong>Description:</strong> {viewingTest.description ||'No description provided'}</p>

                {viewingTest.rejectionReason && (
                  <div style={{ marginTop: 16, padding: 12, backgroundColor:'#fff2f0', border:'1px solid #ffccc7', borderRadius: 4 }}>
                    <p style={{ color:'#cf1322', margin: 0 }}><strong>Rejection Reason:</strong> {viewingTest.rejectionReason}</p>
                  </div>
                )}

                {/* Question Preview */}
                {viewingTest.questions && viewingTest.questions.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Divider>Questions Preview</Divider>
                    {viewingTest.questions.slice(0, 3).map((q, idx) => (
                      <Card key={idx} size="small" style={{ marginBottom: 8 }}>
                        <div>
                          <Text strong>Q{idx + 1}. {q.questionText}</Text>
                          <div style={{ marginTop: 8 }}>
                            <Tag color="blue">+{q.marks}</Tag>
                            <Tag color="red">-{q.negativeMarks}</Tag>
                            <Tag color={q.difficulty ==='hard' ?'red' : q.difficulty ==='medium' ?'orange' :'green'}>
                              {q.difficulty.toUpperCase()}
                            </Tag>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {viewingTest.questions.length > 3 && (
                      <Text type="secondary">... and {viewingTest.questions.length - 3} more questions</Text>
                    )}
                  </div>
                )}
              </div>
            )}
          </Modal>
        </Content>

        <Footer style={{ textAlign:"center", background:'#fafafa', borderTop:'1px solid #f0f0f0' }}>
          <b>&copy; 2025 Draa. All Rights Reserved.</b>
        </Footer>
      </Layout>

      {/* Custom Styles */}
      <style>{`
        .ant-card {
          transition: all 0.3s ease;
        }
        .ant-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .ant-table-tbody > tr:hover > td {
          background: #e6f7ff !important;
        }
        .ant-btn-primary {
          background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
          border: none;
        }
        .ant-btn-primary:hover {
          background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(24,144,255,0.3);
        }
      `}</style>
    </Layout>
  );
};

export default TestSeriesManager;
