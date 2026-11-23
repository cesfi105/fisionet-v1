import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Shield, CheckCircle2, UserCog } from 'lucide-react';

export default function SeguridadRBAC() {
  const { user, registrarAuditoria } = useAuth();
  const [roles, setRoles] = useState([]);
  const [selectedRolId, setSelectedRolId] = useState(2); // Fisioterapeuta por defecto
  const [objetos, setObjetos] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [usuariosRoles, setUsuariosRoles] = useState([]);
  const [mensaje, setMensaje] = useState('');

  const cargarTodo = async () => {
    const { data: r } = await supabase.from('tbl_sec_roles').select('*').order('rol_id');
    const { data: o } = await supabase.from('tbl_sec_objetos').select('*').order('obj_id');
    const { data: p } = await supabase.from('tbl_sec_permisos').select('*');
    const { data: ur } = await supabase
      .from('tbl_sec_usuarios')
      .select('usr_id, usr_nombre_completo, usr_email, tbl_sec_usuarios_roles(rol_id, tbl_sec_roles(rol_nombre))')
      .order('usr_id');

    setRoles(r || []);
    setObjetos(o || []);
    setPermisos(p || []);
    setUsuariosRoles(ur || []);
  };

  useEffect(() => {
    cargarTodo();
  }, []);

  const getPermiso = (objId) => {
    return (
      permisos.find((p) => p.rol_id === selectedRolId && p.obj_id === objId) || {
        per_puede_crear: false,
        per_puede_leer: false,
        per_puede_actualizar: false,
        per_puede_eliminar: false,
      }
    );
  };

  const togglePermiso = async (obj, campo) => {
    const actual = getPermiso(obj.obj_id);
    const nuevoValor = !actual[campo];

    if (actual.per_id) {
      await supabase
        .from('tbl_sec_permisos')
        .update({ [campo]: nuevoValor })
        .eq('per_id', actual.per_id);
    } else {
      await supabase.from('tbl_sec_permisos').insert([
        {
          rol_id: selectedRolId,
          obj_id: obj.obj_id,
          [campo]: nuevoValor,
        },
      ]);
    }

    const rolNombre = roles.find((r) => r.rol_id === selectedRolId)?.rol_codigo;
    await registrarAuditoria(
      user.usr_email,
      'CAMBIO_PERMISO_RBAC',
      'SEGURIDAD_RBAC',
      `Rol ${rolNombre}: ${campo} = ${nuevoValor} en módulo ${obj.obj_codigo}`,
      'EXITOSO'
    );

    setMensaje(`Permiso actualizado para ${obj.obj_nombre}.`);
    cargarTodo();
  };

  const cambiarRolUsuario = async (usr, nuevoRolId) => {
    await supabase.from('tbl_sec_usuarios_roles').delete().eq('usr_id', usr.usr_id);
    await supabase.from('tbl_sec_usuarios_roles').insert([{ usr_id: usr.usr_id, rol_id: parseInt(nuevoRolId, 10) }]);

    const rolObj = roles.find((r) => r.rol_id === parseInt(nuevoRolId, 10));
    await registrarAuditoria(
      user.usr_email,
      'CAMBIO_ROL_USUARIO',
      'SEGURIDAD_RBAC',
      `Usuario ${usr.usr_email} asignado al rol ${rolObj?.rol_codigo}`,
      'EXITOSO'
    );

    setMensaje(`Rol de ${usr.usr_nombre_completo} cambiado a ${rolObj?.rol_nombre}.`);
    cargarTodo();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Control de Acceso Basado en Roles (RBAC)</h1>
        <p className="text-sm text-slate-500 mt-1">
          Administración dinámica de privilegios CRUD por módulo y asignación de roles[cite: 27].
        </p>
      </div>

      {mensaje && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 size={18} />
          <span>{mensaje}</span>
        </div>
      )}

      {/* Selector de Rol */}
      <div className="grid sm:grid-cols-3 gap-4">
        {roles.map((r) => (
          <button
            key={r.rol_id}
            onClick={() => setSelectedRolId(r.rol_id)}
            className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
              selectedRolId === r.rol_id
                ? 'bg-sky-50 border-[#0284C7] shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-900">{r.rol_nombre}</span>
              <Shield size={16} className={selectedRolId === r.rol_id ? 'text-[#0284C7]' : 'text-slate-400'} />
            </div>
            <p className="text-xs font-mono text-[#0284C7] mb-1">{r.rol_codigo}</p>
            <p className="text-xs text-slate-500">{r.rol_descripcion}</p>
          </button>
        ))}
      </div>

      {/* Matriz de Permisos por Módulo */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-800 mb-4">
          Matriz de Permisos — Rol seleccionado:{' '}
          <span className="text-[#0284C7]">{roles.find((r) => r.rol_id === selectedRolId)?.rol_nombre}</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-400">
                <th className="py-3 px-4">Módulo / Objeto</th>
                <th className="py-3 px-4 text-center">Crear</th>
                <th className="py-3 px-4 text-center">Leer (Ver Menú)</th>
                <th className="py-3 px-4 text-center">Actualizar</th>
                <th className="py-3 px-4 text-center">Eliminar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {objetos.map((obj) => {
                const perm = getPermiso(obj.obj_id);
                return (
                  <tr key={obj.obj_id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{obj.obj_nombre}</p>
                      <p className="text-xs font-mono text-slate-400">{obj.obj_codigo} · {obj.obj_ruta}</p>
                    </td>
                    {['per_puede_crear', 'per_puede_leer', 'per_puede_actualizar', 'per_puede_eliminar'].map((campo) => (
                      <td key={campo} className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={!!perm[campo]}
                          onChange={() => togglePermiso(obj, campo)}
                          className="w-4 h-4 accent-[#0284C7] cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asignación de Roles a Usuarios */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <UserCog size={18} className="text-[#0284C7]" /> Asignación de Roles a Usuarios
        </h2>
        <div className="space-y-3">
          {usuariosRoles.map((u) => {
            const rolActualId = u.tbl_sec_usuarios_roles?.[0]?.rol_id || 3;
            return (
              <div key={u.usr_id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-sm font-bold text-slate-800">{u.usr_nombre_completo}</p>
                  <p className="text-xs text-slate-500">{u.usr_email}</p>
                </div>
                <select
                  value={rolActualId}
                  onChange={(e) => cambiarRolUsuario(u, e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 focus:outline-none focus:border-[#0284C7]"
                >
                  {roles.map((r) => (
                    <option key={r.rol_id} value={r.rol_id}>
                      {r.rol_nombre}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
