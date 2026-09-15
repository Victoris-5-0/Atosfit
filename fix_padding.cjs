const fs = require('fs');
const path = require('path');
const dir = 'c:\\Users\\Mahmoud Ayman\\OneDrive\\Desktop\\GEO-atos\\src';

function replaceInFiles(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInFiles(fullPath);
    } else if (/\.(js|jsx)$/.test(file)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const orig = content;
      // Regex to match both spaced and unspaced padding styles
      const regex = /<div style=\{\{\s*padding\s*:\s*['"]1\.5rem 2rem 3rem['"]\s*,\s*maxWidth\s*:\s*1400\s*,\s*margin\s*:\s*['"]0 auto['"]\s*\}\}>/g;
      content = content.replace(regex, '<div className="px-4 py-6 md:px-8 md:py-8 max-w-[1400px] mx-auto">');
      
      if (content !== orig) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated ' + fullPath);
      }
    }
  }
}

replaceInFiles(dir);
