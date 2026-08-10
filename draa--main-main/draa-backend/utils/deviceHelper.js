const axios = require('axios');
const mongoose = require('mongoose');
const { noReplyTransporter: transporter } = require('./mailConfig');
const emailTemplates = require('./emailTemplates');

const getDeviceInfo = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  
  let cleanIp = ip;
  if (cleanIp.includes(',')) {
    cleanIp = cleanIp.split(',')[0].trim();
  }
  if (cleanIp === '::1' || cleanIp === '127.0.0.1' || cleanIp.startsWith('::ffff:127.0.0.1')) {
    cleanIp = '127.0.0.1';
  }

  // Parse OS
  let os = 'Unknown OS';
  if (/windows/i.test(userAgent)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(userAgent)) os = 'macOS';
  else if (/android/i.test(userAgent)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(userAgent)) os = 'iOS';
  else if (/linux/i.test(userAgent)) os = 'Linux';

  // Parse Browser
  let browser = 'Unknown Browser';
  if (/chrome|crios/i.test(userAgent) && !/edge|edg/i.test(userAgent) && !/opr/i.test(userAgent)) browser = 'Chrome';
  else if (/safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent)) browser = 'Safari';
  else if (/firefox|fxios/i.test(userAgent)) browser = 'Firefox';
  else if (/edge|edg/i.test(userAgent)) browser = 'Edge';
  else if (/opr/i.test(userAgent)) browser = 'Opera';

  // Parse Device Type
  let deviceType = 'Browser';
  if (/mobi|android|iphone|ipad|ipod/i.test(userAgent)) {
    deviceType = /ipad|tablet/i.test(userAgent) ? 'Tablet' : 'Mobile';
  }

  return {
    os,
    browser: req.headers['x-device-browser'] || browser,
    deviceType,
    ipAddress: cleanIp
  };
};

const getIpLocation = async (ip) => {
  let lookupIp = ip;
  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    try {
      const publicIpRes = await axios.get('https://api.ipify.org?format=json', { timeout: 1000 });
      if (publicIpRes.data && publicIpRes.data.ip) {
        lookupIp = publicIpRes.data.ip;
      }
    } catch (e) {
      console.warn('Could not determine public IP, using local fallback:', e.message);
      return 'Sikkim, Majitar, India';
    }
  }
  try {
    const response = await axios.get(`http://ip-api.com/json/${lookupIp}`, { timeout: 1500 });
    if (response.data && response.data.status === 'success') {
      const { city, regionName, country } = response.data;
      let resolvedLoc = `${city || ''}, ${regionName || ''}, ${country || ''}`.replace(/^,\s*/, '').replace(/,\s*$/, '');
      // Override ISP routing locations to Sikkim, Majitar, India
      if (resolvedLoc.includes('West Bengal') || resolvedLoc.includes('Murshid') || resolvedLoc.includes('Siliguri')) {
        resolvedLoc = 'Sikkim, Majitar, India';
      }
      return resolvedLoc;
    }
  } catch (error) {
    console.error('GeoIP lookup failed:', error);
  }
  return 'Sikkim, Majitar, India';
};

const formatDateTime = (date) => {
  return date.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const registerDeviceSession = async (user, req, isRegistration = false) => {
  try {
    const info = getDeviceInfo(req);
    
    const deviceId = new mongoose.Types.ObjectId().toString();
    const newDevice = {
      deviceId,
      deviceType: info.deviceType,
      browser: info.browser,
      os: info.os,
      ipAddress: info.ipAddress,
      location: 'Sikkim, Majitar, India', // Instantly default to Sikkim, Majitar, India
      lastUsedAt: new Date(),
      registeredAt: new Date()
    };

    const existingDevices = user.devices || [];
    user.devices = [...existingDevices, newDevice];
    await user.save(); // Save to database instantly (takes milliseconds)

    // Execute GeoIP lookup and warning email asynchronously in the background
    setImmediate(async () => {
      try {
        const location = await getIpLocation(info.ipAddress);
        
        // Fetch fresh copy to avoid concurrent document update version conflicts (VersionError)
        const UserModel = mongoose.model('User');
        const dbUser = await UserModel.findById(user._id);
        if (dbUser) {
          const devIndex = dbUser.devices.findIndex(d => d.deviceId === deviceId);
          if (devIndex !== -1) {
            dbUser.devices[devIndex].location = location;
            await dbUser.save();
          }

          // Send security login notification email on every login (excluding registration)
          if (!isRegistration) {
            const dateTimeStr = formatDateTime(new Date());
            const secureAccountUrl = process.env.NODE_ENV === 'production' 
              ? 'https://draa.in/v2/student/settings' 
              : 'http://localhost:5173/v2/student/settings';
            
            const html = emailTemplates.generateNewDeviceLoginEmail(
              dbUser.name,
              dbUser.email,
              dateTimeStr,
              `${info.deviceType} (${info.browser} on ${info.os})`,
              secureAccountUrl,
              info.ipAddress,
              location
            );

            const mailOptions = {
              from: '"Draa Security" <no-reply@draa.in>',
              to: dbUser.email,
              subject: 'New device login detected in your Draa account',
              html
            };

            await transporter.sendMail(mailOptions);
            console.log(`[Background] Security email sent to ${dbUser.email}`);
          }
        }
      } catch (bgError) {
        console.error('[Background] Error updating device geolocation/email:', bgError);
      }
    });

    return deviceId;
  } catch (error) {
    console.error('Error logging device session:', error);
    return new mongoose.Types.ObjectId().toString();
  }
};

module.exports = {
  getDeviceInfo,
  getIpLocation,
  formatDateTime,
  registerDeviceSession
};
