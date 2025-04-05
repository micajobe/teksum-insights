import React from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'

interface PageLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  showHeader?: boolean
  showFooter?: boolean
}

export function PageLayout({ 
  children, 
  title, 
  description,
  showHeader = true,
  showFooter = true
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Fluid background shapes */}
      <div className="fixed inset-0 -z-10 overflow-hidden opacity-30">
        <div className="absolute -left-[10%] -top-[30%] h-[60%] w-[70%] rounded-full bg-gradient-to-br from-purple-700 via-fuchsia-600 to-pink-600 blur-[120px]" />
        <div className="absolute -bottom-[20%] right-[5%] h-[50%] w-[60%] rounded-full bg-gradient-to-tl from-blue-700 via-cyan-600 to-teal-500 blur-[100px]" />
        <div className="absolute left-[30%] top-[40%] h-[40%] w-[40%] rounded-full bg-gradient-to-tr from-violet-800 via-indigo-600 to-blue-500 blur-[120px]" />
      </div>

      {/* Header */}
      {showHeader && (
        <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-black/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-400 via-fuchsia-300 to-pink-400 bg-clip-text text-transparent">TEKSUM</Link>
              <Badge variant="outline" className="border-purple-500 bg-purple-500/10 text-purple-300">Beta</Badge>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-gray-400 transition-colors hover:text-purple-300">
                Home
              </Link>
              <Link href="/reports" className="text-sm font-medium text-white transition-colors hover:text-purple-300">
                Reports
              </Link>
              <Link href="/about" className="text-sm font-medium text-gray-400 transition-colors hover:text-purple-300">
                About
              </Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <div className="container py-10">
          {title && (
            <div className="mb-8">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent md:text-5xl">
                {title}
              </h1>
              {description && (
                <p className="mt-4 text-xl text-gray-300">
                  {description}
                </p>
              )}
            </div>
          )}
          
          {children}
        </div>
      </main>

      {/* Footer */}
      {showFooter && (
        <footer className="border-t border-gray-800 py-6 md:py-0">
          <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
            <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
              <p className="text-center text-sm leading-loose text-gray-400 md:text-left">
                &copy; {new Date().getFullYear()} TEKSUM Insights. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
} 