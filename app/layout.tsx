import "./globals.css"
import { Noto_Sans, Noto_Serif } from "next/font/google"

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "700", "800"],
})

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "700"],
})

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
      <body className={`${notoSans.variable} ${notoSerif.variable} font-sans`}>
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-logo font-serif">TEKSUM</div>
            <p className="footer-text">Tech Business Intelligence</p>
          </div>
        </footer>
      </body>
    </html>
  )
} 