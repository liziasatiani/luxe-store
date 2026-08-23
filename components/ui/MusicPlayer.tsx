"use client";
import { useState, useEffect, useRef } from "react";

// Comma-separated list of audio URLs, or a single URL
const PLAYLIST: string[] = (process.env.NEXT_PUBLIC_BG_MUSIC_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

type StopFn = () => void;

function startAmbientTone(volume: number): StopFn {
  const ctx = new AudioContext();
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1.5);
  gain.connect(ctx.destination);
  const oscs = [110, 165, 220, 277.5].map((f) => {
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
    setTimeout(() => { oscs.forEach((o) => o.stop()); ctx.close(); }, 900);
  };
}

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopToneRef = useRef<StopFn | null>(null);
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  const hasPlaylist = PLAYLIST.length > 0;

  const loadTrack = (i: number, autoplay: boolean) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.src = PLAYLIST[i];
    audio.load();
    if (autoplay) audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    else setPlaying(false);
  };

  useEffect(() => {
    setMounted(true);
    if (!hasPlaylist) return;
    const audio = new Audio(PLAYLIST[0]);
    audio.volume = 0.35;
    audio.addEventListener("ended", () => {
      setIndex((prev) => {
        const next = (prev + 1) % PLAYLIST.length;
        audio.src = PLAYLIST[next];
        audio.load();
        audio.play().catch(() => {});
        return next;
      });
    });
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ""; };
  }, []);

  const toggle = () => {
    if (playing) {
      if (hasPlaylist) audioRef.current?.pause();
      else { stopToneRef.current?.(); stopToneRef.current = null; }
      setPlaying(false);
    } else {
      if (hasPlaylist && audioRef.current) {
        audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
      } else {
        stopToneRef.current = startAmbientTone(0.06);
        setPlaying(true);
      }
    }
  };

  const next = () => {
    if (!hasPlaylist) return;
    const n = (index + 1) % PLAYLIST.length;
    setIndex(n);
    loadTrack(n, playing);
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
      <div className="fixed bottom-20 right-4 z-40 md:bottom-6 flex flex-col items-center gap-1">
        {hasPlaylist && PLAYLIST.length > 1 && (
          <button
            onClick={next}
            aria-label="Next track"
            title={`Next track (${index + 1} / ${PLAYLIST.length})`}
            className="opacity-40 hover:opacity-90 transition-opacity text-black dark:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3 3.5v9l7-4.5-7-4.5zM12 3h1.5v10H12V3z"/>
            </svg>
          </button>
        )}
        <button
          onClick={toggle}
          aria-label={playing ? "Pause music" : "Play music"}
          title={playing ? "Pause ambient music" : "Play ambient music"}
          className="opacity-50 hover:opacity-100 transition-opacity"
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
      </div>
    </>
  );
}
