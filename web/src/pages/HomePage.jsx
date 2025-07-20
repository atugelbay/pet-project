import React from 'react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div>
      <h1>Добро пожаловать!</h1>
      <nav>
        <ul>
          <li><Link to="/chats">Чаты</Link></li>
          <li><Link to="/posts">Лента постов</Link></li>
          <li><Link to="/profile">Профиль</Link></li>
        </ul>
      </nav>
      <div className="bg-blue-500 text-white p-4 rounded">
  Tailwind работает! 🎉
</div>
    </div>
  )
}
