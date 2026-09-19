import fs from 'node:fs';
import path from 'node:path';

const IMAGES = [
  {
    filename: 'jaipur-hawa-mahal.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Hawa_Mahal_Jaipur.jpg'
  },
  {
    filename: 'mysore-palace.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Mysore_Palace.jpg'
  }
];

const destDir = path.resolve('frontend/study-india/public/media/heritage');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function downloadExtra() {
  for (const item of IMAGES) {
    await sleep(2500);
    const target = path.join(destDir, item.filename);
    try {
      console.log(`Downloading ${item.filename}...`);
      const res = await fetch(item.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0' }
      });
      if (!res.ok) {
        console.error(`Failed ${item.filename}: HTTP ${res.status}`);
        continue;
      }
      const buffer = await res.arrayBuffer();
      fs.writeFileSync(target, Buffer.from(buffer));
      console.log(`  ✓ Saved ${item.filename} (${(buffer.byteLength / 1024).toFixed(0)} KB)`);
    } catch (e) {
      console.error(`Error downloading ${item.filename}:`, e.message);
    }
  }
}

downloadExtra();
