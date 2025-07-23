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
      {/* Заголовок */}
      <div className="px-4 py-3">
        <h2 
            className={`
            font-bold text-lg text-gray-700 dark:text-gray-200
            transition-opacity duration-300
            opacity-0 group-hover:opacity-100
          `}>
          Пользователи
        </h2>
      </div>

      {/* Поиск */}
      <div className="px-4 pb-2">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Поиск…"
          className={`
            w-full px-3 py-2 rounded bg-white/50 dark:bg-gray-800
            focus:outline-none backdrop-blur-sm
            transition-opacity duration-300
            opacity-0 group-hover:opacity-100
          `}
        />
      </div>

      {/* Список */}
        <div className="flex-1 overflow-hidden px-2 space-y-1">
        {filtered.map(u => (
          <button
            key={u.id}
            onClick={() => handleSelect(u.id)}
            className="
              w-full flex items-center px-3 py-2 rounded
              hover:bg-white/20 dark:hover:bg-gray-700
              transition
            "
          >
            {/* аватарка с initial */}
            <div className="
              flex-shrink-0
              w-8 h-8 aspect-square
              rounded-full overflow-hidden
              bg-gray-300 dark:bg-gray-600
              flex items-center justify-center
              text-sm text-white
              mr-3
            ">
              {u.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-gray-800 dark:text-gray-100">
              {u.name}
            </span>
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="px-4 py-3 border-t dark:border-gray-700">
        <button
          onClick={handleLogout}
          className={`
            w-full text-left text-red-500 hover:underline
            transition-opacity duration-300
            opacity-0 group-hover:opacity-100 
          `}>
          Выйти
        </button>
      </div>
    </aside>
  );
}