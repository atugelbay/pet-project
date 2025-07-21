import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute   from '@/components/ProtectedRoute';
import AppLayout        from '@/components/AppLayout';

import LoginPage        from '@/pages/LoginPage';
import RegisterPage     from '@/pages/RegisterPage';
import HomePage         from '@/pages/HomePage';
import ProfilePage      from '@/pages/ProfilePage';
import ProfileEditPage  from '@/pages/ProfileEditPage';
import FeedPage         from '@/pages/FeedPage';
import ChatPage         from '@/pages/ChatPage';
import ChatPlaceholder  from '@/components/ChatPlaceholder';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<HomePage />} />

            <Route path="chats">
              <Route index element={<ChatPlaceholder />} />
              <Route path=":chatID" element={<ChatPage />} />
            </Route>

            <Route path="posts" element={<FeedPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="profile/edit" element={<ProfileEditPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}