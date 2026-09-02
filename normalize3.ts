import fs from 'fs';
import path from 'path';
import { getParsedFingeringKeys } from './src/utils/fingeringParser';

const updateFile = (filename, instrumentName) => {
  const filepath = path.join(process.cwd(), 'src', 'data', filename);
  if (!fs.existsSync(filepath)) return;
  
  const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  let changed = false;
  
  const processNote = (note) => {
    if (note.fingeringDisplay) {
      const display = note.fingeringDisplay;
      
      const options = display.split(/ OR | or /);
      const parsedOptions = options.map(opt => getParsedFingeringKeys(instrumentName, opt).join('-'));
      
      const newFingering = parsedOptions.join(' OR ');
      if (note.fingering !== newFingering) {
        note.fingering = newFingering;
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
updateFile('AltoSaxophoneLevels.json', 'Alto Saxophone');
updateFile('TrumpetLevels.json', 'Trumpet');
updateFile('ViolinLevels.json', 'Violin');
updateFile('Euphonium_and_BaritoneLevels.json', 'Euphonium_and_Baritone');
