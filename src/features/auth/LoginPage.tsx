import { Link } from 'react-router-dom'

export function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold text-white">Sign in</h1>
      <Link to="/docs" className="mt-6 text-sm text-indigo-400 hover:underline">
        Continue
      </Link>
    </div>
  )
}
