const xlsx = require('xlsx'); 
const wb = xlsx.readFile('C:/Users/123ai/OneDrive/Aiden/teaching_app/Notes/Hard Code Notes.xlsx'); 
wb.SheetNames.forEach(sheet => { 
  console.log('SHEET:', sheet); 
  console.log(xlsx.utils.sheet_to_json(wb.Sheets[sheet]).slice(0, 3)); 
});
