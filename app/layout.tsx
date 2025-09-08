import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ivaa Media - Digital Signage Management',
  description: 'Complete digital signage solution for retail shops. Manage content, monitor screens, and grow your business with Ivaa Media.',
  keywords: ['digital signage', 'retail', 'content management', 'screen monitoring', 'Ivaa Media'],
  authors: [{ name: 'Ivaa Media' }],
  creator: 'Ivaa Media',
  publisher: 'Ivaa Media',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: 'any' },
      { url: '/ivaa-logo.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/ivaa-logo.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  openGraph: {
    title: 'Ivaa Media - Digital Signage Management',
    description: 'Complete digital signage solution for retail shops',
    url: 'https://adsync.ivaa.com',
    siteName: 'Ivaa Media',
    images: [
      {
        url: '/ivaa-logo.png',
        width: 512,
        height: 512,
        alt: 'Ivaa Media Logo'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ivaa Media - Digital Signage Management',
    description: 'Complete digital signage solution for retail shops',
    images: ['/ivaa-logo.png']
  },
  robots: {
    index: true,
    follow: true
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}