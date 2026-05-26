import { Check, X, Smile } from 'lucide-react';

interface Grade {
  id: string;
  label: string;
  color: string;
  active: boolean;
}

const GRADES: Grade[] = [
  { id: 'g9',  label: 'Grade 9',  color: '#FFE66D', active: false },
  { id: 'g10', label: 'Grade 10', color: '#4ECDC4', active: false },
  { id: 'g11', label: 'Grade 11', color: '#FF6B6B', active: false },
  { id: 'g12', label: 'Grade 12', color: '#A8E6CF', active: true  },
];

interface SettingsPanelProps {
  selectedGradeId: string;
  onSelectGrade: (id: string) => void;
  onResetSkipped: () => void;
}

export default function SettingsPanel({ selectedGradeId, onSelectGrade, onResetSkipped }: SettingsPanelProps) {
  return (
    <div className="w-full h-full min-h-0 flex flex-col overflow-y-auto">
      <div className="bg-white border-4 border-[#2D3436] shadow-[8px_8px_0px_#FFE66D] rounded-[24px] p-4 mb-4">
        <h3 className="font-black uppercase text-[11px] tracking-wider mb-3 opacity-70">What the icons mean</h3>
        <ul className="space-y-2 text-sm font-medium">
          <li className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-[#A8E6CF] border-2 border-[#2D3436] flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_#2D3436]">
              <Check className="w-5 h-5 text-[#2D3436]" strokeWidth={3} />
            </span>
            <span>You got the name right</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-[#4ECDC4] border-2 border-[#2D3436] flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_#2D3436]">
              <Smile className="w-5 h-5 text-[#2D3436]" strokeWidth={3} />
            </span>
            <span>Skip &mdash; don&apos;t show this student again</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-[#FF6B6B] border-2 border-[#2D3436] flex items-center justify-center text-white flex-shrink-0 shadow-[2px_2px_0px_#2D3436]">
              <X className="w-5 h-5" strokeWidth={3} />
            </span>
            <span>You got the name wrong</span>
          </li>
          <li className="flex items-center gap-3 pt-1">
            <span className="w-9 h-9 rounded-full bg-[#FF8C42] border-2 border-[#2D3436] flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-[2px_2px_0px_#2D3436]">N</span>
            <span>Students still in your deck</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-[#4ECDC4] border-2 border-[#2D3436] flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-[2px_2px_0px_#2D3436]">N</span>
            <span>Students you&apos;ve skipped</span>
          </li>
        </ul>
      </div>

      <button
        onClick={onResetSkipped}
        className="w-full bg-[#FFE66D] text-[#2D3436] border-4 border-[#2D3436] shadow-[6px_6px_0px_#2D3436] active:shadow-none active:translate-x-1.5 active:translate-y-1.5 hover:brightness-95 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-wider transition-all mb-6"
      >
        Reset Skipped Students
      </button>

      <h3 className="font-black uppercase text-[11px] tracking-wider mb-3 opacity-70 px-1">Grade</h3>
      <div className="grid grid-cols-2 gap-3">
        {GRADES.map((grade) => {
          const isSelected = grade.id === selectedGradeId;
          const isClickable = grade.active;
          return (
            <button
              key={grade.id}
              disabled={!isClickable}
              onClick={() => isClickable && onSelectGrade(grade.id)}
              style={{ backgroundColor: grade.color }}
              className={[
                'h-14 rounded-xl border-4 border-[#2D3436] font-black uppercase text-xs tracking-wider text-[#2D3436] transition-all',
                isClickable ? '' : 'opacity-40 cursor-not-allowed',
                isSelected
                  ? 'shadow-[6px_6px_0px_#2D3436]'
                  : 'shadow-[3px_3px_0px_#2D3436]',
              ].join(' ')}
            >
              {grade.label}
              {isSelected && <span className="block text-[9px] opacity-70 mt-0.5">Current</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
