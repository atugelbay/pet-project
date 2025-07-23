// web/src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { Link }                         from 'react-router-dom';
import { getProfile, listChats, listPosts } from '@/services/api';
import Loader                           from '@/components/Loader';

export default function HomePage() {
  const [profile, setProfile] = useState(null);
  const [chats,   setChats]   = useState([]);
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([ getProfile(), listChats(), listPosts() ])
      .then(([me, chatsData, postsData]) => {
        setProfile(me);
        setChats(Array.isArray(chatsData) ? chatsData : []);
        setPosts(Array.isArray(postsData) ? postsData : []);
      })
      .catch(err => {
        console.error('HomePage loading error', err);
        setError(err.message || 'Ошибка загрузки данных');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <h1 className="text-3xl font-semibold mb-8 text-gray-800 dark:text-gray-100">
        Добро пожаловать, {profile.name}!
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Чаты */}
        <Link
          to="/chats"
          className="
            group block relative p-6 rounded-xl overflow-hidden
            bg-glass-light dark:bg-glass-dark
            backdrop-glass-sm
            border border-white/20 dark:border-gray-700
            shadow-md hover:shadow-lg
            transform hover:scale-[1.02]
            transition-all duration-300 ease-in-out
          "
        >
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
            Чаты
          </h2>
          <p className="text-4xl font-bold text-gray-900 dark:text-gray-50">
            {chats.length}
          </p>
        </Link>

        {/* Лента */}
        <Link
          to="/posts"
          className="
            group block relative p-6 rounded-xl overflow-hidden
            bg-glass-light dark:bg-glass-dark
            backdrop-glass-sm
            border border-white/20 dark:border-gray-700
            shadow-md hover:shadow-lg
            transform hover:scale-[1.02]
            transition-all duration-300 ease-in-out
          "
        >
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
            Посты
          </h2>
          <p className="text-4xl font-bold text-gray-900 dark:text-gray-50">
            {posts.length}
          </p>
        </Link>

        {/* Профиль */}
        <Link
          to="/profile"
          className="
            group block relative p-6 rounded-xl overflow-hidden
            bg-glass-light dark:bg-glass-dark
            backdrop-glass-sm
            border border-white/20 dark:border-gray-700
            shadow-md hover:shadow-lg
            transform hover:scale-[1.02]
            transition-all duration-300 ease-in-out
          "
        >
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
            Профиль
          </h2>
          <p className="text-4xl font-bold text-gray-900 dark:text-gray-50">
            {profile.name}
          </p>
        </Link>
      </div>
    </div>
  );
}
