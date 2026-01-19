import React, { useState, useEffect } from 'react';
import { Home, School, Bus } from 'lucide-react';

export interface RaceToBusProps {
  startTime: string; // ISO String
  departureTime: string; // ISO String
  totalTaskSecondsRemaining: number;
  isSimulating: boolean;
  simulatedOffsetMinutes: number;
  className?: string;
  compact?: boolean;
}

export const RaceToBus: React.FC<RaceToBusProps> = ({ 
  startTime, 
  departureTime, 
  totalTaskSecondsRemaining,
  isSimulating,
  simulatedOffsetMinutes,
  className = '',
  compact = false
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Derived Date objects
  const startDate = new Date(startTime);
  const departureDate = new Date(departureTime);
  
  // Real-time update loop
  useEffect(() => {
    const timer = setInterval(() => {
      // If simulating, base time doesn't auto-tick in the same way, 
      // but we update so the 'currentTime' (which acts as base for offset) stays fresh
      if (!isSimulating) {
        setCurrentTime(new Date());
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isSimulating]);

  // Determine the time to use for calculations
  const effectiveTime = isSimulating 
    ? new Date(new Date().getTime() + simulatedOffsetMinutes * 60000) 
    : currentTime;

  // Calculate Progress
  const totalDuration = departureDate.getTime() - startDate.getTime();
  const elapsed = effectiveTime.getTime() - startDate.getTime();
  const rawPercentage = (elapsed / totalDuration) * 100;
  const progressPercentage = Math.min(100, Math.max(0, rawPercentage));

  // Urgency Logic
  const msUntilDeparture = departureDate.getTime() - effectiveTime.getTime();
  const secondsUntilDeparture = msUntilDeparture / 1000;
  
  // Urgent if time remaining is less than task time needed
  // Only trigger urgency if we are actually ON the journey (progress > 0) and not yet arrived
  const isUrgent = progressPercentage > 0 && 
                   progressPercentage < 100 && 
                   secondsUntilDeparture < totalTaskSecondsRemaining;

  const isLate = secondsUntilDeparture < 0 && progressPercentage < 100;

  // Container Styles
  const containerStyles = compact 
    ? `w-full bg-transparent p-0 mb-4 ${className}`
    : `w-full bg-white rounded-3xl border-4 border-black shadow-cartoon p-6 mb-8 ${className}`;

  return (
    <div className={containerStyles}>
        {/* Header Area */}
        {!compact && (
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-black text-gray-800 tracking-tight">Race to School</h2>
                    <div className="text-sm font-bold text-gray-500">
                        {isUrgent 
                            ? <span className="text-red-500 animate-pulse">Hurry up! Not enough time!</span> 
                            : isLate
                                ? "Bus has left!"
                                : `${Math.ceil(Math.max(0, secondsUntilDeparture)/60)} mins until departure`
                        }
                    </div>
                </div>
                
                {isSimulating && (
                    <div className="bg-yellow-100 px-3 py-1 rounded-full border-2 border-yellow-300">
                        <span className="text-xs font-bold text-yellow-700 uppercase tracking-wider">Sim Mode</span>
                    </div>
                )}
            </div>
        )}

        {/* Compact Urgency Indicator */}
        {compact && isUrgent && (
             <div className="text-center text-xs font-black text-red-500 animate-pulse mb-2 uppercase tracking-widest">
                Hurry Up!
             </div>
        )}

        {/* Track Container */}
        <div className={`relative w-full flex items-center ${compact ? 'h-12' : 'h-16 px-6'}`}>
            {/* The Road/Bar */}
            {/* 
                Road positioning:
                Full: left-6 right-6 (24px padding from container edge)
                Compact: left-8 right-8 (32px padding from container edge to allow icons to sit on top comfortably)
            */}
            <div className={`absolute h-3 md:h-4 bg-gray-200 rounded-full overflow-hidden border-2 border-gray-300 ${compact ? 'left-8 right-8' : 'left-6 right-6'}`}>
                <div 
                    className={`h-full transition-all duration-1000 linear ${isUrgent ? 'bg-red-400' : 'bg-kid-blue'}`}
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>

            {/* Icons: Start */}
            <div className="absolute left-0 z-10 flex flex-col items-center">
                <div className="bg-white p-1 md:p-1.5 rounded-full border-2 border-gray-300 shadow-sm">
                    <Home size={compact ? 16 : 20} className="text-gray-600" />
                </div>
            </div>

            {/* Icons: End */}
            <div className="absolute right-0 z-10 flex flex-col items-center">
                <div className="bg-white p-1 md:p-1.5 rounded-full border-2 border-gray-300 shadow-sm">
                    <School size={compact ? 16 : 20} className="text-gray-600" />
                </div>
            </div>

            {/* The Bus */}
            <div 
                className="absolute z-20 transition-all duration-1000 linear will-change-transform"
                style={{ 
                    // Calculate left position based on road insets
                    // Road Inset Left = compact ? 32px (2rem) : 24px (1.5rem)
                    // Road Width = 100% - (InsetLeft + InsetRight)
                    // Position = InsetLeft + (Percent * RoadWidth)
                    left: `calc(${compact ? '32px' : '24px'} + (100% - ${compact ? '64px' : '48px'}) * ${progressPercentage / 100})`,
                    transform: 'translateX(-50%)'
                }}
            >
                <div className={`relative ${isUrgent ? 'animate-shake' : 'animate-bounce-slight'}`}>
                     {/* Bus Body */}
                    <div className={`${compact ? 'w-10 h-8 border-[1.5px]' : 'w-12 h-10 border-2'} ${isUrgent ? 'bg-red-500' : 'bg-kid-yellow'} rounded-xl border-black flex items-center justify-center shadow-md relative z-10`}>
                        <Bus size={compact ? 18 : 24} className={isUrgent ? 'text-white' : 'text-black'} />
                        {/* Windows */}
                        <div className="absolute top-1 left-2 right-2 h-2.5 bg-white/50 rounded-sm"></div>
                    </div>
                    {/* Wheels */}
                    <div className={`absolute -bottom-1 left-1.5 w-2.5 h-2.5 bg-black rounded-full z-0`}></div>
                    <div className={`absolute -bottom-1 right-1.5 w-2.5 h-2.5 bg-black rounded-full z-0`}></div>
                </div>
            </div>
        </div>

        {/* Time Labels */}
        {!compact && (
            <div className="flex justify-between mt-2 text-xs font-bold text-gray-400 px-1">
                <span>{startDate.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit'})}</span>
                <span>{departureDate.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit'})}</span>
            </div>
        )}
    </div>
  );
};