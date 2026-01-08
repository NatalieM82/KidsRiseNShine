export interface Timer {
  id: string;
  taskName: string;
  durationSec: number;
  imageUri: string;
  themeColor: ThemeColor;
  soundType: SoundType;
  lastCompleted?: number;
}

export type ThemeColor = 'blue' | 'pink' | 'yellow' | 'purple' | 'green' | 'orange';
export type SoundType = 'chimes' | 'fanfare' | 'success';

export interface AppSettings {
  morningStart: string; // HH:mm
  departureTime: string; // HH:mm
  bufferMinutes: number;
}

export const THEME_COLORS: Record<ThemeColor, string> = {
  blue: 'bg-kid-blue border-kid-blue',
  pink: 'bg-kid-pink border-kid-pink',
  yellow: 'bg-kid-yellow border-kid-yellow',
  purple: 'bg-kid-purple border-kid-purple',
  green: 'bg-kid-green border-kid-green',
  orange: 'bg-kid-orange border-kid-orange',
};

export const THEME_BG_COLORS: Record<ThemeColor, string> = {
  blue: 'bg-kid-blue',
  pink: 'bg-kid-pink',
  yellow: 'bg-kid-yellow',
  purple: 'bg-kid-purple',
  green: 'bg-kid-green',
  orange: 'bg-kid-orange',
};

export const PRESET_IMAGES = [
  { name: 'Pancakes', uri: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=600&q=80' },
  { name: 'School Bus', uri: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80' },
  { name: 'Sneakers', uri: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=600&q=80' },
  { name: 'Books', uri: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80' },
  { name: 'Toys', uri: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80' },
];