import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Пока что у нас нет реальных сообществ, поэтому сделаем примерный список.
// В будущем вместо этого будем получать их через API.
const fakeClubs = [
  { id: 'all',   name: 'Все сообщества' },
  { id: 'go',    name: 'Go Devs' },
  { id: 'react', name: 'React Club' },
  { id: 'js',    name: 'JS Enthusiasts' },
];

export default function PostsSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const current = params.get('club') || 'all';

  const [query, setQuery] = useState('');

  const filtered = fakeClubs.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const selectClub = id => {
    // меняем query-параметр ?club=...
    params.set('club', id);
    navigate({ pathname: '/posts', search: params.toString() }, { replace: true });
  };

  return (
    <aside className="w-80 bg-white dark:bg-gray-900 border-r dark:border-gray-700 flex flex-col">
      {/* Заголовок */}
      <div className="px-4 py-3">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          Сообщества
        </h2>
      </div>

      {/* Поиск */}
      <div className="px-4 pb-2">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Поиск сообщества…"
          className="w-full px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 focus:outline-none"
        />
      </div>

      {/* Список клубов */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {filtered.map(c => (
          <button
            key={c.id}
            onClick={() => selectClub(c.id)}
            className={`w-full text-left px-3 py-2 rounded flex items-center
              ${
                current === c.id
                  ? 'bg-gray-200 dark:bg-gray-700 font-medium'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Футер */}
      <div className="p-3 text-xs text-center text-gray-400">
        © 2025 Pet‑Project
      </div>
    </aside>
  );
}