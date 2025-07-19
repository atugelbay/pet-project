import React from 'react'
import { Routes, Route, BrowserRouter } from 'react-router-dom'

import HomePage from './pages/HomePage'
import ChatPage from './pages/ChatPage'
import ChatListPage from './pages/ChatListPage'
import FeedPage from './pages/FeedPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Корневая страница */}
        <Route path="/" element={<HomePage />} />

        {/* Список чатов */}
        <Route path="chats" element={<ChatListPage />} />
        {/* Страница конкретного чата */}
        <Route path="chats/:chatID" element={<ChatPage />} />

        {/* Лента постов */}
        <Route path="posts" element={<FeedPage />} />
      </Routes>
    </BrowserRouter>
  )
}
