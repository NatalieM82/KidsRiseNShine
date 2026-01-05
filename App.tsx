import React, { useState, useEffect } from 'react';
import { Timer, THEME_COLORS } from './types';
import { loadInitialPresets, saveTimer, deleteTimer } from './services/storage';
import { TimerForm } from './components/TimerForm';
import { ActiveTimer } from './components/ActiveTimer';
import { Button } from './components/Button';
import { Plus, Trash2, Clock, Edit2, Check } from 'lucide-react';

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
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
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

  return (
    <div className="w-full">
      <div
        onClick={() => onActivate(timer)}
        className={`relative group w-full p-3 pr-4 rounded-3xl border-4 transition-all hover:-translate-y-1 active:translate-y-1 active:shadow-none flex items-center shadow-cartoon overflow-hidden cursor-pointer select-none ${completed ? 'bg-green-50 border-green-600' : 'bg-white border-black'}`}
      >
        {/* Decorative Background Shape */}
        <div className={`absolute -right-8 -bottom-8 w-40 h-40 rounded-full opacity-10 ${THEME_COLORS[timer.themeColor].split(' ')[0]} pointer-events-none transition-transform group-hover:scale-110`} />
        
        {/* Content Layout */}
        <div className="z-10 flex items-center w-full gap-4">
            
            {/* Image Thumbnail with Completed Overlay */}
            <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-2xl border-4 overflow-hidden shadow-sm flex-shrink-0 ${THEME_COLORS[timer.themeColor].split(' ')[1]}`}>
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

  // Load data on mount
  useEffect(() => {
    setTimers(loadInitialPresets());

    // Check every minute if the day has changed to reset statuses
    const interval = setInterval(() => {
        const now = new Date();
        if (now.getDate() !== currentDate.getDate()) {
            setCurrentDate(now);
        }
    }, 60000);

    return () => clearInterval(interval);
  }, [currentDate]);

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
  // RENDER HELPERS
  // --------------------------------------------------------------------------

  const renderDashboard = () => {
    // Sort timers: Uncompleted first, then completed. 
    // This uses new Date() internally via isCompletedToday, but checking against currentDate 
    // implicitly ensures we re-render when currentDate state updates.
    const sortedTimers = [...timers].sort((a, b) => {
        const aCompleted = isCompletedToday(a);
        const bCompleted = isCompletedToday(b);
        
        if (aCompleted === bCompleted) return 0;
        return aCompleted ? 1 : -1;
    });

    return (
        <div className="min-h-screen p-4 pb-24 md:max-w-3xl md:mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 mt-4">
            <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">Rise & Shine</h1>
            <p className="text-gray-500 font-bold">Good morning, Superstar!</p>
            </div>
            <div className="w-12 h-12 bg-yellow-300 rounded-full border-4 border-black flex items-center justify-center shadow-cartoon">
            <span className="text-2xl">☀️</span>
            </div>
        </header>

        {/* Timer List */}
        <div className="flex flex-col gap-4">
            {sortedTimers.map((timer) => (
            <TimerCard 
                key={timer.id} 
                timer={timer} 
                onActivate={(t) => setView({ type: 'ACTIVE', timer: t })}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
            ))}
        </div>

        {/* Empty State */}
        {timers.length === 0 && (
            <div className="text-center py-20 opacity-50">
                <p className="text-xl font-bold text-gray-400">No tasks yet!</p>
                <p className="text-gray-400">Add one below to get started.</p>
            </div>
        )}

        {/* FAB */}
        <div className="fixed bottom-6 right-6 z-40">
            <Button 
            onClick={() => setView({ type: 'CREATE' })}
            className="rounded-full w-16 h-16 !p-0 flex items-center justify-center bg-black text-white shadow-cartoon hover:scale-105"
            >
            <Plus size={32} />
            </Button>
        </div>
        </div>
    );
  };

  // --------------------------------------------------------------------------
  // MAIN RENDER
  // --------------------------------------------------------------------------
  
  return (
    <div className="font-sans antialiased text-gray-900 selection:bg-yellow-200">
      {view.type === 'DASHBOARD' && renderDashboard()}
      
      {view.type === 'CREATE' && (
        <TimerForm 
            onSave={handleSave} 
            onCancel={() => setView({ type: 'DASHBOARD' })} 
        />
      )}
      
      {view.type === 'EDIT' && (
        <TimerForm 
            initialData={view.timer}
            onSave={handleSave} 
            onCancel={() => setView({ type: 'DASHBOARD' })} 
        />
      )}

      {view.type === 'ACTIVE' && (
        <ActiveTimer 
            timer={view.timer} 
            onExit={() => setView({ type: 'DASHBOARD' })}
            onComplete={handleTimerComplete}
        />
      )}
    </div>
  );
};

export default App;