const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/Dan-s/Documents/Kayola/src/components/admin';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') && f !== 'AdminLoginView.tsx');

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find the LAST occurrence of `)}` and remove it
  const lines = content.split('\n');
  
  // Find from bottom up
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].includes(')}')) {
      lines[i] = lines[i].replace(')}', '');
      break;
    }
  }
  
  fs.writeFileSync(filePath, lines.join('\n'));
  console.log('Fixed', file);
}
