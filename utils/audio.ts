// Simple synth sound generator
const getAudioContext = () => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return null;
    return new AudioContext();
}

export const playTick = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
  
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
  
    osc.connect(gain);
    gain.connect(ctx.destination);
  
    const now = ctx.currentTime;
    
    // Woodblock/Tick sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    osc.start(now);
    osc.stop(now + 0.1);
};

export const playSound = (type: string) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;

  if (type === 'fanfare') {
    // Ta-da!
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
    osc.frequency.setValueAtTime(1046.50, now + 0.4); // C6
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
    osc.start(now);
    osc.stop(now + 1.5);
  } else if (type === 'chimes') {
    // Soft sparkle
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 2);
    osc.start(now);
    osc.stop(now + 2);
    
    // Echo
    setTimeout(() => {
        // Create new context/nodes for echo to avoid state issues or reuse main ctx if you prefer, 
        // but creating a quick one-off is safe here.
        const ctx2 = getAudioContext();
        if(!ctx2) return;
        const osc2 = ctx2.createOscillator();
        const gain2 = ctx2.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx2.destination);
        osc2.frequency.setValueAtTime(1100, ctx2.currentTime);
        gain2.gain.setValueAtTime(0.2, ctx2.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx2.currentTime + 2);
        osc2.start(ctx2.currentTime);
        osc2.stop(ctx2.currentTime + 2);
    }, 200);
  } else {
    // Success (Standard Beep-like but nicer)
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(880, now + 0.1);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.5);
    osc.start(now);
    osc.stop(now + 0.5);
  }
};