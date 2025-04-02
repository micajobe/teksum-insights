import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'TEKSUM Insights',
  description: 'Daily tech and business insights reports',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <header className="bg-primary text-white py-4">
          <div className="container">
            <nav className="flex items-center justify-between">
              <a href="/" className="text-2xl font-bold">
                TEKSUM
              </a>
            </nav>
          </div>
        </header>
        {children}
        <footer className="bg-secondary py-8 mt-12">
          <div className="container text-center text-gray-600">
            <p>© {new Date().getFullYear()} TEKSUM Insights. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
} 