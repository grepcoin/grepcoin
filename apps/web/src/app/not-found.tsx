import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center p-8 max-w-lg">
        <div className="text-8xl font-bold text-emerald-500 mb-4">404</div>
        <h1 className="text-3xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-x-4">
          <Link
            href="/"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium inline-block"
          >
            Go Home
          </Link>
          <Link
            href="/games"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium inline-block"
          >
            Play Games
          </Link>
        </div>
      </div>
    </div>
  )
}
