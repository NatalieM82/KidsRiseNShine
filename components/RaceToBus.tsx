import React, { useState, useEffect } from 'react';
import { Home, School, Bus } from 'lucide-react';

interface RaceToBusProps {
  startTime: string; // ISO String
  departureTime: string; // ISO String
  totalTaskSecondsRemaining: number;
  isSimulating: boolean;
  simulatedOffsetMinutes: number;
}

export const RaceToBus: React.FC<RaceToBusProps> = ({ 
  startTime, 
  departureTime, 
  totalTaskSecondsRemaining,
  isSimulating,
  simulatedOffsetMinutes
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

  const isLate = secondsUntilDeparture < 0 && progressPercentage < 100; // Technically progress is capped at 100 but logically late

  return (
    <div className="w-full bg-white rounded-3xl border-4 border-black shadow-cartoon p-6 mb-8 relative overflow-hidden">
        {/* Header Area */}
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
            
            {/* Simulation Indicator (Visual only, controls moved to Settings) */}
            {isSimulating && (
                <div className="bg-yellow-100 px-3 py-1 rounded-full border-2 border-yellow-300">
                     <span className="text-xs font-bold text-yellow-700 uppercase tracking-wider">Sim Mode</span>
                </div>
            )}
        </div>

        {/* Track Container */}
        <div className="relative h-16 w-full flex items-center px-6">
            {/* The Road/Bar */}
            <div className="absolute left-6 right-6 h-4 bg-gray-200 rounded-full overflow-hidden border-2 border-gray-300">
                <div 
                    className={`h-full transition-all duration-1000 linear ${isUrgent ? 'bg-red-400' : 'bg-kid-blue'}`}
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>

            {/* Icons: Start */}
            <div className="absolute left-0 z-10 flex flex-col items-center">
                <div className="bg-white p-1.5 rounded-full border-2 border-gray-300 shadow-sm">
                    <Home size={20} className="text-gray-600" />
                </div>
            </div>

            {/* Icons: End */}
            <div className="absolute right-0 z-10 flex flex-col items-center">
                <div className="bg-white p-1.5 rounded-full border-2 border-gray-300 shadow-sm">
                    <School size={20} className="text-gray-600" />
                </div>
            </div>

            {/* The Bus */}
            <div 
                className="absolute z-20 transition-all duration-1000 linear will-change-transform"
                style={{ 
                    left: `calc(${progressPercentage}% + 24px)`, // Offset start margin
                    transform: 'translateX(-50%)' // Center on the percentage point
                }}
            >
                <div className={`relative ${isUrgent ? 'animate-shake' : 'animate-bounce-slight'}`}>
                     {/* Bus Body */}
                    <div className={`w-12 h-10 ${isUrgent ? 'bg-red-500' : 'bg-kid-yellow'} rounded-xl border-2 border-black flex items-center justify-center shadow-md relative z-10`}>
                        <Bus size={24} className={isUrgent ? 'text-white' : 'text-black'} />
                        {/* Windows */}
                        <div className="absolute top-1 left-2 right-2 h-3 bg-white/50 rounded-sm"></div>
                    </div>
                    {/* Wheels */}
                    <div className="absolute -bottom-1.5 left-1.5 w-3 h-3 bg-black rounded-full z-0"></div>
                    <div className="absolute -bottom-1.5 right-1.5 w-3 h-3 bg-black rounded-full z-0"></div>
                </div>
            </div>
        </div>

        {/* Time Labels */}
        <div className="flex justify-between mt-2 text-xs font-bold text-gray-400 px-1">
            <span>{startDate.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit'})}</span>
            <span>{departureDate.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit'})}</span>
        </div>
    </div>
  );
};