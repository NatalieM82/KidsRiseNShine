import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Timer, THEME_BG_COLORS } from '../types';
import { Button } from './Button';
import { X, Pause, Play, RotateCcw } from 'lucide-react';

interface ActiveTimerProps {
  timer: Timer;
  onExit: () => void;
}

// Simple synth sound generator to avoid external asset dependencies breaking
const playSound = (type: string) => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;

  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;

  if (type === 'fanfare') {
    // Ta-da!
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
    osc.frequency.setValueAtTime(1046.50, now + 0.4); // C6
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
    osc.start(now);
    osc.stop(now + 1.5);
  } else if (type === 'chimes') {
    // Soft sparkle
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 2);
    osc.start(now);
    osc.stop(now + 2);
    
    // Echo
    setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.setValueAtTime(1100, ctx.currentTime);
        gain2.gain.setValueAtTime(0.2, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 2);
    }, 200);
  } else {
    // Success (Standard Beep-like but nicer)
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(880, now + 0.1);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.5);
    osc.start(now);
    osc.stop(now + 0.5);
  }
};

// Simple particle system for confetti
const Confetti = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: any[] = [];
    const colors = ['#F72585', '#4CC9F0', '#FFD93D', '#7209B7'];

    for(let i=0; i<100; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10 - 5,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 100
        });
    }

    const animate = () => {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2; // gravity
            p.life--;
            
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            if(p.life <= 0) particles.splice(i, 1);
        });

        if(particles.length > 0) requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} className="absolute inset-0 pointer-events-none z-50" />;
};


export const ActiveTimer: React.FC<ActiveTimerProps> = ({ timer, onExit }) => {
  const [timeLeft, setTimeLeft] = useState(timer.durationSec);
  const [isActive, setIsActive] = useState(false); // Start paused so user gets ready
  const [isCompleted, setIsCompleted] = useState(false);
  
  const startTimeRef = useRef<number | null>(null);
  const initialTimeRef = useRef<number>(timer.durationSec);
  const rafRef = useRef<number | null>(null);

  const totalTime = timer.durationSec;
  const progressPercentage = ((totalTime - timeLeft) / totalTime) * 100;

  // Animation Loop using requestAnimationFrame for smoothness and Date.now for accuracy
  const tick = useCallback(() => {
      if (!startTimeRef.current) return;
      
      const now = Date.now();
      const elapsed = (now - startTimeRef.current) / 1000;
      const remaining = Math.max(0, initialTimeRef.current - elapsed);
      
      setTimeLeft(remaining);

      if (remaining <= 0) {
          setIsCompleted(true);
          setIsActive(false);
          playSound(timer.soundType);
      } else {
          rafRef.current = requestAnimationFrame(tick);
      }
  }, [timer.soundType]);

  const toggleTimer = () => {
      if (isActive) {
          // Pause
          setIsActive(false);
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          // Store current remaining time to resume from
          initialTimeRef.current = timeLeft;
      } else {
          // Start/Resume
          setIsActive(true);
          startTimeRef.current = Date.now();
          rafRef.current = requestAnimationFrame(tick);
      }
  };

  const resetTimer = () => {
      setIsActive(false);
      setIsCompleted(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setTimeLeft(timer.durationSec);
      initialTimeRef.current = timer.durationSec;
  };

  useEffect(() => {
      return () => {
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
  }, []);

  // Format time mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {isCompleted && <Confetti />}

      {/* Header */}
      <div className="p-4 flex justify-between items-center z-10 bg-white/80 backdrop-blur-md sticky top-0">
        <Button variant="ghost" onClick={onExit} className="rounded-full !p-3 bg-gray-100">
          <X size={24} />
        </Button>
        <h2 className="text-xl font-black text-gray-800 tracking-tight truncate max-w-[200px]">{timer.taskName}</h2>
        <div className="w-12"></div> {/* Spacer for centering */}
      </div>

      {/* Main Visual Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-lg mx-auto relative">
        
        {/* The Reveal Container */}
        <div className="relative w-full aspect-square max-w-[350px] rounded-[3rem] overflow-hidden border-8 border-black shadow-cartoon bg-gray-100">
          {/* The Hidden Image */}
          <img 
            src={timer.imageUri} 
            alt="Reward" 
            className="absolute inset-0 w-full h-full object-cover" 
          />
          
          {/* The Curtain/Overlay */}
          <div 
            className={`absolute inset-0 ${THEME_BG_COLORS[timer.themeColor]} transition-all duration-300 ease-linear z-10 flex items-end justify-center`}
            style={{ 
                height: `${100 - progressPercentage}%`,
                borderBottom: '4px solid rgba(0,0,0,0.1)' 
            }}
          >
              {/* Optional: Add a subtle pattern or icon on the curtain */}
              <div className="mb-4 opacity-50 text-white animate-bounce">
                  {!isActive && !isCompleted && timeLeft === totalTime && (
                      <span className="font-bold text-lg">Press Play!</span>
                  )}
              </div>
          </div>
          
          {/* Completed overlay text */}
          {isCompleted && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 animate-fade-in">
                  <div className="bg-white px-6 py-3 rounded-2xl border-4 border-black shadow-cartoon transform -rotate-6">
                      <span className="text-3xl font-black text-kid-pink">Great Job!</span>
                  </div>
              </div>
          )}
        </div>

        {/* Timer Display */}
        <div className="mt-8 text-center">
            <div className={`text-6xl font-black tabular-nums tracking-tighter transition-colors ${timeLeft <= 10 && timeLeft > 0 ? 'text-red-500 scale-110' : 'text-gray-800'}`}>
                {formatTime(timeLeft)}
            </div>
        </div>

        {/* Controls */}
        <div className="mt-8 flex gap-6 items-center">
             {!isCompleted ? (
                 <>
                    <Button 
                        variant="secondary" 
                        onClick={resetTimer}
                        disabled={timeLeft === totalTime}
                        className="rounded-full !p-4"
                    >
                        <RotateCcw size={24} />
                    </Button>

                    <Button 
                        onClick={toggleTimer} 
                        className={`rounded-full !p-6 w-24 h-24 flex items-center justify-center transition-all ${isActive ? 'bg-kid-orange border-kid-orange text-white' : 'bg-green-500 border-green-600'}`}
                    >
                        {isActive ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-1" />}
                    </Button>
                 </>
             ) : (
                <Button onClick={onExit} size="lg" className="px-12 text-xl animate-bounce">
                    Done!
                </Button>
             )}
        </div>
      </div>
    </div>
  );
};