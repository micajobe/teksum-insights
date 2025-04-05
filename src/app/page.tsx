import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import fs from 'fs'
import path from 'path'

// Function to get all report files from the docs directory
function getReportFiles() {
  const docsDir = path.join(process.cwd(), 'docs')
  
  // Check if docs directory exists
  if (!fs.existsSync(docsDir)) {
    console.error('Docs directory not found')
    return []
  }
  
  // Get all HTML files that match the report pattern
  const files = fs.readdirSync(docsDir)
    .filter(file => file.startsWith('tech_business_report_') && file.endsWith('.html'))
    .filter(file => !file.endsWith('_latest.html')) // Exclude the latest version
  
  // Sort by date (newest first)
  files.sort((a, b) => {
    const dateA = a.split('_')[3] // Gets '20250401'
    const dateB = b.split('_')[3]
    return dateB.localeCompare(dateA)
  })
  
  return files
}

// Function to get report metadata
function getReportMetadata(file: string) {
  try {
    const filePath = path.join(process.cwd(), 'docs', file)
    const content = fs.readFileSync(filePath, 'utf-8')
    
    // Extract date from filename
    const dateStr = file.split('_')[3] // Gets '20250401'
    const date = new Date(
      parseInt(dateStr.substring(0, 4)), // Year
      parseInt(dateStr.substring(4, 6)) - 1, // Month (0-indexed)
      parseInt(dateStr.substring(6, 8)) // Day
    )
    
    // Format the date
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    // Extract title from content (first h1 tag)
    const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/)
    const title = titleMatch ? titleMatch[1] : 'Tech Business Report'
    
    // Extract description from content (first paragraph after h1)
    const descriptionMatch = content.match(/<h1[^>]*>.*?<\/h1>\s*<p[^>]*>(.*?)<\/p>/)
    const description = descriptionMatch ? descriptionMatch[1] : 'Daily technology and business insights report.'
    
    // Get the index for the ID
    const files = getReportFiles()
    const index = files.indexOf(file)
    
    return {
      id: index + 1,
      title,
      description,
      date: formattedDate,
      category: 'Technology',
      author: 'TEKSUM Insights',
      readTime: '5 min read',
      filePath: file
    }
  } catch (error) {
    console.error(`Error reading report file: ${error}`)
    return null
  }
}

export default function Home() {
  // Get all report files
  const reportFiles = getReportFiles()
  
  // Get metadata for each report
  const reports = reportFiles
    .map(file => getReportMetadata(file))
    .filter(report => report !== null) as Array<{
      id: number
      title: string
      description: string
      date: string
      category: string
      author: string
      readTime: string
      filePath: string
    }>
  
  // Get the most recent report for the featured section
  const featuredReport = reports.length > 0 ? reports[0] : null
  
  // Get the latest headlines (excluding the featured report)
  const latestHeadlines = reports.slice(1, 7)
  
  // Get previous reports (all reports)
  const previousReports = reports

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Fluid background shapes */}
      <div className="fixed inset-0 -z-10 overflow-hidden opacity-30">
        <div className="absolute -left-[10%] -top-[30%] h-[60%] w-[70%] rounded-full bg-gradient-to-br from-purple-700 via-fuchsia-600 to-pink-600 blur-[120px]" />
        <div className="absolute -bottom-[20%] right-[5%] h-[50%] w-[60%] rounded-full bg-gradient-to-tl from-blue-700 via-cyan-600 to-teal-500 blur-[100px]" />
        <div className="absolute left-[30%] top-[40%] h-[40%] w-[40%] rounded-full bg-gradient-to-tr from-violet-800 via-indigo-600 to-blue-500 blur-[120px]" />
      </div>

      <div className="container relative mx-auto px-4 py-12">
        <header className="mb-16">
          <div className="relative">
            <h1 className="text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-pink-400 bg-clip-text text-transparent">
                TEK
              </span>
              <span className="relative">
                SUM
                <span className="absolute -bottom-2 left-0 h-1 w-full bg-gradient-to-r from-purple-400 via-fuchsia-300 to-pink-400"></span>
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg font-light italic text-gray-300">
              Where tomorrow&apos;s technology flows into today&apos;s consciousness
            </p>
          </div>
        </header>

        <main className="space-y-24">
          {/* Featured Article with generative motion blur gradient artwork */}
          {featuredReport && (
            <section className="relative overflow-hidden rounded-[2rem]">
              {/* Generative motion blur gradient artwork */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                {/* Main background gradient */}
                <div className="absolute inset-0 bg-black opacity-80" />

                {/* Motion blur gradient elements */}
                <div className="absolute -left-[10%] top-[20%] h-[60%] w-[40%] rotate-[-35deg] rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-transparent opacity-70 blur-[60px]" />
                <div className="absolute -right-[5%] top-[10%] h-[40%] w-[50%] rotate-[25deg] rounded-full bg-gradient-to-l from-blue-600 via-cyan-600 to-transparent opacity-60 blur-[80px]" />
                <div className="absolute bottom-[10%] left-[30%] h-[30%] w-[40%] rotate-[15deg] rounded-full bg-gradient-to-t from-purple-600 via-pink-600 to-transparent opacity-60 blur-[70px]" />

                {/* Smaller motion elements */}
                <div className="absolute left-[20%] top-[30%] h-[15%] w-[15%] animate-pulse rounded-full bg-fuchsia-500 opacity-40 blur-[50px]" />
                <div className="absolute bottom-[20%] right-[25%] h-[10%] w-[10%] animate-pulse rounded-full bg-cyan-500 opacity-30 blur-[40px]" />
                <div className="absolute right-[10%] top-[40%] h-[8%] w-[20%] animate-pulse rounded-full bg-purple-500 opacity-30 blur-[30px]" />

                {/* Streaking light effects */}
                <div className="absolute left-[5%] top-[50%] h-[2px] w-[30%] rotate-[35deg] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-70 blur-[3px]" />
                <div className="absolute right-[15%] top-[30%] h-[2px] w-[20%] rotate-[-20deg] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 blur-[3px]" />
                <div className="absolute bottom-[25%] left-[40%] h-[2px] w-[25%] rotate-[10deg] bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent opacity-60 blur-[3px]" />
              </div>

              <div className="relative z-10 grid gap-8 p-8 md:grid-cols-2 md:p-12 lg:p-16">
                <div className="flex flex-col justify-end space-y-6">
                  <Badge className="w-fit bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600">
                    Featured
                  </Badge>
                  <h2 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl">
                    <span className="bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">
                      {featuredReport.title}
                    </span>
                  </h2>
                  <p className="text-lg font-light text-gray-200">
                    {featuredReport.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <span>By {featuredReport.author}</span>
                    <span className="text-purple-400">•</span>
                    <span>{featuredReport.readTime}</span>
                    <span className="text-purple-400">•</span>
                    <span>{featuredReport.date}</span>
                  </div>
                  <Link
                    href={`/reports/${featuredReport.id}`}
                    className="group mt-4 flex w-fit items-center gap-2 bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent transition-all hover:from-purple-300 hover:to-fuchsia-300"
                  >
                    <span className="text-lg font-medium">Read full article</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform group-hover:translate-x-1"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Latest Headlines Section */}
          {latestHeadlines.length > 0 && (
            <section>
              <div className="mb-10 flex items-center justify-between">
                <h3 className="relative text-3xl font-bold">
                  <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Latest Headlines
                  </span>
                  <span className="absolute -bottom-2 left-0 h-0.5 w-1/3 bg-gradient-to-r from-purple-400 to-transparent"></span>
                </h3>
                <Link
                  href="/reports"
                  className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-fuchsia-300"
                >
                  View all
                </Link>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {latestHeadlines.map((report) => (
                  <Card
                    key={report.id}
                    className="group overflow-hidden rounded-[1.5rem] border-0 bg-gradient-to-br from-gray-900 to-gray-950 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]"
                  >
                    <CardContent className="p-6">
                      <Badge variant="outline" className="mb-3 border-purple-500 bg-purple-500/10 text-purple-300">
                        {report.category}
                      </Badge>
                      <h4 className="mb-2 text-xl font-bold leading-tight tracking-tight">
                        {report.title}
                      </h4>
                    </CardContent>
                    <CardFooter className="border-t border-gray-800/50 p-6">
                      <Link
                        href={`/reports/${report.id}`}
                        className="text-sm text-gray-400 hover:text-purple-300"
                      >
                        Read more →
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Previous Reports Section */}
          {previousReports.length > 0 && (
            <section className="relative">
              <div className="absolute -left-[5%] top-[20%] h-[30%] w-[20%] rounded-full bg-purple-800/20 blur-[80px]" />
              <h3 className="mb-10 text-3xl font-bold">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Previous Reports</span>
              </h3>
              <div className="grid gap-6 md:grid-cols-12">
                {previousReports.map((report, i) => (
                  <Link
                    href={`/reports/${report.id}`}
                    key={report.id}
                    className={`group relative overflow-hidden rounded-[1.5rem] border border-gray-800/50 bg-gradient-to-br from-gray-900 to-gray-950 p-6 transition-all duration-300 hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] ${
                      i === 0 ? "md:col-span-6 md:row-span-2" : "md:col-span-3"
                    }`}
                  >
                    <div className="absolute -right-10 -top-10 h-20 w-20 rounded-full bg-purple-500/10 blur-[30px] transition-all duration-500 group-hover:bg-purple-500/20" />
                    <p className="text-lg font-medium leading-tight tracking-tight transition-colors group-hover:text-purple-300">
                      {report.title}
                    </p>
                    <div className="mt-3 flex items-center text-xs text-gray-400">
                      <span>{report.date}</span>
                      <span className="mx-2 text-purple-500">•</span>
                      <span>{report.readTime}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
} 