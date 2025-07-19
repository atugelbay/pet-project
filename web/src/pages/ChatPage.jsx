import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { listMessages, sendMessage, WS_BASE } from '../services/api'
import { Link } from 'react-router-dom'

export default function ChatPage() {
  const { chatID } = useParams()
  const navigate   = useNavigate()

  // 0) Состояние
  const [msgs,    setMsgs]    = useState([])       // гарантированно массив
  const [text,    setText]    = useState('')
  const [loading, setLoading] = useState(true)     // для индикатора
  const [error,   setError]   = useState(null)     // для показа ошибки
  const wsRef                  = useRef(null)

  // 1) Загрузка истории при каждой смене chatID
  useEffect(() => {
    setLoading(true)
    setError(null)
    listMessages(chatID)
      .then(data => {
        setMsgs(Array.isArray(data) ? data : [])
      })
      .catch(err => {
        console.error('listMessages error', err)
        setError(err.message || 'Unknown error')
        setMsgs([]) 
      })
      .finally(() => {
        setLoading(false)
      })
  }, [chatID])

  // 2) Подписка на WebSocket
  useEffect(() => {
    const ws = new WebSocket(`${WS_BASE}/ws/${chatID}`)
    wsRef.current = ws

    ws.onopen    = () => console.log('WS connected to chat', chatID)
    ws.onmessage = e => {
      const msg = JSON.parse(e.data)
      setMsgs(prev => {
        // защита от дублей по id
        if (prev.some(m => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    }
    ws.onerror = e => console.warn('WS error (dev):', e)
    ws.onclose = () => console.log('WS closed for chat', chatID)

    return () => {
      ws.close()
    }
  }, [chatID])

  // 3) Отправка
  const onSend = async () => {
    if (!text.trim()) return
    try {
      await sendMessage(chatID, 1, text)
      setText('')
      // не добавляем вручную — ждём WS
    } catch (err) {
      console.error('sendMessage error', err)
      alert('Не удалось отправить: ' + (err.message || 'Unknown'))
    }
  }

  // 4) Рендер загрузки / ошибки
  if (loading) return <p>Загружаем сообщения…</p>
  if (error)   return (
    <div>
      <p style={{ color: 'red' }}>Ошибка загрузки: {error}</p>
      <button onClick={() => navigate(-1)}>← Вернуться к списку</button>
    </div>
  )

  // 5) Основной UI
  return (
    <div>
      <button onClick={() => navigate('/chats')}>← Назад к списку</button>
      <h1>Чат #{chatID}</h1>

      <div style={{
        border: '1px solid #ccc',
        padding: 10,
        height: 300,
        overflowY: 'auto',
        marginBottom: 10
      }}>
        {msgs.length === 0
          ? <p>Сообщений пока нет.</p>
          : msgs.map(m => (
            <div key={m.id}>
              <b>{m.sender_id}</b>: {m.content}
            </div>
          ))
        }
      </div>

      <div>
        <input
          style={{ width: '80%' }}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Введите сообщение…"
        />
        <button onClick={onSend} style={{ marginLeft: '2%' }}>
          Отправить
        </button>
      </div>
    </div>
  )
}
