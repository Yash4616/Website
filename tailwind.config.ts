import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // Custom breakpoints for 2025 responsive design
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1400px', // Constrain content max-width on larger screens
      },
    },
    screens: {
      'xs': '320px',      // Small phones (portrait)
      'sm': '640px',      // Mobile Landscape / Small Tablet
      'md': '768px',      // Tablet Portrait
      'lg': '1024px',     // Tablet Landscape / Small Laptop
      'xl': '1280px',     // Standard Laptop / Desktop
      '2xl': '1400px',    // Large Monitor (Max-Content Constraint)
      '3xl': '1920px',    // Ultra-wide (Backgrounds only)
    },
    extend: {
      // Neural Dark tokens (§4.1) — every value maps to a CSS custom property
      // declared in globals.css. Use these, not arbitrary hex values (§3.2).
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        content: '1400px', // §4.3
      },
      boxShadow: {
        'glow-cyan': 'var(--glow-cyan)',
        'glow-violet': 'var(--glow-violet)',
      },
      // Fluid Typography System - 2025 Standard
      fontSize: {
        xs: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',        // 12px -> 14px
        sm: 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',          // 14px -> 16px
        base: 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)',        // 16px -> 18px
        lg: 'clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem)',      // 18px -> 20px
        xl: 'clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)',          // 20px -> 24px
        '2xl': 'clamp(1.5rem, 1.35rem + 0.75vw, 1.875rem)',     // 24px -> 30px
        '3xl': 'clamp(1.875rem, 1.7rem + 0.875vw, 2.25rem)',    // 30px -> 36px
        '4xl': 'clamp(2.25rem, 2.0rem + 1.25vw, 3rem)',         // 36px -> 48px
        '5xl': 'clamp(3rem, 2.7rem + 1.5vw, 3.75rem)',          // 48px -> 60px
        '6xl': 'clamp(3.75rem, 3.4rem + 1.75vw, 4.5rem)',       // 60px -> 72px
        '7xl': 'clamp(4.5rem, 4.0rem + 2.5vw, 5.5rem)',         // 72px -> 88px
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-accent': 'var(--gradient-accent)', // §4.1
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        // Neural Dark palette (§4.1). Two accents plus amber for the
        // "Proficient" tier — there is no fourth colour anywhere.
        void: 'var(--bg-void)',
        surface: {
          DEFAULT: 'var(--bg-surface)',
          primary: 'var(--bg-primary)',
          elevated: 'var(--bg-elevated)',
          overlay: 'var(--bg-overlay)',
        },
        content: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)',
        },
        cyan: {
          accent: 'var(--accent-cyan)',
        },
        violet: {
          accent: 'var(--accent-violet)',
        },
        amber: {
          accent: 'var(--accent-amber)',
        },
        edge: {
          subtle: 'var(--border-subtle)',
          DEFAULT: 'var(--border-default)',
          hover: 'var(--border-hover)',
          accent: 'var(--border-accent)',
        },
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        // §7 Stage 1 deliverable 5. These run on the compositor — transform and
        // opacity only, never a layout-triggering property (§9.3).
        orbit: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 20px rgba(0,240,255,0.40), 0 0 60px rgba(0,240,255,0.10)',
          },
          '50%': {
            opacity: '0.75',
            boxShadow: '0 0 30px rgba(0,240,255,0.55), 0 0 80px rgba(0,240,255,0.18)',
          },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scan: {
          from: { transform: 'translateY(-100%)' },
          to: { transform: 'translateY(100%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        orbit: 'orbit 30s linear infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        blink: 'blink 1s step-end infinite',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        scan: 'scan 8s linear infinite',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/container-queries'),
  ],
};
export default config;
