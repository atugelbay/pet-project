// web/src/components/ChatSidebar.jsx
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { listChats } from '@/services/api';

export default function ChatSidebar({ onCreate }) {
  const { chatID } = useParams();
  const [chats, setChats]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery]     = useState('');

  const fetchChats = async () => {
    setLoading(true);
    try {
        const data = await listChats();
      setChats(data);
    } catch (e) {
      console.error('ChatSidebar fetchChats error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
    const iv = setInterval(fetchChats, 5000);
    return () => clearInterval(iv);
  }, []);

    const visible = chats.filter(c =>
        c.title.toLowerCase().includes(query.trim().toLowerCase())
 );

  return (
    <aside className="w-80 bg-white dark:bg-gray-900 border-r dark:border-gray-700 flex flex-col">
      {/* Заголовок + кнопка создания */}
      <div className="px-4 flex items-center justify-between mt-4">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          Чат
        </h2>
        <button
          onClick={onCreate}
          className="p-2 text-gray-500 hover:text-primary"
          aria-label="Создать чат"
        >
          ＋
        </button>
      </div>

      {/* Поиск */}
      <div className="p-4 pt-2">
        <input
          type="text"
         value={query}
         onChange={e => setQuery(e.target.value)}
         placeholder="Поиск…"
         className="w-full px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 focus:outline-none"
        />
      </div>

      {/* Список чатов */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {loading && chats.length === 0 && (
          <p className="text-center text-sm text-gray-400">Загрузка…</p>
        )}
        {visible.map(c => (
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

      {/* Футер */}
      <div className="p-3 text-xs text-center text-gray-400">
        © 2025 Pet‑Project
      </div>
    </aside>
  );
}
