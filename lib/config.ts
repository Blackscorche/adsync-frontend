// Application configuration
export const config = {
  api: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Ivaa Media',
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Digital Signage Management Platform',
  },
} as const;

export default config;