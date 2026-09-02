const fs = require('fs');

let flow = fs.readFileSync('src/components/FlowPracticeEngine.tsx', 'utf8');
flow = flow.replace(/instrument: string; \/\/ e\.g\. \"violin\", \"clarinet\"/, '');
flow = flow.replace(/export default function FlowPracticeEngine\(\{ onComplete, onCancel, instrument \}: FlowPracticeEngineProps\) \{/, "import { useInstrument } from '../contexts/InstrumentContext';\nexport default function FlowPracticeEngine({ onComplete, onCancel }: FlowPracticeEngineProps) {\n  const { instrument } = useInstrument();");
fs.writeFileSync('src/components/FlowPracticeEngine.tsx', flow);

let sight = fs.readFileSync('src/components/SightReadSoaring.tsx', 'utf8');
sight = sight.replace(/instrument\?: string;/, '');
sight = sight.replace(/export default function SightReadSoaring\(\{ onBack, onComplete, instrument = 'Piano' \}: SightReadSoaringProps\) \{/, "import { useInstrument } from '../contexts/InstrumentContext';\nexport default function SightReadSoaring({ onBack, onComplete }: SightReadSoaringProps) {\n  const { instrument } = useInstrument();");
fs.writeFileSync('src/components/SightReadSoaring.tsx', sight);

console.log('Fixed props');
