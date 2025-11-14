import { Link, useLocation } from "react-router-dom";
import { Home, AlertTriangle, BarChart3, Compass, LogOut, User } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export default function Navigation() {
  const location = useLocation();
  const { isAuthenticated, logout, guestMode } = useAuthStore();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Links principales */}
          <div className="flex gap-6">
            <NavLink to="/" icon={<Home size={18} />} active={isActive("/")}>
              Inicio
            </NavLink>

            <NavLink
              to="/alerts"
              icon={<AlertTriangle size={18} />}
              active={isActive("/alerts")}
            >
              Alertas
            </NavLink>

            <NavLink
              to="/statistics"
              icon={<BarChart3 size={18} />}
              active={isActive("/statistics")}
            >
              Estadísticas
            </NavLink>

            <NavLink
              to="/gps"
              icon={<Compass size={18} />}
              active={isActive("/gps")}
            >
              GPS
            </NavLink>
          </div>

          {/* Profile & Logout */}
          <div className="flex items-center gap-4">
            {isAuthenticated() && (
              <NavLink
                to="/profile"
                icon={<User size={18} />}
                active={isActive("/profile")}
              >
                Perfil
              </NavLink>
            )}

            {(isAuthenticated() || guestMode) && (
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
              >
                <LogOut size={18} />
                <span className="text-sm font-medium">Salir</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

interface NavLinkProps {
  to: string;
  active?: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function NavLink({ to, active, icon, children }: Readonly<NavLinkProps>) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 py-3 px-2 border-b-2 text-sm font-medium transition-colors ${
        active
          ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
          : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}
