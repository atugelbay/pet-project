import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Layout          from "@/components/Layout";
import ProtectedRoute  from "@/components/ProtectedRoute";

import LoginPage       from "@/pages/LoginPage";
import RegisterPage    from "@/pages/RegisterPage";
import HomePage        from "@/pages/HomePage";
import ProfilePage     from "@/pages/ProfilePage";
import ProfileEditPage from "@/pages/ProfileEditPage";
import FeedPage        from "@/pages/FeedPage";
import ChatLayout      from "@/components/ChatLayout";
import ChatPlaceholder from "@/components/ChatPlaceholder";
import ChatPage        from "@/pages/ChatPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Общий Layout */}
        <Route path="/" element={<Layout />}>

          {/* Публичные */}
          <Route path="login"    element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          {/* Всё остальное — здесь! */}
          <Route element={<ProtectedRoute />}>
            {/* "/" */}
            <Route index element={<HomePage />} />
            {/* профиль */}
            <Route path="profile"      element={<ProfilePage />} />
            <Route path="profile/edit" element={<ProfileEditPage />} />

            {/* лента */}
            <Route path="posts" element={<FeedPage />} />

            {/* чаты */}
            <Route path="chats" element={<ChatLayout />}>
              <Route index element={<ChatPlaceholder />} />
              <Route path=":chatID" element={<ChatPage />} />
            </Route>

            {/* всё остальное */}
            <Route path="*" element={<Navigate to="chats" replace />} />
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}
