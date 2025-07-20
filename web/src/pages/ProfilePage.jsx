import { useState, useEffect } from "react";
import { getProfile } from "../services/api";
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

  if (loading) return <div>Загружаем профиль…</div>;
  if (error)   return <div className="text-red-500">Ошибка: {error}</div>;

  return (
    <div className="p-4 max-w-md mx-auto">
        <Link to="/" style={{ display: 'block', marginTop: 20 }}>← На главную</Link>
      <h1 className="text-2xl mb-4">Профиль</h1>
      <p><strong>ID:</strong> {profile.id}</p>
      <p><strong>Имя:</strong> {profile.name}</p>
      <Link to="/profile/edit" className="text-blue-600 hover:underline">
        Редактировать профиль
      </Link>
    </div>
  );
}
