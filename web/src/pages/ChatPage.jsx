import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate }                 from "react-router-dom";
import { listMessages, sendMessage, WS_BASE }      from "@/services/api";

export default function ChatPage() {
  const { chatID } = useParams();
  const navigate   = useNavigate();

  // 0) Состояние
  const [msgs,    setMsgs]    = useState([]);    // array
  const [text,    setText]    = useState("");
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const wsRef                  = useRef(null);
  const boxRef                 = useRef(null);

  // 1) Загрузка истории при смене chatID
  useEffect(() => {
    setLoading(true);
    setError(null);
    listMessages(chatID)
      .then(data => setMsgs(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error("listMessages error", err);
        setError(err.message || "Ошибка загрузки");
        setMsgs([]);
      })
      .finally(() => setLoading(false));
  }, [chatID]);

  // 2) WebSocket‑подписка
  useEffect(() => {
    const ws = new WebSocket(`${WS_BASE}/ws/${chatID}`);
    wsRef.current = ws;

    ws.onopen    = () => console.log("WS connected to chat", chatID);
    ws.onmessage = e => {
      const msg = JSON.parse(e.data);
      setMsgs(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      // Прокрутка вниз
      setTimeout(() => {
        if (boxRef.current) {
          boxRef.current.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" });
        }
      }, 50);
    };
    ws.onerror = e => console.warn("WS error:", e);
    ws.onclose = () => console.log("WS closed for chat", chatID);

    return () => ws.close();
  }, [chatID]);

  // 3) Отправка сообщения
  const onSend = async () => {
    if (!text.trim()) return;
    try {
      await sendMessage(chatID, 1, text);
      setText("");
      // не добавляем локально, ждем WS
    } catch (err) {
      console.error("sendMessage error", err);
      alert("Не удалось отправить сообщение");
    }
  };

  // 4) Error

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-primary text-white rounded hover:opacity-90"
        >
          ← Назад к списку
        </button>
      </div>
    );
  }

  // 5) Основной UI: сообщения + ввод
  return (
    <div className="flex flex-col h-full">
      {/* Сообщения */}
      <div
        ref={boxRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-800"
      >
        {msgs.length === 0 ? (
          <p className="text-gray-500">Сообщений пока нет.</p>
        ) : (
          msgs.map(m => (
            <div
              key={m.id}
              className={`flex ${
                m.sender_id === 1 ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[60%] p-3 rounded-2xl ${
                  m.sender_id === 1
                    ? "bg-primary text-white"
                    : "bg-white dark:bg-gray-700 text-gray-900"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Поле ввода */}
      <footer className="px-6 py-4 border-t bg-white dark:bg-gray-900 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none"
            placeholder="Введите сообщение…"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onSend()}
          />
          <button
            onClick={onSend}
            className="p-2 text-primary hover:text-primary-dark"
          >
            ▶ 
          </button>
        </div>
      </footer>
    </div>
  );
}
