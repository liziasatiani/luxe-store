"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: { url: string; altText?: string | null }[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const lbTouchStartX = useRef<number | null>(null);
  const lbTouchStartY = useRef<number | null>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  const active = images[activeIdx];

  const prev = useCallback(() => setActiveIdx((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setActiveIdx((i) => (i + 1) % images.length), [images.length]);
  const close = useCallback(() => setLightboxOpen(false), []);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    // Focus the close button so screen readers announce the dialog
    closeBtn.current?.focus();
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, prev, next, close]);

  // Scroll active thumbnail into view in lightbox
  useEffect(() => {
    if (!lightboxOpen || !thumbsRef.current) return;
    const thumb = thumbsRef.current.children[activeIdx] as HTMLElement | undefined;
    thumb?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeIdx, lightboxOpen]);

  // Swipe on main gallery image
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - (touchStartY.current ?? 0));
    if (Math.abs(dx) > 40 && dy < 60) { if (dx < 0) next(); else prev(); }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Swipe in lightbox — left/right to navigate, down to close
  const onLbTouchStart = (e: React.TouchEvent) => {
    lbTouchStartX.current = e.touches[0].clientX;
    lbTouchStartY.current = e.touches[0].clientY;
  };
  const onLbTouchEnd = (e: React.TouchEvent) => {
    if (lbTouchStartX.current === null || lbTouchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - lbTouchStartX.current;
    const dy = e.changedTouches[0].clientY - lbTouchStartY.current;
    if (dy > 80 && Math.abs(dx) < 60) { close(); }
    else if (Math.abs(dx) > 40 && Math.abs(dy) < 60) { if (dx < 0) next(); else prev(); }
    lbTouchStartX.current = null;
    lbTouchStartY.current = null;
  };

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <div
          className="relative aspect-square overflow-hidden bg-surface-50 dark:bg-surface-800 group cursor-zoom-in"
          onClick={() => setLightboxOpen(true)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <Image
                src={active?.url ?? ""}
                alt={active?.altText ?? productName}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </motion.div>
          </AnimatePresence>

          <div className="absolute top-3 right-3 w-11 h-11 bg-white/80 dark:bg-black/60 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <ZoomIn size={15} className="text-black dark:text-white" />
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 dark:bg-black/80 flex items-center justify-center text-black dark:text-white shadow-luxury opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 dark:bg-black/80 flex items-center justify-center text-black dark:text-white shadow-luxury opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail filmstrip */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                aria-label={`View image ${i + 1}`}
                className={cn(
                  "relative w-16 h-16 shrink-0 overflow-hidden border transition-all",
                  i === activeIdx
                    ? "border-black dark:border-white"
                    : "border-black/10 dark:border-white/10 hover:border-black/40 dark:hover:border-white/40"
                )}
              >
                <Image src={img.url} alt={img.altText ?? `${productName} ${i + 1}`} fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${productName} image gallery`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
            onTouchStart={onLbTouchStart}
            onTouchEnd={onLbTouchEnd}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 py-4 shrink-0">
              <p className="text-[10px] tracking-[0.2em] uppercase text-white/40">
                {activeIdx + 1} / {images.length}
              </p>
              <div className="flex items-center gap-3">
                <span className="hidden sm:block text-[9px] tracking-[0.14em] uppercase text-white/25">
                  ← → Navigate · ESC Close
                </span>
                <button
                  ref={closeBtn}
                  onClick={close}
                  aria-label="Close gallery"
                  className="w-11 h-11 flex items-center justify-center text-white/60 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Main image area */}
            <div className="flex-1 relative flex items-center justify-center px-16 min-h-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIdx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.18 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={active?.url ?? ""}
                    alt={active?.altText ?? productName}
                    fill
                    className="object-contain"
                    sizes="100vw"
                  />
                </motion.div>
              </AnimatePresence>

              {images.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-white/50 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={next}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-white/50 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail filmstrip */}
            {images.length > 1 && (
              <div className="shrink-0 px-5 py-4">
                <div ref={thumbsRef} className="flex gap-2 overflow-x-auto no-scrollbar justify-center">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIdx(i)}
                      aria-label={`Go to image ${i + 1}`}
                      className={cn(
                        "relative w-12 h-12 shrink-0 overflow-hidden border transition-all",
                        i === activeIdx ? "border-white" : "border-white/20 hover:border-white/50"
                      )}
                    >
                      <Image src={img.url} alt="" fill className="object-cover" sizes="48px" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
