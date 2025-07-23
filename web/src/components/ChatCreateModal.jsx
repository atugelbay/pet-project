// web/src/components/ChatCreateModal.jsx
import React, { useState, useEffect } from 'react';
import { listUsers, createChat, getProfile } from '@/services/api';

export default function ChatCreateModal({ isOpen, onClose, onSuccess }) {
  const [users, setUsers]       = useState([]);
  const [me, setMe]             = useState(null);
  const [selected, setSelected] = useState([]);
  const [isGroup, setIsGroup]   = useState(false);
  const [title, setTitle]       = useState('');
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    Promise.all([listUsers(), getProfile()])
      .then(([u, profile]) => {
        setMe(profile);
        setUsers(u.filter(x => x.id !== profile.id)); // скрываем себя
      })
      .catch(console.error);
  }, [isOpen]);

  const toggleUser = id => {
    if (isGroup) {
      setSelected(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    } else {
      setSelected([id]); // приватный — только один
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    if (!isGroup && selected.length !== 1) {
      setError('Выберите одного пользователя');
      return;
    }
    if (isGroup && (!title.trim() || selected.length < 1)) {
      setError('Название и хотя бы один участник обязательны');
      return;
    }

    setLoading(true);
    try {
      const chat = await createChat({
        title,
        is_group: isGroup,
        members: selected,
      });
      onSuccess(chat);
    } catch (err) {
      setError(err.message || 'Ошибка создания');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-20">
      <form
        onSubmit={handleSubmit}
        className="
        bg-glass-light dark:bg-glass-dark
        backdrop-glass-lg
        rounded-lg
        border border-white/20 dark:border-gray-700
        w-full
        max-w-lg
        p-6 space-y-4
        shadow-lg
        "
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {isGroup ? 'Групповой чат' : 'Приватный чат'}
          </h3>

          {/* Toggle switch */}
          <label className="flex items-center cursor-pointer select-none">
            <span className="mr-3 text-sm text-gray-600 dark:text-gray-300">
              {isGroup ? 'Групповой' : 'Личный'}
            </span>
            <div className="relative">
              <input
                type="checkbox"
                checked={isGroup}
                onChange={() => {
                  setIsGroup(g => !g);
                  setSelected([]);
                  setTitle('');
                }}
                className="sr-only"
              />
              <div className="w-10 h-5 rounded-full bg-gray-300 dark:bg-gray-600 transition-colors peer-checked:bg-primary"></div>
              <div
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  isGroup ? 'translate-x-5' : ''
                }`}
              />
            </div>
          </label>
        </div>

        {isGroup && (
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              Название группы
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring"
              placeholder="Team Chat"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
            {isGroup ? 'Участники' : 'Собеседник'}
          </label>
          <ul className="max-h-48 overflow-auto space-y-1 border p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
            {users.map(u => {
              const active = selected.includes(u.id);
              return (
                <li
                  key={u.id}
                  className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer transition
                    ${active
                        ? 'bg-indigo-500/10 dark:bg-indigo-400/20'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => toggleUser(u.id)}
                >
                  <span className="truncate text-gray-800 dark:text-gray-100">
                    {u.name}
                  </span>
                  {isGroup && (
                    <input
                        type="checkbox"
                        readOnly
                        checked={active}
                        className="form-checkbox h-4 w-4 text-primary pointer-events-none"
                    />
                    )}
                </li>
              );
            })}
          </ul>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300"
            disabled={loading}
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? 'Создаем…' : 'Создать'}
          </button>
        </div>
      </form>
    </div>
  );
}
