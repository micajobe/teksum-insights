import type { BusinessOpportunity } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"

interface OpportunityCardProps {
  opportunity: BusinessOpportunity
}

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  return (
    <Card className="overflow-hidden border-0 bg-digital-blue text-white">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-sans font-bold text-white">{opportunity.opportunity_name}</h3>
            <p className="mt-1 text-blue-100">{opportunity.target_market}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h4 className="mb-2 text-sm font-medium uppercase tracking-wider text-blue-200">
                Implementation Timeline
              </h4>
              <p className="text-white">{opportunity.implementation_timeline}</p>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium uppercase tracking-wider text-blue-200">Required Resources</h4>
              <ul className="space-y-1">
                {opportunity.required_resources.map((resource, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-blue-300" />
                    <span className="text-white">{resource}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium uppercase tracking-wider text-blue-200">ROI Metrics</h4>
              <ul className="space-y-1">
                {opportunity.potential_roi_metrics.map((metric, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-blue-300" />
                    <span className="text-white">{metric}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium uppercase tracking-wider text-blue-200">Success Factors</h4>
              <ul className="space-y-1">
                {opportunity.key_success_factors.map((factor, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-blue-300" />
                    <span className="text-white">{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 