import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  MapPin,
  Stethoscope,
  Activity,
  CheckCircle,
  ShieldCheck,
  Star,
  Banknote,
  Building2,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';

export function PanelEjecutivo() {
  const { user, role } = useAuth();
  const [vistaPaciente, setVistaPaciente] = useState('inicio');
  const [fisioSeleccionado, setFisioSeleccionado] = useState({
    nombre: 'Lic. Sofía Paz',
    especialidad: 'Fisioterapia Ortopédica',
    colegiacion: 'Col. 04521',
  });
  const [fechaSel, setFechaSel] = useState('Mié 18');
  const [horaSel, setHoraSel] = useState('10:00 a. m.');
  const [citaConfirmada, setCitaConfirmada] = useState(false);

  const [notasClinicas, setNotasClinicas] = useState(
    'Paciente presenta mejora del 30% en rango de movilidad lumbar tras ejercicios de fortalecimiento y electroterapia. Se indica continuar plan.'
  );
  const [apoyoPsicologico, setApoyoPsicologico] = useState(true);
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [visitaGuardada, setVisitaGuardada] = useState(false);

  // VISTA 1: ROL PACIENTE
  if (role?.rol_codigo === 'ROL_PACIENTE') {
    if (vistaPaciente === 'agendar') {
      return (
        <div className="max-w-lg mx-auto space-y-5 pb-16">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setVistaPaciente('inicio');
                setCitaConfirmada(false);
              }}
              className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Agendar Cita Domiciliaria</h1>
              <p className="text-xs text-slate-500">Elige cuándo y dónde recibir tu sesión.</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-[#0284C7] font-bold flex items-center justify-center text-base">
                SP
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-sm">{fisioSeleccionado.nombre}</h2>
                <p className="text-xs text-slate-500">{fisioSeleccionado.especialidad}</p>
                <p className="text-[11px] text-slate-400">{fisioSeleccionado.colegiacion}</p>
              </div>
            </div>
            <CheckCircle2 size={20} className="text-[#0284C7]" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-slate-800">Fecha disponible</span>
              <span className="text-xs text-slate-400">Noviembre 2026</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { dia: 'Lun', num: '16' },
                { dia: 'Mar', num: '17' },
                { dia: 'Mié', num: '18' },
              ].map((f) => {
                const label = `${f.dia} ${f.num}`;
                const activo = fechaSel === label;
                return (
                  <button
                    key={label}
                    onClick={() => setFechaSel(label)}
                    className={`py-3 rounded-2xl border text-center transition cursor-pointer ${
                      activo
                        ? 'bg-sky-50 border-[#0284C7] text-[#0284C7]'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="block text-xs text-slate-400">{f.dia}</span>
                    <span className="text-lg font-extrabold">{f.num}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="block text-sm font-bold text-slate-800 mb-2">Bloque horario</span>
            <div className="grid grid-cols-3 gap-2">
              {['08:00 a. m.', '10:00 a. m.', '02:00 p. m.'].map((h) => (
                <button
                  key={h}
                  onClick={() => setHoraSel(h)}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    horaSel === h
                      ? 'bg-[#0284C7] text-white border-[#0284C7]'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-sm font-bold text-slate-800 mb-2">Dirección de visita</span>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center gap-3">
              <MapPin size={18} className="text-[#0284C7] shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-800">Col. Kennedy, Bloque 5, Casa 12</p>
                <p className="text-xs text-slate-400">Tegucigalpa, Honduras</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-600">Tarifa de sesión</span>
              <span className="text-xl font-extrabold text-[#0284C7]">L 450.00</span>
            </div>
            <p className="text-xs text-slate-500">
              Pago manual en sitio: <strong>Efectivo o Transferencia</strong>
            </p>
          </div>

          {citaConfirmada ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm text-center font-semibold">
              ¡Solicitud confirmada para el {fechaSel} a las {horaSel}! Notificación enviada al fisioterapeuta.
            </div>
          ) : (
            <button
              onClick={() => setCitaConfirmada(true)}
              className="w-full py-3.5 rounded-2xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-sm shadow-sm cursor-pointer"
            >
              Confirmar solicitud de cita
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto space-y-5 pb-16">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hola, {user?.usr_nombre_completo}</h1>
          <p className="text-xs text-slate-500">Portal del Paciente · Tegucigalpa, M.D.C.</p>
        </div>

        <div className="bg-gradient-to-r from-[#0284C7] to-[#0369A1] rounded-3xl p-6 text-white shadow-md">
          <h2 className="text-xl font-extrabold leading-snug">Tu recuperación, sin salir de casa.</h2>
          <p className="text-xs text-sky-100 mt-1 mb-4">Atención profesional certificada, cerca de ti.</p>
          <button
            onClick={() => setVistaPaciente('agendar')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-[#0284C7] font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-sky-50 transition cursor-pointer"
          >
            <Calendar size={17} /> Agendar cita a domicilio
          </button>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-slate-800">Estamos cerca de ti</h3>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Con cobertura
            </span>
          </div>
          <div className="bg-sky-100/70 border border-sky-200 rounded-2xl p-5 relative overflow-hidden">
            <div className="border-2 border-dashed border-[#0284C7] rounded-2xl p-6 text-center bg-white/60">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-xs font-bold text-slate-800 shadow-xs">
                <MapPin size={14} className="text-[#0284C7]" /> Tu ubicación · Col. Palmira / Tegucigalpa
              </span>
              <p className="text-[11px] text-slate-500 mt-2">Geocerca activa: Bulevar Morazán · El Centro · Kennedy</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-2.5">Fisioterapeutas cercanos</h3>
          <div className="space-y-3">
            {[
              { nombre: 'Lic. Sofía Paz', esp: 'Fisioterapia musculoesquelética', dist: '3.2 km · 10 min', rating: '4.9', ini: 'SP' },
              { nombre: 'Lic. Diego Flores', esp: 'Rehabilitación deportiva', dist: '4.1 km · 15 min', rating: '4.8', ini: 'DF' },
            ].map((f) => (
              <div
                key={f.nombre}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#0284C7] font-bold flex items-center justify-center">
                    {f.ini}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900">{f.nombre}</p>
                    <p className="text-xs text-slate-500">{f.esp}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{f.dist}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-500 flex items-center justify-end gap-1 mb-1.5">
                    <Star size={12} fill="currentColor" /> {f.rating}
                  </span>
                  <button
                    onClick={() => {
                      setFisioSeleccionado({ nombre: f.nombre, especialidad: f.esp, colegiacion: 'Col. 04521' });
                      setVistaPaciente('agendar');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-[#0284C7] text-[#0284C7] hover:text-white text-xs font-bold transition cursor-pointer"
                  >
                    Seleccionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // VISTA 2: ROL FISIOTERAPEUTA
  if (role?.rol_codigo === 'ROL_FISIO') {
    return (
      <div className="max-w-lg mx-auto space-y-5 pb-16">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Finalizar Visita y Evolución</h1>
          <p className="text-xs text-slate-500">Registro clínico obligatorio · {user?.usr_nombre_completo}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-sky-100 text-[#0284C7] font-bold flex items-center justify-center">
              AM
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900">Ana Martínez</h2>
              <p className="text-xs text-slate-500">Cita en curso · 10:00 a. m.</p>
              <p className="text-[11px] text-slate-400">Col. Kennedy, Bloque 5, Casa 12</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
            En Sitio
          </span>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-sm font-bold text-slate-800">Notas de evolución clínica</label>
            <span className="text-[11px] font-semibold text-slate-400">Obligatorio *</span>
          </div>
          <textarea
            rows={4}
            value={notasClinicas}
            onChange={(e) => setNotasClinicas(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-700 focus:outline-none focus:border-[#0284C7]"
          />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-800">Apoyo psicológico complementario</p>
            <p className="text-xs text-slate-500">Recomendar seguimiento emocional</p>
          </div>
          <button
            type="button"
            onClick={() => setApoyoPsicologico(!apoyoPsicologico)}
            className={`w-12 h-7 rounded-full p-1 transition cursor-pointer ${
              apoyoPsicologico ? 'bg-[#0284C7]' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                apoyoPsicologico ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold text-slate-800">Cobro manual en sitio</span>
            <span className="text-xl font-extrabold text-[#0284C7]">L 450.00</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setMetodoPago('Efectivo')}
              className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border cursor-pointer ${
                metodoPago === 'Efectivo'
                  ? 'bg-[#0284C7] text-white border-[#0284C7]'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              <Banknote size={15} /> Efectivo
            </button>
            <button
              type="button"
              onClick={() => setMetodoPago('Transferencia')}
              className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border cursor-pointer ${
                metodoPago === 'Transferencia'
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              <Building2 size={15} /> Transferencia
            </button>
          </div>
        </div>

        {visitaGuardada ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm text-center font-semibold">
            Evolución guardada en expediente clínico y pago ({metodoPago}) registrado correctamente.
          </div>
        ) : (
          <button
            onClick={() => setVisitaGuardada(true)}
            className="w-full py-3.5 rounded-2xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-sm shadow-sm cursor-pointer"
          >
            Guardar evolución y finalizar visita
          </button>
        )}
      </div>
    );
  }

  // VISTA 3: ROL ADMINISTRADOR
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
          Esta versión V1 integra el núcleo de autenticación segura, políticas globales, control de acceso basado en roles (RBAC)
          y bitácora de auditoría inmutable conectado en tiempo real con Supabase PostgreSQL. Utiliza el menú lateral izquierdo
          para navegar según los privilegios asignados a tu rol.
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
