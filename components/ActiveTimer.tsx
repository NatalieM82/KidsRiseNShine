import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Timer, THEME_BG_COLORS } from '../types';
import { Button } from './Button';
import { playSound } from '../utils/audio';
import { RaceToBus } from './RaceToBus';
import { X, Pause, Play, RotateCcw, Check } from 'lucide-react';

interface ActiveTimerProps {
  timer: Timer;
  onExit: () => void;
  onComplete?: (timer: Timer) => void;
  journeyConfig: {
    startTime: string;
    departureTime: string;
    isSimulating: boolean;
    simulatedOffsetMinutes: number;
  };
  otherTasksDurationSec: number;
}

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


export const ActiveTimer: React.FC<ActiveTimerProps> = ({ 
  timer, 
  onExit, 
  onComplete,
  journeyConfig,
  otherTasksDurationSec 
}) => {
  const [timeLeft, setTimeLeft] = useState(timer.durationSec);
  const [isActive, setIsActive] = useState(false); // Start paused so user gets ready
  const [isCompleted, setIsCompleted] = useState(false);
  
  const startTimeRef = useRef<number | null>(null);
  const initialTimeRef = useRef<number>(timer.durationSec);
  const rafRef = useRef<number | null>(null);
  const soundPlayedRef = useRef(false);

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
          finishTimer();
      } else {
          rafRef.current = requestAnimationFrame(tick);
      }
  }, [timer]);

  const finishTimer = () => {
      setIsCompleted(true);
      setIsActive(false);
      setTimeLeft(0);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      
      if (!soundPlayedRef.current) {
        playSound(timer.soundType);
        soundPlayedRef.current = true;
        if (onComplete) {
            onComplete(timer);
        }
      }
  };

  const handleEarlyComplete = () => {
      finishTimer();
  };

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
      soundPlayedRef.current = false;
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

  // Dynamic calculation of total load including current ticking timer
  const currentTotalRemaining = otherTasksDurationSec + timeLeft;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-y-auto">
      {isCompleted && <Confetti />}

      {/* Header */}
      <div className="p-4 flex justify-between items-center z-10 bg-white/80 backdrop-blur-md sticky top-0">
        <Button variant="ghost" onClick={onExit} className="rounded-full !p-3 bg-gray-100">
          <X size={24} />
        </Button>
        <h2 className="text-xl font-black text-gray-800 tracking-tight truncate max-w-[200px]">{timer.taskName}</h2>
        <div className="w-12"></div> {/* Spacer for centering */}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center p-4 w-full max-w-lg mx-auto relative pb-20">
        
        {/* Race Progress Bar (Compact inside timer) */}
        {!isCompleted && (
            <RaceToBus 
                {...journeyConfig}
                totalTaskSecondsRemaining={currentTotalRemaining}
                compact={true}
                className="mb-8"
            />
        )}

        {/* The Reveal Container */}
        <div className={`relative w-full aspect-square max-w-[320px] rounded-[2.5rem] overflow-hidden border-8 border-black shadow-cartoon bg-gray-100 transition-transform duration-500 ${isCompleted ? 'scale-105 rotate-2' : ''}`}>
          {/* The Hidden Image */}
          <img 
            src={timer.imageUri} 
            alt="Reward" 
            className="absolute inset-0 w-full h-full object-cover" 
          />
          
          {/* The Curtain/Overlay */}
          <div 
            className={`absolute bottom-0 left-0 right-0 ${THEME_BG_COLORS[timer.themeColor]} z-10 flex items-start justify-center overflow-hidden`}
            style={{ 
                height: `${100 - progressPercentage}%`,
            }}
          >
              <div className="w-full h-3 bg-black/10 absolute top-0"></div>
              <div className="mt-12 opacity-50 text-white animate-bounce">
                  {!isActive && !isCompleted && timeLeft === totalTime && (
                      <span className="font-bold text-lg">Press Play!</span>
                  )}
              </div>
          </div>
          
          {/* Completed overlay text */}
          {isCompleted && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 animate-fade-in">
                  <div className="bg-white px-6 py-3 rounded-2xl border-4 border-black shadow-cartoon transform -rotate-6 animate-bounce">
                      <span className="text-3xl font-black text-kid-pink">Great Job!</span>
                  </div>
              </div>
          )}
        </div>

        {/* Timer Display */}
        <div className="mt-6 text-center">
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
                        title="Reset Timer"
                    >
                        <RotateCcw size={24} />
                    </Button>

                    <Button 
                        onClick={toggleTimer} 
                        className={`rounded-full !p-6 w-24 h-24 flex items-center justify-center transition-all ${isActive ? 'bg-kid-orange border-kid-orange text-white' : 'bg-green-500 border-green-600'}`}
                    >
                        {isActive ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-1" />}
                    </Button>

                    <Button 
                        variant="secondary" 
                        onClick={handleEarlyComplete}
                        className="rounded-full !p-4 bg-green-50 border-green-200 hover:border-green-600 hover:bg-green-100"
                        title="I'm done!"
                    >
                        <Check size={24} className="text-green-600" />
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