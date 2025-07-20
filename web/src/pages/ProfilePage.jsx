import { useState, useEffect } from "react";
import { getProfile } from "../services/api";
import { logout } from "@/services/api";
import { useNavigate } from 'react-router-dom'
import { Link } from "react-router-dom";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getProfile()
      .then(data => setProfile(data))
      .catch(err => setError(err.message || "Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, []);

const navigate = useNavigate();
const onLogout = async () => {
    try {
      await logout();
    } catch (err) {
      // Покажем alert только на действительно неожиданные ошибки
      alert("Не удалось связаться с сервером, попробуйте снова.");
    } finally {
      // В любом случае чистим токен и уходим на логин
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  if (loading) return <div>Загружаем профиль…</div>;
  if (error)   return <div className="text-red-500">Ошибка: {error}</div>;

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <Link to="/" style={{ display: 'block', marginTop: 20 }}>← На главную</Link>
      <h1 className="text-2xl font-bold">Профиль</h1>
      <p><strong>ID:</strong> {profile.id}</p>
      <p><strong>Имя:</strong> {profile.name}</p>

      <div className="flex space-x-2">
        <Link
          to="/profile/edit"
          className="px-4 py-2 bg-primary text-white rounded hover:opacity-90"
        >
          Редактировать
        </Link>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:opacity-90"
        >
          Выход
        </button>
      </div>
    </div>
  );
}
