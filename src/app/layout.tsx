import './globals.css'
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import { Navbar }       from '@/components/Navbar'
import { CartDrawer }   from '@/components/CartDrawer'
import { ClientOnly }   from '@/components/ClientOnly'
import { CustomCursor } from '@/components/CustomCursor'
import { AuthProvider } from '@/components/AuthProvider'
import { Toaster }      from 'react-hot-toast'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'], variable: '--font-display',
  weight: ['400','500','600','700','800'],
})
const inter = Inter({
  subsets: ['latin'], variable: '--font-body',
  weight: ['400','500','600','700'],
})

export const metadata: Metadata = {
  title: 'CortexCart — AI-Powered Shopping',
  description: 'Next-gen AI e-commerce: smart recommendations, real-time pricing, and seamless checkout.',
  keywords: ['e-commerce','AI shopping','smart cart','electronics','gadgets'],
  openGraph: {
    title: 'CortexCart — AI-Powered Shopping',
    description: 'Discover products curated by AI. Smart pricing, instant search, seamless checkout.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${inter.variable}`}>
      <body className="font-body text-cx-text antialiased bg-cx-bg">
        <AuthProvider>
          <div className="relative min-h-screen">
            {/* Background ambient orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
              <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[180px] opacity-30" style={{background:'radial-gradient(circle,rgba(16,217,136,0.06) 0%,transparent 70%)'}}/>
              <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[150px] opacity-20" style={{background:'radial-gradient(circle,rgba(139,92,246,0.08) 0%,transparent 70%)'}}/>
              <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full blur-[120px] opacity-15" style={{background:'radial-gradient(circle,rgba(245,183,49,0.05) 0%,transparent 70%)'}}/>
            </div>

            <div className="relative z-10">
              <Navbar/>
              <main>{children}</main>
            </div>
          </div>

          <ClientOnly>
            <CartDrawer/>
            <CustomCursor/>
          </ClientOnly>

          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3500,
              style: { background:'#0f1524', color:'#e8edf8', border:'1px solid #1c2540', borderRadius:'14px', fontSize:'13px', fontWeight:600 },
              success: { iconTheme:{ primary:'#10d988', secondary:'#050810' } },
              error:   { iconTheme:{ primary:'#f43f6e', secondary:'#fff' } },
            }}/>
        </AuthProvider>
      </body>
    </html>
  )
}
