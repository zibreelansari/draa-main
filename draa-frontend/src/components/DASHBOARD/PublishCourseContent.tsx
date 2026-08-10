import { useEffect, useState, useRef } from'react';
import toast from '../../utils/toast';
import { Layout, Form, Input, Button, Card, Switch, Space, Typography, Divider, Row, Col, Select, Upload, Tag, Alert } from'antd';
import { UploadOutlined, YoutubeOutlined, InstagramOutlined, PictureOutlined } from'@ant-design/icons';
import axios from'axios';
import { useNavigate } from'react-router-dom';
import CkEditor from'./CkEditor';
import Sidebar from'./Sidebar';
import Sidebar2 from'./Sidebar2';
import Topbar from'./Topbar';
import url, { getImageUrl } from'../../url';
import { getUserRole } from'../../utils/global_auth';
import ContentCopilotWidget from'../common/AgenticCopilotWidget';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Content, Footer } = Layout;
const CATEGORY_OPTIONS = [
"UPSC",
"CIVIL SERVICES",
"SSC",
"BANKING",
"IBPS",
"SBI PO",
"RRB",
"NDA",
"CDS",
"CAPF",
"STATE PSC",

"JEE",
"JEE Advanced",
"NEET",
"GATE",
"CLAT",
"CAT",
"MAT",
"XAT",
"CMAT",
"SNAP",
"GMAT",

"Technology",
"IT",
"Software Engineering",
"Computer Science",
"Artificial Intelligence",
"Machine Learning",
"Deep Learning",
"Data Science",
"Big Data",
"Cyber Security",
"Cloud Computing",
"DevOps",

"JAVA",
"Python",
"C",
"C++",
"C#",
"JavaScript",
"TypeScript",
"PHP",
"Go",
"Rust",
"Swift",
"Kotlin",

"Frontend Development",
"Backend Development",
"Full Stack Development",
"React",
"Next.js",
"Angular",
"Vue",
"Node.js",

"Android Development",
"iOS Development",
"React Native",
"Flutter",

"CORE SECTOR",
"Mechanical Engineering",
"Civil Engineering",
"Electrical Engineering",
"Electronics Engineering",

"AGRICULTURE",
"Agricultural Science",
"Agricultural Engineering",

"LAW",
"Corporate Law",
"Criminal Law",
"International Law",

"Business",
"Entrepreneurship",
"Startup",
"Finance",
"Accounting",
"Stock Market",
"Digital Marketing",
"SEO",
"Marketing",

"UI/UX Design",
"Graphic Design",
"Product Design",

"Soft Skills",
"Personality Development",
"Communication Skills",
"Interview Preparation",
"Career Development"
];
const PublishCourseContent = () => {
  const navigate = useNavigate();
  const [loginUser, setLoginuser] = useState({ name:'', tname:'', aname:'', id:'', isVerified: false, Status:'' });
  const [form] = Form.useForm();
  const contentSubject = Form.useWatch('content_subject', form);
  const [autoGenerateSEO, setAutoGenerateSEO] = useState(true);
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [readabilityScore, setReadabilityScore] = useState('ok');
  const [editorContent, setEditorContent] = useState('');
  const [youtubePreview, setYoutubePreview] = useState('');
  const [instagramPreview, setInstagramPreview] = useState('');
  const editorRef = useRef(null)

  // Auth check
  useEffect(() => {
    const role = getUserRole();

    //  Not logged in
    if (role ==="GUEST") {
      toast.warning("Please login to continue", 6);
      navigate("/admin-login");
      return;
    }

    //  Students not allowed
    if (role ==="STUDENT") {
      toast.error("Access denied. Teachers or Admin only.", 6);
      navigate("/student-dashboard");
      return;
    }

    const raw = localStorage.getItem("edudocs");
    if (!raw) {
      toast.error("Session expired. Please login again.");
      navigate("/admin-login");
      return;
    }

    try {
      const user = JSON.parse(raw);

      //  Teacher checks
      if (role ==="TEACHER") {
        if (user.isVerified !== true) {
          toast.error("Your account is not verified yet.", 7);
          navigate("/teacher-dashboard");
          return;
        }

        if (user.Status !=="approved") {
          toast.error("Your account is not approved yet.", 7);
          navigate("/teacher-dashboard");
          return;
        }
      }

      //  Admin OR verified teacher
      setLoginuser(user);
    } catch {
      toast.error("Invalid session. Please login again.");
      navigate("/admin-login");
    }
  }, [navigate]);

  if (!loginUser || Object.keys(loginUser).length === 0) {
    return (
      <Layout style={{ minHeight:'100vh' }}>
        <Content style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
          <Card><Text>Checking permissions...</Text></Card>
        </Content>
      </Layout>
    );
  }

  const getFileValue = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  const getReadabilityColor = (score) => {
    switch (score) {
      case'good': return'#52c41a';
      case'ok': return'#faad14';
      case'poor': return'#ff4d4f';
      default: return'#faad14';
    }
  };

  const validateImageDimensions = (file, width, height) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          if (img.width === width && img.height === height) {
            resolve(true);
          } else {
            toast.error(`Image must be exactly ${width}x${height} pixels! (Current: ${img.width}x${img.height})`);
            resolve(false);
          }
        };
        img.onerror = () => {
          toast.error("Invalid image file.");
          resolve(false);
        };
      };
    });
  };

  const getYouTubeEmbedUrl = (url) => {
    try {
      const u = new URL(url);
      if (u.hostname ==='youtu.be') return `https://www.youtube.com/embed${u.pathname}`;
      if (u.hostname.includes('youtube.com')) {
        const v = u.searchParams.get('v');
        if (v) return `https://www.youtube.com/embed/${v}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const handleSubjectChange = (e) => {
    // SEO auto-generation removed
  };

  const handleContentChange = (e) => {
    // SEO auto-generation removed
  };

  const handleTagAdd = () => {
    const value = inputValue.trim();
    if (!value || tags.includes(value)) return;
    const newTags = [...tags, value];
    setTags(newTags);
    form.setFieldsValue({ tags: newTags });
    setInputValue('');
  };

  const handleTagRemove = (removedTag) => {
    const newTags = tags.filter(t => t !== removedTag);
    setTags(newTags);
    form.setFieldsValue({ tags: newTags });
  };

  const onFinish = async (values) => {
    try {
      if (!editorContent || editorContent.trim() ==='') {
        toast.error('Content cannot be empty!');
        return;
      }

      //    if (/([A-Z]:\\|file:\/\/)/i.test(editorContent)) {
      //   toast.error(
      //'Local image detected. Please upload the image using the Image button in the editor.'
      //   );
      //   return;
      // }


      const formData = new FormData();
      const category = (values.content_category && values.content_category.length > 0) ? values.content_category : 'Current Affairs';
      formData.append('content_subject', values.content_subject);
      formData.append('content_category', category);
      formData.append('content', editorContent);
      formData.append('author', loginUser?.tname || loginUser?.aname ||'Anonymous');
      formData.append('content_type', values.content_type ||'article');
      formData.append('tags', JSON.stringify(tags));
      formData.append('youtube_url', values.youtube_url || '');
      formData.append('instagram_url', values.instagram_url || '');

      //  NEW: Schema image (single)
      if (values.schema_image?.[0]?.originFileObj) {
        formData.append('schema_image', values.schema_image[0].originFileObj);
      } else if (values.schema_image?.[0]?.url) {
        const relativeUrl = values.schema_image[0].url.replace(`${url}/`, '');
        formData.append('schema_image', relativeUrl);
      }

      //  NEW: Featured images (multiple)
      if (values.featured_images && values.featured_images.length > 0) {
        values.featured_images.forEach(file => {
          if (file.originFileObj) {
            formData.append('featured_images', file.originFileObj);
          } else if (file.url) {
            const relativeUrl = file.url.replace(`${url}/`, '');
            formData.append('featured_images', relativeUrl);
          }
        });
      }

      const response = await axios.post(`${url}/course/createCourseContent`, formData, {
        headers: {'Content-Type':'multipart/form-data' },
      });

      console.log(response);
      toast.success('Content Published!');
      form.resetFields();
      setTags([]);
      setEditorContent('');
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error ||'Error publishing');
    }
  };

  return (
    <Layout style={{ minHeight:'100vh' }}>
      {'aname' in loginUser ? <Sidebar /> : <Sidebar2 />}
      <Layout>
        <Topbar />
        <Content style={{ margin:'24px 16px', padding: 24 }}>
          <div style={{ maxWidth: 1000, margin:'0 auto' }}>

            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <Title level={4} style={{ margin: 0 }}>Publish Course Content</Title>
              </Col>
              <Col>
                <Button onClick={() => navigate('/manage-courses-content')} type="default">
                  Manage Content
                </Button>
              </Col>
            </Row>

            {loginUser.tname && (
              <Alert
                message="Teacher Account Status"
                description={
                  <div>
                    <div><strong>Verified:</strong> {loginUser.isVerified ?'Yes' :'No'}</div>
                    <div><strong>Status:</strong> {loginUser.Status}</div>
                    <div style={{ marginTop: 8, color:'#52c41a' }}>
                      Account verified and approved.
                    </div>
                  </div>
                }
                type="success"
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                robots:'index, follow',
                content_type:'article',
                readability_score: readabilityScore,
              }}
            >

              <Card title="Content Information" style={{ marginBottom: 24 }}>
                <Form.Item
                  name="content_subject"
                  label="Subject"
                  rules={[{ required: true, message:'Required' }]}
                >
                  <Input placeholder="e.g., React Tutorial" onChange={handleSubjectChange} />
                </Form.Item>

                {/* 
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="content_category"
                      label="Category"
                      rules={[{ required: true, message:"Please select or add a category" }]}
                      extra="Select a category or type a new one if not listed"
                    >
                      <Select
                        mode="tags"
                        showSearch
                        placeholder="Select or type category"
                        optionFilterProp="children"
                      >
                        {CATEGORY_OPTIONS.map((cat) => (
                          <Select.Option key={cat} value={cat}>
                            {cat}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                */}

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="content_category"
                      label="Category"
                      rules={[{ required: true, message: 'Please select a category' }]}
                      initialValue="Current Affairs"
                    >
                      <Select placeholder="Select a category">
                        {[
                          'Current Affairs',
                          'Governance',
                          'Science & Technology',
                          'Art & Culture',
                          'Ethics',
                        ].map((cat) => (
                          <Select.Option key={cat} value={cat}>
                            {cat}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                {/*  NEW: Two separate upload sections */}
                <Divider orientation="left">Images</Divider>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <Space>
                          <PictureOutlined />
                          Schema/Reference Image (1 only)
                        </Space>
                      }
                      name="schema_image"
                      valuePropName="fileList"
                      getValueFromEvent={getFileValue}
                      tooltip="Main image for SEO, OG tags, thumbnails"
                    >
                      <Upload
                        name="schema_image"
                        listType="picture-card"
                        beforeUpload={async (file) => {
                          const isValid = await validateImageDimensions(file, 1550, 650);
                          return isValid ? false : Upload.LIST_IGNORE;
                        }}
                        maxCount={1}
                        accept="image/*"
                      >
                        <div>
                          <UploadOutlined />
                          <div style={{ marginTop: 8 }}>Upload</div>
                          <div style={{ fontSize: 10, color:"#999" }}>(1550x650)</div>
                        </div>
                      </Upload>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label={
                        <Space>
                          <PictureOutlined />
                          Featured Images (Gallery - Max 5)
                        </Space>
                      }
                      name="featured_images"
                      valuePropName="fileList"
                      getValueFromEvent={getFileValue}
                      tooltip="Multiple images for gallery/slider in blog"
                    >
                      <Upload
                        name="featured_images"
                        listType="picture-card"
                        beforeUpload={async (file) => {
                          const isValid = await validateImageDimensions(file, 1550, 650);
                          return isValid ? false : Upload.LIST_IGNORE;
                        }}
                        maxCount={5}
                        accept="image/*"
                        multiple
                      >
                        <div>
                          <UploadOutlined />
                          <div style={{ marginTop: 8 }}>Upload Multiple</div>
                          <div style={{ fontSize: 10, color:"#999" }}>(1550x650)</div>
                        </div>
                      </Upload>
                    </Form.Item>
                  </Col>
                </Row>
                <Button
                  onClick={() => document.getElementById('wordUpload').click()}
                >
                  Import Word (.docx)
                </Button>

                <input
                  id="wordUpload"
                  type="file"
                  accept=".docx"
                  hidden
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append('file', file);

                    const res = await fetch(`${url}/editor/import-word`, {
                      method: 'POST',
                      body: formData
                    });

                    const data = await res.json();
                    setEditorContent(data.html);
                    editorRef.current?.setHTML(data.html);

                    if (data.firstImageUrl) {
                      form.setFieldsValue({
                        schema_image: [{
                          uid: '-1',
                          name: 'extracted-cover.png',
                          status: 'done',
                          url: getImageUrl(data.firstImageUrl)
                        }]
                      });
                    }
                  }}
                />



                {/* <Button
  onClick={() => {
    const input = document.createElement('input')
    input.type ='file'
    input.accept ='image/*'

    input.onchange = async () => {
      const file = input.files[0]
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`${url}/editor/upload`, {
        method:'POST',
        body: formData
      })

      const data = await res.json()

      editorRef.current?.insertImage(data.location)
    }

    input.click()
  }}
>
  Insert Image
</Button> */}


                <Form.Item
                  label={
                    <Space>
                      Main Content
                      <Text style={{ color: getReadabilityColor(readabilityScore), fontSize: 12 }}>
                        Readability: {readabilityScore.toUpperCase()}
                      </Text>
                    </Space>
                  }
                  required
                >
                  <CkEditor
                    value={editorContent}
                    onChange={(html) => {
                      setEditorContent(html)
                      handleContentChange({
                        target: { value: html.replace(/<[^>]+>/g,'') }
                      })
                    }}
                  />





                </Form.Item>

                <Divider>Media Embeds</Divider>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="youtube_url" label="YouTube URL">
                      <Input
                        prefix={<YoutubeOutlined />}
                        placeholder="https://youtube.com/watch?v=..."
                        onChange={(e) => setYoutubePreview(e.target.value)}
                      />
                    </Form.Item>
                    {youtubePreview && (
                      <div style={{ marginBottom: 16 }}>
                        <Text type="secondary">Preview:</Text>
                        <div style={{ marginTop: 8 }}>
                          <iframe
                            width="100%"
                            height="220"
                            src={getYouTubeEmbedUrl(youtubePreview)}
                            frameBorder="0"
                            allowFullScreen
                            title="YT"
                          />
                        </div>
                      </div>
                    )}
                  </Col>

                  <Col span={12}>
                    <Form.Item name="instagram_url" label="Instagram URL">
                      <Input
                        prefix={<InstagramOutlined />}
                        placeholder="https://instagram.com/p/..."
                        onChange={(e) => setInstagramPreview(e.target.value)}
                      />
                    </Form.Item>
                    {instagramPreview && (
                      <Alert
                        style={{ marginTop: 8 }}
                        type="info"
                        message="Link captured"
                        showIcon
                      />
                    )}
                  </Col>
                </Row>

                <Form.Item label="Tags">
                  <Space direction="vertical" style={{ width:'100%' }}>
                    <Space>
                      <Input
                        placeholder="Add tag"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onPressEnter={handleTagAdd}
                        style={{ width: 240 }}
                      />
                      <Button onClick={handleTagAdd}>Add</Button>
                    </Space>
                    <div>
                      {tags.map(tag => (
                        <Tag key={tag} closable onClose={() => handleTagRemove(tag)} style={{ marginBottom: 8 }}>
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  </Space>
                </Form.Item>
              </Card>

              {/* SEO Settings Card Hidden / Commented Out as requested */}
              {/* 
              <Card
                title={
                  <Space>
                    SEO Settings
                    <Switch
                      checked={autoGenerateSEO}
                      onChange={setAutoGenerateSEO}
                      checkedChildren="Auto"
                      unCheckedChildren="Manual"
                      size="small"
                    />
                  </Space>
                }
                style={{ marginBottom: 24 }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="seo_title"
                      label="SEO Title"
                      rules={[{ required: true }, { max: 60 }]}
                    >
                      <Input showCount maxLength={60} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="meta_keywords" label="Keywords">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="focus_keyword" label="Focus Keyword">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="meta_description" label="Meta Description" rules={[{ max: 160 }]}>
                  <TextArea rows={3} showCount maxLength={160} />
                </Form.Item>

                <Divider orientation="left" plain>Advanced</Divider>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="content_type" label="Type">
                      <Select>
                        <Select.Option value="article">Article</Select.Option>
                        <Select.Option value="tutorial">Tutorial</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="robots" label="Robots">
                      <Select>
                        <Select.Option value="index, follow">Index, Follow</Select.Option>
                        <Select.Option value="noindex, nofollow">No Index</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="readability_score" label="Readability">
                      <Select value={readabilityScore} onChange={setReadabilityScore}>
                        <Select.Option value="good">Good</Select.Option>
                        <Select.Option value="ok">OK</Select.Option>
                        <Select.Option value="poor">Poor</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="og_title" label="OG Title">
                      <Input maxLength={60} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="canonical_url" label="Canonical URL">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="og_description" label="OG Description">
                  <TextArea rows={2} maxLength={160} />
                </Form.Item>

                <Form.Item name="schema_markup" label="Schema Markup">
                  <TextArea rows={4} />
                </Form.Item>
              </Card>
              */}

              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" block>
                  Publish Content
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Content>
        <Footer style={{ textAlign:'center' }}>© 2026 Draa</Footer>
      </Layout>
      <ContentCopilotWidget
        blogTitle={contentSubject}
        blogContent={editorContent}
        mode="course"
        onApply={(text) => setEditorContent(text)}
      />
    </Layout>
  );
};

export default PublishCourseContent;
