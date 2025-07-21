// web/src/components/Layout.jsx
import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-primary">Pet‑Project</Link>
        <nav className="space-x-6">
          <Link to="/chats"  className="text-gray-600 hover:text-primary">Чаты</Link>
          <Link to="/posts"  className="text-gray-600 hover:text-primary">Лента</Link>
          <Link to="/profile"className="text-gray-600 hover:text-primary">Профиль</Link>
        </nav>
      </header>

      <main className="flex-grow w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-white shadow-inner py-4 text-center text-sm text-gray-500">
        © 2025 Pet‑Project
      </footer>
    </div>
  );
}
