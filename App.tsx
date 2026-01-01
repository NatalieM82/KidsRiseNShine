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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {timers.map((timer) => (
          <button
            key={timer.id}
            onClick={() => setView({ type: 'ACTIVE', timer })}
            className={`relative group p-4 rounded-[2rem] border-4 transition-all hover:-translate-y-1 active:translate-y-1 active:shadow-none text-left flex items-center gap-4 bg-white border-black shadow-cartoon overflow-hidden`}
          >
            {/* Color accent bg */}
            <div className={`absolute top-0 right-0 w-24 h-24 ${THEME_COLORS[timer.themeColor].split(' ')[0]} rounded-bl-[4rem] opacity-20 group-hover:opacity-40 transition-opacity`} />
            
            {/* Icon/Image Placeholder */}
            <div className={`w-20 h-20 rounded-2xl flex-shrink-0 border-4 overflow-hidden bg-gray-50 ${THEME_COLORS[timer.themeColor].split(' ')[1]}`}>
                <img src={timer.imageUri} alt="" className="w-full h-full object-cover opacity-80 blur-[2px] group-hover:blur-none group-hover:scale-110 transition-all duration-500" />
            </div>

            {/* Content */}
            <div className="flex-1 z-10">
              <h3 className="text-xl font-bold text-gray-800 leading-tight mb-1">{timer.taskName}</h3>
              <div className="flex items-center text-gray-500 font-bold text-sm">
                <Clock size={16} className="mr-1" />
                {Math.floor(timer.durationSec / 60)}:{String(timer.durationSec % 60).padStart(2, '0')}
              </div>
            </div>

            {/* Edit/Delete Actions - Visible on hover or simplified for kids? 
                Let's make them small discrete buttons that parents can tap.
            */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div 
                    role="button"
                    onClick={(e) => handleEdit(e, timer)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full border-2 border-transparent hover:border-black"
                >
                    <Edit2 size={14} className="text-gray-600"/>
                </div>
                <div 
                    role="button"
                    onClick={(e) => handleDelete(e, timer.id)}
                    className="p-2 bg-red-100 hover:bg-red-200 rounded-full border-2 border-transparent hover:border-red-500"
                >
                    <Trash2 size={14} className="text-red-500"/>
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