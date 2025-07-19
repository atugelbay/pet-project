import React, { useState } from 'react'
import { updatePost, deletePost } from '../services/api'

export default function PostItem({ post, onUpdated, onDeleted }) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(post.title)
  const [body,  setBody]  = useState(post.body)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    try {
      const updated = await updatePost(post.id, { title, body })
      onUpdated(updated)
      setIsEditing(false)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Ошибка при сохранении')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Удалить этот пост?')) return
    setLoading(true)
    try {
      await deletePost(post.id)
      onDeleted(post.id)
    } catch (err) {
      console.error(err)
      alert('Ошибка при удалении: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <li style={{ marginBottom: 20, border: '1px solid #ddd', padding: 10 }}>
      {isEditing ? (
        <>
          {error && <p style={{color:'red'}}>{error}</p>}
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={loading}
            style={{ width:'100%', marginBottom:5 }}
          />
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            disabled={loading}
            rows={3}
            style={{ width:'100%', marginBottom:5 }}
          />
          <button onClick={handleSave} disabled={loading}>💾 Сохранить</button>
          <button onClick={() => setIsEditing(false)} disabled={loading} style={{marginLeft:10}}>
            Отмена
          </button>
        </>
      ) : (
        <>
          <h3>{post.title}</h3>
          <p>{post.body}</p>
          <small>
            Автор: {post.author_id} • {new Date(post.created_at).toLocaleString()}
          </small>
          <div style={{ marginTop: 8 }}>
            <button onClick={() => setIsEditing(true)}>✏️ Редактировать</button>
            <button onClick={handleDelete} style={{marginLeft:10}}>🗑️ Удалить</button>
          </div>
        </>
      )}
    </li>
  )
}
