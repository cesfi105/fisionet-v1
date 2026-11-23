import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Stethoscope, Activity, CheckCircle, ShieldCheck } from 'lucide-react';

export function PanelEjecutivo() {
  const { user, role } = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hola, {user?.usr_nombre_completo}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Panel principal de FisioNet · Sesión verificada como <strong>{role?.rol_nombre}</strong>.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
            <span>Citas Hoy (Tegucigalpa)</span>
            <Calendar size={18} className="text-[#0284C7]" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">12</p>
          <p className="text-xs text-emerald-600 mt-1 font-medium">+3 respecto a ayer</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
            <span>Fisioterapeutas Activos</span>
            <Stethoscope size={18} className="text-[#0284C7]" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">9</p>
          <p className="text-xs text-slate-500 mt-1">Colegiación verificada</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
            <span>Geocercas Activas</span>
            <MapPin size={18} className="text-[#0284C7]" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">3 Zonas</p>
          <p className="text-xs text-slate-500 mt-1">Palmira, Kennedy, Lomas</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
            <span>Seguridad del Sistema</span>
            <ShieldCheck size={18} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">Protegido</p>
          <p className="text-xs text-slate-500 mt-1">SHA-256 · 2FA · RBAC activo</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Activity size={18} className="text-[#0284C7]" /> Resumen Operativo — Entregable V1
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
         """"
        </p>
      </div>
    </div>
  );
}

export function CitasView() {
  const citas = [
    { id: 'CIT-101', paciente: 'Ana Martínez', fisio: 'Lic. Sofía Paz', zona: 'Col. Kennedy', hora: '10:00 AM', estado: 'Confirmada' },
    { id: 'CIT-102', paciente: 'Carlos Ruiz', fisio: 'Lic. Sofía Paz', zona: 'Col. Palmira', hora: '02:00 PM', estado: 'Pendiente' },
  ];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Gestión de Citas Domiciliarias</h1>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase text-slate-400">
              <th className="py-3 px-4">Código</th>
              <th className="py-3 px-4">Paciente</th>
              <th className="py-3 px-4">Fisioterapeuta</th>
              <th className="py-3 px-4">Zona (Tegucigalpa)</th>
              <th className="py-3 px-4">Horario</th>
              <th className="py-3 px-4">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {citas.map((c) => (
              <tr key={c.id}>
                <td className="py-3 px-4 font-mono font-bold text-[#0284C7]">{c.id}</td>
                <td className="py-3 px-4 font-semibold">{c.paciente}</td>
                <td className="py-3 px-4">{c.fisio}</td>
                <td className="py-3 px-4">{c.zona}</td>
                <td className="py-3 px-4">{c.hora}</td>
                <td className="py-3 px-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-[#0284C7]">{c.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function FisioterapeutasView() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Directorio de Fisioterapeutas</h1>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900">Lic. Sofía Paz</h3>
          <p className="text-sm text-slate-500">Especialidad: Rehabilitación Ortopédica · Colegiación #HN-4482</p>
        </div>
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
          <CheckCircle size={14} /> Validado
        </span>
      </div>
    </div>
  );
}

export function CoberturaView() {
  const zonas = [
    { nombre: 'Zona Centro - Palmira', fisios: 4, estado: 'Activa' },
    { nombre: 'Zona Kennedy - Miraflores', fisios: 5, estado: 'Activa' },
    { nombre: 'Zona Lomas - Morazán', fisios: 3, estado: 'Activa' },
  ];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Zonas de Cobertura Geográfica (Tegucigalpa, M.D.C.)</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        {zonas.map((z) => (
          <div key={z.nombre} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="font-bold text-slate-900">{z.nombre}</p>
            <p className="text-xs text-slate-500 mt-1">{z.fisios} fisioterapeutas asignados</p>
            <span className="inline-block mt-3 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
              {z.estado}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

