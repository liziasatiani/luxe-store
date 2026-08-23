"use client";
import { useState, useEffect, useRef } from "react";

const PLAYLIST: string[] = (process.env.NEXT_PUBLIC_BG_MUSIC_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const AMBIENT_TONES: { freqs: number[] }[] = [
  { freqs: [110, 165, 220, 277.5] },
  { freqs: [130.8, 196, 261.6, 329.6] },
  { freqs: [98, 147, 196, 246.9] },
];

type StopFn = () => void;

function startAmbientTone(freqs: number[], volume: number): StopFn {
  const ctx = new AudioContext();
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1.5);
  gain.connect(ctx.destination);
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
  const trackCount = hasPlaylist ? PLAYLIST.length : AMBIENT_TONES.length;

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
        stopToneRef.current = startAmbientTone(AMBIENT_TONES[index].freqs, 0.06);
        setPlaying(true);
      }
    }
  };

  const next = () => {
    const n = (index + 1) % trackCount;
    setIndex(n);
    if (hasPlaylist) {
      loadTrack(n, playing);
    } else if (playing) {
      stopToneRef.current?.();
      stopToneRef.current = startAmbientTone(AMBIENT_TONES[n].freqs, 0.06);
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
        .player-wrap:hover .player-controls,
        .player-wrap:focus-within .player-controls {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
        .player-controls {
          opacity: 0;
          transform: translateY(6px);
          pointer-events: none;
          transition: opacity 0.25s ease, transform 0.25s ease;
        }
      `}</style>

      <div className="player-wrap fixed bottom-20 right-4 z-40 md:bottom-6 flex flex-col items-center gap-2">

        {/* Controls revealed on hover */}
        <div className="player-controls flex flex-col items-center gap-2">

          {/* Track dots */}
          <div className="flex gap-1.5">
            {Array.from({ length: trackCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (i === index) return;
                  setIndex(i);
                  if (hasPlaylist) loadTrack(i, playing);
                  else if (playing) {
                    stopToneRef.current?.();
                    stopToneRef.current = startAmbientTone(AMBIENT_TONES[i].freqs, 0.06);
                  }
                }}
                aria-label={`Track ${i + 1}`}
                className="transition-all duration-200"
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    i === index
                      ? "w-4 h-1.5 bg-[#C9A84C]"
                      : "w-1.5 h-1.5 bg-black/30 dark:bg-white/30 hover:bg-black/60 dark:hover:bg-white/60"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Skip button */}
          <button
            onClick={next}
            aria-label="Next track"
            className="group/skip w-7 h-7 rounded-full border border-black/20 dark:border-white/20 flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm hover:border-[#C9A84C] hover:bg-[#C9A84C]/10 transition-all duration-200"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"
              className="text-black/60 dark:text-white/60 group-hover/skip:text-[#C9A84C] transition-colors">
              <path d="M0.5 1.5 L6 5 L0.5 8.5 V1.5Z M7.5 1.5 H9 V8.5 H7.5 V1.5Z"/>
            </svg>
          </button>
        </div>

        {/* Vinyl disc — always visible */}
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
