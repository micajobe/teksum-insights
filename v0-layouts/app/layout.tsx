import type React from "react"
import "@/app/globals.css"
import { Noto_Sans, Noto_Serif } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "700", "800"],
})

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
})

export const metadata = {
  title: "Tech Business Intelligence Report",
  description: "A streamlined application for analyzing news headlines and business trends",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${notoSans.variable} ${notoSerif.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'