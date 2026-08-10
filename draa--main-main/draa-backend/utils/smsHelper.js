const axios = require('axios');

/**
 * Sends a 6-digit OTP to a mobile phone number using Fast2SMS or Twilio.
 * Falls back to console log if no credentials are configured.
 * 
 * @param {string} phone 10-digit phone number
 * @param {string} otp 6-digit OTP
 * @returns {Promise<{success: boolean, provider: string, message: string}>}
 */
const sendSMS = async (phone, otp) => {
  const cleanPhone = phone.replace(/\D/g,''); // strip any non-numeric chars
  const fast2smsKey = process.env.FAST2SMS_API_KEY;
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_FROM_NUMBER;

  if (fast2smsKey) {
    try {
      // Fast2SMS API expects Indian mobile numbers to be 10 digits.
      // If the clean phone is longer (e.g. starts with 91), take the last 10 digits.
      const targetPhone = cleanPhone.length > 10 ? cleanPhone.slice(-10) : cleanPhone;
      const route = process.env.FAST2SMS_ROUTE ||'q'; // Default to'q' (Quick SMS, no DLT required)

      let payload = {};
      if (route ==='otp') {
        // OTP route (requires DLT approved Template ID and Sender ID)
        payload = {
          route:'otp',
          variables_values: otp,
          numbers: targetPhone
        };
      } else {
        // Quick SMS route (no DLT required, manual approval by Fast2SMS)
        payload = {
          route:'q',
          message: `Your OTP for Draa is ${otp}. It is valid for 10 minutes.`,
          language:'english',
          flash: 0,
          numbers: targetPhone
        };
      }

      console.log(`[SMS Helper] Dispatching OTP via Fast2SMS (${route} route) to +91 ${targetPhone}...`);
      
      const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', payload, {
        headers: {
'authorization': fast2smsKey,
'Content-Type':'application/json'
        }
      });

      if (response.data && response.data.return === true) {
        console.log(`[SMS Helper] Fast2SMS: OTP successfully sent to +91 ${targetPhone}`);
        return {
          success: true,
          provider:'Fast2SMS',
          message:'OTP sent to your phone number via Fast2SMS SMS.'
        };
      } else {
        console.error('[SMS Helper] Fast2SMS Error Response:', response.data);
        throw new Error(response.data.message ||'Fast2SMS API returned failure');
      }
    } catch (err) {
      const errorMsg = err.response && err.response.data 
        ? (typeof err.response.data ==='object' ? JSON.stringify(err.response.data) : err.response.data)
        : err.message;
      console.error('[SMS Helper] Fast2SMS failed, falling back to console log:', errorMsg);
      logToConsole(phone, otp, `Fast2SMS ERROR: ${errorMsg}`);
      return {
        success: false,
        provider:'Fallback/Console',
        message: `Failed to send SMS via Fast2SMS: ${errorMsg}. (Developer fallback: check server console)`
      };
    }
  } else if (twilioSid && twilioAuthToken && twilioFrom) {
    try {
      // Twilio requires E.164 format. If it doesn't start with'+', add'+91' as default for India, or'+' if it looks like an international number.
      let targetPhone = phone.trim();
      if (!targetPhone.startsWith('+')) {
        if (targetPhone.length === 10) {
          targetPhone = `+91${targetPhone}`;
        } else {
          targetPhone = `+${targetPhone}`;
        }
      }

      const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;

      const params = new URLSearchParams();
      params.append('To', targetPhone);
      params.append('From', twilioFrom);
      params.append('Body', `Your OTP for Draa is ${otp}. It is valid for 10 minutes.`);

      console.log(`[SMS Helper] Dispatching OTP via Twilio to ${targetPhone}...`);
      const response = await axios.post(url, params, {
        auth: {
          username: twilioSid,
          password: twilioAuthToken
        },
        headers: {
'Content-Type':'application/x-www-form-urlencoded'
        }
      });

      if (response.data && response.data.sid) {
        console.log(`[SMS Helper] Twilio: OTP successfully sent to ${targetPhone} (SID: ${response.data.sid})`);
        return {
          success: true,
          provider:'Twilio',
          message:'OTP sent to your phone number via Twilio SMS.'
        };
      } else {
        throw new Error('Twilio API did not return a Message SID');
      }
    } catch (err) {
      const errorMsg = err.response && err.response.data ? JSON.stringify(err.response.data) : err.message;
      console.error('[SMS Helper] Twilio failed, falling back to console log:', errorMsg);
      logToConsole(phone, otp, `Twilio ERROR: ${errorMsg}`);
      return {
        success: false,
        provider:'Fallback/Console',
        message: `Failed to send SMS via Twilio. (Developer fallback: check server console)`
      };
    }
  } else {
    // Fallback: no API keys configured
    logToConsole(phone, otp,'NO GATEWAY CONFIG');
    return {
      success: true,
      provider:'Console',
      message:'SMS gateway not configured. OTP printed to server console.'
    };
  }
};

const logToConsole = (phone, otp, reason) => {
  console.log(`\n======================================================`);
  console.log(` [PHONE OTP VERIFICATION] (FALLBACK - ${reason})`);
  console.log(` Phone:  +91 ${phone}`);
  console.log(` OTP:    ${otp}  (Valid for 10 minutes)`);
  console.log(`======================================================\n`);
};

module.exports = { sendSMS };
