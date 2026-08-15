"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

interface ProductGalleryProps {
  images: { url: string; altText?: string | null }[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const t = useTranslations("product");
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const active = images[activeIdx];

  const prev = useCallback(() => setActiveIdx(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setActiveIdx(i => (i + 1) % images.length), [images.length]);
  const close = useCallback(() => setLightboxOpen(false), []);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    closeBtn.current?.focus();
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, prev, next, close]);

  return (
    <>
      <div className="dgallery" style={{
        position: "sticky",
        top: "var(--nav-h)",
        height: "calc(100vh - var(--nav-h))",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "32px 28px",
      }}>
        {/* Main image */}
        <div
          style={{ flex: 1, background: "var(--s1)", border: "1px solid var(--border)", borderRadius: 1, overflow: "hidden", cursor: "zoom-in", position: "relative" }}
          onClick={() => setLightboxOpen(true)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{ position: "absolute", inset: 0 }}
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
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div style={{ display: "flex", gap: 8, height: 74 }}>
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                aria-label={`View image ${i + 1}`}
                style={{
                  flex: 1,
                  background: "var(--s1)",
                  border: `1px solid ${i === activeIdx ? "var(--gold)" : "var(--border)"}`,
                  borderRadius: 1,
                  overflow: "hidden",
                  cursor: "pointer",
                  opacity: i === activeIdx ? 1 : 0.4,
                  transition: "opacity 0.2s, border-color 0.2s",
                  position: "relative",
                }}
              >
                <Image src={img.url} alt={img.altText ?? `${productName} ${i + 1}`} fill className="object-cover" sizes="80px" />
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
            aria-label={`${productName} gallery`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: "fixed", inset: 0, zIndex: 300, background: "#000", display: "flex", flexDirection: "column" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", flexShrink: 0 }}>
              <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
                {activeIdx + 1} / {images.length}
              </p>
              <button ref={closeBtn} onClick={close} aria-label={t("closeGallery")}
                style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.6)" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 64px", minHeight: 0 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIdx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.18 }}
                  style={{ position: "relative", width: "100%", height: "100%" }}
                >
                  <Image src={active?.url ?? ""} alt={active?.altText ?? productName} fill className="object-contain" sizes="100vw" />
                </motion.div>
              </AnimatePresence>
              {images.length > 1 && (
                <>
                  <button onClick={prev} aria-label={t("prevImage")} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)" }}>
                    <ChevronLeft size={24} />
                  </button>
                  <button onClick={next} aria-label={t("nextImage")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)" }}>
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
