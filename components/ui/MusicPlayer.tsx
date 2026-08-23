"use client";
import { useState, useEffect, useRef } from "react";

// Set NEXT_PUBLIC_BG_MUSIC_URL in Vercel env to use your own track
const MUSIC_URL = process.env.NEXT_PUBLIC_BG_MUSIC_URL || "";

type StopFn = () => void;

function startAmbientTone(volume: number): StopFn {
  const ctx = new AudioContext();
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1.5);
  gain.connect(ctx.destination);

  const freqs = [110, 165, 220, 277.5];
  const oscs = freqs.map((f) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = f;
    osc.connect(gain);
    osc.start();
    return osc;
  });

  return () => {
    gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    setTimeout(() => {
      oscs.forEach((o) => o.stop());
      ctx.close();
    }, 900);
  };
}

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopToneRef = useRef<StopFn | null>(null);
  const [playing, setPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (MUSIC_URL) {
      const audio = new Audio(MUSIC_URL);
      audio.loop = true;
      audio.volume = 0.35;
      audioRef.current = audio;
      return () => { audio.pause(); audio.src = ""; };
    }
  }, []);

  const toggle = () => {
    if (playing) {
      if (MUSIC_URL) {
        audioRef.current?.pause();
      } else if (stopToneRef.current) {
        stopToneRef.current();
        stopToneRef.current = null;
      }
      setPlaying(false);
    } else {
      if (MUSIC_URL && audioRef.current) {
        audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
      } else {
        stopToneRef.current = startAmbientTone(0.06);
        setPlaying(true);
      }
    }
  };

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @keyframes vinyl-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .vinyl-disc {
          animation: vinyl-spin 2.4s linear infinite;
          animation-play-state: paused;
        }
        .vinyl-disc.spinning {
          animation-play-state: running;
        }
      `}</style>
      <button
        onClick={toggle}
        aria-label={playing ? "Pause music" : "Play music"}
        title={playing ? "Pause ambient music" : "Play ambient music"}
        className="fixed bottom-20 right-4 z-40 md:bottom-6 opacity-50 hover:opacity-100 transition-opacity"
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`vinyl-disc${playing ? " spinning" : ""}`}
        >
          <circle cx="18" cy="18" r="17" fill="currentColor" className="text-black dark:text-white" opacity="0.85" />
          <circle cx="18" cy="18" r="14" fill="none" stroke="white" strokeWidth="0.35" opacity="0.15" />
          <circle cx="18" cy="18" r="11.5" fill="none" stroke="white" strokeWidth="0.35" opacity="0.15" />
          <circle cx="18" cy="18" r="9" fill="none" stroke="white" strokeWidth="0.35" opacity="0.15" />
          <circle cx="18" cy="18" r="6" fill="#C9A84C" opacity="0.9" />
          <circle cx="18" cy="18" r="1.4" fill="currentColor" className="text-black dark:text-white" opacity="0.7" />
        </svg>
      </button>
    </>
  );
}
