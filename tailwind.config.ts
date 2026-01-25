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
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/container-queries'),
  ],
};
export default config;
