import { useEffect, useState, useRef } from 'react';
import {
    Layout, Form, Input, Button, message, Card, Switch,
    Space, Typography, Divider, Row, Col, Select, Upload, Tag, Alert
} from 'antd';
import {
    UploadOutlined, YoutubeOutlined, InstagramOutlined, PictureOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import CkEditor from './CkEditor';
import Sidebar from './Sidebar';
import Sidebar2 from './Sidebar2';
import Topbar from './Topbar';
import url, { getImageUrl } from '../../url';
import ContentCopilotWidget from '../common/AgenticCopilotWidget';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Content, Footer } = Layout;
const CATEGORY_OPTIONS = [
    // Competitive Exams
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

    // Entrance Exams
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

    // Technology
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

    // Programming Languages
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

    // Web Development
    "Frontend Development",
    "Backend Development",
    "Full Stack Development",
    "React",
    "Next.js",
    "Angular",
    "Vue",
    "Node.js",

    // Mobile Development
    "Android Development",
    "iOS Development",
    "React Native",
    "Flutter",

    // Engineering
    "CORE SECTOR",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Electronics Engineering",

    // Agriculture
    "AGRICULTURE",
    "Agricultural Science",
    "Agricultural Engineering",

    // Law
    "LAW",
    "Corporate Law",
    "Criminal Law",
    "International Law",

    // Business
    "Business",
    "Entrepreneurship",
    "Startup",
    "Finance",
    "Accounting",
    "Stock Market",
    "Digital Marketing",
    "SEO",
    "Marketing",

    // Design
    "UI/UX Design",
    "Graphic Design",
    "Product Design",

    // Misc
    "Soft Skills",
    "Personality Development",
    "Communication Skills",
    "Interview Preparation",
    "Career Development",
];
const UpdateCourseContent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const contentSubject = Form.useWatch('content_subject', form);
    const editorRef = useRef(null);

    const [loginUser, setLoginuser] = useState<{ name?: string; tname?: string; aname?: string; isVerified?: boolean; Status?: string }>({});
    const [autoGenerateSEO, setAutoGenerateSEO] = useState(false); // default OFF for update
    const [tags, setTags] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [readabilityScore, setReadabilityScore] = useState('ok');
    const [editorContent, setEditorContent] = useState('');
    const [youtubePreview, setYoutubePreview] = useState('');
    const [instagramPreview, setInstagramPreview] = useState('');
    const [loading, setLoading] = useState(true);

    // Load logged-in user
    useEffect(() => {
        const raw = localStorage.getItem('edudocs');
        if (raw) {
            try { setLoginuser(JSON.parse(raw)); } catch { /* ignore */ }
        }
    }, []);

    // Fetch existing content and pre-fill form
    useEffect(() => {
        fetch(`${url}/course/courseContentDetails/${id}`)
            .then(res => res.json())
            .then(data => {
                const c = data.contents;

                // Pre-fill all form fields
                form.setFieldsValue({
                    content_subject: c.content_subject || '',
                    content_category: c.content_category || '',
                    content_type: c.content_type || 'article',
                    youtube_url: c.youtube_url || '',
                    instagram_url: c.instagram_url || '',
                    schema_image: c.schema_image ? [{
                        uid: '-1',
                        name: 'schema_image.png',
                        status: 'done',
                        url: getImageUrl(c.schema_image)
                    }] : [],
                    featured_images: c.featured_images && c.featured_images.length > 0
                        ? c.featured_images.map((img: string, index: number) => ({
                            uid: `featured-${index}`,
                            name: `featured_image_${index}.png`,
                            status: 'done',
                            url: getImageUrl(img)
                        }))
                        : []
                });

                // Editor content
                setEditorContent(c.content || '');

                // Tags
                if (c.tags) {
                    const parsedTags = typeof c.tags === 'string'
                        ? (() => { try { return JSON.parse(c.tags); } catch { return []; } })()
                        : c.tags;
                    setTags(Array.isArray(parsedTags) ? parsedTags : []);
                    form.setFieldsValue({ tags: parsedTags });
                }

                // Previews
                if (c.youtube_url) setYoutubePreview(c.youtube_url);
                if (c.instagram_url) setInstagramPreview(c.instagram_url);
                if (c.readability_score) setReadabilityScore(c.readability_score);

                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching content:', err);
                message.error('Failed to load content');
                setLoading(false);
            });
    }, [id, form]);

    const getFileValue = (e: any) => {
        if (Array.isArray(e)) return e;
        return e?.fileList;
    };

    const getReadabilityColor = (score: string) => {
        switch (score) {
            case 'good': return '#52c41a';
            case 'ok': return '#faad14';
            case 'poor': return '#ff4d4f';
            default: return '#faad14';
        }
    };

    const getYouTubeEmbedUrl = (rawUrl: string) => {
        try {
            const u = new URL(rawUrl);
            if (u.hostname === 'youtu.be') return `https://www.youtube.com/embed${u.pathname}`;
            if (u.hostname.includes('youtube.com')) {
                const v = u.searchParams.get('v');
                if (v) return `https://www.youtube.com/embed/${v}`;
            }
            return rawUrl;
        } catch { return rawUrl; }
    };

    const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // SEO auto-generation removed
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement> | { target: { value: string } }) => {
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

    const handleTagRemove = (removedTag: string) => {
        const newTags = tags.filter(t => t !== removedTag);
        setTags(newTags);
        form.setFieldsValue({ tags: newTags });
    };

    const onFinish = async (values: any) => {
        try {
            if (!editorContent || editorContent.trim() === '') {
                message.error('Content cannot be empty!');
                return;
            }

            const categoryValue = values.content_category || form.getFieldValue('content_category');
            const category = (categoryValue && categoryValue.length > 0) ? categoryValue : 'Current Affairs';

            const formData = new FormData();
            formData.append('content_subject', values.content_subject);
            formData.append('content_category', category);
            formData.append('content', editorContent);
            formData.append('author', loginUser?.tname || loginUser?.aname || 'Anonymous');
            formData.append('content_type', values.content_type || 'article');
            formData.append('tags', JSON.stringify(tags));
            formData.append('youtube_url', values.youtube_url || '');
            formData.append('instagram_url', values.instagram_url || '');

            if (values.schema_image?.[0]?.originFileObj) {
                formData.append('schema_image', values.schema_image[0].originFileObj);
            } else if (values.schema_image?.[0]?.url) {
                const relativeUrl = values.schema_image[0].url.replace(`${url}/`, '');
                formData.append('schema_image', relativeUrl);
            }
            if (values.featured_images?.length > 0) {
                values.featured_images.forEach((file: any) => {
                    if (file.originFileObj) {
                        formData.append('featured_images', file.originFileObj);
                    } else if (file.url) {
                        const relativeUrl = file.url.replace(`${url}/`, '');
                        formData.append('featured_images', relativeUrl);
                    }
                });
            }

            await axios.put(`${url}/course/UpdateCourseContent/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            message.success('Content Updated Successfully!');
            setTimeout(() => navigate('/manage-courses-content'), 2000);
        } catch (error: any) {
            console.error(error);
            message.error(error.response?.data?.error || 'Error updating content');
        }
    };

    if (loading) {
        return (
            <Layout style={{ minHeight: '100vh' }}>
                <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Card><Text>Loading content...</Text></Card>
                </Content>
            </Layout>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {'aname' in loginUser ? <Sidebar /> : <Sidebar2 />}
            <Layout>
                <Topbar />
                <Content style={{ margin: '24px 16px', padding: 24 }}>
                    <div style={{ maxWidth: 1000, margin: '0 auto' }}>

                        {/*  Header row  */}
                        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                            <Col>
                                <Title level={4} style={{ margin: 0 }}>Update Course Content</Title>
                            </Col>
                            <Col>
                                <Button onClick={() => navigate('/manage-courses-content')} type="default">
                                    Manage Content
                                </Button>
                            </Col>
                        </Row>

                        {/*  Teacher status alert  */}
                        {loginUser.tname && (
                            <Alert
                                message="Teacher Account Status"
                                description={
                                    <div>
                                        <div><strong>Verified:</strong> {loginUser.isVerified ? 'Yes' : 'No'}</div>
                                        <div><strong>Status:</strong> {loginUser.Status}</div>
                                        <div style={{ marginTop: 8, color: '#52c41a' }}>Account verified and approved.</div>
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
                                robots: 'index, follow',
                                content_type: 'article',
                                readability_score: readabilityScore,
                            }}
                        >

                            {/* 
                  CARD 1  Content Information
               */}
                            <Card title="Content Information" style={{ marginBottom: 24 }}>

                                <Form.Item
                                    name="content_subject"
                                    label="Subject"
                                    rules={[{ required: true, message: 'Required' }]}
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
                                            extra="Select a category or type your own if not listed"
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

                                {/*  Images  */}
                                <Divider orientation="left">Images</Divider>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label={<Space><PictureOutlined />Schema/Reference Image (1 only)</Space>}
                                            name="schema_image"
                                            valuePropName="fileList"
                                            getValueFromEvent={getFileValue}
                                            tooltip="Main image for SEO, OG tags, thumbnails"
                                        >
                                            <Upload
                                                name="schema_image"
                                                listType="picture-card"
                                                beforeUpload={() => false}
                                                maxCount={1}
                                                accept="image/*"
                                            >
                                                <div><UploadOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>
                                            </Upload>
                                        </Form.Item>
                                    </Col>

                                    <Col span={12}>
                                        <Form.Item
                                            label={<Space><PictureOutlined />Featured Images (Gallery - Max 5)</Space>}
                                            name="featured_images"
                                            valuePropName="fileList"
                                            getValueFromEvent={getFileValue}
                                            tooltip="Multiple images for gallery/slider in blog"
                                        >
                                            <Upload
                                                name="featured_images"
                                                listType="picture-card"
                                                beforeUpload={() => false}
                                                maxCount={5}
                                                accept="image/*"
                                                multiple
                                            >
                                                <div><UploadOutlined /><div style={{ marginTop: 8 }}>Upload Multiple</div></div>
                                            </Upload>
                                        </Form.Item>
                                    </Col>
                                </Row>

                                {/*  Word import  */}
                                <Button onClick={() => document.getElementById('wordUploadUpdate')?.click()}>
                                    Import Word (.docx)
                                </Button>
                                 <input
                                    id="wordUploadUpdate"
                                    type="file"
                                    accept=".docx"
                                    hidden
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const fd = new FormData();
                                        fd.append('file', file);
                                        const res = await fetch(`${url}/editor/import-word`, { method: 'POST', body: fd });
                                        const data = await res.json();
                                        setEditorContent(data.html);
                                        (editorRef.current as any)?.setHTML?.(data.html);

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

                                {/*  CkEditor  */}
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
                                    style={{ marginTop: 16 }}
                                >
                                    <CkEditor
                                        ref={editorRef}
                                        value={editorContent}
                                        onChange={(html: string) => {
                                            setEditorContent(html);
                                            handleContentChange({ target: { value: html.replace(/<[^>]+>/g, '') } });
                                        }}
                                    />
                                </Form.Item>

                                {/*  Media Embeds  */}
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
                                                        width="100%" height="220"
                                                        src={getYouTubeEmbedUrl(youtubePreview)}
                                                        frameBorder="0" allowFullScreen title="YT"
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
                                            <Alert style={{ marginTop: 8 }} type="info" message="Link captured" showIcon />
                                        )}
                                    </Col>
                                </Row>

                                {/*  Tags  */}
                                <Form.Item label="Tags">
                                    <Space direction="vertical" style={{ width: '100%' }}>
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
                                        <Form.Item name="seo_title" label="SEO Title" rules={[{ required: true }, { max: 60 }]}>
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

                            {/*  Submit  */}
                            <Form.Item>
                                <Button type="primary" htmlType="submit" size="large" block>
                                    Update Content
                                </Button>
                            </Form.Item>

                        </Form>
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>© 2026 Draa</Footer>
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

export default UpdateCourseContent;