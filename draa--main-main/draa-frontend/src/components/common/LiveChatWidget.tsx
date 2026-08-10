import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  MessageSquare, 
  ChevronRight,
  HelpCircle,
  Clock,
  BookOpen,
  ShoppingCart,
  Calendar,
  UserPlus,
  PhoneCall,
  ChevronLeft,
  Send,
  ShieldAlert,
  Briefcase,
  Gift,
  RotateCcw,
  Video
} from 'lucide-react';
import { WhatsAppOutlined } from '@ant-design/icons';
import { isAuthenticated, getStoredUser, getUserRole } from '../../utils/global_auth';
import axios from 'axios';
import url from '../../url';
import './LiveChatWidget.css';

interface FAQItem {
  _id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  priority: number;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  options?: { label: string; action: 'category' | 'question' | 'link'; payload: any }[];
  date: Date;
}

const LiveChatWidget: React.FC = () => {
  const brandName = 'Draa';
  const brandLogo = '/brand/draa-mark.png';
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'chat' | 'callback'>('chat');
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  
  const [callbackData, setCallbackData] = useState({ name: '', phone: '' });
  const [sending, setSending] = useState(false);
  const [botMessage, setBotMessage] = useState<string>(''); // used for callback feedback
  const [isWiggling, setIsWiggling] = useState(false);
  const [shouldHide, setShouldHide] = useState(false);
  
  const user = getStoredUser();
  const loggedIn = isAuthenticated();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const WHATSAPP_NUMBER = '918076003728';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Check route exclusions
  useEffect(() => {
    const checkPath = () => {
      const path = window.location.pathname.toLowerCase();
      const role = getUserRole();

      // Always hide bot widget for Admin and Teacher users in management views
      if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'TEACHER') {
        setShouldHide(true);
        return;
      }
      
      if (
        path === '/student-login' ||
        path === '/student-register' ||
        path === '/teacher-login' ||
        path === '/teacher-register' ||
        path === '/admin-login' ||
        path === '/admin-register' ||
        path === '/forgot-password' ||
        path === '/teacher/forgot-password'
      ) {
        setShouldHide(false);
        return;
      }

      const hidePrefixes = [
        '/admin',
        '/teacher',
        '/v2/student',
        '/add-',
        '/addcourse',
        '/addcourses',
        '/manage-',
        '/managecourses',
        '/publish-',
        '/content-details',
        '/coursedetails',
        '/updatecourse',
        '/update-course',
        '/assignments',
        '/upload-assignment',
        '/live-sessions',
        '/exam/edit',
        '/previous-year-questions/manage',
        '/syllabus/manage',
        '/current-affairs/management',
        '/exam-sections',
        '/support',
        '/userprofile',
        '/teacherprofile',
        '/course-categories',
        '/students/',
        '/dashboard'
      ];

      if (hidePrefixes.some(prefix => path.startsWith(prefix))) {
        setShouldHide(true);
        return;
      }

      if (
        path.startsWith('/student-dashboard') ||
        path.startsWith('/student/')
      ) {
        setShouldHide(true);
        return;
      }

      if (
        path === '/exams' ||
        path === '/books' ||
        path === '/book-categories' ||
        path === '/jobs' ||
        path === '/job-categories'
      ) {
        setShouldHide(true);
        return;
      }

      if (path.startsWith('/test-series/')) {
        if (!path.startsWith('/test-series/examination') && !path.startsWith('/test-series/subject')) {
          setShouldHide(true);
          return;
        }
      }

      setShouldHide(false);
    };

    checkPath();
    const interval = setInterval(checkPath, 300);
    return () => clearInterval(interval);
  }, []);

  // Fetch FAQs from database
  useEffect(() => {
    const fetchPublicFAQs = async () => {
      try {
        const res = await axios.get(`${url}/chatbot/public`);
        if (res.data?.success) {
          const list: FAQItem[] = res.data.data || [];
          setFaqs(list);
          // extract unique active categories
          const uniqueCats = Array.from(new Set(list.map(f => f.category)));
          setCategories(uniqueCats);
        }
      } catch (err) {
        console.error("Failed to load chatbot FAQs:", err);
      }
    };
    fetchPublicFAQs();
  }, []);

  // Initialize Chat history
  useEffect(() => {
    if (faqs.length > 0 && messages.length === 0) {
      resetChat();
    }
  }, [faqs]);

  // Scroll to bottom helper
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, view]);

  // Wiggle floating button
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen) {
        setIsWiggling(true);
        setTimeout(() => setIsWiggling(false), 1000);
      }
    }, 25000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const resetChat = () => {
    const welcomeMsg: ChatMessage = {
      id: 'welcome',
      sender: 'bot',
      text: `Hi ${loggedIn ? user?.name : 'there'}! I am your ${brandName} assistant. How can I help you today? You can type a question below or select a topic to get started:`,
      options: categories.map(cat => ({ label: cat, action: 'category', payload: cat })),
      date: new Date()
    };
    setMessages([welcomeMsg]);
    setView('chat');
  };

  // Dynamic Lucide icons for categories
  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('purchase') || cat.includes('payment') || cat.includes('price')) {
      return <ShoppingCart size={16} />;
    }
    if (cat.includes('login') || cat.includes('access') || cat.includes('account')) {
      return <BookOpen size={16} />;
    }
    if (cat.includes('exam') || cat.includes('test') || cat.includes('pattern') || cat.includes('series')) {
      return <Calendar size={16} />;
    }
    if (cat.includes('career') || cat.includes('job') || cat.includes('placement')) {
      return <Briefcase size={16} />;
    }
    if (cat.includes('offer') || cat.includes('reward') || cat.includes('coin') || cat.includes('gift')) {
      return <Gift size={16} />;
    }
    if (cat.includes('tech') || cat.includes('support') || cat.includes('video') || cat.includes('pdf')) {
      return <ShieldAlert size={16} />;
    }
    return <HelpCircle size={16} />;
  };

  // simulated typing and response
  const triggerBotResponse = (userText: string, botText: string, options?: ChatMessage['options']) => {
    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      date: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botText,
        options,
        date: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  // Handle Option Click
  const handleOptionClick = (option: any) => {
    if (option.action === 'category') {
      const catName = option.payload;
      const questionsInCat = faqs.filter(f => f.category === catName && f.isActive);
      
      triggerBotResponse(
        catName,
        `Here are the common questions about "${catName}":`,
        questionsInCat.map(q => ({ label: q.question, action: 'question', payload: q }))
      );
    } else if (option.action === 'question') {
      const faq: FAQItem = option.payload;
      triggerBotResponse(
        faq.question,
        faq.answer,
        [
          { label: "← Back to Categories", action: 'link', payload: 'back' }
        ]
      );
    } else if (option.action === 'link') {
      if (option.payload === 'back') {
        triggerBotResponse(
          "Back to Main Menu",
          "What else would you like to explore?",
          categories.map(cat => ({ label: cat, action: 'category', payload: cat }))
        );
      }
    }
  };

  // keyword matching algorithm
  const findBestMatch = (query: string): FAQItem | null => {
    if (!query) return null;
    const cleanQuery = query.toLowerCase().replace(/[?.,!]/g, '');
    const queryWords = cleanQuery.split(/\s+/).filter(w => w.length > 2); // ignore short words

    if (queryWords.length === 0) return null;

    let bestMatch: FAQItem | null = null;
    let highestScore = 0;

    for (const faq of faqs) {
      const cleanQuestion = faq.question.toLowerCase().replace(/[?.,!]/g, '');
      const questionWords = cleanQuestion.split(/\s+/);

      let score = 0;
      for (const qw of queryWords) {
        if (questionWords.includes(qw)) {
          score += 2; // match full word
        } else if (cleanQuestion.includes(qw)) {
          score += 1; // match substring
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = faq;
      }
    }

    return highestScore > 0 ? bestMatch : null;
  };

  // Handle typed query
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const query = messageInput.trim();
    if (!query) return;

    setMessageInput('');
    
    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      date: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const match = findBestMatch(query);
      let responseText = "";
      let options: ChatMessage['options'] = [];

      if (match) {
        responseText = match.answer;
        options = [{ label: "← Back to Categories", action: 'link', payload: 'back' }];
      } else {
        responseText = "I'm sorry, I couldn't find a direct answer to that query. Please try searching with different keywords, select a topic below, or schedule a callback!";
        options = categories.map(cat => ({ label: cat, action: 'category', payload: cat }));
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: responseText,
        options,
        date: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    }, 700);
  };

  // Submit callback request
  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackData.name || !callbackData.phone || sending) return;
    
    try {
      setSending(true);
      await axios.post(`${url}/admin/contactus/contact/submit`, {
        name: callbackData.name,
        email: user?.email || 'callback-request@draa.in',
        phone: callbackData.phone,
        subject: 'Call Back Request',
        message: 'Requesting a call back from Live Chat Bot'
      });
      setBotMessage('Thank you! Our expert counselor will call you within 24 hours.');
      setCallbackData({ name: '', phone: '' });
      setTimeout(() => {
        setView('chat');
        setBotMessage('');
        resetChat();
      }, 5000);
    } catch (error) {
      setBotMessage('Something went wrong. Please try again or chat on WhatsApp.');
    } finally {
      setSending(false);
    }
  };

  const handleWhatsAppChat = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Hello, I need some help regarding ${brandName}!`, '_blank');
  };

  if (shouldHide) return null;

  return (
    <div className="live-chat-container draa-chat">
      <div className={`live-chat-window ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="live-chat-header">
          <div className="live-chat-header-info">
            <div className="live-chat-avatar">
              <img src={brandLogo} alt={brandName} />
              <span className="online-dot"></span>
            </div>
            <div>
              <h4>{brandName} Bot</h4>
              <p>Online Assistant</p>
            </div>
          </div>
          <button className="live-chat-close" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="live-chat-body">
          {view === 'chat' ? (
            <div className="conversational-chat-feed" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {messages.map((msg) => {
                const isBot = msg.sender === 'bot';
                return (
                  <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignSelf: isBot ? "flex-start" : "flex-end", maxWidth: "85%" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      {isBot && (
                        <div className="bot-avatar-small">
                          <img src={brandLogo} alt={brandName} />
                        </div>
                      )}
                      <div className={`chat-bubble ${isBot ? 'received' : 'sent'}`}>
                        {msg.text}
                      </div>
                    </div>

                    {/* Quick Options Chips */}
                    {isBot && msg.options && msg.options.length > 0 && (
                      <div className="chat-chips-container" style={{ paddingLeft: 46 }}>
                        {msg.options.map((opt, i) => (
                          <button 
                            key={i} 
                            className="chat-chip" 
                            onClick={() => handleOptionClick(opt)}
                          >
                            {opt.action === 'category' && getCategoryIcon(opt.payload)}
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {isTyping && (
                <div style={{ display: "flex", gap: 8, alignItems: "center", alignSelf: "flex-start" }}>
                  <div className="bot-avatar-small">
                    <img src={brandLogo} alt={brandName} />
                  </div>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Callback View
            <div className="chat-callback-view">
              <button className="chat-back-btn" onClick={() => { setView('chat'); setBotMessage(''); setCallbackData({ name: '', phone: '' }); }}>
                <ChevronLeft size={18} /> Back
              </button>
              
              <div className="bot-message-chain">
                <div className="bot-intro">
                  <div className="bot-avatar-small"><img src={brandLogo} alt={brandName} /></div>
                  <div className="chat-bubble received">
                    I'll be happy to arrange a call back! Let's get your details.
                  </div>
                </div>

                <div className="chat-bubble received">What is your Full Name?</div>

                {callbackData.name && (
                  <div className="chat-bubble sent">{callbackData.name}</div>
                )}

                {!callbackData.name && (
                  <form className="mini-bot-input" onSubmit={(e: any) => {
                    e.preventDefault();
                    const val = e.target.elements.name.value;
                    if (val) setCallbackData({ ...callbackData, name: val });
                  }}>
                    <input name="name" type="text" placeholder="Type your name..." autoFocus required />
                    <button type="submit"><Send size={16} /></button>
                  </form>
                )}

                {callbackData.name && (
                  <>
                    <div className="chat-bubble received">Great! And your phone number?</div>
                    
                    {botMessage ? (
                      <>
                        <div className="chat-bubble sent">{callbackData.phone}</div>
                        <div className="chat-bubble received">{botMessage}</div>
                      </>
                    ) : (
                      <form className="mini-bot-input" onSubmit={async (e: any) => {
                        e.preventDefault();
                        const phone = e.target.elements.phone.value;
                        if (!/^\d{10}$/.test(phone)) return alert('Enter valid 10-digit number');
                        
                        try {
                          setSending(true);
                          await axios.post(`${url}/admin/contactus/contact/submit`, {
                            name: callbackData.name,
                            email: user?.email || 'callback-request@draa.in',
                            phone: phone,
                            subject: 'Call Back Request',
                            message: 'Requesting a call back from Live Chat Bot'
                          });
                          setCallbackData({ ...callbackData, phone });
                          setBotMessage('Thank you! Our expert counselor will call you within 24 hours.');
                          setTimeout(() => {
                            setView('chat');
                            setBotMessage('');
                            resetChat();
                          }, 5000);
                        } catch (err) {
                          setBotMessage('Failed to submit. Please try again later.');
                        } finally {
                          setSending(false);
                        }
                      }}>
                        <input name="phone" type="tel" placeholder="10-digit number..." autoFocus required />
                        <button type="submit" disabled={sending}><Send size={16} /></button>
                      </form>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Persistent Pill Action Buttons (Helpful links & actions) */}
        {view === 'chat' && (
          <div style={{ display: "flex", gap: 6, padding: "8px 14px 0", background: "#f8fafc", flexWrap: "wrap" }}>
            <button className="chat-chip" onClick={() => setView('callback')} style={{ background: "#eee3d0", borderColor: "#a5b4fc", color: "#9b6118" }}>
              <PhoneCall size={12} /> Call Back
            </button>
            <button className="chat-chip" onClick={handleWhatsAppChat} style={{ background: "#dcfce7", borderColor: "#86efac", color: "#16a34a" }}>
              <WhatsAppOutlined style={{ fontSize: 12 }} /> WhatsApp
            </button>
            <button className="chat-chip" onClick={resetChat} style={{ color: "#475569" }}>
              <RotateCcw size={12} /> Restart Chat
            </button>
          </div>
        )}

        {/* Text Input Footer */}
        {view === 'chat' && (
          <form className="chat-input-area" onSubmit={handleSendMessage}>
            <input 
              type="text" 
              placeholder="Ask a question..." 
              value={messageInput} 
              onChange={(e) => setMessageInput(e.target.value)} 
            />
            <button type="submit" disabled={!messageInput.trim()}>
              <Send size={16} />
            </button>
          </form>
        )}
        
        <div className="live-chat-brand">
          Official Support by <strong>{brandName}</strong>
        </div>
      </div>

      {/* Floating Toggle Button */}
      <button
        className={`live-chat-toggle-btn ${isWiggling ? 'wiggle' : ''} ${isOpen ? 'hide' : ''}`}
        onClick={() => setIsOpen(true)}
      >
        <img src={brandLogo} className="float-icon" alt={`${brandName} live chat`} />
        <span className="live-chat-tooltip">Help Bot: Have a question?</span>
      </button>
    </div>
  );
};

export default LiveChatWidget;
