const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Deal Card Token System
      spacing: {
        'card-mobile': '248px',      // Card width mobile
        'card-desktop': '290px',     // Card width desktop
        'card-h-mobile': '140px',    // Card height mobile
        'card-h-desktop': '160px',   // Card height desktop
        'logo-sm': '24px',           // Logo size mobile
        'logo-md': '26px',           // Logo size desktop
      },
      fontSize: {
        'discount': ['20px', { lineHeight: '1.2', fontWeight: '700' }],
        'discount-sm': ['18px', { lineHeight: '1.2', fontWeight: '700' }],
        'card-title': ['12px', { lineHeight: '1.3' }],
        'card-time': ['10px', { lineHeight: '1' }],
        'card-cta': ['12px', { lineHeight: '1' }],
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
        // Deal card specific colors
        'time-urgent': '#F97316',     // Orange for Son 24 Saat
        'time-normal': 'hsl(var(--muted-foreground))',
        // Void colors for dark mode
        void: {
          dark: "#0B0C15",
          paper: "#12141C",
          subtle: "#181823",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'card': '12px',
        'card-lg': '14px',
        'logo': '6px',
      },
      boxShadow: {
        'card': '0 2px 4px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 8px rgba(0, 0, 0, 0.06)',
      },
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
        heading: ["Outfit", ...fontFamily.sans],
        mono: ["JetBrains Mono", ...fontFamily.mono],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
