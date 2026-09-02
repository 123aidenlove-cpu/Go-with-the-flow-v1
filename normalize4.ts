import fs from 'fs';
import path from 'path';
import { getParsedFingeringKeys } from './src/utils/fingeringParser';

const updateFile = (filename, instrumentName) => {
  const filepath = path.join(process.cwd(), 'src', 'data', filename);
  if (!fs.existsSync(filepath)) return;
  
  const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  let changed = false;
  
  const processNote = (note) => {
    // If it's the un-normalized G note
    if (note.fingering === 'No fingers need to be pressed down at all.' && !note.fingeringDisplay) {
      note.fingeringDisplay = note.fingering;
      note.fingering = '';
      changed = true;
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

updateFile('ClarinetLevels.json', 'Clarinet');
