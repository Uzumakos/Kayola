const fs = require('fs');
const content = fs.readFileSync('c:/Users/Dan-s/Documents/Kayola/src/lib/store.ts', 'utf-8');
const lines = content.split('\n');

let balance = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '{') balance++;
    if (line[j] === '}') balance--;
  }
  if (balance < 0) {
    console.log(`Unbalanced '}' at line ${i + 1}: ${line}`);
    break;
  }
}
if (balance === 0) console.log('Braces are balanced');
if (balance > 0) console.log(`Unbalanced '{', remaining balance: ${balance}`);
