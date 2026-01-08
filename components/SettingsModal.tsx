import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { Button } from './Button';
import { X, Clock, ShieldAlert, CheckCircle2, RotateCcw, Trash2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  currentSettings: AppSettings;
  totalTaskSeconds: number;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
  simulation: { isActive: boolean; offset: number };
  onSimulationChange: (sim: { isActive: boolean; offset: number }) => void;
  onResetAllProgress: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  currentSettings, 
  totalTaskSeconds,
  onSave, 
  onClose,
  simulation,
  onSimulationChange,
  onResetAllProgress
}) => {
  const [settings, setSettings] = useState<AppSettings>(currentSettings);

  // Sync state when prop updates
  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings, isOpen]);

  if (!isOpen) return null;

  // -- Calculations for Visual Feedback --
  
  // Helper to get minutes from midnight
  const getMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const startMin = getMinutes(settings.morningStart);
  const endMin = getMinutes(settings.departureTime);
  const bufferMin = settings.bufferMinutes;

  const totalWindowMinutes = endMin - startMin;
  const taskMinutes = Math.ceil(totalTaskSeconds / 60);
  const availableMinutes = Math.max(0, totalWindowMinutes - bufferMin);
  
  const isOverBudget = taskMinutes > availableMinutes;
  const isTimeInvalid = totalWindowMinutes <= 0;

  // Width percentages for the bar chart
  const getPercent = (mins: number) => {
    if (totalWindowMinutes <= 0) return 0;
    return Math.min(100, (mins / totalWindowMinutes) * 100);
  };

  const taskPercent = getPercent(taskMinutes);
  const bufferPercent = getPercent(bufferMin);
  const freePercent = Math.max(0, 100 - taskPercent - bufferPercent);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isTimeInvalid) {
        alert("Departure time must be after Start time.");
        return;
    }
    onSave(settings);
    onClose();
  };

  // Helper for current simulated time display
  const getSimulatedTimeDisplay = () => {
    const now = new Date();
    const simTime = new Date(now.getTime() + simulation.offset * 60000);
    return simTime.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Card */}
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
           <div>
             <h2 className="text-2xl font-black text-gray-800">Morning Setup</h2>
             <p className="text-sm text-gray-500 font-bold">Configure the journey</p>
           </div>
           <Button variant="ghost" onClick={onClose} className="rounded-full !p-2">
             <X size={24} />
           </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
            <form id="settings-form" onSubmit={handleSave} className="space-y-6">
                
                {/* Time Inputs */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">Start Morning</label>
                        <input 
                            type="time" 
                            required
                            value={settings.morningStart}
                            onChange={(e) => setSettings({...settings, morningStart: e.target.value})}
                            className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl font-bold text-xl focus:border-black focus:outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">Departure Time</label>
                        <input 
                            type="time" 
                            required
                            value={settings.departureTime}
                            onChange={(e) => setSettings({...settings, departureTime: e.target.value})}
                            className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl font-bold text-xl focus:border-black focus:outline-none"
                        />
                    </div>
                </div>

                {/* Buffer Input */}
                <div className="space-y-2">
                     <label className="block text-sm font-bold text-gray-700 flex justify-between">
                        <span>Buffer Time (Shoes, Coat, etc.)</span>
                        <span className="text-gray-400">{settings.bufferMinutes} min</span>
                     </label>
                     <input 
                        type="range"
                        min="0"
                        max="30"
                        step="1"
                        value={settings.bufferMinutes}
                        onChange={(e) => setSettings({...settings, bufferMinutes: parseInt(e.target.value)})}
                        className="w-full accent-black h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                     />
                </div>

                {/* Visual Budget Bar */}
                <div className="p-4 bg-gray-50 rounded-2xl border-2 border-gray-100 space-y-3">
                    <div className="flex justify-between items-end text-sm">
                        <span className="font-bold text-gray-600">Time Budget</span>
                        <span className={`font-bold ${isOverBudget ? 'text-red-500' : 'text-green-600'}`}>
                            {availableMinutes - taskMinutes} min {isOverBudget ? 'short' : 'spare'}
                        </span>
                    </div>
                    
                    {/* The Bar */}
                    <div className="h-6 w-full bg-gray-200 rounded-full overflow-hidden flex shadow-inner">
                        <div 
                            style={{ width: `${taskPercent}%` }} 
                            className={`h-full ${isOverBudget ? 'bg-red-400' : 'bg-kid-blue'} transition-all duration-500 flex items-center justify-center`}
                            title="Tasks"
                        ></div>
                        <div 
                             style={{ width: `${freePercent}%` }}
                             className="h-full bg-green-200 transition-all duration-500"
                             title="Free Time"
                        ></div>
                         <div 
                            style={{ width: `${bufferPercent}%` }} 
                            className="h-full bg-gray-400 transition-all duration-500 pattern-diagonal-lines"
                            title="Buffer"
                        ></div>
                    </div>

                    {/* Legend */}
                    <div className="flex gap-4 text-xs font-bold text-gray-400 justify-center pt-1">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-kid-blue"></div> Tasks ({taskMinutes}m)</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-200"></div> Free</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-400"></div> Buffer ({bufferMin}m)</div>
                    </div>
                </div>

                {/* Warning Message */}
                {isOverBudget && (
                    <div className="flex items-start gap-3 p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
                        <ShieldAlert className="shrink-0 mt-0.5" size={18} />
                        <div>
                            <span className="font-bold">Schedule Overload! </span>
                            Your routine is longer than the time you have left. Consider starting earlier or reducing tasks.
                        </div>
                    </div>
                )}
            </form>

            {/* Quick Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
                <span className="font-black text-gray-800 block">Quick Actions</span>
                <Button 
                    type="button"
                    variant="secondary" 
                    fullWidth 
                    className="!bg-red-50 !border-red-200 !text-red-600 hover:!bg-red-100"
                    onClick={onResetAllProgress}
                >
                    <RotateCcw size={18} />
                    Reset Daily Progress
                </Button>
            </div>

            {/* Simulation Controls Section (Direct Control, no Save needed) */}
             <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <span className="font-black text-gray-800">Time Travel Simulation</span>
                    <button 
                        onClick={() => onSimulationChange({ isActive: false, offset: 0 })}
                        className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg font-bold text-gray-600 hover:bg-gray-200 flex items-center gap-1"
                        type="button"
                    >
                        <RotateCcw size={12} /> Reset
                    </button>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200 space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={simulation.isActive}
                                onChange={(e) => onSimulationChange({ ...simulation, isActive: e.target.checked })}
                                className="w-5 h-5 rounded text-black focus:ring-black border-gray-300"
                            />
                            <span className="font-bold text-gray-700">Enable Override</span>
                        </label>
                        <div className="text-right">
                             <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Simulated Time</div>
                             <div className="font-mono font-bold text-lg text-blue-600">{getSimulatedTimeDisplay()}</div>
                        </div>
                    </div>

                    {simulation.isActive && (
                        <div className="space-y-2 animate-fade-in">
                            <input 
                                type="range" 
                                min="-360" 
                                max="360" 
                                value={simulation.offset}
                                onChange={(e) => onSimulationChange({ ...simulation, offset: parseInt(e.target.value) })}
                                className="w-full accent-black h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] font-bold text-gray-400">
                                <span>-6 hours</span>
                                <span className="text-gray-600">{simulation.offset > 0 ? '+' : ''}{simulation.offset} min</span>
                                <span>+6 hours</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-gray-100">
             <Button fullWidth onClick={handleSave} disabled={isTimeInvalid}>
                 Save Settings
             </Button>
        </div>

      </div>
    </div>
  );
};