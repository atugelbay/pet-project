// web/src/components/AppLayout.jsx
import React from 'react';
import { Outlet, Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import ChatCreateModal from '@/components/ChatCreateModal';
import { listChats } from '@/services/api';
import { useEffect, useState } from 'react';

export default function AppLayout() {
  const location = useLocation();
  const { chatID } = useParams();
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModal] = useState(false);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const data = await listChats();
      setChats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
    const iv = setInterval(fetchChats, 5000);
    return () => clearInterval(iv);
  }, []);

  const onCreate = () => setModal(true);
  const handleSuccess = chat => {
    fetchChats();
    navigate(`/chats/${chat.id}`);
    setModal(false);
  };

  const isChatsRoute = location.pathname.startsWith('/chats');

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-80 bg-white dark:bg-gray-900 border-r dark:border-gray-700 flex flex-col">
        {/* Логотип / навигация */}
        <div className="p-4">
          <Link to="/" className="text-2xl font-bold text-primary block mb-4">
            Pet‑Project
          </Link>
        </div>

        {/* Пока что всегда показываем чатовый список (позже заменим на динамический) */}
        <div className="px-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Pet‑Chat</h2>
          <button
            onClick={onCreate}
            className="p-2 text-gray-500 hover:text-primary"
            aria-label="Создать чат"
          >
            ＋
          </button>
        </div>

        <div className="p-4 pt-2">
          <input
            placeholder="Поиск…"
            className="w-full px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 focus:outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {loading && chats.length === 0 && (
            <p className="text-center text-sm text-gray-400">Загрузка…</p>
          )}
          {chats.map(c => (
            <Link
              key={c.id}
              to={`/chats/${c.id}`}
              className={`flex items-center px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                String(c.id) === chatID ? 'bg-gray-200 dark:bg-gray-700' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gray-300 mr-3" />
              <span className="truncate text-sm text-primary">
                {c.is_group ? c.title : (c.title || '—')}
              </span>
            </Link>
          ))}
        </div>

        <div className="p-3 text-xs text-center text-gray-400">
          © 2025 Pet‑Project
        </div>
      </aside>

      {/* Правая часть */}
      <div className="flex flex-col flex-1">
        {/* Верхний правый хедер: ссылка на профиль */}
         <header className="px-6 py-3 border-b bg-white dark:bg-gray-900 dark:border-gray-700 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-primary">Pet‑Project</Link>

          <nav className="flex items-center space-x-6 text-sm">
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
        </header>

        <main className="flex-1 overflow-y-auto flex">
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
