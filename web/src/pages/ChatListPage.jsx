import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listChats } from '../services/api'

export default function ChatListPage() {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    listChats()
      .then(data => setChats(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Загружаем чаты…</p>
  if (error)   return <p style={{ color: 'red' }}>Ошибка: {error}</p>

  return (
    <div>
      <Link to="/" style={{ display: 'block', marginTop: 20 }}>← На главную</Link>
      <h1>Список чатов</h1>
      <ul>
        {chats.map(c => (
          <li key={c.id}>
            <Link to={`/chats/${c.id}`}>
              {c.is_group ? '👥 ' : '👤 '} 
              {c.title || `Chat #${c.id}`}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
