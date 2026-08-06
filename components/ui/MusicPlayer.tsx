"use client";
import { useState, useEffect, useRef } from "react";

// Set NEXT_PUBLIC_BG_MUSIC_URL in Vercel env to point to your audio file
const MUSIC_URL =
  process.env.NEXT_PUBLIC_BG_MUSIC_URL ||
  "https://cdn.pixabay.com/download/audio/2022/03/24/audio_2cef4b1f32.mp3?filename=ambient-piano-logo-165357.mp3";

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const audio = new Audio(MUSIC_URL);
    audio.loop = true;
    audio.volume = 0.35;
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ""; };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      aria-label={playing ? "Pause music" : "Play music"}
      className="fixed bottom-20 right-4 z-40 md:bottom-6 w-9 h-9 flex items-center justify-center gap-[2px] group"
      title={playing ? "Pause music" : "Play ambient music"}
    >
      {/* Animated equalizer bars */}
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="block w-[3px] bg-black/40 dark:bg-white/40 group-hover:bg-black dark:group-hover:bg-white transition-colors rounded-full"
          style={{
            height: playing
              ? `${[14, 20, 12, 18][i - 1]}px`
              : "8px",
            animation: playing
              ? `eq-bar-${i} ${[0.8, 1.1, 0.9, 1.0][i - 1]}s ease-in-out infinite alternate`
              : "none",
            transition: "height 0.3s ease",
          }}
        />
      ))}
      <style>{`
        @keyframes eq-bar-1 { from { height: 6px } to { height: 18px } }
        @keyframes eq-bar-2 { from { height: 14px } to { height: 22px } }
        @keyframes eq-bar-3 { from { height: 8px } to { height: 16px } }
        @keyframes eq-bar-4 { from { height: 12px } to { height: 20px } }
      `}</style>
    </button>
  );
}
