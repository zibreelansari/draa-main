import React, { useState } from 'react';
import { Button, Modal, Input, Space, Tag, Tooltip, message, Spin } from 'antd';
import { Sparkles, Zap, Check, RefreshCw, Wand2, ArrowRight } from 'lucide-react';
import axios from 'axios';
import url from '../../url';
import { getAuthHeaders } from '../../utils/global_auth';

const { TextArea } = Input;

export interface CopilotInlineHelperProps {
  fieldName: string;
  fieldType: 'title' | 'short_desc' | 'long_desc' | 'audience' | 'learnings' | 'features' | 'faqs' | 'seo_title' | 'seo_desc' | 'keywords' | 'general';
  courseTitle?: string;
  category?: string;
  onApply: (generatedResult: any) => void;
  buttonText?: string;
  size?: 'small' | 'middle' | 'large';
  style?: React.CSSProperties;
}

const DEFAULT_PROMPTS: Record<string, string[]> = {
  title: [
    'Suggest 5 catchy and professional course titles',
    'Short and punchy course title for exam preparation',
    'Comprehensive mastery course title'
  ],
  short_desc: [
    'Write a compelling 2-sentence summary highlighting key student benefits',
    'Concise overview of what students will master in this course',
    'High-converting course subtitle & short description'
  ],
  long_desc: [
    'Write a comprehensive, structured course description with syllabus overview and key highlights',
    'Detailed course overview including who should join, prerequisites, and learning strategy',
    'Professional course introduction with detailed module descriptions'
  ],
  audience: [
    'Generate 4 target student personas for this course (e.g. Beginners, Exam Aspirants)',
    'Who should enroll in this course: list 4 clear student types',
    'Target audience breakdown for competitive exam students'
  ],
  learnings: [
    'Generate 5 key skill outcomes students will master by completing this course',
    'List 5 practical takeaways and exam skills gained',
    'Step-by-step learning outcomes for students'
  ],
  features: [
    'Generate 4 key course highlights (e.g. Lifetime Access, PDF Notes, Certificates, Live Q&A)',
    'List top features that make this course valuable for learners'
  ],
  faqs: [
    'Generate 3 common student questions and clear answers for this course',
    'FAQ list about course validity, schedule, and study materials'
  ],
  seo_title: [
    'Generate high-ranking 60-character SEO title',
    'Clickable and keyword-optimized search title'
  ],
  seo_desc: [
    'Generate 150-character meta description with call to action',
    'SEO search snippet description'
  ],
  keywords: [
    'Generate 10 comma-separated SEO keywords for this course',
    'Popular search terms and exam keywords'
  ],
  general: [
    'Help me write professional course content',
    'Improve and expand this text'
  ]
};

const CopilotInlineHelper: React.FC<CopilotInlineHelperProps> = ({
  fieldName,
  fieldType,
  courseTitle = '',
  category = '',
  onApply,
  buttonText,
  size = 'small',
  style
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);

  const quickPrompts = DEFAULT_PROMPTS[fieldType] || DEFAULT_PROMPTS.general;

  const buildContextPrompt = (userPrompt: string) => {
    let context = `Task: Generate content for the "${fieldName}" field of a course.\n`;
    if (courseTitle) context += `Course Title: "${courseTitle}"\n`;
    if (category) context += `Course Category: "${category}"\n`;
    context += `Field Type: ${fieldType}\n`;
    context += `User instruction: ${userPrompt}\n\n`;

    if (fieldType === 'audience') {
      context += `Formatting instructions: Provide a clean list of 3-5 target audience items.`;
    } else if (fieldType === 'learnings') {
      context += `Formatting instructions: Provide a clean list of 4-6 key learning outcomes.`;
    } else if (fieldType === 'features') {
      context += `Formatting instructions: Provide a clean list of 4 key course features.`;
    } else if (fieldType === 'faqs') {
      context += `Formatting instructions: Provide a clean list of questions and answers.`;
    } else if (fieldType === 'keywords') {
      context += `Formatting instructions: Provide only comma-separated keywords (e.g. UPSC, Civil Services, Exam Prep, Mock Tests).`;
    } else if (fieldType === 'short_desc') {
      context += `Formatting instructions: Provide a concise 2-sentence summary under 160 characters.`;
    }

    return context;
  };

  const handleGenerate = async (customPrompt?: string) => {
    const targetPrompt = customPrompt || promptText || quickPrompts[0];
    const fullPrompt = buildContextPrompt(targetPrompt);

    setLoading(true);
    setGeneratedResult(null);

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      };

      const res = await axios.post(`${url}/agent/blog-chat`, {
        prompt: fullPrompt,
        mode: 'course'
      }, { headers });

      const reply = res.data?.data?.reply || res.data?.reply;
      if (reply) {
        setGeneratedResult(reply.trim());
      } else {
        message.error('Could not generate response. Please try again.');
      }
    } catch (err: any) {
      console.error('Copilot inline error:', err);
      message.error(err?.response?.data?.message || 'Failed to reach AI Copilot server');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!generatedResult) return;

    onApply(generatedResult);
    message.success(`✨ Auto-filled ${fieldName}!`);
    setModalVisible(false);
    setGeneratedResult(null);
  };

  return (
    <>
      <Tooltip title={`Auto-generate ${fieldName} with AI Copilot`}>
        <Button
          type="default"
          size={size}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setModalVisible(true);
            if (!promptText) setPromptText(quickPrompts[0]);
          }}
          style={{
            background: 'linear-gradient(135deg, #66735b 0%, #9b6118 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)',
            fontSize: size === 'small' ? '12px' : '13px',
            cursor: 'pointer',
            ...style
          }}
        >
          <Sparkles size={13} style={{ color: '#fbbf24' }} />
          {buttonText || '✨ Generate with Copilot'}
        </Button>
      </Tooltip>

      <Modal
        title={
          <Space>
            <Sparkles size={18} style={{ color: '#66735b' }} />
            <span style={{ fontWeight: 600, fontSize: '16px' }}>
              AI Copilot — Generate {fieldName}
            </span>
            <Tag color="purple" style={{ borderRadius: '12px' }}>Course AI</Tag>
          </Space>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setGeneratedResult(null);
        }}
        footer={null}
        width={600}
        destroyOnClose
        centered
      >
        <div style={{ padding: '8px 0 16px 0' }}>
          {courseTitle && (
            <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', marginBottom: '16px', borderLeft: '3px solid #66735b' }}>
              <span style={{ color: '#64748b', fontSize: '12px' }}>Course Context:</span>
              <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '13px' }}>
                {courseTitle} {category ? `(${category})` : ''}
              </div>
            </div>
          )}

          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
              ⚡ Quick Prompt Suggestions:
            </span>
            <Space wrap size={[6, 6]}>
              {quickPrompts.map((qp, idx) => (
                <Tag
                  key={idx}
                  color="blue"
                  onClick={() => {
                    setPromptText(qp);
                    handleGenerate(qp);
                  }}
                  style={{
                    cursor: 'pointer',
                    borderRadius: '12px',
                    padding: '3px 10px',
                    fontSize: '12px',
                    border: '1px solid #93c5fd',
                    background: '#eff6ff'
                  }}
                >
                  <Wand2 size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  {qp}
                </Tag>
              ))}
            </Space>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
              Custom Instruction:
            </span>
            <TextArea
              rows={3}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder={`Describe what you want for ${fieldName}...`}
              style={{ borderRadius: '6px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <Button
              type="primary"
              onClick={() => handleGenerate()}
              loading={loading}
              icon={<Zap size={14} />}
              style={{
                background: 'linear-gradient(135deg, #66735b 0%, #9b6118 100%)',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600
              }}
            >
              {loading ? 'AI is Generating...' : 'Generate with AI'}
            </Button>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '24px 0', background: '#faf5ff', borderRadius: '8px', border: '1px dashed #d8b4fe' }}>
              <Spin indicator={<Sparkles size={24} style={{ color: '#66735b' }} />} />
              <div style={{ marginTop: '8px', color: '#6b21a8', fontWeight: 500, fontSize: '13px' }}>
                AI Copilot is crafting optimal content for {fieldName}...
              </div>
            </div>
          )}

          {generatedResult && !loading && (
            <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '16px', border: '1px solid #e2e8f0', marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={14} color="#16a34a" /> Generated Result Preview
                </span>
                <Button
                  type="text"
                  size="small"
                  icon={<RefreshCw size={12} />}
                  onClick={() => handleGenerate()}
                  style={{ fontSize: '11px', color: '#64748b' }}
                >
                  Regenerate
                </Button>
              </div>

              <div style={{
                background: '#ffffff',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                maxHeight: '200px',
                overflowY: 'auto',
                fontSize: '13px',
                whiteSpace: 'pre-wrap',
                color: '#1e293b'
              }}>
                {generatedResult}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', gap: '8px' }}>
                <Button onClick={() => setGeneratedResult(null)}>
                  Discard
                </Button>
                <Button
                  type="primary"
                  onClick={handleApply}
                  icon={<ArrowRight size={14} />}
                  style={{
                    background: '#16a34a',
                    borderColor: '#16a34a',
                    fontWeight: 600
                  }}
                >
                  Auto-Fill into {fieldName}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default CopilotInlineHelper;
