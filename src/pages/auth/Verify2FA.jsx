import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';

export default function Verify2FA() {
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, pending2FAUser, verify2FACode } = useAuth();
  const navigate = useNavigate();

  // Si ya inició sesión completamente, ir directo al panel
  if (user) {
    return <Navigate to="/panel" replace />;
  }

  // Si no hay usuario pendiente de 2FA, volver al login
  if (!pending2FAUser) {
    return <Navigate to="/login" replace />;
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await verify2FACode(code);
      navigate('/panel', { replace: true });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-6 cursor-pointer"
        >
          <ArrowLeft size={15} /> Volver al inicio de sesión
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center mb-3">
            <ShieldCheck size={30} />
          </div>
          <h2 className="text-xl font-bold text-[#0F172A]">Verificación en Dos Pasos (2FA)</h2>
          <p className="text-sm text-slate-500 mt-1">
            Ingresa el código OTP de 6 dígitos asociado a{' '}
            <span className="font-medium text-slate-700">{pending2FAUser.usr_email}</span>
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle size={17} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="w-full text-center tracking-[0.5em] text-2xl font-bold py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0284C7]"
          />

          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="w-full py-3 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-semibold text-sm transition cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Validando token...' : 'Verificar y Entrar'}
          </button>
        </form>

        <div className="mt-5 p-3 rounded-xl bg-sky-50 border border-sky-100 text-xs text-sky-800 text-center">
          Código de prueba activo: <strong>{pending2FAUser.usr_mfa_secret}</strong>
        </div>
      </div>
    </div>
  );
}