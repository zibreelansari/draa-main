import React, { useState } from'react';
import toast from '../../utils/toast';
import { X, Send, User, Mail, Phone, MessageSquare, Loader2 } from'lucide-react';
import axios from'axios';
import url from'../../url';
import'./ServiceLeadModal.css';

interface ServiceLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceTitle: string;
}

const ServiceLeadModal: React.FC<ServiceLeadModalProps> = ({ isOpen, onClose, serviceTitle }) => {
  const [formData, setFormData] = useState({
    name:'',
    email:'',
    phone:'',
    message: `I'm interested in learning more about ${serviceTitle}.`
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${url}/admin/contactus/contact/submit`, {
        ...formData,
        subject: `Inquiry for ${serviceTitle}`,
        targetEmail:'admin@draa.in'
      });

      if (response.data.success) {
        toast.success('Thank you! Your inquiry has been sent successfully.');
        setFormData({
          name:'',
          email:'',
          phone:'',
          message: `I'm interested in learning more about ${serviceTitle}.`
        });
        onClose();
      }
    } catch (error: any) {
      console.error('Lead submission error:', error);
      toast.error(error.response?.data?.message ||'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="lead-modal-overlay" onClick={onClose}>
      <div className="lead-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="lead-modal-header">
          <h2>Know More About <span className="sx-title-gradient">{serviceTitle}</span></h2>
          <p>Fill out the form below and our experts will get back to you shortly.</p>
        </div>

        <form onSubmit={handleSubmit} className="lead-modal-form">
          <div className="modal-input-group">
            <label htmlFor="name"><User size={18} /> Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="John Doe"
              required
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="modal-input-group">
                <label htmlFor="email"><Mail size={18} /> Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="john@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="modal-input-group">
                <label htmlFor="phone"><Phone size={18} /> Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="9876543210"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="modal-input-group">
            <label htmlFor="message"><MessageSquare size={18} /> Your Message</label>
            <textarea
              id="message"
              name="message"
              rows={4}
              placeholder="Tell us about your requirements..."
              required
              value={formData.message}
              onChange={handleChange}
            ></textarea>
          </div>

          <button type="submit" className="submit-lead-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Sending...
              </>
            ) : (
              <>
                Send Inquiry <Send size={20} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ServiceLeadModal;
