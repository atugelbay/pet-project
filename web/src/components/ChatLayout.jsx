import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { listChats, createChat } from "@/services/api";

export default function ChatLayout() {
  const [chats, setChats]   = useState([]);
  const [loading, setLoading] = useState(true);
  const { id }             = useParams();
  const navigate           = useNavigate();

  useEffect(() => {
    listChats()
      .then(data => setChats(data))
      .catch(err => console.error("listChats error:", err))
      .finally(() => setLoading(false));
  }, []);

  
const onCreate = async () => {
  // Спрашиваем тип
  const isGroup = window.confirm(
    "Нажмите ОК для группового чата, Отмена — для приватного."
  );

  let title = "";
  let userIds = [];

  if (isGroup) {
    title = window.prompt("Название группового чата:");
    if (!title?.trim()) return;

    const usersRaw = window.prompt(
      "Введите ID участников через запятую, например: 2,3,4"
    );
    if (!usersRaw) return;
    userIds = usersRaw
      .split(",")
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n));
  } else {
    const otherIdRaw = window.prompt("ID пользователя для приватного чата:");
    const otherId = parseInt(otherIdRaw, 10);
    if (isNaN(otherId)) return;
    userIds = [otherId];
  }

  try {
    const chat = await createChat({ title, is_group: isGroup, user_ids: userIds });
    // обновляем список
    setChats(prev => [chat, ...prev]);
    navigate(`/chats/${chat.id}`);
  } catch (err) {
    console.error("createChat error", err);
    alert("Не удалось создать чат: " + err.message);
  }
};

  if (loading) return <div className="p-4">Загружаем чаты…</div>;

  return (
    <div className="flex h-screen">
      <aside className="w-80 bg-white border-r dark:bg-gray-900 dark:border-gray-700 flex flex-col">
        <div className="p-4 flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">Pet‑Chat</span>
          <button
            onClick={onCreate}
            className="p-2 text-gray-500 hover:text-primary"
            title="Создать чат"
          >
            ＋
          </button>
        </div>

        <div className="px-4 mb-4">
          <input
            type="text"
            placeholder="Поиск…"
            className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 focus:outline-none"
          />
        </div>

        <nav className="flex-1 overflow-auto space-y-1 px-2">
          {chats.map(c => (
            <Link
              key={c.id}
              to={`${c.id}`}
              className={`
                flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800
                ${String(c.id) === id ? "bg-gray-200 dark:bg-gray-700" : ""}
              `}
            >
              <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 flex-shrink-0" />
              <div className="overflow-hidden">
                <p className="font-medium truncate">{c.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {c.lastMessage || "—"}
                </p>
              </div>
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex flex-col flex-1">
        <header className="flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-gray-900 dark:border-gray-700">
          {/* … как было … */}
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
