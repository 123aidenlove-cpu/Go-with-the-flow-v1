import fs from 'fs';
import path from 'path';
import { getParsedFingeringKeys } from './src/utils/fingeringParser';

const updateFile = (filename, instrumentName) => {
  const filepath = path.join(process.cwd(), 'src', 'data', filename);
  if (!fs.existsSync(filepath)) return;
  
  const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  let changed = false;
  
  const processNote = (note) => {
    if (note.fingering && !note.fingeringDisplay) {
      const display = note.fingering;
      const parsedKeys = getParsedFingeringKeys(instrumentName, display);
      if (parsedKeys.length > 0) {
        note.fingeringDisplay = display;
        note.fingering = parsedKeys.join('-');
        changed = true;
      } else if (display === '0' || display === 'Open' || display === 'None' || display.trim() === '') {
        note.fingeringDisplay = display;
        note.fingering = '';
        changed = true;
      }
    }
  };

  data.forEach(level => {
    level.introducedNotes?.forEach(processNote);
    level.exercises?.forEach(ex => {
      ex.targetNotes?.forEach(processNote);
    });
  });

  if (changed) {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    console.log(`Updated ${filename}`);
  } else {
    console.log(`No changes for ${filename}`);
  }
};

updateFile('FluteLevels.json', 'Flute');
updateFile('ClarinetLevels.json', 'Clarinet');
updateFile('SaxophoneLevels.json', 'Alto Saxophone');
updateFile('BrassLevels.json', 'Trumpet');
updateFile('ViolinLevels.json', 'Violin');
