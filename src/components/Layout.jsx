import { useState, useEffect } from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HeartPulse,
  LayoutDashboard,
  Calendar,
  Stethoscope,
  MapPin,
  Sliders,
  Shield,
  FileText,
  LogOut,
  Clock,
  Menu,
  X,
} from 'lucide-react';

const MENU_ITEMS = [
  { codigo: 'MOD_PANEL', label: 'Panel Ejecutivo', ruta: '/panel', icon: LayoutDashboard },
  { codigo: 'MOD_CITAS', label: 'Gestión de Citas', ruta: '/citas', icon: Calendar },
  { codigo: 'MOD_FISIOS', label: 'Fisioterapeutas', ruta: '/fisioterapeutas', icon: Stethoscope },
  { codigo: 'MOD_COBERTURA', label: 'Cobertura (Geocercas)', ruta: '/cobertura', icon: MapPin },
  { codigo: 'MOD_PARAMETROS', label: 'Políticas y Parámetros', ruta: '/parametros', icon: Sliders },
  { codigo: 'MOD_RBAC', label: 'Seguridad RBAC', ruta: '/seguridad', icon: Shield },
  { codigo: 'MOD_AUDITORIA', label: 'Bitácora de Auditoría', ruta: '/auditoria', icon: FileText },
];

export default function Layout() {
  const { user, role, permissions, jwtExpiresAt, logout, loading } = useAuth();
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!jwtExpiresAt) return;
    const updateTimer = () => {
      const diff = Math.max(0, Math.floor((new Date(jwtExpiresAt) - new Date()) / 1000));
      setSecondsLeft(diff);
    };
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [jwtExpiresAt]);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  // Filtrar menú dinámicamente según matriz RBAC (per_puede_leer = true)
  const allowedMenus = MENU_ITEMS.filter((item) =>
    permissions.some((p) => p.tbl_sec_objetos?.obj_codigo === item.codigo && p.per_puede_leer)
  );

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-[#0F172A]">
      {/* Sidebar Escritorio */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col justify-between p-5 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-8 px-1">
            <div className="w-10 h-10 rounded-xl bg-[#0284C7] text-white flex items-center justify-center shadow-sm">
              <HeartPulse size={22} />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight block leading-none">FisioNet</span>
              <span className="text-[11px] text-slate-400 font-medium">Tegucigalpa, M.D.C.</span>
            </div>
          </div>

          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Menú Autorizado (RBAC)
          </p>
          <nav className="space-y-1">
            {allowedMenus.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.ruta}
                  to={item.ruta}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? 'bg-sky-50 text-[#0284C7] font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50 mb-3">
            <p className="text-xs font-bold text-slate-800 truncate">{user.usr_nombre_completo}</p>
            <p className="text-[11px] text-[#0284C7] font-semibold">{role?.rol_nombre}</p>
          </div>
          <button
            onClick={() => logout(false)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition cursor-pointer"
          >
            <LogOut size={15} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenedor Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Superior */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-[#0284C7] border border-sky-100">
              Rol activo: {role?.rol_codigo}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
              <Clock size={14} className="text-amber-600" />
              <span>Token JWT expira en:</span>
              <strong className="font-mono">{formatTime(secondsLeft)}</strong>
            </div>
          </div>
        </header>

        {/* Menú Móvil Desplegable */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-1">
            {allowedMenus.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.ruta}
                  to={item.ruta}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                      isActive ? 'bg-sky-50 text-[#0284C7] font-bold' : 'text-slate-600'
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
            <button
              onClick={() => logout(false)}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold"
            >
              <LogOut size={15} /> Cerrar Sesión
            </button>
          </div>
        )}

        {/* Contenido de la Ruta Activa */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
