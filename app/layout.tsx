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
      <body>
        {children}
      </body>
    </html>
  )
} 