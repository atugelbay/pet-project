import { useState, useEffect } from "react";
import { getProfile, updateProfile, changePassword } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function ProfileEditPage() {
  const [name, setName] = useState("");
  const [curPass, setCurPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getProfile().then(data => setName(data.name));
  }, []);

  const saveName = async () => {
    try {
      await updateProfile(name);
      setMsg("Имя обновлено!");
      setTimeout(() => navigate("/profile"), 1000);
    } catch (e) {
      setMsg(e.message || "Не удалось обновить имя");
    }
  };

  const savePass = async () => {
    try {
      await changePassword(curPass, newPass);
      setMsg("Пароль изменён!");
      setCurPass(""); setNewPass("");
    } catch (e) {
      setMsg(e.message || "Не удалось сменить пароль");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-6">
        <Link to="/profile" style={{ display: 'block', marginTop: 20 }}>← Назад</Link>
      <h1 className="text-2xl">Редактировать профиль</h1>

      {msg && <div className="text-green-600">{msg}</div>}

      <section className="space-y-2">
        <label className="block">Имя</label>
        <input
          className="w-full p-2 border rounded"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={saveName}
        >
          Сохранить имя
        </button>
      </section>

      <hr />

      <section className="space-y-2">
        <label className="block">Текущий пароль</label>
        <input
          type="password"
          className="w-full p-2 border rounded"
          value={curPass}
          onChange={e => setCurPass(e.target.value)}
        />

        <label className="block">Новый пароль</label>
        <input
          type="password"
          className="w-full p-2 border rounded"
          value={newPass}
          onChange={e => setNewPass(e.target.value)}
        />

        <button
          className="px-4 py-2 bg-green-600 text-white rounded"
          onClick={savePass}
        >
          Изменить пароль
        </button>
      </section>
    </div>
  );
}
