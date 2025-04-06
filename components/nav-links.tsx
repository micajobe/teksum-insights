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
          <Link href="/debug" className="text-blue-600 hover:underline">
            Debug Tools
          </Link>
        </li>
      </ul>
    </div>
  )
} 