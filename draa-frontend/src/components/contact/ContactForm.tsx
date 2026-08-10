import React, { useState } from'react';
import toast from '../../utils/toast';
import { Form, Input, Button, Select, Row, Col, Card, Modal } from'antd';
import {
  Phone,
  Mail,
  MapPin,
  Send,
  Clock,
  CheckCircle,
  GraduationCap,
  CreditCard,
  Settings
} from'lucide-react';
import url from'../../url';
import'./ContactPage.css';

const { TextArea } = Input;
const { Option } = Select;

export default function ContactPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState('');

  const contactData = {
    phone:"+91 90978 24112",
    emails: ["info@draa.com","support@draa.com"],
    office:"Building no 1, 3rd floor, opp. Sapna cinema, above Bikanervala Community centre, D Block, East of Kailash, New Delhi, Delhi 110065"
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const response = await fetch(`${url}/admin/contactus/contact/submit`, {
        method:'POST',
        headers: {'Content-Type':'application/json' },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success("Message sent successfully!");
        setSubmissionId(data.data?.reference || `REF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
        setSubmitted(true);
        form.resetFields();
      } else {
        toast.error(data.message ||"Submission failed");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-marketplace-wrapper">
      <div className="container">

        {/* HEADER SECTION */}
        <header className="contact-header">
          <h1>Contact Us</h1>
          <p>Have questions about our educational resources? We're here to help you find the right documents for your studies.</p>
          <div className="response-pill">
            <Clock size={16} /> We usually respond within 12 hours.
          </div>
        </header>

        <div className="contact-main-grid">
          {/* LEFT: Message Form */}
          <Card className="message-form-card" bordered={false}>
            <h2>Send Us a Message</h2>
            <p>Fill out the form below and our team will get back to you shortly.</p>
            <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
              <Row gutter={20}>
                <Col xs={24} sm={12}><Form.Item name="name" label="Full Name" rules={[{ required: true }]}><Input placeholder="John Doe" size="large" /></Form.Item></Col>
                <Col xs={24} sm={12}><Form.Item name="email" label="Email Address" rules={[{ required: true, type:'email' }]}><Input placeholder="john@example.com" size="large" /></Form.Item></Col>
              </Row>
              <Row gutter={20}>
                <Col xs={24} sm={12}><Form.Item name="phone" label="Phone Number" rules={[{ required: true }]}><Input placeholder="+91 00000 00000" size="large" /></Form.Item></Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="subject" label="Subject" rules={[{ required: true }]}>
                    <Select placeholder="General Inquiry" size="large">
                      <Option value="General Inquiry">General Inquiry</Option>
                      <Option value="Course Help">Course Help</Option>
                      <Option value="Billing">Billing & Payment</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="message" label="Your Message" rules={[{ required: true }]}><TextArea rows={5} placeholder="How can we help you?" /></Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} className="btn-send-message">Send Message</Button>
            </Form>
          </Card>

          {/* RIGHT: Contact Info Cards */}
          <aside className="contact-sidebar">
            <Card className="info-mini-card">
              <div className="icon-box blue"><Phone size={20} /></div>
              <div className="info-content">
                <h3>Call Us</h3>
                <a href={`tel:080760 03728`}>080760 03728</a>
                <span>Mon-Fri, 9am - 6pm IST</span>
              </div>
            </Card>
            <Card className="info-mini-card">
              <div className="icon-box purple"><Mail size={20} /></div>
              <div className="info-content">
                <h3>Email Us</h3>
                <a href={`mailto:contact@draa.in`}>contact@draa.in</a>
              </div>
            </Card>
            <Card className="info-mini-card">
              <div className="icon-box light-blue"><MapPin size={20} /></div>
              <div className="info-content">
                <h3>Visit Our Office</h3>
                <p>{contactData.office}</p>
              </div>
            </Card>
          </aside>
        </div>

        {/*  FIXED: WHY CONTACT SECTION */}
        <section className="why-contact-full-width">
          <div className="why-contact-inner">
            <h2 className="why-title">Why Contact Draa?</h2>
            <Row gutter={[40, 40]} justify="center">
              <Col xs={24} md={8}>
                <div className="figma-feature-item">
                  <div className="figma-f-icon"><GraduationCap size={28} /></div>
                  <h4>Course Recommendations</h4>
                  <p>Not sure where to start? Our educators can recommend the perfect documents for your specific curriculum.</p>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="figma-feature-item">
                  <div className="figma-f-icon"><CreditCard size={28} /></div>
                  <h4>Payment & Billing</h4>
                  <p>Fast and secure resolution for any subscription or billing queries to keep your learning uninterrupted.</p>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="figma-feature-item">
                  <div className="figma-f-icon"><Settings size={28} /></div>
                  <h4>Technical Guidance</h4>
                  <p>Encountered a bug or need help navigating the platform? Our tech support team is ready to assist.</p>
                </div>
              </Col>
            </Row>
          </div>
        </section>
      </div>

      <Modal open={submitted} onCancel={() => setSubmitted(false)} footer={[<Button key="ok" type="primary" onClick={() => setSubmitted(false)}>OK</Button>]} centered>
        <div className="success-modal-body">
          <CheckCircle size={60} color="#52c41a" />
          <h2>Message Sent!</h2>
          <p>Reference ID: <strong>{submissionId}</strong></p>
        </div>
      </Modal>
    </div>
  );
}