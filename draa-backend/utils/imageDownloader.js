const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function downloadExternalImage(url) {
  try {
    if (!url || !url.startsWith('http')) return url;
    
    // Ensure uploads directory exists
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Derive file extension from URL
    let ext = 'jpg';
    try {
      const parsedUrl = new URL(url);
      const pathParts = parsedUrl.pathname.split('.');
      if (pathParts.length > 1) {
        const derivedExt = pathParts.pop().split('?')[0];
        if (derivedExt && derivedExt.length <= 4 && /^[a-zA-Z0-9]+$/.test(derivedExt)) {
          ext = derivedExt;
        }
      }
    } catch (e) {
      // Fallback to default jpg
    }
    
    const filename = `ai-cover-${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`;
    const filePath = path.join(uploadDir, filename);
    
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    });
    
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);
    
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    
    return `uploads/${filename}`;
  } catch (error) {
    console.error('Failed to download external image:', error.message);
    return '';
  }
}

module.exports = {
  downloadExternalImage
};
