import type { Config } from "tailwindcss";

function withOpacity(variableName: string) {
  return `hsl(var(${variableName}) / <alpha-value>)`;
}

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/stories/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    variants: {
      fill: ['hover', 'focus'], // this line does the trick
    },
    extend: {
      colors: {
        background: withOpacity('--bg-primary'),
        foreground: withOpacity('--bg-secondary'),
        brand: withOpacity('--bg-brand'),
      },
      fill: {
        primary: withOpacity('--fill-primary'),
        secondary: withOpacity('--fill-secondary'),
        tertiary: withOpacity('--fill-tertiary'),
        error: withOpacity('--fill-error'),
        warning: withOpacity('--fill-warning'),
        success: withOpacity('--fill-success'),
        info: withOpacity('--fill-info'),
        brand: withOpacity('--fill-brand'),
      },
      backgroundColor: {
        primary: withOpacity('--bg-primary'),
        secondary: withOpacity('--bg-secondary'),
        tertiary: withOpacity('--bg-tertiary'),
        error: withOpacity('--bg-error'),
        warning: withOpacity('--bg-warning'),
        success: withOpacity('--bg-success'),
        info: withOpacity('--bg-info'),
        brand: withOpacity('--bg-brand'),
        inverted: withOpacity('--bg-inverted'),
        main: withOpacity('--bg-main'),
      },
      textColor: {
        primary: withOpacity('--text-primary'),
        secondary: withOpacity('--text-secondary'),
        tertiary: withOpacity('--text-tertiary'),
        error: withOpacity('--text-error'),
        warning: withOpacity('--text-warning'),
        success: withOpacity('--text-success'),
        info: withOpacity('--text-info'),
        brand: withOpacity('--text-brand'),
        inverted: withOpacity('--text-inverted'),
      },
      borderColor: {
        main: withOpacity('--border-main'),
        success: withOpacity('--border-success'),
        warning: withOpacity('--border-warning'),
        error: withOpacity('--border-error'),
        info: withOpacity('--border-info'),
        brand: withOpacity('--border-brand'),
      },
      ringColor: {
        main: withOpacity('--ring-main'),
        success: withOpacity('--ring-success'),
        warning: withOpacity('--ring-warning'),
        error: withOpacity('--ring-error'),
        info: withOpacity('--ring-info'),
        brand: withOpacity('--ring-brand'),
      },
      outlineColor: {
        success: withOpacity('--outline-success'),
        warning: withOpacity('--outline-warning'),
        error: withOpacity('--outline-error'),
        info: withOpacity('--outline-info'),
        brand: withOpacity('--outline-brand'),
      },
      placeholderColor: {
        main: withOpacity('--text-placeholder'),
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      }
    },
  },
  plugins: [
    require("tailwindcss-animate")
  ],
} satisfies Config;
