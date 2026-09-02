const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\123ai\\.gemini\\antigravity-cli\\brain';

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      searchDir(fullPath);
    } else if (file === 'transcript_full.jsonl') {
      const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.type === 'PLANNER_RESPONSE' && parsed.tool_calls) {
            for (const call of parsed.tool_calls) {
              if (call.name === 'default_api:write_to_file' || call.name === 'write_to_file') {
                if (call.args && call.args.TargetFile && call.args.TargetFile.includes('WorldMap.tsx')) {
                  console.log(`FOUND write_to_file in ${fullPath}`);
                  fs.writeFileSync('src/components/WorldMap.tsx', call.args.CodeContent || call.args.content);
                  console.log('RECOVERED WorldMap.tsx!');
                  return;
                }
              }
            }
          }
        } catch (e) {}
      }
    }
  }
}

searchDir(brainDir);
