import { useState, useRef, useEffect } from 'react';
import { Check, X, Smile } from 'lucide-react';
import { GRADES, Grade } from '../grades';

interface SettingsPanelProps {
  activeCount: number;
  masteredCount: number;
  onResetGrade: (gradeId: string) => void;
}

export default function SettingsPanel({ activeCount, masteredCount, onResetGrade }: SettingsPanelProps) {
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const handleReset = (grade: Grade) => {
    onResetGrade(grade.id);
    setResetMessage(`${grade.label} reset!`);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setResetMessage(null), 2000);
  };

  return (
    <div className="w-full h-full min-h-0 flex flex-col overflow-y-auto">
      <div className="bg-white border-4 border-[#2D3436] rounded-[24px] p-4 mb-6">
        <h3 className="font-black uppercase text-[11px] tracking-wider mb-3 opacity-70">What the icons mean</h3>
        <ul className="space-y-2 text-sm font-medium">
          <li className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-[#A8E6CF] border-2 border-[#2D3436] flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-[#2D3436]" strokeWidth={3} />
            </span>
            <span>You got the name right</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-[#4ECDC4] border-2 border-[#2D3436] flex items-center justify-center flex-shrink-0">
              <Smile className="w-5 h-5 text-[#2D3436]" strokeWidth={3} />
            </span>
            <span>Skip &mdash; don&apos;t show this student again</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-[#FF6B6B] border-2 border-[#2D3436] flex items-center justify-center text-white flex-shrink-0">
              <X className="w-5 h-5" strokeWidth={3} />
            </span>
            <span>You got the name wrong</span>
          </li>
          <li className="flex items-center gap-3 pt-1">
            <span className="w-9 h-9 rounded-full bg-[#FF8C42] border-2 border-[#2D3436] flex items-center justify-center text-white font-black text-sm flex-shrink-0">{activeCount}</span>
            <span>Students still in your deck</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-[#4ECDC4] border-2 border-[#2D3436] flex items-center justify-center text-white font-black text-sm flex-shrink-0">{masteredCount}</span>
            <span>Students you&apos;ve skipped</span>
          </li>
        </ul>
      </div>

      <hr className="border-t-2 border-[#2D3436] opacity-30 mb-4" />
      <h2 className="font-black uppercase text-base tracking-tight mb-3 text-center">Reset Skipped Students</h2>

      <div className="grid grid-cols-2 gap-3">
        {GRADES.map((grade) => (
          <button
            key={grade.id}
            onClick={() => handleReset(grade)}
            style={{ backgroundColor: grade.color }}
            className="h-14 rounded-xl border-4 border-[#2D3436] font-black uppercase text-xs tracking-wider text-[#2D3436] transition-all cursor-pointer hover:brightness-95 active:brightness-90"
          >
            {grade.label}
          </button>
        ))}
      </div>

      <p
        aria-live="polite"
        className={`mt-3 text-center text-sm font-black uppercase tracking-wider text-[#2D3436] transition-opacity duration-200 ${resetMessage ? 'opacity-80' : 'opacity-0'}`}
      >
        {resetMessage ?? ' '}
      </p>
    </div>
  );
}
