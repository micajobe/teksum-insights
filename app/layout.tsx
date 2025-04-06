import "./globals.css"
import "./fonts.css"

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
      <body className="font-['Satoshi'] bg-background text-foreground">
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
} 