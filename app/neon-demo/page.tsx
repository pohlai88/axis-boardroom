/**
 * Neon Database Demo - Server Component Example
 * 
 * This page demonstrates fetching data from Neon Postgres in a Server Component.
 * 
 * Visit: http://localhost:3000/neon-demo
 */

import { sql } from '@/app/lib/db'

async function getDbVersion() {
  try {
    const result = await sql`SELECT version()`
    return result[0].version as string
  } catch (error) {
    console.error('Database connection error:', error)
    throw error
  }
}

export default async function NeonDemoPage() {
  let version: string
  let error: string | null = null

  try {
    version = await getDbVersion()
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error'
    version = 'Unable to fetch'
  }

  return (
    <main className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Next.js + Neon Postgres</h1>
        <p className="text-lg mb-6">
          This page demonstrates fetching data from Neon Postgres in a Server Component.
        </p>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Database Connection Status</h2>
          {error ? (
            <div className="text-red-600 dark:text-red-400">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          ) : (
            <div className="text-green-600 dark:text-green-400">
              <p className="font-medium">✅ Connected</p>
              <p className="mt-2 text-sm">PostgreSQL Version:</p>
              <code className="block mt-1 p-2 bg-gray-200 dark:bg-gray-700 rounded">
                {version}
              </code>
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Other Examples</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <a 
                href="/neon-demo/action" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Server Action Example
              </a>
              {' '} - Form with data mutation
            </li>
            <li>
              <a 
                href="/api/neon-demo/version" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
                target="_blank"
              >
                API Route Example
              </a>
              {' '} - Serverless function endpoint
            </li>
            <li>
              <a 
                href="/neon-data-api-demo" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Data API Demo
              </a>
              {' '} - Test Neon Data API (client & server)
            </li>
          </ul>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm">
            <strong>Note:</strong> Your project already has a more sophisticated database setup
            using Drizzle ORM at <code className="text-xs">lib/server/drizzle/index.ts</code>.
            This is a simple example for demonstration purposes.
          </p>
        </div>
      </div>
    </main>
  )
}
