// web/src/pages/ChatPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate }              from "react-router-dom";
import {
  listMessages,
  sendMessage,
  WS_BASE,
  getProfile
} from "@/services/api";
import Loader from "@/components/Loader";

export default function ChatPage() {
  const { chatID }        = useParams();
  const navigate          = useNavigate();

  // профиль текущего юзера
  const [profile, setProfile] = useState(null);
  // сообщения, текст инпута, статус загрузки и ошибки
  const [msgs, setMsgs]       = useState([]);
  const [text, setText]       = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const wsRef  = useRef(null);
  const boxRef = useRef(null);

  // 0) Загрузим профиль, чтобы получить profile.id → userId
  useEffect(() => {
    getProfile()
      .then(u => setProfile(u))
      .catch(() => {
        navigate("/login");
      });
  }, [navigate]);

  const userId = profile?.id;

  // 1) Загрузка истории
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    listMessages(chatID)
      .then(data => setMsgs(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error("listMessages error", err);
        setError(err.message || "Ошибка загрузки");
      })
      .finally(() => setLoading(false));
  }, [chatID, userId]);

  // 2) WS‑подписка
  useEffect(() => {
    if (!userId) return;
    const token = localStorage.getItem("token");
    const ws = new WebSocket(`${WS_BASE}/ws/${chatID}?token=${token}`);
    wsRef.current = ws;

    ws.onopen    = () => console.log("WS connected to chat", chatID);
    ws.onmessage = e => {
      const msg = JSON.parse(e.data);
      setMsgs(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setTimeout(() => {
        boxRef.current?.scrollTo({
          top: boxRef.current.scrollHeight,
          behavior: "smooth"
        });
      }, 50);
    };
    ws.onerror = e => console.warn("WS error:", e);
    ws.onclose = () => console.log("WS closed for chat", chatID);

    return () => ws.close();
  }, [chatID, userId]);

  // 3) Отправка
  const onSend = async () => {
    if (!text.trim()) return;
    try {
      await sendMessage(chatID, userId, text);
      setText("");
    } catch (err) {
      console.error("sendMessage error", err);
      alert("Не удалось отправить сообщение");
    }
  };

  // 4) Loading / Error
  if (!profile) {
    return <Loader />;
  }
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-6">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-primary text-white rounded hover:opacity-90 transition"
        >
          ← Назад
        </button>
      </div>
    );
  }

  // 5) UI в glassmorphic стиле
  return (
    <div className="flex flex-col h-full w-full">

      {/* Сообщения */}
      <div
        ref={boxRef}
        className="
          flex-1 overflow-y-auto p-6 space-y-4
          bg-glass-light bg-opacity-50 dark:bg-glass-dark dark:bg-opacity-50
          backdrop-glass-md
        "
      >
        {msgs.length === 0 ? (
          <p className="text-gray-500">Сообщений пока нет.</p>
        ) : (
          msgs.map(m => {
            const mine = m.sender_id === userId;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
              >
                {/* Имя + время */}
                <div className="text-xs text-gray-400 mb-1">
                  <span className="font-medium">
                    {mine ? "Вы" : m.sender_name}
                  </span>{" "}
                  <span>
                    {new Date(m.created_at).toLocaleTimeString([], {
                      hour:   "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Пузырь */}
                <div
                  className={`
                    max-w-[60%] break-words
                    px-4 py-2 rounded-2xl
                    backdrop-glass-xs
                    border border-white/20 dark:border-gray-700
                    transition
                    ${mine
                      ? "bg-primary/80 text-white"
                      : "bg-white/30 dark:bg-black/30 text-gray-900 dark:text-gray-100"}
                  `}
                >
                  {m.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Поле ввода */}
      <footer className="
        px-6 py-4
        bg-glass-light bg-opacity-50 dark:bg-glass-dark dark:bg-opacity-50
        backdrop-glass-xs
        border-t border-white/20 dark:border-gray-700
      ">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            className="
              flex-1 px-4 py-2
              bg-glass-light bg-opacity-70 dark:bg-glass-dark dark:bg-opacity-70
              backdrop-glass-xs
              rounded-full focus:outline-none
              border border-white/20 dark:border-gray-700
              transition
            "
            placeholder="Введите сообщение…"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onSend()}
          />
          <button
            onClick={onSend}
            className="
              p-2 bg-primary text-white rounded-full
              hover:bg-primary-dark transition
            "
          >
            ▶
          </button>
        </div>
      </footer>
    </div>
  );
}
