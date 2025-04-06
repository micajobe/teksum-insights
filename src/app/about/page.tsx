'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xl font-bold">TEKSUM</Link>
            <Badge variant="outline">Beta</Badge>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Home
            </Link>
            <Link href="/reports" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Reports
            </Link>
            <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
              About
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container py-10">
          <div className="flex flex-col items-start gap-4">
            <h1 className="text-3xl font-bold tracking-tight">About TEKSUM Insights</h1>
            <p className="text-muted-foreground">
              Learn more about our mission and the team behind TEKSUM Insights.
            </p>
          </div>
          
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <h2 className="mb-4 text-2xl font-bold">Our Mission</h2>
                <p className="mb-4 text-muted-foreground">
                  At TEKSUM Insights, our mission is to provide businesses and individuals with 
                  concise, actionable technology insights that drive informed decision-making.
                </p>
                <p className="text-muted-foreground">
                  We believe that in today&apos;s rapidly evolving tech landscape, staying informed 
                  is not just an advantage—it&apos;s a necessity. Our AI-powered platform analyzes 
                  thousands of tech news sources to deliver the most relevant and impactful 
                  information to our users.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h2 className="mb-4 text-2xl font-bold">Our Technology</h2>
                <p className="mb-4 text-muted-foreground">
                  TEKSUM Insights leverages cutting-edge artificial intelligence and natural 
                  language processing to analyze and summarize complex technology information.
                </p>
                <p className="text-muted-foreground">
                  Our proprietary algorithms identify key trends, extract meaningful insights, 
                  and present them in a clear, accessible format. This allows our users to 
                  quickly understand the implications of technological developments without 
                  getting lost in technical details.
                </p>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardContent className="pt-6">
                <h2 className="mb-4 text-2xl font-bold">Our Team</h2>
                <p className="mb-4 text-muted-foreground">
                  TEKSUM Insights was founded by a team of technology enthusiasts, data scientists, 
                  and industry experts with decades of combined experience in technology, 
                  artificial intelligence, and business intelligence.
                </p>
                <p className="mb-6 text-muted-foreground">
                  We&apos;re passionate about making technology insights accessible to everyone, 
                  from business leaders making strategic decisions to individuals staying 
                  informed about the latest tech trends.
                </p>
                <Button asChild>
                  <Link href="/reports">Explore Our Reports</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              &copy; {new Date().getFullYear()} TEKSUM Insights. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 