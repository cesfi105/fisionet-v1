import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { FileText, RefreshCw, Lock } from 'lucide-react';

export default function Auditoria() {
  const [logs, setLogs] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [cargando, setCargando] = useState(false);

  const cargarBitacora = async () => {
    setCargando(true);
    const { data } = await supabase
      .from('tbl_sec_bitacora_auditoria')
      .select('*')
      .order('aud_id', { ascending: false })
      .limit(50);
    setLogs(data || []);
    setCargando(false);
  };

  useEffect(() => {
    cargarBitacora();
  }, []);

  const logsFiltrados = logs.filter(
    (l) =>
      (l.usr_email || '').toLowerCase().includes(filtro.toLowerCase()) ||
      l.aud_tipo_accion.toLowerCase().includes(filtro.toLowerCase()) ||
      l.aud_detalle.toLowerCase().includes(filtro.toLowerCase())
  );

  const badgeEstado = (estado) => {
    if (estado === 'EXITOSO') return 'bg-emerald-50 text-emerald-700';
    if (estado === 'BLOQUEADO' || estado === 'FALLIDO') return 'bg-red-50 text-red-700';
    return 'bg-amber-50 text-amber-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bitácora de Auditoría Forense</h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
            <Lock size={14} className="text-[#0284C7]" /> Registro inmutable (Append-Only) de eventos de seguridad[cite: 27].
          </p>
        </div>

        <button
          onClick={cargarBitacora}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold cursor-pointer self-start"
        >
          <RefreshCw size={15} className={cargando ? 'animate-spin' : ''} /> Actualizar Logs
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FileText size={18} className="text-[#0284C7]" /> Eventos Registrados ({logsFiltrados.length})
          </h2>
          <input
            type="text"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Filtrar por usuario, acción o detalle..."
            className="w-full sm:w-72 px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0284C7]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-400">
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">Fecha y Hora</th>
                <th className="py-3 px-3">Usuario</th>
                <th className="py-3 px-3">IP Origen</th>
                <th className="py-3 px-3">Acción</th>
                <th className="py-3 px-3">Detalle</th>
                <th className="py-3 px-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logsFiltrados.map((log) => (
                <tr key={log.aud_id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono text-xs text-slate-400">#{log.aud_id}</td>
                  <td className="py-3 px-3 text-xs text-slate-600 whitespace-nowrap">
                    {new Date(log.aud_fecha_hora).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{log.usr_email || 'Sistema'}</td>
                  <td className="py-3 px-3 font-mono text-xs text-slate-500">{log.aud_direccion_ip}</td>
                  <td className="py-3 px-3 font-mono text-xs font-bold text-[#0284C7]">{log.aud_tipo_accion}</td>
                  <td className="py-3 px-3 text-xs text-slate-600">{log.aud_detalle}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${badgeEstado(log.aud_estado)}`}>
                      {log.aud_estado}
                    </span>
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