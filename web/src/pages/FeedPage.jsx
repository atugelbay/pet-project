// web/src/pages/FeedPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation }                from 'react-router-dom';
import { listPosts }                  from '@/services/api';
import Loader                         from '@/components/Loader';

const clubs = {
  all:   'Все сообщества',
  go:    'Go Devs',
  react: 'React Club',
  js:    'JS Enthusiasts',
};

export default function FeedPage() {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const location   = useLocation();
  const params     = new URLSearchParams(location.search);
  const clubParam  = params.get('club') || 'all';
  const clubName   = clubs[clubParam] || clubs.all;

  // 1) Загружаем все посты (пока без фильтра)
  useEffect(() => {
    setLoading(true);
    setError(null);

    listPosts()
      .then(data => {
        // TODO: здесь можно фильтровать по клубам, когда появится поддержка в бэке
        setPosts(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('listPosts error', err);
        setError(err.message || 'Не удалось загрузить посты');
      })
      .finally(() => setLoading(false));
  }, [clubParam]); // перезагружаем, когда сменился параметр ?club=

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-3">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Заголовок выбранного клуба */}
      <h1 className="text-2xl font-semibold">{clubName}</h1>

      {/* Список постов */}
      {posts.length === 0 ? (
        <p className="text-gray-500">Постов ещё нет.</p>
      ) : (
        posts.map(post => (
          <article
            key={post.id}
            className="p-4 border rounded-lg bg-white dark:bg-gray-800"
          >
            <h2 className="text-lg font-medium mb-2">{post.title}</h2>
            <p className="text-gray-700 dark:text-gray-200 mb-3">
              {post.body}
            </p>
            <time
              className="text-xs text-gray-400"
              dateTime={post.created_at}
            >
              {new Date(post.created_at).toLocaleString()}
            </time>
          </article>
        ))
      )}
    </div>
  );
}
