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
  Layout   //  added
} from"antd";
import { PlusOutlined, DeleteOutlined } from"@ant-design/icons";
import axios from'axios';
import url from'../../url';
import moment from"moment";
import { useParams } from"react-router-dom";

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;
const { Content, Footer } = Layout; //  added

import Topbar from"./Topbar";
import Sidebar from"./Sidebar";
import Sidebar2 from"./Sidebar2";
import usePageTitle from '../../hooks/usePageTitle';

const EditExamPage = () => {
  const { id } = useParams(); // exam ID from route
  // const navigate = useNavigate();

  const [loginUser, setLoginuser] = useState<any>({});
  const [form] = Form.useForm();
  const [questions, setQuestions] = useState<any[]>([]);

  // Load logged in user from local storage
  useEffect(() => {
    const user = localStorage.getItem('edudocs')
      ? JSON.parse(localStorage.getItem('edudocs') as string)
      : null;
    if (user) setLoginuser(user);
  }, []);

  // Fetch existing exam data on mount or id change
  useEffect(() => {
    if (!id) return;

    axios.get(`${url}/exam/fetch/${id}`)
      .then(res => {
        const exam = res.data.exam;
        form.setFieldsValue({
          title: exam.title,
          subject: exam.subject,
          instructions: exam.instructions,
          duration: exam.durationMinutes,
          scheduledDate: exam.scheduledAt ? moment(exam.scheduledAt) : null,
          scheduledTime: exam.scheduledAt ? moment(exam.scheduledAt) : null,
          seoTitle: exam.seo?.title ||'',
          seoKeywords: exam.seo?.keywords?.join(",") ||'',
          seoDescription: exam.seo?.description ||'',
        });
        setQuestions(exam.questions || []);
      })
      .catch(err => {
        console.error(err);
        message.error("Error loading exam data!");
      });
  }, [id, form]);

  // Functions to manipulate questions same as before
  const addQuestion = () => {
    setQuestions(prev => [
      ...prev,
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

  const updateQuestion = (index: number, field: string, value: any) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const updateMCQOption = (qIndex: number, optIndex: number, value: string) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[qIndex].options[optIndex] = value;
      return updated;
    });
  };

  const addMCQOption = (qIndex: number) => {
    setQuestions(prev => {
      const updated = [...prev];
      if (updated[qIndex].options.length < 5) {
        updated[qIndex].options.push("");
      } else {
        message.warning("Maximum 5 options allowed.");
      }
      return updated;
    });
  };

  const removeMCQOption = (qIndex: number, optIndex: number) => {
    setQuestions(prev => {
      const updated = [...prev];
      if (updated[qIndex].options.length > 1) {
        updated[qIndex].options.splice(optIndex, 1);
      } else {
        message.warning("At least 1 option is required.");
      }
      return updated;
    });
  };

  const handleSubmit = async (values: any) => {
    if (!id) {
      message.error("Invalid exam ID.");
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
      id,
      title: values.title,
      subject: values.subject,
      instructions: values.instructions,
      totalMarks: questions.reduce((sum, q) => sum + Number(q.marks || 0), 0),
      durationMinutes: values.duration,
      scheduledAt,
      createdBy: loginUser?.id,
      questions,
      seo: {
        title: values.seoTitle,
        keywords: values.seoKeywords ? values.seoKeywords.split(",").map((k: string) => k.trim()) : [],
        description: values.seoDescription,
      }
    };

    try {
      await axios.put(`${url}/exam/update/${id}`, payload);
      message.success(" Exam Updated Successfully!");
      // navigate("/manage-exams"); // Redirect to exam management list page
    } catch (err) {
      console.error(err);
      message.error(" Error updating exam.");
    }
  };

  return (
    <Layout style={{ minHeight:"100vh" }}>
      {/* Sidebar based on role (kept integrity) */}
      {"aname" in (loginUser || {}) ? <Sidebar /> : <Sidebar2 />}

      <Layout>
        <Topbar />

        <Content style={{ margin:"24px 16px", padding: 24 }}>
          <Card bordered style={{ padding:"2rem", borderRadius:"16px", boxShadow:"0 4px 14px rgba(0,0,0,0.1)" }}>
            <Title level={3} style={{ textAlign:"center", marginBottom: 20 }}>
              Edit Exam
            </Title>

            <Form layout="vertical" form={form} onFinish={handleSubmit}>
              <Form.Item name="createdBy" initialValue={loginUser?.id} hidden>
                <Input type="hidden" />
              </Form.Item>

              <Form.Item label="Exam Title" name="title" rules={[{ required: true }]}>
                <Input size="large" placeholder="Enter exam title" />
              </Form.Item>

              <Form.Item label="Subject" name="subject" rules={[{ required: true }]}>
                <Input size="large" placeholder="Enter subject name" />
              </Form.Item>

              <Form.Item label="Instructions" name="instructions">
                <TextArea rows={3} placeholder="Any specific instructions..." />
              </Form.Item>

              <Space size="large" wrap>
                <Form.Item label="Duration (minutes)" name="duration" rules={[{ required: true }]}>
                  <InputNumber min={1} size="large" />
                </Form.Item>

                <Form.Item label="Scheduled Date" name="scheduledDate">
                  <DatePicker size="large" />
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

              <Divider>Questions</Divider>
              {questions.map((q, index) => (
                <Card
                  key={index}
                  style={{ marginBottom: 24, border:"1px solid #f0f0f0", borderRadius: 10 }}
                  title={`Question ${index + 1}`}
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
                <Button type="dashed" block onClick={addQuestion} icon={<PlusOutlined />}>
                  Add Question
                </Button>
              </Form.Item>

              <Divider />

              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" block>
                  Update Exam
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

export default EditExamPage;
