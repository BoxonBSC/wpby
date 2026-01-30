import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        sans: ['Rajdhani', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Fire color palette
        fire: {
          orange: "hsl(var(--fire-orange))",
          red: "hsl(var(--fire-red))",
          yellow: "hsl(var(--fire-yellow))",
          ember: "hsl(var(--fire-ember))",
          crimson: "hsl(var(--fire-crimson))",
          gold: "hsl(var(--fire-gold))",
        },
        // Legacy neon mapped to fire
        neon: {
          blue: "hsl(var(--fire-orange))",
          purple: "hsl(var(--fire-red))",
          pink: "hsl(var(--fire-crimson))",
          cyan: "hsl(var(--fire-yellow))",
          green: "hsl(var(--neon-green))",
          yellow: "hsl(var(--fire-gold))",
          orange: "hsl(var(--fire-ember))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "spin-slow": {
          from: { transform: "rotateX(0deg)" },
          to: { transform: "rotateX(360deg)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "flicker": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
          "25%, 75%": { opacity: "0.9" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "spin-slow": "spin-slow 0.1s linear infinite",
        "float": "float 3s ease-in-out infinite",
        "flicker": "flicker 3s ease-in-out infinite",
      },
      backgroundImage: {
        "fire-gradient": "linear-gradient(135deg, hsl(var(--fire-orange) / 0.2), hsl(var(--fire-red) / 0.2))",
        "fire-gradient-intense": "linear-gradient(135deg, hsl(var(--fire-orange) / 0.4), hsl(var(--fire-red) / 0.4))",
        "cyber-gradient": "linear-gradient(135deg, hsl(var(--fire-orange) / 0.2), hsl(var(--fire-red) / 0.2))",
        "cyber-gradient-intense": "linear-gradient(135deg, hsl(var(--fire-orange) / 0.4), hsl(var(--fire-red) / 0.4))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
