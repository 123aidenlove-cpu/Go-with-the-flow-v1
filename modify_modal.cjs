const fs = require('fs');
let content = fs.readFileSync('src/components/ConcertHall.tsx', 'utf8');

const newModal = `      {selectedStudentForLesson && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-8">
          <div className="bg-white rounded-[2rem] w-full max-w-lg flex flex-col overflow-hidden shadow-2xl relative border-4 border-slate-200 p-8 text-center">
            <button 
              onClick={() => setSelectedStudentForLesson(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-24 h-24 bg-slate-100 border-4 border-slate-200 rounded-full flex items-center justify-center text-5xl mx-auto mb-4 shadow-inner">
              {selectedStudentForLesson.avatar_data?.type === 'conductor' ? '🤵' : '🦉'}
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-1">{selectedStudentForLesson.name || 'Student'}</h2>
            <p className="text-sky-500 font-bold uppercase tracking-widest text-sm mb-8">{selectedStudentForLesson.instrument}</p>

            <div className="flex flex-col gap-4">
              <button 
                onClick={() => {
                  alert('Lesson Started!');
                  setSelectedStudentForLesson(null);
                }}
                className="w-full bg-emerald-500 text-white font-black py-4 px-6 rounded-2xl shadow-[0_8px_16px_rgba(16,185,129,0.3)] hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-3 text-lg"
              >
                <Play className="w-6 h-6 fill-current" />
                START A LESSON
              </button>
              
              <button 
                onClick={() => {
                  localStorage.setItem('teacherViewStudentId', selectedStudentForLesson.id);
                  onNavigateToGame('teacher-student-profile');
                }}
                className="w-full bg-slate-100 text-slate-700 hover:bg-slate-200 font-black py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 text-lg border-2 border-slate-200"
              >
                <User className="w-6 h-6" />
                GO TO PROFILE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

content = content.replace(/\{selectedStudentForLesson && \([\s\S]*?\)\}\s*<\/div>\s*\);\s*\}/, newModal);

if (!content.includes('X,')) {
    content = content.replace(/import \{ Settings, Play \} from 'lucide-react';/, "import { Settings, Play, X, User } from 'lucide-react';");
}

fs.writeFileSync('src/components/ConcertHall.tsx', content);
console.log('Replaced successfully');
