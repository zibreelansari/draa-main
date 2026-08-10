const fs = require('fs');
const path = require('path');

const ignoreDirs = ['node_modules', '.git', 'dist', 'build', 'public'];
const ignoreFiles = ['package-lock.json', 'replace.js', 'build_output.txt', '.npmrc'];
const validExts = ['.js', '.ts', '.tsx', '.json', '.html', '.css', '.md'];

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        try {
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                if (!ignoreDirs.includes(file)) walk(fullPath);
            } else {
                const ext = path.extname(fullPath);
                if (!ignoreFiles.includes(file) && validExts.includes(ext)) {
                    let content = fs.readFileSync(fullPath, 'utf8');
                    let newContent = content;
                    
                    // Specific domain first
                    newContent = newContent.replace(/myedudocs\.in/gi, 'draa.in');
                    
                    // Names
                    newContent = newContent.replace(/MyEdudocs/g, 'Draa');
                    newContent = newContent.replace(/MyEduDocs/g, 'Draa');
                    newContent = newContent.replace(/myedudocs/g, 'draa');
                    newContent = newContent.replace(/MYEDUDOCS/g, 'DRAA');
                    
                    if (newContent !== content) {
                        fs.writeFileSync(fullPath, newContent, 'utf8');
                        console.log('Updated:', fullPath);
                    }
                }
            }
        } catch (e) {}
    }
}

walk('.');
