import type { Headline } from "@/lib/types"

interface HeadlineGroupProps {
  source: string
  headlines: Headline[]
}

export default function HeadlineGroup({ source, headlines }: HeadlineGroupProps) {
  return (
    <div className="mb-10">
      <h3 className="mb-4 text-base font-sans font-medium uppercase tracking-wider text-neutral-500">{source}</h3>
      <ul className="space-y-4">
        {headlines.map((headline, index) => (
          <li key={index} className="border-l-2 border-neutral-200 pl-4">
            <a href={headline.url} target="_blank" rel="noopener noreferrer" className="block hover:text-digital-blue">
              <h4 className="font-medium text-neutral-800">{headline.title}</h4>
              <p className="mt-1 text-sm text-digital-blue">View article →</p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

