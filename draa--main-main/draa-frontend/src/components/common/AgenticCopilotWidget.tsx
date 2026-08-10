/**
 * AgenticCopilotWidget — AI-powered writing assistant.
 * Shown ONLY on admin-dashboard and teacher-dashboard routes.
 * Hidden on all public front-end pages even when logged in as admin/teacher.
 */
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Info, Copy, Check, RefreshCw } from 'lucide-react';
import { message } from 'antd';
import axios from 'axios';
import url from '../../url';
import { getStoredUser, getAuthHeaders, getUserRole } from '../../utils/global_auth';
import './AgenticCopilotWidget.css';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  copyable?: boolean;
  isAi?: boolean;
  date: Date;
}

// ─── Suggestion chips by category ──────────────────────────────────────────

const BLOG_TABS = {
  writing: [
    { label: '💡 Blog ideas', prompt: 'Give me 5 interesting blog post ideas for an education platform' },
    { label: '📝 Write outline', prompt: 'Write an outline for a blog about effective study techniques' },
    { label: '✨ Improve writing', prompt: 'How can I make my blog post more engaging and readable?' },
    { label: '📌 Intro paragraph', prompt: 'Write an engaging introduction paragraph for a blog about exam preparation tips' },
    { label: '✅ Checklist', prompt: 'Give me a checklist for writing a high-quality blog post' },
  ],
  seo: [
    { label: '🏷️ Suggest title', prompt: 'Suggest 5 catchy titles for a blog about online learning' },
    { label: '🎯 SEO tips', prompt: 'What SEO tips should I follow when writing a blog post for an education site?' },
  ],
  infographics: [
    { label: '📊 Visual ideas', prompt: 'Suggest 5 infographic layout and visual ideas to explain a complex topic' },
    { label: '🎨 Visual script', prompt: 'Write a step-by-step layout script and visual cues for an infographic explaining study tips' },
    { label: '📈 Stats & data', prompt: 'Suggest key data points and statistics for an educational infographic' },
  ]
};

const COURSE_TABS = {
  writing: [
    { label: '💡 Topic ideas', prompt: 'Give me 5 interesting course content topic ideas for an online education platform' },
    { label: '📝 Lesson outline', prompt: 'Write a detailed lesson outline for a course chapter on effective learning techniques' },
    { label: '✨ Improve content', prompt: 'How can I make my course content more engaging and easy to understand for students?' },
    { label: '📌 Introduction', prompt: 'Write an engaging introduction for a course lesson about exam preparation tips' },
    { label: '🎯 Learning goals', prompt: 'Help me write clear learning objectives for a course chapter' },
    { label: '❓ Quiz questions', prompt: 'Generate 5 multiple choice quiz questions for a lesson on study techniques' },
    { label: '✅ Checklist', prompt: 'Give me a checklist for publishing high-quality course content' },
  ],
  seo: [
    { label: '🏷️ Suggest title', prompt: 'Suggest 5 catchy and SEO-friendly titles for a course content lesson' },
  ],
  infographics: [
    { label: '📊 Visual ideas', prompt: 'Suggest 5 infographic layout and visual ideas to explain this course topic' },
    { label: '🎨 Visual script', prompt: 'Write a step-by-step layout script and visual cues for a course infographic' },
    { label: '📈 Stats & data', prompt: 'Suggest key data points and statistics for an educational infographic related to this course content' },
  ]
};

// ─── Component ───────────────────────────────────────────────────────────────

interface BlogCopilotWidgetProps {
  /** Pass the current blog/content title to give the AI context */
  blogTitle?: string;
  blogContent?: string;
  /** 'blog' (default) = student blog writing | 'course' = teacher course content */
  mode?: 'blog' | 'course';
  /** Callback to apply generated content to the editor */
  onApply?: (text: string) => void;
}

const AgenticCopilotWidget: React.FC<BlogCopilotWidgetProps> = ({ blogTitle, blogContent, mode = 'blog', onApply }) => {
  const [activeSuggestionTab, setActiveSuggestionTab] = useState<'writing' | 'seo' | 'infographics'>('writing');
  const isCourse = mode === 'course';
  const chips = isCourse ? COURSE_TABS[activeSuggestionTab] : BLOG_TABS[activeSuggestionTab];
  const widgetTitle = isCourse ? 'Course Content Assistant' : 'Blog Writing Assistant';
  const inputPlaceholder = isCourse ? 'Ask for lesson ideas, outlines, quiz questions...' : 'Ask for blog ideas, outlines, titles...';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const loginUser = getStoredUser() || {};

  // ─── Guard: Role (must come AFTER hooks) ─────────────────
  const currentRole = getUserRole();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeText = isCourse
        ? `Hi ${loginUser.tname || loginUser.aname || 'there'}! 📚 I'm your Course Content Assistant.\n\nI can help you:\n• 💡 Generate lesson topic ideas\n• 📝 Create structured lesson outlines\n• ✨ Make your content more engaging\n• 🏷️ Suggest catchy lesson titles\n• 📌 Write intro & summary paragraphs\n• ❓ Generate quiz questions\n• ✅ Pre-publish content checklist\n\nDescribe what you need or pick a suggestion below!`
        : `Hi ${loginUser.name || 'there'}! ✍️ I'm your Blog Writing Assistant.\n\nI can help you:\n• 💡 Generate blog topic ideas\n• 📝 Create outlines and structure\n• ✨ Improve your writing\n• 🏷️ Suggest catchy titles\n• 📌 Write intro/conclusion paragraphs\n• 🎯 SEO tips for your posts\n\nDescribe what you want or pick a suggestion below!`;
      setMessages([{ id: 'welcome', sender: 'bot', text: welcomeText, date: new Date() }]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleCopy = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // ─── Send prompt ──────────────────────────────────────────────────────────

  const handleSendPrompt = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = { id: `user-${Date.now()}`, sender: 'user', text: trimmed, date: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      };

      // Build a context-aware prompt
      let contextPrefix = '';
      if (blogTitle?.trim()) {
        const label = isCourse ? 'course content lesson' : 'blog';
        contextPrefix += `The ${mode === 'course' ? 'teacher' : 'student'} is writing a ${label} titled: "${blogTitle}". `;
      }
      if (blogContent?.trim()) {
        const snippet = blogContent.replace(/<[^>]+>/g, '').trim().slice(0, 300);
        if (snippet) contextPrefix += `Current draft (first 300 chars): "${snippet}". `;
      }

      const fullPrompt = contextPrefix
        ? `Context: ${contextPrefix}\n\nUser request: ${trimmed}`
        : trimmed;

      const res = await axios.post(`${url}/agent/blog-chat`, { prompt: fullPrompt }, { headers });
      const reply = res.data?.data?.reply || res.data?.reply;

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: reply || 'I could not generate a response. Please try again.',
        copyable: true,
        isAi: res.data?.isAiPowered,
        date: new Date()
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        text: '❌ Unable to reach the server. Please check your connection.',
        date: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  // Guard: hide if guest/not logged in
  if (currentRole === 'GUEST') {
    return null;
  }

  return (
    <>
      {/* FAB */}
      <div className="copilot-fab" onClick={() => setIsOpen(!isOpen)} title={widgetTitle}>
        <Sparkles size={22} />
        <div className="copilot-fab-pulse" />
      </div>

      {/* Backdrop */}
      {isOpen && <div className="copilot-backdrop" onClick={() => setIsOpen(false)} />}

      {/* Drawer */}
      <div className={`copilot-drawer ${isOpen ? 'open' : ''}`}>

        {/* Header */}
        <div className="copilot-header">
          <div className="copilot-header-title">
            <span className="copilot-status-dot" />
            <h3>{widgetTitle}</h3>
          </div>
          <div className="copilot-header-actions">
            <button className="copilot-header-btn" title="Close" onClick={() => setIsOpen(false)}><X size={19} /></button>
          </div>
        </div>

        {/* Context banner — shows when blog title is provided */}
        {blogTitle && (
          <div className="copilot-context-banner">
            <span className="copilot-context-dot">📝</span>
            <span>Writing: <strong>{blogTitle}</strong></span>
          </div>
        )}

        {/* Conversation */}
        <div className="copilot-body">
          {messages.map((msg) => (
            <div key={msg.id} className={`copilot-msg ${msg.sender}`}>
              <div className="copilot-msg-bubble">
                <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>

                {/* Actions for bot responses */}
                {msg.sender === 'bot' && msg.copyable && (
                  <div className="copilot-msg-actions">
                    <button
                      className="copilot-action-btn copilot-copy-btn"
                      onClick={() => handleCopy(msg.text, msg.id)}
                      title="Copy to clipboard"
                    >
                      {copiedId === msg.id
                        ? <><Check size={12} /> Copied!</>
                        : <><Copy size={12} /> Copy</>
                      }
                    </button>
                    {onApply && (
                      <button
                        className="copilot-action-btn copilot-apply-btn"
                        onClick={() => onApply(msg.text)}
                        title="Apply content directly to the editor"
                      >
                        <Sparkles size={12} /> Apply to Editor
                      </button>
                    )}
                  </div>
                )}
              </div>
              <span className="copilot-msg-timestamp">
                {msg.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="copilot-msg bot">
              <div className="copilot-msg-bubble">
                <div className="copilot-typing"><span /><span /><span /></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion chips */}
        <div className="copilot-suggestions-section">
          <div className="copilot-suggestion-tabs">
            <button
              className={`copilot-suggestion-tab ${activeSuggestionTab === 'writing' ? 'active' : ''}`}
              onClick={() => setActiveSuggestionTab('writing')}
            >
              Writing
            </button>
            <button
              className={`copilot-suggestion-tab ${activeSuggestionTab === 'seo' ? 'active' : ''}`}
              onClick={() => setActiveSuggestionTab('seo')}
            >
              SEO
            </button>
            <button
              className={`copilot-suggestion-tab ${activeSuggestionTab === 'infographics' ? 'active' : ''}`}
              onClick={() => setActiveSuggestionTab('infographics')}
            >
              Infographics
            </button>
          </div>
          <div className="copilot-suggestions">
            {chips.map((chip, idx) => (
              <button key={idx} className="copilot-chip" onClick={() => handleSendPrompt(chip.prompt)}>
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="copilot-footer">
          <div className="copilot-input-container">
            <input
              type="text"
              className="copilot-input"
              placeholder={inputPlaceholder}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendPrompt(inputVal); } }}
            />
            <button className="copilot-send-btn" onClick={() => handleSendPrompt(inputVal)} disabled={!inputVal.trim()}>
              <Send size={15} />
            </button>
          </div>
          <div className="copilot-footer-note">
            ✨ Powered by Gemini AI
          </div>
        </div>
      </div>
    </>
  );
};

export default AgenticCopilotWidget;
