const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\123ai\\.gemini\\antigravity-cli\\brain';
let bestContent = null;
let latestTime = 0;

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
                  const time = new Date(parsed.created_at).getTime();
                  if (time > latestTime) {
                    latestTime = time;
                    bestContent = call.args.CodeContent || call.args.content;
                    console.log(`Found newer version at ${parsed.created_at} in ${fullPath}`);
                  }
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
if (bestContent) {
  fs.writeFileSync('src/components/WorldMap.tsx', bestContent);
  console.log('Restored the absolute latest WorldMap.tsx!');
} else {
  console.log('Not found');
}
