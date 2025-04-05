import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface TrendAnalysisProps {
  title: string
  icon: ReactNode
  summary: string
  insights: string[]
  headlines: string[]
}

export default function TrendAnalysis({ title, icon, summary, insights, headlines }: TrendAnalysisProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="rounded-full bg-slate-100 p-2">{icon}</div>
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="line-clamp-2">{summary}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="mb-2 text-sm font-medium">Key Insights</h4>
            <ul className="space-y-1 text-sm text-slate-600">
              {insights.map((insight, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-medium">Supporting Headlines</h4>
            <ul className="space-y-1 text-sm text-slate-600">
              {headlines.map((headline, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                  <span>{headline}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

