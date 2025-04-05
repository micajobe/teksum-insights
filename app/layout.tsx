import "./globals.css"

export const metadata = {
  title: "TEKSUM Insights",
  description: "Tech Business Intelligence",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&family=Noto+Serif:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans bg-background text-foreground">
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-digital-blue text-white">
          <div className="max-w-7xl mx-auto py-4 px-4 flex flex-col items-center gap-2">
            <div className="text-2xl font-serif font-bold">TEKSUM</div>
            <p className="text-sm opacity-80">Tech Business Intelligence</p>
          </div>
        </footer>
      </body>
    </html>
  )
} 