const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\Ananda Yoga\\.gemini\\antigravity\\brain\\e176930e-4efd-43f6-a20c-88bca7196827\\.system_generated\\steps\\85\\content.md', 'utf8');

function findSnippet(keyword, len = 1500) {
  const idx = content.indexOf(keyword);
  if (idx !== -1) {
    console.log(`=== SNIPPET FOR [${keyword}] ===`);
    console.log(content.substring(idx - 100, idx + len));
  } else {
    console.log(`Keyword [${keyword}] not found.`);
  }
}

findSnippet('Simple and Transparent');
findSnippet('Audited tokens created on 20lab');
findSnippet('What Users say about 20lab');
findSnippet('Benefits of customizable tokens');
