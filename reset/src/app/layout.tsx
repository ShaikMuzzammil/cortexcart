import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CortexCart — Reset Password',
  description: 'Securely reset your CortexCart account password.',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-cx-bg text-cx-text antialiased">
        {children}
      </body>
    </html>
  )
}
