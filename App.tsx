import React, { useState, useEffect } from 'react';
import { Timer, AppSettings, THEME_COLORS, PresetDef } from './types';
import { loadInitialPresets, saveTimer, deleteTimer, getSettings, saveSettings, resetAllTimersStatus, getPresets, savePreset } from './services/storage';
import { TimerForm } from './components/TimerForm';
import { ActiveTimer } from './components/ActiveTimer';
import { Button } from './components/Button';
import { RaceToBus } from './components/RaceToBus';
import { SettingsModal } from './components/SettingsModal';
import { Plus, Trash2, Clock, Edit2, Check, Settings as SettingsIcon, Loader2 } from 'lucide-react';

// View State Types
type ViewState = 
  | { type: 'DASHBOARD' }
  | { type: 'CREATE' }
  | { type: 'EDIT', timer: Timer }
  | { type: 'ACTIVE', timer: Timer };

// Check if timer was completed today
const isCompletedToday = (timer: Timer) => {
    if (!timer.lastCompleted) return false;
    const date = new Date(timer.lastCompleted);
    const today = new Date();
    return date.toDateString() === today.toDateString();
};

// Timer Card Component
interface TimerCardProps {
  timer: Timer;
  onActivate: (timer: Timer) => void;
  onEdit: (e: React.MouseEvent, timer: Timer) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

const TimerCard: React.FC<TimerCardProps> = ({ timer, onActivate, onEdit, onDelete }) => {
  const completed = isCompletedToday(timer);
  const themeClass = THEME_COLORS[timer.themeColor] || THEME_COLORS.blue;
  const [bgClass, borderClass] = themeClass.split(' ');

  return (
    <div className="w-full">
      <div
        onClick={() => onActivate(timer)}
        className={`relative group w-full p-3 pr-4 rounded-3xl border-4 transition-all hover:-translate-y-1 active:translate-y-1 active:shadow-none flex items-center shadow-cartoon overflow-hidden cursor-pointer select-none ${completed ? 'bg-green-50 border-green-600' : 'bg-white border-black'}`}
      >
        {/* Decorative Background Shape */}
        <div className={`absolute -right-8 -bottom-8 w-40 h-40 rounded-full opacity-10 ${bgClass} pointer-events-none transition-transform group-hover:scale-110`} />
        
        {/* Content Layout */}
        <div className="z-10 flex items-center w-full gap-4">
            
            {/* Image Thumbnail with Completed Overlay */}
            <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-2xl border-4 overflow-hidden shadow-sm flex-shrink-0 ${borderClass} bg-white`}>
                <img 
                  src={timer.imageUri} 
                  alt={timer.taskName} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  draggable={false} 
                />
                {completed && (
                    <div className="absolute inset-0 bg-green-500/50 flex items-center justify-center backdrop-blur-[1px]">
                        <div className="bg-white rounded-full p-1 shadow-md">
                            <Check size={28} className="text-green-600" strokeWidth={4} />
                        </div>
                    </div>
                )}
            </div>

            {/* Text Info */}
            <div className="flex flex-col items-start flex-grow min-w-0 py-1">
                <h3 className={`text-2xl md:text-3xl font-black leading-none tracking-tight truncate w-full mb-2 ${completed ? 'text-green-700 decoration-green-500' : 'text-gray-800'}`}>
                  {timer.taskName}
                </h3>
                <div className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-bold ${completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {completed ? (
                      <>
                        <Check size={14} className="mr-1.5" strokeWidth={3} />
                        <span>Done!</span>
                      </>
                  ) : (
                      <>
                        <Clock size={14} className="mr-1.5" />
                        <span>
                            {Math.floor(timer.durationSec / 60)}:{String(timer.durationSec % 60).padStart(2, '0')}
                        </span>
                      </>
                  )}
                </div>
            </div>

            {/* Edit/Delete Actions */}
            <div 
              className="flex flex-col gap-2 ml-2 z-20 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()} 
            >
                <div 
                    role="button"
                    onClick={(e) => onEdit(e, timer)}
                    className="p-2 bg-white hover:bg-gray-50 rounded-full border border-gray-200 hover:border-black shadow-sm"
                >
                    <Edit2 size={16} className="text-gray-600"/>
                </div>
                <div 
                    role="button"
                    onClick={(e) => onDelete(e, timer.id)}
                    className="p-2 bg-white hover:bg-red-50 rounded-full border border-red-100 hover:border-red-500 shadow-sm"
                >
                    <Trash2 size={16} className="text-red-500"/>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [view, setView] = useState<ViewState>({ type: 'DASHBOARD' });
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Settings State
  const [appSettings, setAppSettings] = useState<AppSettings>(getSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Simulation State
  const [simulation, setSimulation] = useState({ isActive: false, offset: 0 });

  // Preset Generation State
  const [presets, setPresets] = useState<PresetDef[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load data on mount
  useEffect(() => {
    // 1. Load basic data
    setTimers(loadInitialPresets());
    setAppSettings(getSettings());
    
    // 2. Load presets and trigger generation if needed
    const loadedPresets = getPresets();
    setPresets(loadedPresets);

    // 3. Date check loop
    const interval = setInterval(() => {
        const now = new Date();
        if (now.toDateString() !== currentDate.toDateString()) {
            setCurrentDate(now);
            // Optionally reset statuses here automatically?
            // For now, let's keep it manual or explicitly via button
        }
    }, 60000);

    return () => clearInterval(interval);
  }, [currentDate]);

  // Derived state: Convert HH:mm settings + today's date into ISO strings for RaceToBus
  const getJourneyTimes = () => {
    const today = new Date();
    
    // Parse start time
    const [startH, startM] = appSettings.morningStart.split(':').map(Number);
    const startDate = new Date(today);
    startDate.setHours(startH, startM, 0, 0);

    // Parse departure time
    const [endH, endM] = appSettings.departureTime.split(':').map(Number);
    const endDate = new Date(today);
    endDate.setHours(endH, endM, 0, 0);

    // Apply buffer to create the "Effective Departure" (Goal Line)
    const effectiveEndDate = new Date(endDate.getTime() - appSettings.bufferMinutes * 60000);

    return {
        start: startDate.toISOString(),
        end: effectiveEndDate.toISOString()
    };
  };

  const journeyTimes = getJourneyTimes();

  // Handlers
  const handleSaveSettings = (newSettings: AppSettings) => {
      const saved = saveSettings(newSettings);
      setAppSettings(saved);
  };

  const handleResetAllProgress = () => {
      const updated = resetAllTimersStatus();
      setTimers([...updated]);
      setIsSettingsOpen(false);
  };

  const handleSave = (timer: Timer) => {
    const updated = saveTimer(timer);
    setTimers(updated);
    setView({ type: 'DASHBOARD' });
  };

  const handleTimerComplete = (timer: Timer) => {
    // Update timestamp and save without changing view
    const updatedTimer = { ...timer, lastCompleted: Date.now() };
    const updatedList = saveTimer(updatedTimer);
    setTimers(updatedList);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(window.confirm("Are you sure you want to remove this task?")) {
        const updated = deleteTimer(id);
        setTimers(updated);
    }
  };

  const handleEdit = (e: React.MouseEvent, timer: Timer) => {
      e.stopPropagation();
      setView({ type: 'EDIT', timer });
  };

  // --------------------------------------------------------------------------
  // RENDER Helpers
  // --------------------------------------------------------------------------

  // Shared Total Duration calculation for Dashboard and ActiveTimer logic
  const totalUncompletedDuration = timers
        .filter(t => !isCompletedToday(t))
        .reduce((sum, t) => sum + t.durationSec, 0);

  const renderDashboard = () => {
    // Sort timers: Uncompleted first, then completed. 
    const sortedTimers = [...timers].sort((a, b) => {
        const aCompleted = isCompletedToday(a);
        const bCompleted = isCompletedToday(b);
        
        if (aCompleted === bCompleted) return 0;
        return aCompleted ? 1 : -1;
    });

    const totalDurationAllTasks = timers.reduce((sum, t) => sum + t.durationSec, 0);

    return (
        <div className="min-h-screen p-4 pb-24 md:max-w-3xl md:mx-auto">
        
        {/* Settings Modal */}
        <SettingsModal 
            isOpen={isSettingsOpen}
            currentSettings={appSettings}
            totalTaskSeconds={totalDurationAllTasks}
            onSave={handleSaveSettings}
            onClose={() => setIsSettingsOpen(false)}
            simulation={simulation}
            onSimulationChange={setSimulation}
            onResetAllProgress={handleResetAllProgress}
        />

        {/* Header */}
        <header className="flex items-center justify-between mb-8 mt-4">
            <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">Rise & Shine</h1>
            <p className="text-gray-500 font-bold">Good morning, Superstar!</p>
            </div>
            
            <div className="flex gap-3">
                 {/* Generation Status Indicator */}
                 {isGenerating && (
                    <div className="w-12 h-12 bg-white rounded-full border-4 border-gray-100 flex items-center justify-center animate-pulse shadow-sm" title="Creating new stickers...">
                        <Loader2 size={24} className="text-kid-purple animate-spin" />
                    </div>
                 )}

                 <Button 
                    variant="secondary" 
                    onClick={() => setIsSettingsOpen(true)}
                    className="rounded-full !p-3"
                 >
                    <SettingsIcon size={24} />
                 </Button>
            </div>
        </header>

         {/* Journey Progress */}
         <RaceToBus 
            startTime={journeyTimes.start}
            departureTime={journeyTimes.end}
            totalTaskSecondsRemaining={totalUncompletedDuration}
            isSimulating={simulation.isActive}
            simulatedOffsetMinutes={simulation.offset}
        />

        {/* Timer Grid */}
        <div className="space-y-4">
            {sortedTimers.map(timer => (
            <TimerCard 
                key={timer.id} 
                timer={timer} 
                onActivate={(t) => setView({ type: 'ACTIVE', timer: t })}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
            ))}

            {sortedTimers.length === 0 && (
                <div className="text-center py-12 px-4 bg-white rounded-3xl border-4 border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Clock size={40} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-600 mb-2">No tasks yet!</h3>
                    <p className="text-gray-400 mb-6">Add your morning routine tasks to get started.</p>
                </div>
            )}
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6 z-40">
            <Button 
            onClick={() => setView({ type: 'CREATE' })}
            className="rounded-full w-16 h-16 !p-0 shadow-cartoon hover:scale-105 active:scale-95 flex items-center justify-center"
            >
            <Plus size={32} strokeWidth={3} />
            </Button>
        </div>
        </div>
    );
  };

  return (
    <div className="font-sans text-gray-900 min-h-screen">
      {view.type === 'DASHBOARD' && renderDashboard()}
      
      {(view.type === 'CREATE' || view.type === 'EDIT') && (
        <div className="fixed inset-0 bg-white z-50 overflow-hidden">
             <TimerForm 
                initialData={view.type === 'EDIT' ? view.timer : undefined}
                presets={presets}
                onSave={handleSave}
                onCancel={() => setView({ type: 'DASHBOARD' })}
             />
        </div>
      )}

      {view.type === 'ACTIVE' && (
        <ActiveTimer 
          timer={view.timer}
          onExit={() => setView({ type: 'DASHBOARD' })}
          onComplete={handleTimerComplete}
          journeyConfig={{
            startTime: journeyTimes.start,
            departureTime: journeyTimes.end,
            isSimulating: simulation.isActive,
            simulatedOffsetMinutes: simulation.offset
          }}
          // If the active task is NOT completed, it is included in totalUncompletedDuration.
          // We subtract its duration here because ActiveTimer adds 'timeLeft' dynamically to this base.
          // If the active task IS completed (re-running it), it wasn't in totalUncompletedDuration, so base is fine.
          otherTasksDurationSec={
             totalUncompletedDuration - (isCompletedToday(view.timer) ? 0 : view.timer.durationSec)
          }
        />
      )}
    </div>
  );
};

export default App;