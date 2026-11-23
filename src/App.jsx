import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Verify2FA from './pages/auth/Verify2FA';
import Layout from './components/Layout';
import Parametros from './pages/admin/Parametros';
import SeguridadRBAC from './pages/admin/SeguridadRBAC';
import Auditoria from './pages/admin/Auditoria';
import { PanelEjecutivo, CitasView, FisioterapeutasView, CoberturaView } from './pages/VistasOperativas';
import { ShieldOff } from 'lucide-react';

function ProtectedRoute({ moduloCodigo, children }) {
  const { permissions } = useAuth();
  const tienePermiso = permissions.some(
    (p) => p.tbl_sec_objetos?.obj_codigo === moduloCodigo && p.per_puede_leer
  );

  if (!tienePermiso) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-10 text-center max-w-lg mx-auto mt-10">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <ShieldOff size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Acceso Denegado (Error 403)</h2>
        <p className="text-sm text-slate-500 mt-2">
          Tu rol actual no posee privilegios de lectura sobre este módulo según la matriz de seguridad RBAC[cite: 27].
        </p>
      </div>
    );
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/verify-2fa" element={<Verify2FA />} />

          <Route element={<Layout />}>
            <Route
              path="/panel"
              element={
                <ProtectedRoute moduloCodigo="MOD_PANEL">
                  <PanelEjecutivo />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citas"
              element={
                <ProtectedRoute moduloCodigo="MOD_CITAS">
                  <CitasView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fisioterapeutas"
              element={
                <ProtectedRoute moduloCodigo="MOD_FISIOS">
                  <FisioterapeutasView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cobertura"
              element={
                <ProtectedRoute moduloCodigo="MOD_COBERTURA">
                  <CoberturaView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parametros"
              element={
                <ProtectedRoute moduloCodigo="MOD_PARAMETROS">
                  <Parametros />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seguridad"
              element={
                <ProtectedRoute moduloCodigo="MOD_RBAC">
                  <SeguridadRBAC />
                </ProtectedRoute>
              }
            />
            <Route
              path="/auditoria"
              element={
                <ProtectedRoute moduloCodigo="MOD_AUDITORIA">
                  <Auditoria />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}