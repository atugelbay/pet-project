// web/src/pages/FeedPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation }                from 'react-router-dom';
import { listPosts }                  from '@/services/api';
import Loader                         from '@/components/Loader';

// Заголовки сообществ (в будущем подтянуть из API)
const clubs = {
  all:   'Все сообщества',
  go:    'Go Devs',
  react: 'React Club',
  js:    'JS Enthusiasts',
};

export default function FeedPage() {
  const location   = useLocation();
  const params     = new URLSearchParams(location.search);
  const clubParam  = params.get('club') || 'all';
  const clubName   = clubs[clubParam] || clubs.all;

  const [posts,    setPosts]     = useState([]);
  const [loading,  setLoading]   = useState(true);
  const [error,    setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    listPosts()
      .then(data => {
        // если появится поле post.club_id – можно будет фильтровать:
        // const filtered = data.filter(p => clubParam === 'all' || p.club_id === clubParam);
        setPosts(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('listPosts error', err);
        setError(err.message || 'Не удалось загрузить посты');
      })
      .finally(() => setLoading(false));
  }, [clubParam]);

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
      {/* Заголовок выбранного сообщества */}
      <h1 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
        {clubName}
      </h1>

      {/* Список карточек */}
      {posts.length === 0 ? (
        <p className="text-gray-500">Постов ещё нет.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <article
              key={post.id}
              className="
                group relative p-6 rounded-xl overflow-hidden
                bg-glass-light dark:bg-glass-dark
                backdrop-glass-sm
                border border-white/20 dark:border-gray-700
                shadow-md
                hover:shadow-lg
                transform hover:scale-[1.02]
                transition-all duration-300 ease-in-out
              "
            >
              <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">
                {post.title}
              </h2>
              <p className="text-gray-700 dark:text-gray-200 mb-4">
                {post.body}
              </p>
              <time
                className="text-xs text-gray-400"
                dateTime={post.created_at}
              >
                {new Date(post.created_at).toLocaleString([], {
                  year:   'numeric',
                  month:  '2-digit',
                  day:    '2-digit',
                  hour:   '2-digit',
                  minute: '2-digit',
                })}
              </time>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
