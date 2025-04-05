import React from 'react';
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Report } from '@/lib/types';

async function getReports(): Promise<Report[]> {
  // TODO: Implement API call to fetch reports
  return [];
}

export default async function Home() {
  const reports = await getReports();
  const latestReport = reports[0];
  const reportDate = latestReport?.date ? new Date(latestReport.date) : new Date();

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
          {/* Featured Report Section */}
          {latestReport && (
            <section className="relative overflow-hidden rounded-[2rem]">
              {/* Generative motion blur gradient artwork */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-80" />
                <div className="absolute -left-[10%] top-[20%] h-[60%] w-[40%] rotate-[-35deg] rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-transparent opacity-70 blur-[60px]" />
                <div className="absolute -right-[5%] top-[10%] h-[40%] w-[50%] rotate-[25deg] rounded-full bg-gradient-to-l from-blue-600 via-cyan-600 to-transparent opacity-60 blur-[80px]" />
                <div className="absolute bottom-[10%] left-[30%] h-[30%] w-[40%] rotate-[15deg] rounded-full bg-gradient-to-t from-purple-600 via-pink-600 to-transparent opacity-60 blur-[70px]" />
              </div>

              <div className="relative z-10 grid gap-8 p-8 md:grid-cols-2 md:p-12 lg:p-16">
                <div className="flex flex-col justify-end space-y-6">
                  <Badge className="w-fit bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600">
                    Latest Report
                  </Badge>
                  <h2 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl">
                    <span className="bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">
                      {latestReport.sections[0]?.title || "Latest Tech Insights"}
                    </span>
                  </h2>
                  <p className="text-lg font-light text-gray-200">
                    {latestReport.sections[0]?.analysis || "Stay ahead with the latest technology news and trends"}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <span>{reportDate.toLocaleDateString()}</span>
                    <span className="text-purple-400">•</span>
                    <span>{latestReport.headlines.length} headlines analyzed</span>
                  </div>
                  <Link
                    href="/debug"
                    className="group mt-4 flex w-fit items-center gap-2 bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent transition-all hover:from-purple-300 hover:to-fuchsia-300"
                  >
                    <span className="text-lg font-medium">View full report</span>
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
          <section>
            <div className="mb-10 flex items-center justify-between">
              <h3 className="relative text-3xl font-bold">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Latest Headlines
                </span>
                <span className="absolute -bottom-2 left-0 h-0.5 w-1/3 bg-gradient-to-r from-purple-400 to-transparent"></span>
              </h3>
              <Link
                href="/debug"
                className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-fuchsia-300"
              >
                View all
              </Link>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {latestReport?.headlines.slice(0, 6).map((headline, index) => (
                <Card
                  key={index}
                  className="group overflow-hidden rounded-[1.5rem] border-0 bg-gradient-to-br from-gray-900 to-gray-950 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]"
                >
                  <CardContent className="p-6">
                    <Badge variant="outline" className="mb-3 border-purple-500 bg-purple-500/10 text-purple-300">
                      {headline.source}
                    </Badge>
                    <h4 className="mb-2 text-xl font-bold leading-tight tracking-tight">{headline.title}</h4>
                  </CardContent>
                  <CardFooter className="border-t border-gray-800/50 p-6">
                    <a
                      href={headline.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-400 hover:text-purple-300"
                    >
                      Read more →
                    </a>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>

          {/* Previous Reports Section */}
          <section className="relative">
            <div className="absolute -left-[5%] top-[20%] h-[30%] w-[20%] rounded-full bg-purple-800/20 blur-[80px]" />
            <h3 className="mb-10 text-3xl font-bold">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Previous Reports</span>
            </h3>
            <div className="grid gap-6 md:grid-cols-12">
              {reports.slice(1, 8).map((report, index) => (
                <Link
                  href={`/report/${report.id}`}
                  key={index}
                  className={`group relative overflow-hidden rounded-[1.5rem] border border-gray-800/50 bg-gradient-to-br from-gray-900 to-gray-950 p-6 transition-all duration-300 hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] ${
                    index === 0 ? "md:col-span-6 md:row-span-2" : "md:col-span-3"
                  }`}
                >
                  <div className="absolute -right-10 -top-10 h-20 w-20 rounded-full bg-purple-500/10 blur-[30px] transition-all duration-500 group-hover:bg-purple-500/20" />
                  <p className="text-lg font-medium leading-tight tracking-tight transition-colors group-hover:text-purple-300">
                    {report.sections[0]?.title || "Tech Insights Report"}
                  </p>
                  <div className="mt-3 flex items-center text-xs text-gray-400">
                    <span>{new Date(report.date).toLocaleDateString()}</span>
                    <span className="mx-2 text-purple-500">•</span>
                    <span>{report.headlines.length} headlines</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
} 