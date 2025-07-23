import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const fakeClubs = [
  { id: 'all',   name: 'Все сообщества'  },
  { id: 'go',    name: 'Go Devs'         },
  { id: 'react', name: 'React Club'      },
  { id: 'js',    name: 'JS Enthusiasts'  },
];

export default function PostsSidebar() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params   = new URLSearchParams(search);
  const current  = params.get('club') || 'all';

  const [query, setQuery] = useState('');
  const filtered = fakeClubs.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  function selectClub(id) {
    params.set('club', id);
    navigate({ pathname: '/posts', search: params.toString() }, { replace: true });
  }

  return (
    <aside
      className={`
        group h-full flex flex-col
        w-16 hover:w-80
        bg-glass-light dark:bg-glass-dark
        backdrop-glass-sm
        border-r border-white/20 dark:border-gray-700
        transition-all duration-300 ease-in-out
        overflow-hidden
      `}
    >
      {/* Заголовок */}
      <div className="px-4 py-3">
        <h2
          className={`
            text-lg font-semibold text-gray-700 dark:text-gray-200
            transition-opacity duration-300
            opacity-0 group-hover:opacity-100
          `}
        >
          Сообщества
        </h2>
      </div>

      {/* Поиск */}
      <div className="px-4 pb-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Поиск…"
          className={`
            w-full px-3 py-2 rounded
            bg-white/50 dark:bg-gray-800
            focus:outline-none backdrop-glass-xs
            transition-opacity duration-300
            opacity-0 group-hover:opacity-100
          `}
        />
      </div>

      {/* Список сообществ */}
      <div className="flex-1 overflow-auto">
        <ul className="space-y-1 px-2">
          {filtered.map(c => {
            const isActive    = current === c.id;
            const avatarLabel = c.id === 'all'
              ? '🌐'
              : c.name.charAt(0).toUpperCase();

            return (
              <li key={c.id}>
                <button
                  onClick={() => selectClub(c.id)}
                  className={`
                    flex items-center w-full p-2 rounded
                    ${isActive
                      ? 'bg-white/30 dark:bg-gray-700'
                      : 'hover:bg-white/20 dark:hover:bg-gray-700'}
                    transition
                  `}
                >
                  {/* Аватарка */}
                  <div className="
                    flex-shrink-0
                    w-8 h-8 aspect-square
                    rounded-full overflow-hidden
                    bg-gray-300 dark:bg-gray-600
                    flex items-center justify-center
                    text-sm text-white
                    mr-3
                  ">
                    {avatarLabel}
                  </div>

                  {/* Название */}
                  <span className={`
                    text-sm text-gray-800 dark:text-gray-100
                    whitespace-nowrap overflow-hidden
                    max-w-0 group-hover:max-w-[12rem]
                    transition-[max-width] duration-300 ease-in-out
                  `}>
                    {c.name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Футер */}
      <div className={`
        px-4 py-3 text-xs text-center text-gray-400
        transition-opacity duration-300
        opacity-0 group-hover:opacity-100
      `}>
        © 2025 Pet‑Project
      </div>
    </aside>
  );
}
