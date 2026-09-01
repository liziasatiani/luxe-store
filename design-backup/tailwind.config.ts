import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand — Night Market Gold
        brand: {
          50:  "#fdf8ed",
          100: "#f8ecce",
          200: "#f0d99c",
          300: "#e4c064",
          400: "#d4a843",
          500: "#C9A44A",  // Night Market gold
          600: "#a8802a",
          700: "#866119",
          800: "#664a13",
          900: "#4a360e",
          950: "#2a1e07",
        },
        // Neutrals — Night Market dark palette
        surface: {
          0:   "#ffffff",
          50:  "#EFE9DA",  // chalk
          100: "#E8E1D0",
          200: "#D5CCBB",
          300: "#B8AD9E",
          400: "#8A8070",
          500: "#5E5750",
          600: "#3D3830",
          700: "#2A2520",
          800: "#1A1720",  // s2
          900: "#0D1220",  // s1
          950: "#07090F",  // bg deep
        },
        // Accent — crimson for beauty category
        accent: {
          50:  "#fff0f3",
          100: "#ffe0e6",
          200: "#ffc0cc",
          300: "#ff8fa3",
          400: "#ff5272",
          500: "#FF3366",
          600: "#d01040",
          700: "#ad0e33",
          800: "#8f1030",
          900: "#77112d",
          950: "#42030e",
        },
        // Tech accent
        tech: "#00E5FF",
        // Success / Error / Warning
        success: "#16a34a",
        warning: "#ca8a04",
        error:   "#dc2626",
      },
      fontFamily: {
        display:  ["var(--font-playfair)", "Georgia", "serif"],
        serif:    ["var(--font-playfair)", "Georgia", "serif"],
        sans:     ["var(--font-outfit)", "system-ui", "sans-serif"],
        georgian: ["var(--font-georgian)", "serif"],
        mono:     ["monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        xs:    ["0.75rem",  { lineHeight: "1rem"     }],
        sm:    ["0.875rem", { lineHeight: "1.25rem"  }],
        base:  ["1rem",     { lineHeight: "1.625rem" }],
        lg:    ["1.125rem", { lineHeight: "1.75rem"  }],
        xl:    ["1.25rem",  { lineHeight: "1.875rem" }],
        "2xl": ["1.5rem",   { lineHeight: "2rem"     }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem"  }],
        "4xl": ["2.25rem",  { lineHeight: "2.5rem"   }],
        "5xl": ["3rem",     { lineHeight: "1.15"     }],
        "6xl": ["3.75rem",  { lineHeight: "1.1"      }],
        "7xl": ["4.5rem",   { lineHeight: "1.05"     }],
        "8xl": ["6rem",     { lineHeight: "1"        }],
        "9xl": ["8rem",     { lineHeight: "1"        }],
      },
      spacing: {
        "18":  "4.5rem",
        "22":  "5.5rem",
        "26":  "6.5rem",
        "30":  "7.5rem",
        "34":  "8.5rem",
        "38":  "9.5rem",
        "42":  "10.5rem",
        "46":  "11.5rem",
        "50":  "12.5rem",
        "54":  "13.5rem",
        "58":  "14.5rem",
        "62":  "15.5rem",
        "66":  "16.5rem",
        "70":  "17.5rem",
        "76":  "19rem",
        "84":  "21rem",
        "88":  "22rem",
        "92":  "23rem",
        "96":  "24rem",
        "100": "25rem",
        "104": "26rem",
        "112": "28rem",
        "120": "30rem",
        "128": "32rem",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        "luxury":    "0 4px 24px -2px rgba(0,0,0,0.08), 0 2px 8px -1px rgba(0,0,0,0.04)",
        "luxury-md": "0 8px 40px -4px rgba(0,0,0,0.12), 0 4px 16px -2px rgba(0,0,0,0.06)",
        "luxury-lg": "0 20px 60px -8px rgba(0,0,0,0.18), 0 8px 24px -4px rgba(0,0,0,0.08)",
        "luxury-xl": "0 32px 80px -12px rgba(0,0,0,0.25), 0 12px 32px -6px rgba(0,0,0,0.10)",
        "glow-gold":  "0 0 24px rgba(182,130,53,0.35)",
        "glow-brand": "0 0 32px rgba(182,130,53,0.20)",
        "inner-luxury": "inset 0 1px 0 rgba(255,255,255,0.08)",
      },
      backgroundImage: {
        "gradient-luxury":  "linear-gradient(135deg, #201f1d 0%, #2d2b28 50%, #201f1d 100%)",
        "gradient-gold":    "linear-gradient(135deg, #b68235 0%, #e0b867 50%, #9b6b29 100%)",
        "gradient-hero":    "linear-gradient(180deg, rgba(32,31,29,0) 0%, rgba(32,31,29,0.8) 100%)",
        "gradient-card":    "linear-gradient(180deg, transparent 0%, rgba(32,31,29,0.65) 100%)",
        "shimmer":          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
      },
      animation: {
        "fade-in":     "fadeIn 0.4s ease-out",
        "fade-up":     "fadeUp 0.5s ease-out",
        "slide-in":    "slideIn 0.3s ease-out",
        "shimmer":     "shimmer 2s infinite",
        "float":       "float 4s ease-in-out infinite",
        "pulse-slow":  "pulse 3s ease-in-out infinite",
        "spin-slow":   "spin 8s linear infinite",
        "marquee":     "marquee 32s linear infinite",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        fadeUp:  { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        slideIn: { "0%": { opacity: "0", transform: "translateX(-16px)" }, "100%": { opacity: "1", transform: "translateX(0)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        float:   { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
      },
      transitionTimingFunction: {
        "luxury": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "bounce-in": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
      zIndex: {
        "60": "60",
        "70": "70",
        "80": "80",
        "90": "90",
        "100": "100",
      },
      screens: {
        "xs": "375px",
        "3xl": "1920px",
      },
    },
  },
  plugins: [],
};

export default config;
