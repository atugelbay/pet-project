import React, { useState, useEffect } from 'react';
import { listUsers, getProfile, createChat, logout as apiLogout } from '@/services/api';
import { useNavigate } from 'react-router-dom';

export default function UsersSidebar() {
  const [me,    setMe]    = useState(null);
  const [users, setUsers] = useState([]);
  const [q,     setQ]     = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Получаем профиль + список всех пользователей
    Promise.all([getProfile(), listUsers()])
      .then(([profile, all]) => {
        setMe(profile);
        // Исключаем себя из списка
        setUsers(all.filter(u => u.id !== profile.id));
      })
      .catch(err => {
        console.error('UsersSidebar load error', err);
        // Если не авторизован — редиректим
        navigate('/login', { replace: true });
      });
  }, [navigate]);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(q.toLowerCase())
  );

  const handleSelect = async id => {
    try {
      // Создаём или возвращаем приватный чат
      const chat = await createChat({
        title: '',
        is_group: false,
        members: [id],
      });
      navigate(`/chats/${chat.id}`);
    } catch (e) {
      console.error('UsersSidebar createChat error', e);
      alert('Не удалось открыть чат');
    }
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (e) {
      console.warn('Logout error', e);
    }
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-80 bg-white dark:bg-gray-900 border-r dark:border-gray-700 flex flex-col">
      {/* Заголовок */}
      <div className="px-4 py-3">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          Пользователи
        </h2>
      </div>

      {/* Поиск */}
      <div className="px-4 pb-2">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Поиск…"
          className="w-full px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 focus:outline-none"
        />
      </div>

      {/* Список */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {filtered.map(u => (
          <button
            key={u.id}
            onClick={() => handleSelect(u.id)}
            className="w-full text-left px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {u.name}
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="px-4 py-3 border-t dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full text-left text-red-500 hover:underline"
        >
          Выйти
        </button>
      </div>
    </aside>
  );
}