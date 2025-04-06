import Link from 'next/link'

export default function NavLinks() {
  return (
    <div className="bg-gray-100 p-4 mb-6 rounded">
      <h2 className="text-lg font-semibold mb-2">Navigation</h2>
      <ul className="flex space-x-4">
        <li>
          <Link href="/" className="text-blue-600 hover:underline">
            Main Dashboard
          </Link>
        </li>
        <li>
          <Link href="/test" className="text-blue-600 hover:underline">
            Test Page
          </Link>
        </li>
        <li>
          <Link href="/simple" className="text-blue-600 hover:underline">
            Simple View
          </Link>
        </li>
        <li>
          <Link href="/raw" className="text-blue-600 hover:underline">
            Raw Data
          </Link>
        </li>
      </ul>
    </div>
  )
} 