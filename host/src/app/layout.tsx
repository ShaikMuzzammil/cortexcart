import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'CortexCart Host — Admin Dashboard',
  description: 'Private order management dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          toastOptions={{
            style: { background: '#111520', border: '1px solid #1a2035', color: '#e8edf8', fontSize: '13px' },
            success: { iconTheme: { primary: '#10d988', secondary: '#07090f' } },
          }}
        />
      </body>
    </html>
  )
}
