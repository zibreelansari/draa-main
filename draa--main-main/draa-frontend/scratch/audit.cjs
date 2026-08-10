const fs = require('fs');
const path = require('path');

const srcDir = 'c:\\STATICODER\\myedudocs\\client\\src';
const publicDir = 'c:\\STATICODER\\myedudocs\\client\\public';

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, fileList);
    } else {
      fileList.push(name);
    }
  });
  return fileList;
}

console.log('Collecting file inventory...');
const allFiles = getFiles(srcDir);
const publicFiles = getFiles(publicDir);

console.log('Reading all source contents...');
const sourceContents = allFiles
  .filter(f => /\.(tsx|ts|js|jsx|css|html)$/.test(f))
  .map(f => fs.readFileSync(f, 'utf8'))
  .join('\n');

const unusedFiles = [];
const fileCounts = {};

console.log('Analyzing references...');
allFiles.forEach(file => {
  const basename = path.basename(file, path.extname(file));
  if (basename === 'main' || basename === 'App' || file.endsWith('.d.ts')) return;
  
  // Search for basename in all contents
  // We use a regex with word boundaries to avoid partial matches
  const regex = new RegExp('\\b' + basename + '\\b', 'g');
  const matches = sourceContents.match(regex);
  const count = matches ? matches.length : 0;
  
  if (count <= 1) { // 1 match is usually for the file itself (though unlikely to have its own name inside)
     unusedFiles.push(file);
  }
});

console.log('\n--- UNUSED SOURCE FILES ---');
unusedFiles.forEach(f => console.log(f));
console.log(`\nTotal potentially unused source files: ${unusedFiles.length}`);

console.log('\n--- ANALYZING PUBLIC ASSETS ---');
const unusedPublic = [];
publicFiles.forEach(file => {
    const basename = path.basename(file);
    if (sourceContents.indexOf(basename) === -1) {
        unusedPublic.push(file);
    }
});

unusedPublic.forEach(f => console.log(f));
console.log(`\nTotal potentially unused public assets: ${unusedPublic.length}`);
