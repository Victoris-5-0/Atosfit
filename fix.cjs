const fs = require('fs');
const path = require('path');
const dir = 'c:\\Users\\Mahmoud Ayman\\OneDrive\\Desktop\\GEO-atos\\src';

function replaceInFiles(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInFiles(fullPath);
    } else if (/\.(js|jsx|css|html)$/.test(file)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const orig = content;
      content = content.replace(/#ff6858/gi, '#FF8A00');
      content = content.replace(/255\s*,\s*104\s*,\s*88/g, '255, 138, 0');
      if (content !== orig) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated ' + fullPath);
      }
    }
  }
}

replaceInFiles(dir);
