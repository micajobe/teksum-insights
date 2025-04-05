"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Headline } from "@/lib/types"

interface HeadlinesListProps {
  headlines: Headline[]
}

export default function HeadlinesList({ headlines }: HeadlinesListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const sources = Array.from(new Set(headlines.map((headline) => headline.source)))

  const filteredHeadlines = headlines.filter(
    (headline) =>
      headline.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      headline.source.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Headlines Analysis</CardTitle>
        <div className="mt-2">
          <Input
            placeholder="Search headlines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="mb-4 flex flex-wrap">
            <TabsTrigger value="all">All Sources</TabsTrigger>
            {sources.map((source) => (
              <TabsTrigger key={source} value={source}>
                {source}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <div className="space-y-4">
              {filteredHeadlines.map((headline, index) => (
                <div key={index} className="border-b pb-3 last:border-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{headline.title}</h3>
                      <a
                        href={headline.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-slate-500 hover:text-slate-900 hover:underline"
                      >
                        View article
                      </a>
                    </div>
                    <Badge variant="outline">{headline.source}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {sources.map((source) => (
            <TabsContent key={source} value={source}>
              <div className="space-y-4">
                {filteredHeadlines
                  .filter((headline) => headline.source === source)
                  .map((headline, index) => (
                    <div key={index} className="border-b pb-3 last:border-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{headline.title}</h3>
                          <a
                            href={headline.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-slate-500 hover:text-slate-900 hover:underline"
                          >
                            View article
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

