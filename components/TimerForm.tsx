import React, { useState } from 'react';
import { Timer, ThemeColor, SoundType, THEME_BG_COLORS, PRESET_IMAGES } from '../types';
import { Button } from './Button';
import { ArrowLeft, Upload, Check, Music, Clock } from 'lucide-react';

interface TimerFormProps {
  initialData?: Timer;
  onSave: (timer: Timer) => void;
  onCancel: () => void;
}

export const TimerForm: React.FC<TimerFormProps> = ({ initialData, onSave, onCancel }) => {
  const [taskName, setTaskName] = useState(initialData?.taskName || '');
  const [minutes, setMinutes] = useState(Math.floor((initialData?.durationSec || 120) / 60));
  const [seconds, setSeconds] = useState((initialData?.durationSec || 120) % 60);
  const [imageUri, setImageUri] = useState(initialData?.imageUri || PRESET_IMAGES[0].uri);
  const [themeColor, setThemeColor] = useState<ThemeColor>(initialData?.themeColor || 'blue');
  const [soundType, setSoundType] = useState<SoundType>(initialData?.soundType || 'success');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const durationSec = (minutes * 60) + seconds;
    if (durationSec <= 0) {
      alert("Please set a time greater than 0!");
      return;
    }
    if (!taskName.trim()) {
      alert("Please give the task a name!");
      return;
    }

    onSave({
      id: initialData?.id || crypto.randomUUID(),
      taskName,
      durationSec,
      imageUri,
      themeColor,
      soundType
    });
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-4 animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onCancel} className="!p-2 rounded-full">
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-2xl font-black text-gray-800">
          {initialData ? 'Edit Task' : 'New Task'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto hide-scrollbar pb-20 space-y-8">
        {/* Name Section */}
        <div className="space-y-3">
          <label className="text-lg font-bold text-gray-700 block">What are we doing?</label>
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="e.g. Brush Teeth"
            className="w-full text-2xl font-bold p-4 rounded-2xl border-4 border-gray-200 focus:border-black focus:outline-none transition-colors"
          />
        </div>

        {/* Time Section */}
        <div className="space-y-3">
          <label className="text-lg font-bold text-gray-700 flex items-center gap-2">
            <Clock size={20} /> How long?
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-bold text-gray-500 mb-1 block">Minutes</label>
              <input
                type="number"
                min="0"
                max="60"
                value={minutes}
                onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-center text-3xl font-bold p-4 rounded-2xl border-4 border-gray-200 focus:border-black focus:outline-none"
              />
            </div>
            <div className="text-2xl font-bold text-gray-300 self-end mb-4">:</div>
            <div className="flex-1">
              <label className="text-sm font-bold text-gray-500 mb-1 block">Seconds</label>
              <input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-center text-3xl font-bold p-4 rounded-2xl border-4 border-gray-200 focus:border-black focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Color Theme */}
        <div className="space-y-3">
          <label className="text-lg font-bold text-gray-700 block">Pick a Color</label>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(THEME_BG_COLORS) as ThemeColor[]).map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setThemeColor(color)}
                className={`w-12 h-12 rounded-full ${THEME_BG_COLORS[color]} border-4 transition-transform hover:scale-110 flex items-center justify-center ${themeColor === color ? 'border-black scale-110 shadow-cartoon' : 'border-transparent'}`}
              >
                {themeColor === color && <Check className="text-white" size={24} />}
              </button>
            ))}
          </div>
        </div>

        {/* Image Selection */}
        <div className="space-y-3">
          <label className="text-lg font-bold text-gray-700 block">The Reward Image</label>
          
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
             {/* Upload Option */}
             <label className="snap-start shrink-0 w-32 h-32 rounded-2xl border-4 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-gray-50 transition-colors">
                <Upload size={32} className="text-gray-400 mb-2" />
                <span className="text-xs font-bold text-gray-500">Upload</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>

            {PRESET_IMAGES.map((img) => (
              <button
                key={img.uri}
                type="button"
                onClick={() => setImageUri(img.uri)}
                className={`snap-start shrink-0 w-32 h-32 rounded-2xl overflow-hidden border-4 relative ${imageUri === img.uri ? 'border-black shadow-cartoon' : 'border-transparent opacity-70'}`}
              >
                <img src={img.uri} alt={img.name} className="w-full h-full object-cover" />
                {imageUri === img.uri && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Check className="text-white drop-shadow-md" size={40} />
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {/* Selected Preview */}
          <div className="mt-4 p-4 bg-white rounded-2xl border-4 border-gray-100 flex items-center gap-4">
             <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
               <img src={imageUri} alt="Selected" className="w-full h-full object-cover" />
             </div>
             <div>
               <p className="text-sm font-bold text-gray-500">Selected Reward</p>
               <p className="text-xs text-gray-400">This image will reveal as time passes.</p>
             </div>
          </div>
        </div>

        {/* Sound Selection */}
        <div className="space-y-3">
           <label className="text-lg font-bold text-gray-700 flex items-center gap-2">
             <Music size={20} /> Victory Sound
           </label>
           <div className="grid grid-cols-3 gap-3">
             {(['chimes', 'fanfare', 'success'] as SoundType[]).map((type) => (
               <button
                 key={type}
                 type="button"
                 onClick={() => setSoundType(type)}
                 className={`py-3 rounded-xl border-4 font-bold text-sm capitalize ${soundType === type ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200'}`}
               >
                 {type}
               </button>
             ))}
           </div>
        </div>
      </form>

      <div className="pt-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm sticky bottom-0">
        <Button fullWidth onClick={handleSubmit} size="lg" className="text-xl">
          Save Task
        </Button>
      </div>
    </div>
  );
};