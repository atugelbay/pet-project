// web/src/pages/RegisterPage.jsx
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../services/api'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError(null)
    try {
      // вызываем API /register
      const { token } = await register({ name, password })
      // сохраняем токен и переходим в чат-лист
      localStorage.setItem('token', token)
      navigate('/')
    } catch (err) {
      // err.message содержит текст из response.text()
      setError(err.message.replace(/^API \d+ \w+: /, ''))
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: 'auto', padding: 20 }}>
      <h1>Регистрация</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ marginBottom: 10 }}>
        <input
          required
          autoFocus
          placeholder="Имя пользователя"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ width: '100%', padding: 8 }}
        />
      </div>
      <div style={{ marginBottom: 10 }}>
        <input
          required
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', padding: 8 }}
        />
      </div>
      <button type="submit" style={{ width: '100%', padding: 8 }}>
        Зарегистрироваться
      </button>
      <p style={{ marginTop: 10, textAlign: 'center' }}>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </form>
  )
}
