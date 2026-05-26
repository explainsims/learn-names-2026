import { useEffect, useState, useMemo } from 'react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logout } from './auth';
import { fetchStudentPhotos, fetchImageBlobUrl, StudentPhoto } from './drive';
import Flashcard from './components/Flashcard';
import { LogOut, UserSquare, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const FOLDER_ID = '1Xa7yM7aKS3ql9oUt6RVAFypO-q9LmhAn';

interface StudentStats {
  correct: number;
  incorrect: number;
  mastered: boolean;
}

export default function App() {
  const [needsAuth, setNeedsAuth] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [photos, setPhotos] = useState<StudentPhoto[]>([]);
  const [isLoadingDeck, setIsLoadingDeck] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deckStats, setDeckStats] = useState<Record<string, StudentStats>>(() => {
    const saved = localStorage.getItem('student_stats');
    return saved ? JSON.parse(saved) : {};
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentBlobUrl, setCurrentBlobUrl] = useState<string | null>(null);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);

  const activeDeck = useMemo(() => {
    return photos.filter(p => !deckStats[p.id]?.mastered);
  }, [photos, deckStats]);

  const safeIndex = activeDeck.length > 0 ? Math.min(currentIndex, Math.max(0, activeDeck.length - 1)) : 0;
  const currentPhoto = activeDeck[safeIndex];

  // Authentication State
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setUser(user);
        setNeedsAuth(false);
        loadDeck();
      },
      () => {
        setUser(null);
        setNeedsAuth(true);
        setPhotos([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setNeedsAuth(false);
        loadDeck();
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setNeedsAuth(true);
    setPhotos([]);
  };

  const loadDeck = async () => {
    setIsLoadingDeck(true);
    setError(null);
    try {
      const list = await fetchStudentPhotos(FOLDER_ID);
      const shuffled = [...list].sort(() => Math.random() - 0.5);
      setPhotos(shuffled);
      setCurrentIndex(0);
    } catch (err: any) {
      setError(err.message || 'Failed to load photos from Google Drive.');
    } finally {
      setIsLoadingDeck(false);
    }
  };

  const handleResult = (type: 'correct' | 'incorrect' | 'mastered') => {
    if (!currentPhoto) return;
    setDeckStats(prev => {
      const current = prev[currentPhoto.id] || { correct: 0, incorrect: 0, mastered: false };
      const nextStats = { ...current };
      if (type === 'correct') nextStats.correct += 1;
      if (type === 'incorrect') nextStats.incorrect += 1;
      if (type === 'mastered') nextStats.mastered = true;
      
      const newState = { ...prev, [currentPhoto.id]: nextStats };
      localStorage.setItem('student_stats', JSON.stringify(newState));
      return newState;
    });
  };

  // Pre-load the current image URL when safeIndex changes
  useEffect(() => {
    if (!currentPhoto) return;
    
    // If we already have a direct thumbnail URL from the file list, use that!
    if (currentPhoto.url) {
      setCurrentBlobUrl(currentPhoto.url);
      setIsLoadingPhoto(false);
      return;
    }

    let isMounted = true;

    const loadPhoto = async () => {
      setIsLoadingPhoto(true);
      setCurrentBlobUrl(null);
      try {
        const url = await fetchImageBlobUrl(currentPhoto.id);
        if (isMounted) {
          setCurrentBlobUrl(url);
        } else {
          URL.revokeObjectURL(url);
        }
      } catch (err) {
        console.error("Failed to load photo image data:", err);
      } finally {
        if (isMounted) setIsLoadingPhoto(false);
      }
    };

    loadPhoto();

    return () => {
      isMounted = false;
      // Do not revoke here because we do not know if currentBlobUrl is a blob or thumbnail string
    };
  }, [currentPhoto]);

  const handleNextStudent = () => {
    if (activeDeck.length <= 1) return;
    let next = Math.floor(Math.random() * activeDeck.length);
    if (next === safeIndex) {
       next = (next + 1) % activeDeck.length;
    }
    setCurrentIndex(next);
  };

  if (needsAuth) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] relative overflow-hidden flex items-center justify-center p-4 font-sans text-[#2D3436]">
        {/* Background elements */}
        <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-[#FFE66D] rounded-full opacity-40 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-[#4ECDC4] rounded-full opacity-20 blur-3xl pointer-events-none"></div>
        
        <div className="max-w-md w-full bg-white rounded-[32px] border-4 border-[#2D3436] shadow-[10px_10px_0px_#FFE66D] overflow-hidden p-8 flex flex-col items-center relative z-10">
          <div className="w-16 h-16 bg-[#F7F7F7] text-[#2D3436] flex items-center justify-center rounded-full mb-6 border-2 border-[#2D3436] shadow-[4px_4px_0px_#2D3436]">
            <UserSquare className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-[#2D3436] uppercase italic text-center mb-2 tracking-tight">Student Names</h1>
          <p className="text-[#2D3436] text-center text-sm font-medium mb-8 opacity-80">
            Learn the names of your students with flashcards. Sign in with the Google account that has access to the shared student-photos Drive folder.
          </p>

          {error && (
            <div className="w-full bg-[#FF6B6B] text-white font-bold border-2 border-[#2D3436] shadow-[4px_4px_0px_#2D3436] text-sm p-4 rounded-xl mb-6">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full relative py-4 px-4 bg-white border-4 border-[#2D3436] shadow-[6px_6px_0px_#2D3436] active:shadow-none active:translate-x-1.5 active:translate-y-1.5 rounded-2xl hover:bg-[#F7F7F7] transition-all flex items-center justify-center gap-3 font-black text-[#2D3436] uppercase text-sm disabled:opacity-50"
          >
            {isLoggingIn ? (
              <span className="animate-pulse">Signing in...</span>
            ) : (
              <>
                <svg viewBox="0 0 48 48" className="w-5 h-5">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  <path fill="none" d="M0 0h48v48H0z" />
                </svg>
                Continue with Google
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F0] relative overflow-hidden flex flex-col font-sans text-[#2D3436]">
      {/* Abstract Backgrounds */}
      <div className="absolute top-[-50px] left-[-50px] w-80 h-80 bg-[#FFE66D] rounded-full opacity-40 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-[#4ECDC4] rounded-full opacity-20 blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white border-b-4 border-[#2D3436] z-10 px-6 flex items-center justify-between shadow-[0_4px_0px_rgba(45,52,54,0.1)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF6B6B] border-2 border-[#2D3436] rounded-full flex items-center justify-center text-white shadow-[2px_2px_0px_#2D3436]">
            <UserSquare className="w-6 h-6" />
          </div>
          <span className="font-black text-[#2D3436] uppercase italic tracking-tight text-xl">Learn Names</span>
        </div>
        
        <button 
          onClick={handleLogout}
          className="text-[#2D3436] px-4 py-2 border-2 border-[#2D3436] shadow-[2px_2px_0px_#2D3436] bg-white hover:bg-[#F7F7F7] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 rounded-xl transition-all flex items-center gap-2 text-sm font-bold uppercase"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </header>

      {/* Main Area */}
      <main id="app-main" className="flex-1 min-h-0 flex flex-col items-center justify-center pt-24 pb-28 px-4 w-full max-w-lg mx-auto z-10 relative">
        {isLoadingDeck ? (
          <div id="loading-deck-state" className="flex flex-col items-center space-y-4 text-[#2D3436]">
            <div className="w-12 h-12 border-4 border-[#F0F0F0] border-t-[#4ECDC4] rounded-full animate-spin"></div>
            <p className="font-bold animate-pulse uppercase tracking-wide text-sm">Scanning Drive folder...</p>
          </div>
        ) : error ? (
          <div id="error-deck-state" className="flex flex-col justify-center items-center text-center p-8 bg-white border-4 border-[#2D3436] shadow-[10px_10px_0px_#FF6B6B] rounded-[32px] w-full">
            <div className="w-16 h-16 bg-[#FFE66D] border-2 border-[#2D3436] shadow-[4px_4px_0px_#2D3436] text-[#2D3436] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-[#2D3436] font-bold mb-6 text-lg">{error}</p>
            <button id="btn-retry-deck" onClick={loadDeck} className="bg-[#FF6B6B] text-white border-2 border-[#2D3436] shadow-[4px_4px_0px_#2D3436] active:shadow-none active:translate-x-1 active:translate-y-1 px-8 py-3 rounded-2xl text-sm font-black uppercase transition-all">
              Try Again
            </button>
          </div>
        ) : photos.length > 0 && activeDeck.length === 0 ? (
          <div className="text-center p-8 text-[#2D3436]">
            <div className="w-20 h-20 bg-[#FFE66D] border-4 border-[#2D3436] text-[#2D3436] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[6px_6px_0px_#FF6B6B]">
                <Sparkles className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black uppercase italic mb-2">All Mastered!</h2>
            <p className="font-bold opacity-80 text-sm">You have mastered all {photos.length} students in this folder.</p>
            <button 
              onClick={() => {
                setDeckStats({});
                localStorage.removeItem('student_stats');
              }}
              className="mt-8 bg-white border-2 border-[#2D3436] shadow-[4px_4px_0px_#2D3436] active:shadow-none active:translate-x-1 active:translate-y-1 px-6 py-3 rounded-2xl text-sm font-black uppercase transition-all"
            >
              Reset Progress
            </button>
          </div>
        ) : activeDeck.length === 0 ? (
          <div id="empty-deck-state" className="text-center p-8 text-[#2D3436]">
            <div className="w-16 h-16 bg-[#F7F7F7] border-2 border-[#2D3436] text-[#2D3436] rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                <UserSquare className="w-8 h-8" />
            </div>
            <p className="font-bold">No photos found in the folder.</p>
          </div>
        ) : (
          <div id="deck-view" className="w-full h-full flex flex-col items-center justify-center min-h-0 py-2 max-h-[800px]">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={currentPhoto.id}
                initial={{ opacity: 0, scale: 0.9, x: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -50 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex-1 w-full min-h-0 min-w-0 flex justify-center mb-4"
              >
                <Flashcard 
                  name={currentPhoto.name} 
                  photoUrl={currentBlobUrl} 
                  isLoading={isLoadingPhoto} 
                  stats={deckStats[currentPhoto.id] || { correct: 0, incorrect: 0, mastered: false }}
                  onResult={handleResult}
                />
              </motion.div>
            </AnimatePresence>

            <button 
              onClick={handleNextStudent}
              className="mt-2 flex-shrink-0 mx-auto bg-white border-4 border-[#2D3436] shadow-[6px_6px_0px_#2D3436] active:shadow-none active:translate-x-1.5 active:translate-y-1.5 hover:bg-[#F7F7F7] px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-wider transition-all"
            >
              Next Student
            </button>
          </div>
        )}
      </main>

      {/* Footer Navigation */}
      {photos.length > 0 && !isLoadingDeck && !error && (
        <footer className="fixed bottom-0 left-0 right-0 h-24 bg-white border-t-4 border-[#2D3436] z-10 px-4 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 pb-safe">
          <button disabled className="flex-1 h-12 rounded-xl border-4 border-[#2D3436] font-black uppercase text-[10px] sm:text-xs tracking-wider bg-[#FFE66D] text-[#2D3436] opacity-50 cursor-not-allowed">
            Grade 9
          </button>
          <button disabled className="flex-1 h-12 rounded-xl border-4 border-[#2D3436] font-black uppercase text-[10px] sm:text-xs tracking-wider bg-[#4ECDC4] text-[#2D3436] opacity-50 cursor-not-allowed">
            Grade 10
          </button>
          <button disabled className="flex-1 h-12 rounded-xl border-4 border-[#2D3436] font-black uppercase text-[10px] sm:text-xs tracking-wider bg-[#FF6B6B] text-[#2D3436] opacity-50 cursor-not-allowed">
            Grade 11
          </button>
          <button disabled className="flex-1 h-12 rounded-xl border-4 border-[#2D3436] font-black uppercase text-[10px] sm:text-xs tracking-wider bg-[#A8E6CF] text-[#2D3436] opacity-50 cursor-not-allowed">
            Grade 12
          </button>
        </footer>
      )}
    </div>
  );
}

