import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Navbar }        from '@/components/Navbar'
import { CartDrawer }    from '@/components/CartDrawer'
import { ClientOnly }    from '@/components/ClientOnly'
import { CustomCursor }  from '@/components/CustomCursor'
import { AuthProvider }  from '@/components/AuthProvider'
import { Toaster }       from 'react-hot-toast'

const inter  = Inter({ subsets: ['latin'], variable: '--font-body' })
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display', weight: ['400','500','600','700','800'] })
const mono   = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400','600','700'] })

export const metadata: Metadata = {
  title:       { default: 'CortexCart — AI-Powered Commerce', template: '%s | CortexCart' },
  description: 'Hyper-personalized AI shopping with dynamic pricing, semantic search, and real-time recommendations.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} ${mono.variable}`}>
      <body className="bg-cx-bg text-cx-text font-body antialiased overflow-x-hidden">

        <AuthProvider>
          {/* Ambient background */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute inset-0 bg-cx-hero" />
            <div className="absolute top-0 left-1/3 w-[700px] h-[500px] orb-vio rounded-full blur-[140px] opacity-60" />
            <div className="absolute top-1/2 right-0 w-[500px] h-[400px] orb-em rounded-full blur-[120px] opacity-40" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] orb-gold rounded-full blur-[120px] opacity-30" />
            <div className="absolute bottom-1/3 right-1/3 w-[300px] h-[300px] orb-rose rounded-full blur-[100px] opacity-25" />
            <div className="absolute inset-0 grid-bg opacity-30" />
          </div>

          <div className="relative z-10">
            <Navbar />
            <main>{children}</main>
            <ClientOnly>
              <CartDrawer />
              <CustomCursor />
            </ClientOnly>
          </div>

          <Toaster
            position="bottom-right"
            toastOptions={{
              style: { background: '#131829', color: '#e8edf8', border: '1px solid #1e2640', borderRadius: '14px', fontSize: '13px' },
              success: { iconTheme: { primary: '#10d988', secondary: '#131829' } },
              error:   { iconTheme: { primary: '#f43f6e', secondary: '#131829' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
