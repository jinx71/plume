/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        // Plume palette — indigo accent, cool paper neutrals, one emerald
        // "live" signal that only ever marks the realtime state.
        ink: '#1A1830',
        paper: '#FBFBFE',
        line: '#E9E9F2',
        muted: '#6E6B86',
        indigo: {
          soft: '#EEF0FF',
          DEFAULT: '#4F46E5',
          deep: '#4338CA',
        },
        live: '#10B981',
        danger: '#E5484D',
      },
      fontFamily: {
        // Poppins carries the brand voice (wordmark + headings, used sparingly);
        // Inter is the workhorse for UI and body copy.
        display: ['Poppins', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      maxWidth: {
        feed: '600px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(26, 24, 48, 0.04), 0 8px 24px -12px rgba(26, 24, 48, 0.12)',
        lift: '0 8px 30px -12px rgba(79, 70, 229, 0.35)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      keyframes: {
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop': {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.35)' },
          '100%': { transform: 'scale(1)' },
        },
        'pill-in': {
          '0%': { opacity: '0', transform: 'translate(-50%, -12px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translate(-50%, 0) scale(1)' },
        },
        'live-pulse': {
          '0%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.5)' },
          '70%': { boxShadow: '0 0 0 6px rgba(16, 185, 129, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-down': 'slide-down 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        pop: 'pop 0.3s ease-out',
        'pill-in': 'pill-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'live-pulse': 'live-pulse 2s ease-out infinite',
        'fade-in': 'fade-in 0.4s ease-out',
      },
    },
  },
  plugins: [],
};
