/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kofu: {
          bg: '#08080A',
          card: '#0D0D11',
          surface: '#121217',
          border: '#1E1E28',
          borderSubtle: '#171720',
          green: '#00FF66',
          greenDim: '#00D154',
          greenMuted: 'rgba(0, 255, 102, 0.12)',
          text: '#F3F3F6',
          textMuted: '#848494',
          textDark: '#505060',
          yellow: '#FFB800',
          red: '#FF4D4D',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Space Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'terminal-blink': 'blink 1s step-start infinite',
        'fade-in': 'fadeIn 0.25s ease-out',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
