const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\Ananda Yoga\\.gemini\\antigravity\\brain\\e176930e-4efd-43f6-a20c-88bca7196827\\.system_generated\\steps\\85\\content.md', 'utf8');

const regex = /https?:\/\/[^\s"'<>]+/g;
const matches = content.match(regex) || [];
const unique = [...new Set(matches)];
console.log('Total links:', unique.length);

const relevant = unique.filter(l => 
  l.includes('certik') || 
  l.includes('audit') || 
  l.includes('cyberscope') || 
  l.includes('solidproof') || 
  l.includes('github') || 
  l.includes('scan') || 
  l.includes('contract') ||
  l.includes('20lab')
);
console.log('Relevant links:');
console.log(relevant.slice(0, 50));
