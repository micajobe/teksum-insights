import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { BusinessOpportunity } from "@/lib/types"

interface BusinessOpportunityProps {
  opportunity: BusinessOpportunity
  icon: ReactNode
}

export default function BusinessOpportunityCard({ opportunity, icon }: BusinessOpportunityProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="rounded-full bg-slate-100 p-2">{icon}</div>
        <div>
          <CardTitle className="text-lg">{opportunity.opportunity_name}</CardTitle>
          <CardDescription>Target: {opportunity.target_market}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="mb-1 text-sm font-medium">Implementation Timeline</h4>
            <p className="text-sm text-slate-600">{opportunity.implementation_timeline}</p>
          </div>

          <div>
            <h4 className="mb-1 text-sm font-medium">Required Resources</h4>
            <ul className="space-y-1 text-sm text-slate-600">
              {opportunity.required_resources.map((resource, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                  <span>{resource}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-1 text-sm font-medium">Potential ROI Metrics</h4>
            <ul className="space-y-1 text-sm text-slate-600">
              {opportunity.potential_roi_metrics.map((metric, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                  <span>{metric}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-1 text-sm font-medium">Key Success Factors</h4>
            <ul className="space-y-1 text-sm text-slate-600">
              {opportunity.key_success_factors.map((factor, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

