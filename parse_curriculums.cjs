const fs = require('fs');
const path = require('path');

const srcDir = 'C:/Users/123ai/OneDrive/Aiden/teaching_app/Curriculum_Templates';
const outDir = 'C:/Users/123ai/OneDrive/Aiden/teaching_app/go-with-the-flow v1/src/data';

function parseCSV(filename, outName, useOctaveAsLabel) {
  let content;
  try {
    content = fs.readFileSync(path.join(srcDir, filename), 'utf8');
  } catch(e) {
    console.error('File not found: ' + filename);
    return;
  }
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('Level,Label,Written Note')) {
      headerIndex = i;
      break;
    }
  }
  
  if (headerIndex === -1) {
    console.error('Header not found for ' + filename);
    return;
  }
  
  const levels = {};
  let currentLevel = "1"; // Default to 1 if first notes have no level

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    let row = [];
    let inQuote = false;
    let currentCell = '';
    for(let char of line) {
      if (char === '"') inQuote = !inQuote;
      else if (char === ',' && !inQuote) {
        row.push(currentCell);
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    row.push(currentCell);

    if (row.length < 3) continue;

    let levelRaw = row[0].trim();
    if (levelRaw === "") continue;
    currentLevel = levelRaw;
    
    let label = useOctaveAsLabel ? row[2].trim() : row[1].trim(); 
    let writtenNote = row[2].trim();
    let fingering = '';
    let clefValue = '';
    
    if (useOctaveAsLabel) {
       clefValue = row[3] ? row[3].trim() : '';
       fingering = writtenNote;
    } else {
       fingering = row[3] ? row[3].trim() : '';
    }

    let description = row[4] ? row[4].trim() : '';
    let tip = row[5] ? row[5].trim() : '';
    
    if (filename.includes('Piano')) {
       fingering = fingering.replace(/\d/g, '');
    }
    
    let parsedClef = undefined;
    if (clefValue.toLowerCase().includes('bass')) parsedClef = 'bass';
    else if (clefValue.toLowerCase().includes('8vb')) parsedClef = 'treble8vb';
    else if (clefValue.toLowerCase().includes('treble')) parsedClef = 'treble';

    if (!label) continue;

    if (!levels[currentLevel]) {
      levels[currentLevel] = { 
        id: parseInt(currentLevel.replace(/Level\s*/i, '')) || parseInt(currentLevel) || 1, 
        description: `Level ${currentLevel}`,
        introducedNotes: [] 
      };
    }
    levels[currentLevel].introducedNotes.push({
      label,
      writtenNote,
      fingering,
      fingeringDisplay: fingering,
      clef: parsedClef,
      description,
      tip
    });
  }
  
  const output = Object.values(levels);
  fs.writeFileSync(path.join(outDir, outName), JSON.stringify(output, null, 2));
  console.log('Parsed ' + filename + ' to ' + outName);
}

parseCSV('Cello_Curriculum.csv', 'CelloLevels.json', false);
parseCSV('Piano_Curriculum.csv', 'PianoLevels.json', true);
parseCSV('Soprano_Curriculum.csv', 'Soprano_VoiceLevels.json', true);
parseCSV('Alto_Curriculum.csv', 'Alto_VoiceLevels.json', true);
parseCSV('Tenor_Curriculum.csv', 'Tenor_VoiceLevels.json', true);
parseCSV('Bass_Curriculum.csv', 'Bass_VoiceLevels.json', true);
console.log('Done!');
