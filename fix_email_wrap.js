const fs = require('fs');
let c = fs.readFileSync('src/app/profile/page.js', 'utf8');

// Fix email input row flex wrap
c = c.replace(
  "style={{ display: 'flex', gap: '10px' }}>\r\n                   <input\r\n                       type=\"email\"",
  "style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>\r\n                   <input\r\n                       type=\"email\""
);

fs.writeFileSync('src/app/profile/page.js', c);
console.log('Done');
