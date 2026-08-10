import { useEffect, useState } from'react';
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  TimePicker,
  InputNumber,
  Space,
  Divider,
  message,
  Typography,
  Card,
  Layout,
  Alert,
} from"antd";
import { PlusOutlined, DeleteOutlined, UploadOutlined, DownloadOutlined } from"@ant-design/icons";
import { Modal } from'antd';
import axios from'axios';

import { useNavigate } from'react-router-dom';
import Sidebar from'./Sidebar';
import Topbar from'./Topbar';
import Sidebar2 from'./Sidebar2';
import url from'../../url';
import moment from"moment";
import * as XLSX from'xlsx';
import { getUserRole } from'../../utils/global_auth';
import { validateQuestionRow } from"../../utils/questionValidator";
import usePageTitle from '../../hooks/usePageTitle';


const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;
const { Content, Footer } = Layout;

const ExamCreation = () => {
  const navigate = useNavigate();
  const [loginUser, setLoginuser] = useState<{
    id?: string;
    name?: string;
    tname?: string;
    aname?: string;
    isVerified?: boolean;
    Status?: string;
  }>({});
  const [form] = Form.useForm();
  const [questions, setQuestions] = useState<any[]>([]);

  //  UPDATED: Enhanced Auth & Teacher Verification Check
  useEffect(() => {
    const role = getUserRole();

    //  Guest
    if (role ==="GUEST") {
      message.warning("Please login to continue", 6);
      navigate("/admin-login");
      return;
    }

    //  Student
    if (role ==="STUDENT") {
      message.error("Students are not allowed to create exams.", 6);
      navigate("/student-dashboard");
      return;
    }

    const raw = localStorage.getItem("edudocs");
    if (!raw) {
      message.error("Session expired. Please login again.");
      navigate("/admin-login");
      return;
    }

    try {
      const user = JSON.parse(raw);

      //  Teacher validation
      if (role ==="TEACHER") {
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
      }

      //  Admin OR verified teacher
      setLoginuser(user);
    } catch {
      message.error("Invalid session. Please login again.");
      navigate("/admin-login");
    }
  }, [navigate]);
  type Course = { _id: string; title: string };
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeacherCourses = async () => {
      if (!loginUser.id) {
        return;
      }
      setLoading(true);

      try {
        const response = await axios.get(`${url}/course/courseDetails/teacher/${loginUser.id}`);
        setCourses(response.data.courses);
        message.success('Courses loaded successfully!');
      } catch (error: any) {
        console.error("Error fetching courses:", error);
        if (error.response) {
          message.error(error.response.data.message ||'Failed to fetch courses.');
        } else if (error.request) {
          message.error('No response received from the server. Please check your network connection.');
        } else {
          message.error('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherCourses();
  }, [loginUser.id]);

  //  AUTH GUARD: Don't render form until user is verified
  if (!loginUser || Object.keys(loginUser).length === 0) {
    return (
      <Layout style={{ minHeight:"100vh" }}>
        <Content style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
          <Card>
            <Typography.Text>Checking authentication and permissions...</Typography.Text>
          </Card>
        </Content>
      </Layout>
    );
  }

  //  NEW: Download Template Function
  const downloadTemplate = () => {
    const template = [
      {
        questionText:"What is React?",
        type:"mcq",
        option1:"A library",
        option2:"A framework",
        option3:"A language",
        option4:"A database",
        option5:"",
        correctAnswer:"A library",
        marks: 2,
        explanation:"React is a JavaScript library for building user interfaces"
      },
      {
        questionText:"Explain the virtual DOM",
        type:"short",
        option1:"",
        option2:"",
        option3:"",
        option4:"",
        option5:"",
        correctAnswer:"",
        marks: 5,
        explanation:"Virtual DOM is a lightweight copy of the actual DOM"
      },
      {
        questionText:"Describe React lifecycle methods in detail",
        type:"paragraph",
        option1:"",
        option2:"",
        option3:"",
        option4:"",
        option5:"",
        correctAnswer:"",
        marks: 10,
        explanation:"Lifecycle methods are special methods in class components"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet,"Questions");

    // Set column widths for better readability
    const wscols = [
      { wch: 50 }, // questionText
      { wch: 12 }, // type
      { wch: 25 }, // option1
      { wch: 25 }, // option2
      { wch: 25 }, // option3
      { wch: 25 }, // option4
      { wch: 25 }, // option5
      { wch: 25 }, // correctAnswer
      { wch: 8 },  // marks
      { wch: 50 }, // explanation
    ];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook,"exam_questions_template.xlsx");
    message.success(" Template downloaded successfully!");
  };

  //  NEW: Bulk Upload Handler
  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type:"array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          message.warning(" The uploaded file is empty.");
          return;
        }

        // Transform uploaded data to question format with standardized validation
        const parsedQuestions: any[] = [];
        const errors: string[] = [];

        jsonData.forEach((row: any, index: number) => {
          const { question, errors: rowErrors } = validateQuestionRow(row, index, { 
            mode:'exam',
            maxOptions: 10 
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
          return;
        }

        // Append to existing questions
        setQuestions([...questions, ...parsedQuestions]);
        message.success(` ${parsedQuestions.length} questions uploaded successfully!`);

        // Reset file input
        e.target.value ="";
      } catch (error) {
        console.error("Upload error:", error);
        message.error(" Error parsing file. Please check the format and try again.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        type:"mcq",
        questionText:"",
        options: [""],
        correctAnswer:"",
        explanation:"",
        marks: 1,
      },
    ]);
  };

  console.log(loading);

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateMCQOption = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const addMCQOption = (qIndex: number) => {
    const updated = [...questions];
    if (updated[qIndex].options.length < 5) {
      updated[qIndex].options.push("");
      setQuestions(updated);
    } else {
      message.warning("Maximum 5 options allowed.");
    }
  };

  const removeMCQOption = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    if (updated[qIndex].options.length > 1) {
      updated[qIndex].options.splice(optIndex, 1);
      setQuestions(updated);
    } else {
      message.warning("At least 1 option is required.");
    }
  };

  //  NEW: Remove individual question
  const removeQuestion = (index: number) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
    message.success("Question removed successfully.");
  };

  //  NEW: Clear all questions
  const clearAllQuestions = () => {
    if (questions.length === 0) {
      message.info("No questions to clear.");
      return;
    }
    setQuestions([]);
    message.success("All questions cleared successfully.");
  };

  const handleSubmit = async (values: any) => {
    if (questions.length === 0) {
      message.error(" Please add at least one question to create an exam.");
      return;
    }

    // Validate all questions
    const invalidQuestions = questions.filter((q, index) => {
      const qText = (q.questionText ||"").toString().trim();
      if (!qText) {
        message.error(` Question ${index + 1}: Question text is required.`);
        return true;
      }
      if (q.type ==="mcq") {
        if (q.options.filter((opt: string) => opt.trim() !=="").length < 2) {
          message.error(` Question ${index + 1}: MCQ must have at least 2 options.`);
          return true;
        }
        if (!q.correctAnswer.trim()) {
          message.error(` Question ${index + 1}: Correct answer is required for MCQ.`);
          return true;
        }
      }
      return false;
    });

    if (invalidQuestions.length > 0) {
      return;
    }

    const scheduledAt = values.scheduledDate && values.scheduledTime
      ? moment(values.scheduledDate)
        .set({
          hour: values.scheduledTime.hour(),
          minute: values.scheduledTime.minute(),
        })
        .toISOString()
      : null;

    const payload = {
      title: values.title,
      subject: values.subject,
      instructions: values.instructions,
      totalMarks: questions.reduce((sum, q) => sum + Number(q.marks || 0), 0),
      durationMinutes: values.duration,
      scheduledAt,
      courseId: values.courseId,
      createdBy: loginUser?.id ||"64cce3fc7b6b990cf029394b",
      questions,
      seo: {
        title: values.seoTitle,
        keywords: values.seoKeywords ? values.seoKeywords.split(",").map((k: string) => k.trim()) : [],
        description: values.seoDescription,
      }
    };

    try {
      await axios.post(`${url}/exam/create`, payload);
      message.success(" Exam Created Successfully!");
      form.resetFields();
      setQuestions([]);
    } catch (err) {
      console.error("Error creating exam:", err);
      message.error(" Error creating exam. Please try again.");
    }
  };

  return (
    <Layout style={{ minHeight:"100vh" }}>
      {/* Sidebar based on role */}
      {"aname" in (loginUser || {}) ? <Sidebar /> : <Sidebar2 />}

      <Layout>
        <Topbar />

        <Content style={{ margin:"24px 16px", padding: 24 }}>
          <Card
            bordered
            style={{ padding:"2rem", borderRadius:"16px", boxShadow:"0 4px 14px rgba(0,0,0,0.1)" }}
          >
            <Title level={3} style={{ textAlign:"center", marginBottom: 20 }}>
              Create Exam
            </Title>

            {/*  Status Information for Teachers */}
            {loginUser.tname && (
              <Alert
                message="Teacher Account Status"
                description={
                  <div>
                    <div> <strong>Verified:</strong> {loginUser.isVerified ?'Yes' :'No'}</div>
                    <div> <strong>Status:</strong> {loginUser.Status}</div>
                    <div style={{ marginTop: 8, color:'#52c41a' }}>
                      Your account is verified and approved. You can create exams.
                    </div>
                  </div>
                }
                type="success"
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}

            <Form layout="vertical" form={form} onFinish={handleSubmit}>
              <Form.Item name="createdBy" initialValue={loginUser?.id} hidden>
                <Input type="hidden" />
              </Form.Item>

              <Form.Item label="Exam Title" name="title" rules={[{ required: true, message:'Please enter exam title' }]}>
                <Input size="large" placeholder="Enter exam title" />
              </Form.Item>

              <Form.Item label="Subject" name="subject" rules={[{ required: true, message:'Please enter subject' }]}>
                <Input size="large" placeholder="Enter subject name" />
              </Form.Item>

              <Form.Item label="Instructions" name="instructions">
                <TextArea rows={3} placeholder="Any specific instructions..." />
              </Form.Item>

              <Space size="large" wrap>
                <Form.Item label="Duration (minutes)" name="duration" rules={[{ required: true, message:'Please enter duration' }]}>
                  <InputNumber min={1} size="large" />
                </Form.Item>

                <Form.Item label="Scheduled Date" name="scheduledDate">
                  <DatePicker size="large" />
                </Form.Item>

                <Form.Item label="Course" name="courseId" rules={[{ required: true, message:'Please select a course' }]}>
                  <Select placeholder="Choose Course" size="large" style={{ minWidth: 200 }}>
                    {courses.map((courseSel) => (
                      <Select.Option key={courseSel._id} value={courseSel._id}>
                        {courseSel.title}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label="Scheduled Time" name="scheduledTime">
                  <TimePicker format="HH:mm" size="large" />
                </Form.Item>
              </Space>

              <Divider>SEO Details</Divider>

              <Form.Item label="SEO Title" name="seoTitle">
                <Input size="large" placeholder="Enter SEO title" />
              </Form.Item>

              <Form.Item label="SEO Keywords (comma separated)" name="seoKeywords">
                <Input size="large" placeholder="keyword1, keyword2, keyword3" />
              </Form.Item>

              <Form.Item label="SEO Description" name="seoDescription">
                <TextArea rows={2} placeholder="Enter SEO description..." />
              </Form.Item>

              {/*  NEW: Bulk Upload Section */}
              <Divider>Bulk Question Upload</Divider>

              <Space size="large" style={{ marginBottom: 24 }} wrap>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={downloadTemplate}
                  type="default"
                  size="large"
                >
                  Download Template
                </Button>

                <label htmlFor="bulk-upload">
                  <Button
                    icon={<UploadOutlined />}
                    type="primary"
                    size="large"
                    onClick={() => document.getElementById('bulk-upload')?.click()}
                  >
                    Upload Questions (Excel/CSV)
                  </Button>
                </label>

                <input
                  id="bulk-upload"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleBulkUpload}
                  style={{ display:'none' }}
                />
              </Space>

              <Alert
                message=" Bulk Upload Instructions"
                description={
                  <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                    <li><strong>Step 1:</strong> Click"Download Template" to get the Excel format</li>
                    <li><strong>Step 2:</strong> Fill in your questions following the template format</li>
                    <li><strong>For MCQ:</strong> Fill option1-5 columns and specify correctAnswer</li>
                    <li><strong>For short/paragraph:</strong> Leave option columns blank</li>
                    <li><strong>Step 3:</strong> Upload the completed file using"Upload Questions" button</li>
                    <li><strong>Note:</strong> Uploaded questions will be added to any manually created questions</li>
                  </ul>
                }
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Divider>Questions ({questions.length})</Divider>

              {questions.length > 0 && (
                <div style={{ marginBottom: 16, textAlign:'right' }}>
                  <Button
                    danger
                    onClick={clearAllQuestions}
                    size="small"
                  >
                    Clear All Questions
                  </Button>
                </div>
              )}

              {questions.map((q, index) => (
                <Card
                  key={index}
                  style={{ marginBottom: 24, border:"1px solid #f0f0f0", borderRadius: 10 }}
                  title={
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span>Question {index + 1}</span>
                      <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => removeQuestion(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  }
                >
                  <Space direction="vertical" style={{ width:"100%" }}>
                    <Select
                      value={q.type}
                      style={{ width: 200 }}
                      onChange={(val) => updateQuestion(index,"type", val)}
                    >
                      <Option value="mcq">MCQ</Option>
                      <Option value="short">Short Answer</Option>
                      <Option value="paragraph">Paragraph</Option>
                    </Select>

                    <Input.TextArea
                      rows={2}
                      placeholder="Enter question text"
                      value={q.questionText}
                      onChange={(e) => updateQuestion(index,"questionText", e.target.value)}
                    />

                    {q.type ==="mcq" && (
                      <>
                        {q.options.map((opt: string, i: number) => (
                          <Space key={i} style={{ display:'flex', marginBottom: 8 }}>
                            <Input
                              value={opt}
                              placeholder={`Option ${i + 1}`}
                              onChange={(e) => updateMCQOption(index, i, e.target.value)}
                            />
                            <Button
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => removeMCQOption(index, i)}
                            />
                          </Space>
                        ))}
                        <Button
                          icon={<PlusOutlined />}
                          onClick={() => addMCQOption(index)}
                          size="small"
                          style={{ marginBottom: 8 }}
                        >
                          Add Option
                        </Button>

                        <Input
                          placeholder="Correct answer"
                          value={q.correctAnswer}
                          onChange={(e) => updateQuestion(index,"correctAnswer", e.target.value)}
                        />
                      </>
                    )}

                    <InputNumber
                      min={1}
                      value={q.marks}
                      onChange={(val) => updateQuestion(index,"marks", val)}
                      placeholder="Marks for this question"
                      style={{ width:'100%' }}
                    />

                    <TextArea
                      rows={2}
                      placeholder="Explanation / Solution for this question"
                      value={q.explanation}
                      onChange={(e) => updateQuestion(index,"explanation", e.target.value)}
                    />
                  </Space>
                </Card>
              ))}

              <Form.Item>
                <Button type="dashed" block onClick={addQuestion} icon={<PlusOutlined />} size="large">
                  Add Question Manually
                </Button>
              </Form.Item>

              <Divider />

              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" block>
                  Submit Exam ({questions.reduce((sum, q) => sum + Number(q.marks || 0), 0)} Total Marks)
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Content>

        <Footer style={{ textAlign:"center" }}>
          <b>© 2026 Draa. All Rights Reserved.</b>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default ExamCreation;
