
import { Timer, AppSettings, PresetDef } from '../types';

const TIMER_STORAGE_KEY = 'rise_and_shine_timers';
const SETTINGS_STORAGE_KEY = 'rise_and_shine_settings';
const PRESET_STORAGE_KEY = 'rise_and_shine_presets';

// --- Timers ---

export const getTimers = (): Timer[] => {
  try {
    const data = localStorage.getItem(TIMER_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load timers", e);
    return [];
  }
};

export const saveTimer = (timer: Timer) => {
  const timers = getTimers();
  const index = timers.findIndex(t => t.id === timer.id);
  if (index >= 0) {
    timers[index] = timer;
  } else {
    timers.push(timer);
  }
  localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timers));
  return [...timers];
};

export const deleteTimer = (id: string) => {
  const timers = getTimers().filter(t => t.id !== id);
  localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timers));
  return [...timers];
};

export const resetAllTimersStatus = () => {
  const timers = getTimers().map(timer => {
    const { lastCompleted, ...rest } = timer;
    return rest;
  });
  localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timers));
  return [...timers];
};

// --- Settings ---

const DEFAULT_SETTINGS: AppSettings = {
  morningStart: '07:00',
  departureTime: '08:00',
  bufferMinutes: 5
};

export const getSettings = (): AppSettings => {
  try {
    const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: AppSettings): AppSettings => {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  return settings;
};

// --- Presets ---

export const getPresets = (): PresetDef[] => {
  try {
    const data = localStorage.getItem(PRESET_STORAGE_KEY);
    if (data) return JSON.parse(data);

    // Initial Seed for AI Generation demo
    const seeds: PresetDef[] = [
        { id: 'ai-1', name: 'Cereal', prompt: 'cartoon bowl of cereal with milk and spoon, colorful style', uri: '', isGenerated: false },
        { id: 'ai-2', name: 'Teddy', prompt: 'cute teddy bear sitting', uri: '', isGenerated: false }
    ];
    localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(seeds));
    return seeds;
  } catch (e) {
    return [];
  }
};

export const savePreset = (preset: PresetDef): PresetDef[] => {
  const presets = getPresets();
  const index = presets.findIndex(p => p.id === preset.id);
  if (index >= 0) {
    presets[index] = preset;
  } else {
    presets.push(preset);
  }
  localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
  return presets;
};

export const loadInitialPresets = (): Timer[] => {
    const current = getTimers();
    if (current.length > 0) return current;

    const presets: Timer[] = [
        {
            id: 'preset-2',
            taskName: 'Get Dressed',
            durationSec: 300,
            imageUri: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=600&q=80',
            themeColor: 'purple',
            soundType: 'fanfare'
        },
        {
            id: 'preset-3',
            taskName: 'Eat Breakfast',
            durationSec: 600,
            imageUri: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=600&q=80',
            themeColor: 'yellow',
            soundType: 'chimes'
        }
    ];
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(presets));
    return presets;
}
