import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black">
      <h1 className="font-mono text-4xl text-terminal mb-4">404</h1>
      <p className="font-mono text-gray-300 mb-6">Page not found</p>
      <Link
        href="/"
        className="font-mono text-terminal hover:underline"
      >
        Return home
      </Link>
    </div>
  )
}
