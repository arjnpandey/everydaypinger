import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'commonplace pinger', description: 'Resurface one important line per day' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900 text-neutral-900 dark:text-neutral-100">
        <header className="sticky top-0 z-10 border-b border-neutral-200/70 dark:border-neutral-800/80 backdrop-blur bg-white/70 dark:bg-neutral-900/50">
          <div className="container-max flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-black text-white grid place-items-center font-semibold">M</div>
              <span className="font-semibold">arjuns commonplace</span>
            </div>
            <nav className="text-sm text-neutral-500">i guess anybody can make a post</nav>
          </div>
        </header>
        <main className="container-max py-8">{children}</main>
        <footer className="mt-16 border-t border-neutral-200/70 dark:border-neutral-800/80">
          <div className="container-max py-6 text-sm text-neutral-500">© {new Date().getFullYear()} Memory Pinger</div>
        </footer>
      </body>
    </html>
  )
}
