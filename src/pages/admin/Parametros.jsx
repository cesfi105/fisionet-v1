import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Sliders, Save, Unlock, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function Parametros() {
  const { user, registrarAuditoria } = useAuth();
  const [parametros, setParametros] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargarDatos = async () => {
    const { data: params } = await supabase.from('tbl_sec_parametros').select('*').order('par_id');
    const { data: usrs } = await supabase.from('tbl_sec_usuarios').select('*').order('usr_id');
    setParametros(params || []);
    setUsuarios(usrs || []);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleValorChange = (id, nuevoValor) => {
    setParametros((prev) =>
      prev.map((p) => (p.par_id === id ? { ...p, par_valor: nuevoValor } : p))
    );
  };

  const guardarParametro = async (param) => {
    setGuardando(true);
    setMensaje('');
    await supabase
      .from('tbl_sec_parametros')
      .update({ par_valor: param.par_valor })
      .eq('par_id', param.par_id);

    await registrarAuditoria(
      user.usr_email,
      'ACTUALIZAR_PARAMETRO',
      'PARAMETROS',
      `Parámetro ${param.par_codigo} actualizado a valor: ${param.par_valor}`,
      'EXITOSO'
    );

    setMensaje(`Parámetro "${param.par_nombre}" guardado correctamente.`);
    setGuardando(false);
  };

  const desbloquearUsuario = async (usr) => {
    await supabase
      .from('tbl_sec_usuarios')
      .update({ usr_estado: 'ACTIVO', usr_intentos_fallidos: 0, usr_bloqueado_hasta: null })
      .eq('usr_id', usr.usr_id);

    await registrarAuditoria(
      user.usr_email,
      'DESBLOQUEO_CUENTA',
      'SEGURIDAD',
      `Cuenta ${usr.usr_email} desbloqueada manualmente por administrador`,
      'EXITOSO'
    );

    setMensaje(`Cuenta ${usr.usr_email} desbloqueada y activa.`);
    cargarDatos();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Políticas de Seguridad y Parámetros Globales</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configuración de umbral de bloqueo por intentos, vigencia de tokens JWT y control de cuentas[cite: 27].
        </p>
      </div>

      {mensaje && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 size={18} />
          <span>{mensaje}</span>
        </div>
      )}

      {/* Tabla de Parámetros Globales */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Sliders size={18} className="text-[#0284C7]" /> Parámetros Activos del Sistema
        </h2>
        <div className="space-y-4">
          {parametros.map((p) => (
            <div
              key={p.par_id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200"
            >
              <div>
                <p className="text-sm font-bold text-slate-800">{p.par_nombre}</p>
                <p className="text-xs text-slate-500">{p.par_descripcion} ({p.par_codigo})</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={p.par_valor}
                  onChange={(e) => handleValorChange(p.par_id, e.target.value)}
                  className="w-28 px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm font-bold text-center focus:outline-none focus:border-[#0284C7]"
                />
                <button
                  onClick={() => guardarParametro(p)}
                  disabled={guardando}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold cursor-pointer"
                >
                  <Save size={14} /> Guardar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estado de Cuentas y Bloqueo por 3 Intentos */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <ShieldAlert size={18} className="text-amber-600" /> Estado de Cuentas e Intentos Fallidos
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-400">
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Correo</th>
                <th className="py-3 px-4">2FA</th>
                <th className="py-3 px-4">Intentos Fallidos</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuarios.map((u) => (
                <tr key={u.usr_id}>
                  <td className="py-3 px-4 font-semibold">{u.usr_nombre_completo}</td>
                  <td className="py-3 px-4 text-slate-600">{u.usr_email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.usr_mfa_enabled ? 'bg-sky-50 text-[#0284C7]' : 'bg-slate-100 text-slate-500'}`}>
                      {u.usr_mfa_enabled ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold">{u.usr_intentos_fallidos}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.usr_estado === 'ACTIVO' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                      {u.usr_estado}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {u.usr_estado === 'BLOQUEADO' ? (
                      <button
                        onClick={() => desbloquearUsuario(u)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold cursor-pointer"
                      >
                        <Unlock size={13} /> Desbloquear
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">Sin bloqueos</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
