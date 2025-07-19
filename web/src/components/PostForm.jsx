import React, { useState } from 'react'
import { createPost } from '../services/api'

export default function PostForm({ onPostCreated }) {
  const [title, setTitle] = useState('')
  const [body,  setBody]  = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return

    setLoading(true)
    setError(null)
    try {
      const post = await createPost({ author_id: 1, title, body })
      onPostCreated(post)
      setTitle(''); setBody('')
    } catch (err) {
      console.error('createPost error', err)
      setError(err.message || 'Ошибка при создании')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
      {error && <p style={{ color:'red' }}>{error}</p>}
      <div>
        <input
          placeholder="Заголовок"
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={loading}
          style={{ width: '100%', marginBottom: 5 }}
        />
      </div>
      <div>
        <textarea
          placeholder="Текст поста"
          value={body}
          onChange={e => setBody(e.target.value)}
          disabled={loading}
          rows={4}
          style={{ width: '100%', marginBottom: 5 }}
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Публикую…' : 'Опубликовать'}
      </button>
    </form>
  )
}
