import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { listChats, createChat } from "@/services/api";

export default function ChatLayout() {
  const [chats, setChats]   = useState([]);
  const [loading, setLoading] = useState(true);
  const { id: selectedId  }             = useParams();
  const navigate           = useNavigate();
  
    // Функция, которая грузит чаты и ставит в state
  const fetchChats = async () => {
    try {
      setLoading(true);
      const data = await listChats();
      setChats(data);
    } catch (err) {
      console.error("listChats error:", err);
    } finally {
      setLoading(false);
    }
  };

    // При монтировании — загрузить и запустить таймер
  useEffect(() => {
    fetchChats();
    const iv = setInterval(fetchChats, 5000);
    return () => clearInterval(iv);
  }, []);

  
const onCreate = async () => {
  // Спрашиваем тип
  const isGroup = window.confirm(
    "Нажмите ОК для группового чата, Отмена — для приватного."
  );

  let title = "";
  let members = [];

   if (isGroup) {
      title = window.prompt("Название группового чата:");
      if (!title) return;

      const raw = window.prompt("ID участников через запятую:");
      members = raw
        .split(",")
        .map(s => Number(s.trim()))
        .filter(n => !isNaN(n));
    } else {
      const other = Number(window.prompt("ID собеседника:"));
      if (isNaN(other)) return;
      members = [other];
    }

  try {
      const newChat = await createChat({ title, is_group: isGroup, members });
      // сразу подтягиваем корректный title из back‑end
      await fetchChats();
      navigate(`/chats/${newChat.id}`);
    } catch (err) {
      console.error("createChat error:", err);
      alert("Не удалось создать чат");
    }
};

    const current = chats.find(c => String(c.id) === selectedId)

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

        {loading && chats.length === 0 ? (
          <p className="px-4 text-gray-500">Загружаем чаты…</p>
        ) : (
          <nav className="flex-1 overflow-auto space-y-1 px-2">
            {chats.map(c => (
              <Link
                key={c.id}
                to={`${c.id}`}
                className={`
                  flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800
                  ${String(c.id) === selectedId ? "bg-gray-200 dark:bg-gray-700" : ""}
                `}
              >
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 flex-shrink-0" />
                <div className="overflow-hidden">
                  <p className="font-medium truncate">{c.title}</p>
                </div>
              </Link>
            ))}
          </nav>
        )}
      </aside>

      <div className="flex flex-col flex-1">
        <header className="flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-gray-900 dark:border-gray-700">
          <h2 className="text-xl font-semibold">
            {current ? current.title : "Выберите чат"}
          </h2>
          {/* можно добавить кнопку «назад» */}
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
