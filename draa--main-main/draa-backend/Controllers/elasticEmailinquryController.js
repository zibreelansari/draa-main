// services/elasticEmailService.js
const axios = require('axios');

class ElasticEmailService {
    constructor() {
        this.apiKey = process.env.ELASTIC_EMAIL_API_KEY;
        this.baseURL ='https://api.elasticemail.com/v2';
        this.fromEmail = process.env.FROM_EMAIL;
        this.fromName = process.env.FROM_NAME;

        if (!this.apiKey) {
            throw new Error('ELASTIC_EMAIL_API_KEY is required in environment variables');
        }
    }

    async sendEmail({ to, subject, htmlContent, textContent = null }) {
        try {
            const emailData = {
                apikey: this.apiKey,
                from: this.fromEmail,
                fromName: this.fromName,
                to: to,
                subject: subject,
                bodyHtml: htmlContent,
                bodyText: textContent || this.stripHtml(htmlContent),
                isTransactional: true
            };

            const response = await axios.post(
                `${this.baseURL}/email/send`,
                new URLSearchParams(emailData),
                {
                    headers: {
'Content-Type':'application/x-www-form-urlencoded'
                    },
                    timeout: 30000
                }
            );

            if (response.data.success) {
                return {
                    success: true,
                    messageId: response.data.data.messageid,
                    data: response.data
                };
            } else {
                throw new Error(response.data.error ||'Failed to send email');
            }
        } catch (error) {
            console.error('Elastic Email Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.error || error.message ||'Email service unavailable');
        }
    }

    async sendOtpEmail(email, name, otp) {
        const htmlContent = this.generateOtpEmailTemplate(name, otp);
        const subject ='Email Verification - Your OTP Code';

        return this.sendEmail({
            to: email,
            subject,
            htmlContent
        });
    }

    async sendWelcomeEmail(email, name) {
        const htmlContent = this.generateWelcomeEmailTemplate(name);
        const subject ='Welcome! Your inquiry has been received';

        return this.sendEmail({
            to: email,
            subject,
            htmlContent
        });
    }

    generateOtpEmailTemplate(name, otp) {
        return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont,'Segoe UI', Roboto,'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6; 
                color: #333; 
                max-width: 600px; 
                margin: 0 auto; 
                padding: 20px;
                background-color: #f8f9fa;
            }
            .container { 
                background: white; 
                padding: 40px; 
                border-radius: 16px; 
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                border: 1px solid #e9ecef;
            }
            .header { 
                text-align: center; 
                margin-bottom: 40px; 
                padding-bottom: 20px;
                border-bottom: 2px solid #f8f9fa;
            }
            .logo { 
                font-size: 28px; 
                font-weight: bold; 
                color: #667eea; 
                margin-bottom: 8px;
            }
            .title { 
                font-size: 24px; 
                color: #2d3748; 
                margin: 20px 0;
                font-weight: 600;
            }
            .otp-box { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 24px; 
                text-align: center; 
                border-radius: 12px; 
                margin: 30px 0;
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
            }
            .otp-code { 
                font-size: 36px; 
                font-weight: bold; 
                letter-spacing: 8px; 
                font-family:'Courier New', monospace;
                text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .otp-label { 
                font-size: 14px; 
                opacity: 0.9; 
                margin-top: 8px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .content { 
                font-size: 16px; 
                line-height: 1.8; 
                margin: 25px 0;
                color: #4a5568;
            }
            .warning { 
                background: #fff3cd; 
                border: 1px solid #ffeaa7; 
                padding: 20px; 
                border-radius: 8px; 
                margin: 25px 0;
                border-left: 4px solid #f39c12;
            }
            .warning-icon { 
                color: #f39c12; 
                font-size: 18px; 
                margin-right: 8px;
            }
            .footer { 
                text-align: center; 
                margin-top: 40px; 
                padding-top: 30px; 
                border-top: 1px solid #e9ecef; 
                color: #6c757d; 
                font-size: 14px;
            }
            .company-info { 
                margin-top: 20px; 
                font-size: 13px; 
                color: #8e9aaf;
            }
            .highlight { 
                color: #667eea; 
                font-weight: 600;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo"> EduPlatform</div>
                <h1 class="title">Email Verification Required</h1>
                <p>Hi <strong>${name}</strong>! Please verify your email address to complete your inquiry.</p>
            </div>
            
            <div class="content">
                <p>Thank you for your interest in our courses! To complete your inquiry submission, please use the verification code below:</p>
            </div>
            
            <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <div class="otp-label">Verification Code</div>
            </div>
            
            <div class="content">
                <p>Enter this <span class="highlight">6-digit code</span> on the verification page to confirm your email address.</p>
            </div>
            
            <div class="warning">
                <span class="warning-icon"></span>
                <strong>Important:</strong> This code will expire in <strong>10 minutes</strong> for security reasons. 
                If you didn't request this verification, please ignore this email.
            </div>
            
            <div class="content">
                <p><strong>What happens next?</strong></p>
                <ul style="padding-left: 20px; color: #4a5568;">
                    <li> Our education counselor will contact you within 24 hours</li>
                    <li> Discuss your learning goals and preferences</li>
                    <li> Get personalized course recommendations</li>
                    <li> Start your learning journey with us</li>
                </ul>
            </div>
            
            <div class="footer">
                <p>Questions? Reply to this email or contact our support team.</p>
                <div class="company-info">
                    <p><strong>Your Education Platform</strong><br>
                    Email: support@yourdomain.com | Phone: +1 (555) 123-4567</p>
                    <p>This is an automated message. Please do not reply directly to this email.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
    }

    generateWelcomeEmailTemplate(name) {
        return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Our Platform</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont,'Segoe UI', Roboto, sans-serif;
                line-height: 1.6; 
                color: #333; 
                max-width: 600px; 
                margin: 0 auto; 
                padding: 20px;
                background-color: #f8f9fa;
            }
            .container { 
                background: white; 
                padding: 40px; 
                border-radius: 16px; 
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .header { 
                text-align: center; 
                margin-bottom: 40px;
            }
            .success-icon { 
                font-size: 64px; 
                margin-bottom: 20px;
            }
            .title { 
                font-size: 28px; 
                color: #10b981; 
                margin: 20px 0;
                font-weight: 700;
            }
            .content { 
                font-size: 16px; 
                line-height: 1.8; 
                margin: 25px 0;
                color: #4a5568;
            }
            .success-box { 
                background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                color: white; 
                padding: 30px; 
                text-align: center; 
                border-radius: 12px; 
                margin: 30px 0;
            }
            .footer { 
                text-align: center; 
                margin-top: 40px; 
                padding-top: 30px; 
                border-top: 1px solid #e9ecef; 
                color: #6c757d; 
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="success-icon"></div>
                <h1 class="title">Welcome, ${name}!</h1>
                <p>Your inquiry has been successfully submitted and verified.</p>
            </div>
            
            <div class="success-box">
                <h2 style="margin: 0 0 15px 0; font-size: 24px;"> Inquiry Confirmed</h2>
                <p style="margin: 0; font-size: 18px; opacity: 0.95;">Our team will contact you within 24 hours</p>
            </div>
            
            <div class="content">
                <p><strong>What's Next?</strong></p>
                <ul style="padding-left: 20px;">
                    <li> Personal consultation call to understand your needs</li>
                    <li> Discussion about your learning goals and career objectives</li>
                    <li> Customized course recommendations based on your interests</li>
                    <li> Guidance on starting your learning journey with us</li>
                </ul>
                
                <p>Thank you for choosing us for your educational journey. We're excited to help you achieve your learning goals!</p>
            </div>
            
            <div class="footer">
                <p><strong>Need immediate assistance?</strong><br>
                Email: support@yourdomain.com | Phone: +1 (555) 123-4567</p>
                <p style="margin-top: 20px; font-size: 12px; color: #8e9aaf;">
                    © 2025 Your Education Platform. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
    }

    stripHtml(html) {
        return html.replace(/<[^>]*>/g,'').replace(/\s+/g,'').trim();
    }
}

module.exports = new ElasticEmailService();
