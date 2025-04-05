import "./globals.css"
import { Noto_Sans, Noto_Serif } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${notoSans.variable} ${notoSerif.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
} 