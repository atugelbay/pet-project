// web/src/components/ChatSidebar.jsx
import React, { useEffect, useState } from 'react';
import { Link, useParams }              from 'react-router-dom';
import { listChats }                    from '@/services/api';

export default function ChatSidebar({ onCreate }) {
  const { chatID }   = useParams();
  const [chats, setChats]     = useState([]);
  const [query, setQuery]     = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
      async function fetch() {
      try { setChats(await listChats()); }
      catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    fetch();
    const iv = setInterval(fetch, 5000);
    return () => clearInterval(iv);
  }, []);

  const visible = chats.filter(c =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <aside
      className={`
        group h-full flex flex-col
        w-16 hover:w-80
        bg-glass-light dark:bg-glass-dark
        backdrop-glass
        border-r border-white/20 dark:border-gray-700
        transition-all duration-300 ease-in-out
        overflow-hidden
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {/* Заголовок скрыт, пока sidebar узкий */}
        <h2
          className={`
            font-bold text-lg text-gray-700 dark:text-gray-200
            transition-opacity duration-300
            opacity-0 group-hover:opacity-100
          `}
        >
          Pet‑Chat
        </h2>
        {/* Кнопка "+" тоже прячем на узком */}
        <button
          onClick={onCreate}
          className={`
            p-2 hover:bg-white/30 rounded transition
            opacity-0 group-hover:opacity-100
          `}
          aria-label="Создать чат"
        >
          ＋
        </button>
      </div>

      {/* Поиск: виден только при hover */}
      <div className="px-4 pb-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Поиск…"
          className={`
            w-full px-3 py-2 rounded bg-white/50 dark:bg-gray-800
            focus:outline-none backdrop-blur-sm
            transition-opacity duration-300
            opacity-0 group-hover:opacity-100
          `}
        />
      </div>

      {/* Список чатов: иконки всегда, текст только при hover */}
      <div className="flex-1 overflow-hidden">
        {loading && (
          <p className="text-center text-sm text-gray-400">Загрузка…</p>
        )}
        <ul className="space-y-1 px-2">
          {visible.map(c => {
            const active = String(c.id) === chatID;
            return (
              <li key={c.id}>
                <Link
                  to={`/chats/${c.id}`}
                  className={`
                    flex items-center p-2 rounded
                    ${active
                      ? 'bg-white/30 dark:bg-gray-700'
                      : 'hover:bg-white/20 dark:hover:bg-gray-700'}
                    transition
                  `}
                >
                <div
                    className={`
              flex-shrink-0
              w-8 h-8 aspect-square
              rounded-full overflow-hidden
              bg-gray-300 dark:bg-gray-600
              flex items-center justify-center
              text-sm text-white
              mr-3
                `}
                >
                        {c.is_group ? '👥' : (c.title?.[0]?.toUpperCase() || '?')}
                  </div>
                  <span
                    className={`
                      text-sm text-primary
                      transition-opacity duration-300
                      opacity-0 group-hover:opacity-100
                    `}
                  >
                    {c.is_group ? c.title : (c.title || '—')}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer */}
      <div className="p-3 text-xs text-center text-gray-400
                      transition-opacity duration-300
                      opacity-0 group-hover:opacity-100">
        © 2025 Pet‑Project
      </div>
    </aside>
  );
}
