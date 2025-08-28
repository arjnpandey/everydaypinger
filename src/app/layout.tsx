import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'commonplace pinger', description: 'Resurface one important line per day' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="container-max flex items-center justify-between py-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 grid place-items-center font-semibold text-sm">
                M
              </div>
              <span className="font-semibold text-lg">commonplace pinger</span>
            </div>
            <nav className="text-sm text-gray-500 dark:text-gray-400">
              hosted · serverless cron
            </nav>
          </div>
        </header>
        
        <main className="container-max py-12">
          {children}
        </main>
        
        <footer className="mt-16 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="container-max py-8 text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} commonplace pinger
          </div>
        </footer>
      </body>
    </html>
  )
}
