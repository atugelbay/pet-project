import React from 'react'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Layout from "./components/Layout";
import ChatLayout from "./components/ChatLayout";
import HomePage from './pages/HomePage'
import ChatPage from './pages/ChatPage'
import ProfilePage from './pages/ProfilePage'
import ProfileEditPage from './pages/ProfileEditPage'
import ChatListPage from './pages/ChatListPage'
import FeedPage from './pages/FeedPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './components/ProtectedRoute'


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />


          {/* Корневая страница */} 
          <Route path="/" element={<ProtectedRoute> <HomePage /> </ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><ProfileEditPage /></ProtectedRoute>} /> 
          
          <Route path="chats" element={<ChatLayout />}>
            {/* Список чатов */}
            <Route path="chats" element={<ProtectedRoute> <ChatListPage /> </ProtectedRoute>} />
            {/* Страница конкретного чата */}
            <Route path=":chatID" element={ <ProtectedRoute> <ChatPage /> </ProtectedRoute>} />
          </Route>

          {/* Лента постов */}
          <Route path="posts" element={ <ProtectedRoute> <FeedPage /> </ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
