import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { hashPasswordSHA256 } from '../utils/crypto';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [pending2FAUser, setPending2FAUser] = useState(null);
  const [jwtExpiresAt, setJwtExpiresAt] = useState(null);
  const [loading, setLoading] = useState(true);

  const registrarAuditoria = async (email, tipoAccion, modulo, detalle, estado = 'EXITOSO') => {
    await supabase.from('tbl_sec_bitacora_auditoria').insert([
      {
        usr_email: email,
        aud_tipo_accion: tipoAccion,
        aud_modulo: modulo,
        aud_detalle: detalle,
        aud_direccion_ip: '190.53.21.14',
        aud_estado: estado,
      },
    ]);
  };

  useEffect(() => {
    const savedSession = localStorage.getItem('fisionet_session');
    if (savedSession) {
      const parsed = JSON.parse(savedSession);
      if (new Date(parsed.expiresAt) > new Date()) {
        setUser(parsed.user);
        setRole(parsed.role);
        setPermissions(parsed.permissions);
        setJwtExpiresAt(parsed.expiresAt);
      } else {
        localStorage.removeItem('fisionet_session');
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!jwtExpiresAt || !user) return;
    const interval = setInterval(() => {
      if (new Date() >= new Date(jwtExpiresAt)) {
        registrarAuditoria(user.usr_email, 'JWT_EXPIRADO', 'SEGURIDAD', 'Sesión cerrada por caducidad de token JWT', 'ALERTA');
        logout(true);
        alert('Tu sesión (Token JWT) ha expirado por política de seguridad. Inicia sesión nuevamente.');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [jwtExpiresAt, user]);

  const loginStep1 = async (email, password) => {
    const { data: paramData } = await supabase
      .from('tbl_sec_parametros')
      .select('par_valor')
      .eq('par_codigo', 'MAX_INTENTOS_LOGIN')
      .maybeSingle();
    const maxIntentos = parseInt(paramData?.par_valor || '3', 10);

    const { data: usr, error } = await supabase
      .from('tbl_sec_usuarios')
      .select('*')
      .eq('usr_email', email.trim().toLowerCase())
      .maybeSingle();

    if (error) {
      throw new Error(`Error de BD: ${error.message}`);
    }
    if (!usr) {
      await registrarAuditoria(email, 'LOGIN_FALLIDO', 'AUTENTICACION', 'Intento de acceso con correo inexistente', 'FALLIDO');
      throw new Error('Credenciales inválidas. Verifica tu correo y contraseña.');
    }

    if (usr.usr_estado === 'BLOQUEADO') {
      if (usr.usr_bloqueado_hasta && new Date(usr.usr_bloqueado_hasta) > new Date()) {
        await registrarAuditoria(usr.usr_email, 'ACCESO_DENEGADO_BLOQUEO', 'SEGURIDAD', 'Intento de ingreso en cuenta bloqueada', 'BLOQUEADO');
        throw new Error('Cuenta BLOQUEADA por exceder los 3 intentos fallidos. Contacta al administrador o espera 15 minutos.');
      } else {
        await supabase
          .from('tbl_sec_usuarios')
          .update({ usr_estado: 'ACTIVO', usr_intentos_fallidos: 0, usr_bloqueado_hasta: null })
          .eq('usr_id', usr.usr_id);
        usr.usr_estado = 'ACTIVO';
        usr.usr_intentos_fallidos = 0;
      }
    }

    if (usr.usr_clave_expira_en && new Date(usr.usr_clave_expira_en) < new Date()) {
      await registrarAuditoria(usr.usr_email, 'CLAVE_EXPIRADA', 'SEGURIDAD', 'Contraseña vencida por política de vigencia', 'ALERTA');
      throw new Error('Tu contraseña ha expirado según las políticas globales. Debes renovarla.');
    }

   const inputHash = await hashPasswordSHA256(password);
    if (inputHash !== usr.usr_password_hash) {
      const nuevosIntentos = (usr.usr_intentos_fallidos || 0) + 1;

      if (nuevosIntentos >= maxIntentos) {
        const bloqueoHasta = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        await supabase
          .from('tbl_sec_usuarios')
          .update({
            usr_intentos_fallidos: nuevosIntentos,
            usr_estado: 'BLOQUEADO',
            usr_bloqueado_hasta: bloqueoHasta,
          })
          .eq('usr_id', usr.usr_id);

        await registrarAuditoria(
          usr.usr_email,
          'CUENTA_BLOQUEADA',
          'SEGURIDAD',
          `Cuenta bloqueada tras ${nuevosIntentos} intentos fallidos`,
          'BLOQUEADO'
        );
        throw new Error(`Contraseña incorrecta. Límite de ${maxIntentos} intentos alcanzado: Cuenta BLOQUEADA.`);
      } else {
        await supabase
          .from('tbl_sec_usuarios')
          .update({ usr_intentos_fallidos: nuevosIntentos })
          .eq('usr_id', usr.usr_id);

        await registrarAuditoria(
          usr.usr_email,
          'LOGIN_FALLIDO',
          'AUTENTICACION',
          `Clave incorrecta (Intento ${nuevosIntentos} de ${maxIntentos})`,
          'FALLIDO'
        );
        throw new Error(`Contraseña incorrecta. Intento ${nuevosIntentos} de ${maxIntentos}.`);
      }
    }

    await supabase
      .from('tbl_sec_usuarios')
      .update({ usr_intentos_fallidos: 0, usr_bloqueado_hasta: null })
      .eq('usr_id', usr.usr_id);

    if (usr.usr_mfa_enabled) {
      setPending2FAUser(usr);
      await registrarAuditoria(usr.usr_email, 'CREDENCIALES_VALIDAS_2FA', 'AUTENTICACION', 'Primer factor superado. Esperando código OTP 2FA', 'PENDIENTE');
      return { requires2FA: true };
    } else {
      await finalizarInicioSesion(usr);
      return { requires2FA: false };
    }
  };

const verify2FACode = async (code) => {
    if (!pending2FAUser) throw new Error('No hay una verificación 2FA pendiente.');

    if (code.trim() !== pending2FAUser.usr_mfa_secret) {
      await registrarAuditoria(pending2FAUser.usr_email, '2FA_FALLIDO', 'AUTENTICACION', 'Código OTP 2FA incorrecto', 'FALLIDO');
      throw new Error('Código de verificación 2FA incorrecto. Intenta nuevamente.');
    }

    const usrVerificado = pending2FAUser;
    await registrarAuditoria(usrVerificado.usr_email, '2FA_VERIFICADO', 'AUTENTICACION', 'Doble factor validado correctamente', 'EXITOSO');
    await finalizarInicioSesion(usrVerificado);
    setPending2FAUser(null);
  };

  const finalizarInicioSesion = async (usr) => {
    const { data: usrRol } = await supabase
      .from('tbl_sec_usuarios_roles')
      .select('rol_id, tbl_sec_roles(*)')
      .eq('usr_id', usr.usr_id)
      .maybeSingle();

    const rolObj = usrRol?.tbl_sec_roles || { rol_id: 1, rol_codigo: 'ROL_ADMIN', rol_nombre: 'Administrador' };

    const { data: permsData } = await supabase
      .from('tbl_sec_permisos')
      .select('*, tbl_sec_objetos(*)')
      .eq('rol_id', rolObj.rol_id);

    const { data: jwtParam } = await supabase
      .from('tbl_sec_parametros')
      .select('par_valor')
      .eq('par_codigo', 'JWT_EXPIRACION_SEG')
      .maybeSingle();
    const segundosVigencia = parseInt(jwtParam?.par_valor || '900', 10);
    const expiresAt = new Date(Date.now() + segundosVigencia * 1000).toISOString();

    await supabase
      .from('tbl_sec_usuarios')
      .update({ usr_ultimo_login: new Date().toISOString() })
      .eq('usr_id', usr.usr_id);

    await registrarAuditoria(usr.usr_email, 'LOGIN_EXITOSO', 'AUTENTICACION', `Acceso concedido con rol ${rolObj.rol_codigo}`, 'EXITOSO');

    const sessionPayload = { user: usr, role: rolObj, permissions: permsData || [], expiresAt };
    localStorage.setItem('fisionet_session', JSON.stringify(sessionPayload));

    setUser(usr);
    setRole(rolObj);
    setPermissions(permsData || []);
    setJwtExpiresAt(expiresAt);
  };

  const logout = async (isAuto = false) => {
    if (user && !isAuto) {
      await registrarAuditoria(user.usr_email, 'LOGOUT', 'AUTENTICACION', 'Cierre de sesión manual', 'EXITOSO');
    }
    localStorage.removeItem('fisionet_session');
    setUser(null);
    setRole(null);
    setPermissions([]);
    setPending2FAUser(null);
    setJwtExpiresAt(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        permissions,
        pending2FAUser,
        jwtExpiresAt,
        loading,
        loginStep1,
        verify2FACode,
        logout,
        registrarAuditoria,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);