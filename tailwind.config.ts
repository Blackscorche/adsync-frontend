import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ivaa: {
          primary: '#6B46C1',
          secondary: '#9333EA',
          dark: '#1F2937',
          light: '#F3F4F6'
        }
      },
    },
  },
  plugins: [],
}
export default config