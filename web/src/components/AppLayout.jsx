// web/src/components/AppLayout.jsx
import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import ChatCreateModal from '@/components/ChatCreateModal';
import { useState } from 'react';
import ChatSidebar from '@/components/ChatSidebar';
import PostsSidebar from '@/components/PostsSidebar';
import UsersSidebar  from '@/components/UsersSidebar';


export default function AppLayout() {
  const location = useLocation();
  const isChats = location.pathname.startsWith('/chats');
  const isPosts = location.pathname.startsWith('/posts');
  const isProfile = location.pathname.startsWith('/profile');
  const navigate = useNavigate();
  const [isModalOpen, setModal] = useState(false);
  const [sidebarCollapsed] = useState(false);

  const onCreate = () => setModal(true);
  const handleSuccess = chat => {
    navigate(`/chats/${chat.id}`);
    setModal(false);
  };

  const isChatsRoute = location.pathname.startsWith('/chats');

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
     {isChats && <ChatSidebar onCreate={onCreate} collapsed={sidebarCollapsed} />}
     {isPosts && <PostsSidebar />}
     {isProfile && <UsersSidebar />}

      {/* Правая часть */}
      <div className="flex flex-col flex-1">
        {/* Верхний правый хедер: ссылка на профиль */}
         <header
          className="
            px-6 py-3
            bg-glass-light dark:bg-glass-dark
            backdrop-glass-md
            border-b border-white/20 dark:border-gray-700
            flex items-center justify-between
            "
          >
          <Link to="/" className="text-xl font-bold text-primary">Pet‑Project</Link>
          <div className="flex items-center space-x-4">

            <nav className="flex items-center space-x-6 text-sm">
              <Link
                to="/"
                className={`hover:underline ${location.pathname.startsWith('/') ? 'font-semibold' : ''}`}
              >Главная</Link>
              <Link
                to="/chats"
                className={`hover:underline ${location.pathname.startsWith('/chats') ? 'font-semibold' : ''}`}
              >
                Чаты
              </Link>
              <Link
                to="/posts"
                className={`hover:underline ${location.pathname.startsWith('/posts') ? 'font-semibold' : ''}`}
              >
                Лента
              </Link>
              <Link
                to="/profile"
                className={`hover:underline ${location.pathname.startsWith('/profile') ? 'font-semibold' : ''}`}
              >
                Профиль
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto flex text-base md:text-[18px]">
          <Outlet context={{ onCreate }} />
        </main>
      </div>

      <ChatCreateModal
        isOpen={isModalOpen}
        onClose={() => setModal(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
