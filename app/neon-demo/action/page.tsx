/**
 * Neon Database Demo - Server Action Example
 * 
 * This page demonstrates using Server Actions to mutate data in Neon Postgres.
 * 
 * Visit: http://localhost:3000/neon-demo/action
 */

import { sql } from '@/app/lib/db'
import { revalidatePath } from 'next/cache'

export default async function ActionPage() {
  async function createComment(formData: FormData) {
    'use server'
    
    const comment = formData.get('comment') as string
    
    if (!comment || comment.trim().length === 0) {
      return { error: 'Comment cannot be empty' }
    }

    try {
      // Ensure table exists
      await sql`
        CREATE TABLE IF NOT EXISTS comments (
          id SERIAL PRIMARY KEY,
          comment TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `
      
      // Insert comment
      await sql`
        INSERT INTO comments (comment) 
        VALUES (${comment.trim()})
      `
      
      revalidatePath('/neon-demo/action')
      return { success: true }
    } catch (error) {
      console.error('Error creating comment:', error)
      return { 
        error: error instanceof Error ? error.message : 'Failed to create comment' 
      }
    }
  }

  async function getComments() {
    try {
      // Ensure table exists
      await sql`
        CREATE TABLE IF NOT EXISTS comments (
          id SERIAL PRIMARY KEY,
          comment TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `
      
      const comments = await sql`
        SELECT id, comment, created_at 
        FROM comments 
        ORDER BY created_at DESC 
        LIMIT 50
      `
      
      return comments as Array<{
        id: number
        comment: string
        created_at: Date
      }>
    } catch (error) {
      console.error('Error fetching comments:', error)
      return []
    }
  }

  const comments = await getComments()

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Server Action Example</h1>
        <p className="text-lg mb-6">
          This page demonstrates using Server Actions to insert data into Neon Postgres.
        </p>

        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Add a Comment</h2>
          <form action={createComment} className="space-y-4">
            <div>
              <input
                type="text"
                name="comment"
                placeholder="Enter your comment..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Comment
            </button>
          </form>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Comments ({comments.length})</h2>
          {comments.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No comments yet. Be the first to add one!
            </p>
          ) : (
            <ul className="space-y-3">
              {comments.map((comment) => (
                <li
                  key={comment.id}
                  className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <p className="text-gray-900 dark:text-gray-100">{comment.comment}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {new Date(comment.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6">
          <a
            href="/neon-demo"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Demo Home
          </a>
        </div>
      </div>
    </div>
  )
}
