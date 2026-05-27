import { Check, X, Smile } from 'lucide-react';

export default function IntroScreen() {
  return (
    <div className="w-full h-full min-h-0 flex items-center justify-center overflow-y-auto">
      <div className="bg-white border-4 border-[#2D3436] shadow-[10px_10px_0px_#FFE66D] rounded-[24px] p-5 max-w-md w-full">
        <h2 className="font-black uppercase italic text-xl text-center mb-3 tracking-tight">Welcome!</h2>
        <p className="text-sm font-medium mb-4 text-center opacity-80">
          Tap a photo to flip it, then tell the app how you did:
        </p>
        <ul className="space-y-2 mb-4 text-sm font-medium">
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
            <span>You know it &mdash; skip from now on</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-[#FF6B6B] border-2 border-[#2D3436] flex items-center justify-center text-white flex-shrink-0">
              <X className="w-5 h-5" strokeWidth={3} />
            </span>
            <span>You got the name wrong</span>
          </li>
        </ul>
        <p className="text-xs font-medium mb-4 opacity-70 text-center">
          The orange and green circles on each photo show how many students are still to learn vs. already skipped. Reset a grade any time from <span className="font-black">Settings</span> (top right).
        </p>
        <p className="text-sm font-black uppercase tracking-wider text-center">
          Pick a grade below to begin &darr;
        </p>
      </div>
    </div>
  );
}
