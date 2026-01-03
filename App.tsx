import React, { useState, useEffect } from 'react';
import { Timer, THEME_COLORS } from './types';
import { loadInitialPresets, saveTimer, deleteTimer } from './services/storage';
import { TimerForm } from './components/TimerForm';
import { ActiveTimer } from './components/ActiveTimer';
import { Button } from './components/Button';
import { Plus, Trash2, Clock, Settings, Edit2 } from 'lucide-react';

// View State Types
type ViewState = 
  | { type: 'DASHBOARD' }
  | { type: 'CREATE' }
  | { type: 'EDIT', timer: Timer }
  | { type: 'ACTIVE', timer: Timer };

const App: React.FC = () => {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [view, setView] = useState<ViewState>({ type: 'DASHBOARD' });

  // Load data on mount
  useEffect(() => {
    setTimers(loadInitialPresets());
  }, []);

  const handleSave = (timer: Timer) => {
    const updated = saveTimer(timer);
    setTimers(updated);
    setView({ type: 'DASHBOARD' });
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

  const renderDashboard = () => (
    <div className="min-h-screen p-4 pb-24 md:max-w-4xl md:mx-auto">
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

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {timers.map((timer) => (
          <button
            key={timer.id}
            onClick={() => setView({ type: 'ACTIVE', timer })}
            className="relative group w-full aspect-square p-2 md:p-4 rounded-3xl border-4 transition-all hover:-translate-y-1 active:translate-y-1 active:shadow-none flex flex-col items-center justify-center bg-white border-black shadow-cartoon overflow-hidden"
          >
            {/* Decorative Corner */}
            <div className={`absolute -top-8 -right-8 w-24 h-24 md:w-32 md:h-32 rounded-full opacity-10 ${THEME_COLORS[timer.themeColor].split(' ')[0]} transition-all group-hover:scale-110`} />
            
            {/* Main Content Wrapper */}
            <div className="z-10 flex flex-col items-center justify-center w-full h-full gap-2 md:gap-4 mt-2">
                
                {/* Image Container */}
                <div className={`relative w-16 h-16 md:w-24 md:h-24 rounded-2xl border-2 md:border-4 overflow-hidden shadow-sm flex-shrink-0 ${THEME_COLORS[timer.themeColor].split(' ')[1]}`}>
                    <img 
                      src={timer.imageUri} 
                      alt={timer.taskName} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                </div>

                {/* Text Info */}
                <div className="flex flex-col items-center w-full px-1">
                    <h3 className="text-sm md:text-lg font-black text-gray-800 leading-tight text-center w-full line-clamp-1 mb-1">
                      {timer.taskName}
                    </h3>
                    <div className="inline-flex items-center justify-center bg-gray-100 rounded-full px-2 py-0.5 text-xs md:text-sm font-bold text-gray-500">
                      <Clock size={10} className="mr-1 md:w-3 md:h-3" />
                      <span>
                        {Math.floor(timer.durationSec / 60)}:{String(timer.durationSec % 60).padStart(2, '0')}
                      </span>
                    </div>
                </div>
            </div>

            {/* Edit/Delete Actions - Always visible on mobile but subtle, larger on hover for desktop */}
            <div className="absolute top-2 right-2 flex gap-1 z-20 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <div 
                    role="button"
                    onClick={(e) => handleEdit(e, timer)}
                    className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full border border-gray-200 hover:border-black shadow-sm"
                >
                    <Edit2 size={12} className="text-gray-600"/>
                </div>
                <div 
                    role="button"
                    onClick={(e) => handleDelete(e, timer.id)}
                    className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full border border-red-100 hover:border-red-500 shadow-sm"
                >
                    <Trash2 size={12} className="text-red-500"/>
                </div>
            </div>
          </button>
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
        />
      )}
    </div>
  );
};

export default App;