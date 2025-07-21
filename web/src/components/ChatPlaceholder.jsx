// web/src/components/ChatPlaceholder.jsx
import React from 'react';
import { useOutletContext } from 'react-router-dom';

export default function ChatPlaceholder() {
  const { onCreate } = useOutletContext() || {};
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-gray-500 dark:text-gray-400">
      {/* Иконка чата */}
      <svg
        className="w-20 h-20 opacity-50"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Заголовок */}
      <p className="text-2xl font-semibold">
        Выберите чат слева
      </p>

      {/* Подсказка */}
      <p className="max-w-xs text-center text-sm">
        Здесь будет содержимое вашего чата. 
        Выберите существующий диалог или&nbsp;
        <button
          type="button"
          onClick={onCreate}
          className="text-primary font-medium hover:underline focus:outline-none"
        >
          создайте новый чат
        </button>.
      </p>
    </div>
  );
}
