import { Separator } from "@/components/ui/separator"
import DropCap from "@/components/drop-cap"

interface InsightSectionProps {
  title: string
  summary: string
  insights: string[]
  headlines: string[]
}

export default function InsightSection({ title, summary, insights, headlines }: InsightSectionProps) {
  // Get the first letter for the drop cap
  const firstLetter = summary.charAt(0)
  const restOfSummary = summary.substring(1)

  return (
    <section className="mb-16">
      <h2 className="mb-6 font-sans text-2xl font-bold">{title}</h2>

      <div className="prose prose-neutral max-w-none">
        <p className="text-lg leading-relaxed">
          <DropCap letter={firstLetter} />
          {restOfSummary}
        </p>
      </div>

      <div className="mt-8 space-y-6">
        <div>
          <h3 className="mb-3 text-base font-medium uppercase tracking-wider text-neutral-500">Key Insights</h3>
          <ul className="space-y-3">
            {insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-neutral-400" />
                <span className="text-neutral-700">{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-base font-medium uppercase tracking-wider text-neutral-500">Supporting Headlines</h3>
          <ul className="space-y-3">
            {headlines.map((headline, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-neutral-400" />
                <span className="text-neutral-700">{headline}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Separator className="mt-12 bg-neutral-200" />
    </section>
  )
}

