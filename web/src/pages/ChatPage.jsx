import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { listMessages, sendMessage, WS_BASE } from '../services/api'

export default function ChatPage() {
  const { chatID } = useParams()
  const navigate   = useNavigate()
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState('')
  const wsRef = useRef(null)

  // 1) Загрузка истории при монтировании
  useEffect(() => {
    listMessages(chatID)
      .then(setMsgs)
      .catch(console.error)
  }, [chatID])

  // 2) Подписка на WS‑канал
  useEffect(() => {
    const ws = new WebSocket(`${WS_BASE}/ws/${chatID}`)
    wsRef.current = ws

    ws.onopen = () => console.log('WS connected to chat', chatID)
    ws.onmessage = e => {
      const msg = JSON.parse(e.data)
      setMsgs(prev => [...prev, msg])
    }
    ws.onerror = err => console.error('WS error', err)
    ws.onclose = () => console.log('WS closed for chat', chatID)

    // при размонтировании - закрываем соединение
    return () => {
      ws.close()
    }
  }, [chatID])

  // 3) Отправка нового сообщения
  const onSend = async () => {
    if (!text) return
    try {
      await sendMessage(chatID, 1 /*твой userID*/, text)
      setText('')
    } catch (err) {
      console.error('sendMessage error', err)
      alert('Не удалось отправить сообщение')
    }
  }

  return (
    <div>
      <button onClick={() => navigate(-1)}>← Назад к списку</button>
      <h1>Чат #{chatID}</h1>

      <div style={{
        border: '1px solid #ccc',
        padding: 10,
        height: 300,
        overflowY: 'auto',
        marginBottom: 10
      }}>
        {msgs.map(m => (
          <div key={m.id}>
            <b>{m.sender_id}</b>: {m.content}
          </div>
        ))}
      </div>

      <div>
        <input
          style={{ width: '80%' }}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Введите сообщение…"
        />
        <button onClick={onSend} style={{ width: '18%', marginLeft: '2%' }}>
          Отправить
        </button>
      </div>
    </div>
  )
}
