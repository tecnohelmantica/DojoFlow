const fs = require('fs');
let c = fs.readFileSync('src/app/profile/page.js', 'utf8');

// We need to:
// 1. Extract the FILA 3B block
// 2. Remove it from its current position (between 3A and selectedScroll)
// 3. Insert it after the selectedScroll viewer block

const FILA3B_START = '          {/* FILA 3B: RECURSOS DEL PROFESOR (materiales propios de la clase) */}';
const VISOR_START = '          {selectedScroll &&';
const VISOR_END_MARKER = '          {/* CURSO LUIS LLAMAS';

const b3BStart = c.indexOf(FILA3B_START);
const visorStart = c.indexOf(VISOR_START);
const visorEnd = c.indexOf(VISOR_END_MARKER);

console.log('3B starts at line:', c.substring(0, b3BStart).split('\n').length);
console.log('Visor starts at line:', c.substring(0, visorStart).split('\n').length);
console.log('Visor ends (CURSO) at line:', c.substring(0, visorEnd).split('\n').length);

if (b3BStart < 0 || visorStart < 0 || visorEnd < 0) {
  console.log('ERROR: markers not found');
  process.exit(1);
}

// Extract 3B block (everything from FILA3B_START to visorStart)
const block3B = c.substring(b3BStart, visorStart);
console.log('\n3B block length:', block3B.length, 'chars');

// Build new content:
// - Before 3B: unchanged (master section 3A)
// - Skip 3B in current position
// - Visor block (from visorStart to visorEnd)
// - Insert 3B here
// - CURSO LUIS LLAMAS onwards

const beforeBlock3B = c.substring(0, b3BStart);
const visorBlock = c.substring(visorStart, visorEnd);
const afterVisor = c.substring(visorEnd);

const newContent = beforeBlock3B + visorBlock + block3B + afterVisor;

fs.writeFileSync('src/app/profile/page.js', newContent, 'utf8');
console.log('✅ FILA 3B moved to after the selectedScroll viewer');
console.log('New 3B position (approx line):', newContent.indexOf(FILA3B_START) > -1 ? newContent.substring(0, newContent.indexOf(FILA3B_START)).split('\n').length : 'NOT FOUND');
