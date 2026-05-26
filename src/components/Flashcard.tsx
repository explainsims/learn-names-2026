import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Check, X, Smile } from 'lucide-react';

interface StudentStats {
  correct: number;
  incorrect: number;
  mastered: boolean;
}

interface FlashcardProps {
  name: string;
  photoUrl: string | null;
  isLoading: boolean;
  stats: StudentStats;
  activeCount: number;
  masteredCount: number;
  onResult: (type: 'correct' | 'incorrect' | 'mastered') => void;
  onNext: () => void;
}

export default function Flashcard({ name, photoUrl, isLoading, stats, activeCount, masteredCount, onResult, onNext }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Auto flip to front when a new student is shown
  useEffect(() => {
    setIsFlipped(false);
  }, [name]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAction = (e: React.MouseEvent, type: 'correct' | 'incorrect' | 'mastered') => {
    e.stopPropagation();
    onResult(type);
    // 'mastered' auto-advances because the card is filtered out of activeDeck;
    // correct/incorrect need an explicit advance to mirror that behaviour.
    if (type === 'correct' || type === 'incorrect') {
      onNext();
    }
  };

  return (
    <div className="relative h-[85%] max-w-full mx-auto cursor-pointer group" onClick={handleFlip} style={{ perspective: '1000px', aspectRatio: '3 / 4' }}>
      <motion.div
        className="w-full h-full relative"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of Card: Photo */}
        <div
          className="absolute w-full h-full backface-hidden bg-white border-4 border-[#2D3436] rounded-[32px] shadow-[12px_12px_0px_#4ECDC4] flex flex-col p-4 transition-transform group-hover:scale-[1.02] group-active:scale-[0.98]"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {isLoading ? (
            <div className="w-full h-full bg-[#FFE66D] border-2 border-[#2D3436] rounded-[24px] flex flex-col items-center justify-center text-[#2D3436] space-y-4">
              <RefreshCw className="w-10 h-10 animate-spin" />
              <p className="text-sm font-bold uppercase tracking-wider">Loading...</p>
            </div>
          ) : photoUrl ? (
            <div className="w-full h-full relative border-2 border-[#2D3436] rounded-[24px] overflow-hidden bg-[#F0F0F0] flex items-center justify-center">
              <img src={photoUrl} alt="Student" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full h-full bg-[#FFE66D] border-2 border-[#2D3436] rounded-[24px] flex flex-col items-center justify-center text-[#2D3436] space-y-4">
              <p className="font-bold uppercase tracking-wider text-sm">No photo available</p>
            </div>
          )}
        </div>

        {/* Back of Card: Name and actions */}
        <div 
          className="absolute w-full h-full backface-hidden bg-[#FFE66D] border-4 border-[#2D3436] rounded-[32px] shadow-[12px_12px_0px_#FF6B6B] flex flex-col items-center justify-center p-6 transition-transform group-hover:scale-[1.02] group-active:scale-[0.98]"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="w-full h-full bg-white border-2 border-[#2D3436] rounded-[24px] flex flex-col items-center justify-between p-6 overflow-hidden">
            
            <div className="flex-1 flex items-center justify-center w-full">
              <h2 className="text-3xl font-black text-[#2D3436] text-center tracking-tight leading-snug break-words hyphens-none">
                {name}
              </h2>
            </div>

            <div className="w-full flex justify-center gap-4 mb-4" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => handleAction(e, 'correct')}
                className="w-14 h-14 rounded-full bg-[#A8E6CF] border-2 border-[#2D3436] flex items-center justify-center text-[#2D3436] shadow-[2px_2px_0px_#2D3436] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
                title="Got it right"
              >
                <Check className="w-8 h-8" strokeWidth={3} />
              </button>

              <button
                onClick={(e) => handleAction(e, 'mastered')}
                className="w-14 h-14 rounded-full bg-[#4ECDC4] border-2 border-[#2D3436] flex items-center justify-center text-[#2D3436] shadow-[2px_2px_0px_#2D3436] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
                title="Don't show again"
              >
                <Smile className="w-8 h-8" strokeWidth={3} />
              </button>

              <button
                onClick={(e) => handleAction(e, 'incorrect')}
                className="w-14 h-14 rounded-full bg-[#FF6B6B] border-2 border-[#2D3436] flex items-center justify-center text-white shadow-[2px_2px_0px_#2D3436] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
                title="Got it wrong"
              >
                <X className="w-8 h-8" strokeWidth={3} />
              </button>
            </div>

            <div className="w-full bg-[#F7F7F7] border-2 border-[#2D3436] rounded-xl p-3 flex justify-evenly items-center">
              <div className="flex flex-col items-center">
                <span className="text-xs uppercase font-black text-[#2D3436] opacity-70">Correct</span>
                <span className="text-xl font-black text-[#A8E6CF]" style={{ textShadow: '1px 1px 0 #2D3436, -1px -1px 0 #2D3436, 1px -1px 0 #2D3436, -1px 1px 0 #2D3436' }}>{stats.correct}</span>
              </div>
              <div className="w-px h-8 bg-[#2D3436] opacity-20"></div>
              <div className="flex flex-col items-center">
                <span className="text-xs uppercase font-black text-[#2D3436] opacity-70">Incorrect</span>
                <span className="text-xl font-black text-[#FF6B6B]" style={{ textShadow: '1px 1px 0 #2D3436, -1px -1px 0 #2D3436, 1px -1px 0 #2D3436, -1px 1px 0 #2D3436' }}>{stats.incorrect}</span>
              </div>
            </div>
            
          </div>
        </div>
      </motion.div>

      {/* Progress counters live OUTSIDE the rotating layer so they
          stay readable when the card flips. */}
      <div className="absolute top-3 left-3 z-30 w-10 h-10 rounded-full bg-[#FF8C42] border-2 border-[#2D3436] flex items-center justify-center text-white font-black text-base leading-none shadow-[2px_2px_0px_#2D3436] pointer-events-none">
        {activeCount}
      </div>
      <div className="absolute top-3 right-3 z-30 w-10 h-10 rounded-full bg-[#4ECDC4] border-2 border-[#2D3436] flex items-center justify-center text-white font-black text-base leading-none shadow-[2px_2px_0px_#2D3436] pointer-events-none">
        {masteredCount}
      </div>
    </div>
  );
}
