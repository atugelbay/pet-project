// web/src/pages/FeedPage.jsx
import React, { useEffect, useState } from 'react'
import PostForm from '../components/PostForm'
import PostItem from '../components/PostItem'
import { listPosts } from '../services/api'
import { Link } from 'react-router-dom'

export default function FeedPage() {
  const [posts,   setPosts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  // 1. Загрузка списка постов при монтировании
  useEffect(() => {
    setLoading(true)
    setError(null)
    listPosts()
      .then(data => setPosts(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('listPosts error', err)
        setError(err.message || 'Ошибка при загрузке постов')
      })
      .finally(() => setLoading(false))
  }, [])

  // 2. Колбэки для CRUD‑операций
  const handlePostCreated = post => {
    setPosts(prev => [post, ...prev])
  }

  const handlePostUpdated = updatedPost => {
    setPosts(prev =>
      prev.map(p => (p.id === updatedPost.id ? updatedPost : p))
    )
  }

  const handlePostDeleted = id => {
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  // 3. UI: индикаторы загрузки/ошибки
  if (loading) return <p>Загрузка ленты…</p>
  if (error)   return <p style={{ color: 'red' }}>Ошибка: {error}</p>

  // 4. Основной рендер
  return (
    <div>
      <Link to="/" style={{ display: 'block', marginTop: 20 }}>← На главную</Link>
      <h1>Лента постов</h1>

      {/* Форма создания нового поста */}
      <PostForm onPostCreated={handlePostCreated} />

      {/* Список постов или сообщение об их отсутствии */}
      {posts.length === 0 ? (
        <p>Постов пока нет.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {posts.map(post => (
            <PostItem
              key={post.id}
              post={post}
              onUpdated={handlePostUpdated}
              onDeleted={handlePostDeleted}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
