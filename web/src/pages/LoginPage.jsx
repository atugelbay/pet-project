import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/api'
import { Link } from 'react-router-dom'

export default function LoginPage() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const { token } = await login({ name, password })
      localStorage.setItem('token', token)
      // После логина идём в список чатов
      navigate('/chats')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: 'auto', padding: 20 }}>
      <h1>Войти</h1>
      {error && <p style={{color:'red'}}>{error}</p>}
      <div style={{ marginBottom: 10 }}>
        <input
            required
            autoFocus
            placeholder="Имя"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ width: '100%', padding: 8 }}
        />
      </div>
      <div>
        <input
            required
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: 8 }}
        />
      </div>
      <button type="submit" style={{ width: '100%', padding: 8 }}>Войти</button>
      <p style={{ marginTop: 10, textAlign: 'center' }}>
  Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
</p>
    </form>
  )
}
