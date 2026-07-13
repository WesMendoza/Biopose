import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import CreateAccount from './pages/CreateAccount';
import Dashboard from './pages/Dashboard';
import GestionUsuarios from './pages/GestionUsuarios';
import ConfiguracionRutas from './pages/ConfiguracionRutas';
import GenerarImagenes from './pages/GenerarImagenes';
import CargaImagen from './pages/CargaImagen';
import VerificarImagenes from './pages/VerificarImagenes';
import VideoDetection from './pages/VideoDetection';
import VideoActionMultiPerson from './pages/VideoActionMultiPerson';
import LiveDetection from './pages/LiveDetection';
import LiveActionMultiPerson from './pages/LiveActionMultiPerson';
import Layout from './components/Layout';
import GestionEmpresas from './pages/GestionEmpresas';
import GestionRoles from './pages/GestionRoles';
import ProtectedRoute from './utils/ProtectedRoute';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />

        {/* Protected Routes under /app (Layout) */}
        <Route path="/app" element={<Layout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          
          {/* Dashboard no le pasamos requiredRoute porque es público para todos los logueados */}
          <Route path="dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />

          {/* =================== ADMINISTRACIÓN =================== */}
          <Route path="users" element={
            <ProtectedRoute requiredRoute="/app/users"><GestionUsuarios /></ProtectedRoute>
          } />
          <Route path="gestion-empresas" element={
            <ProtectedRoute requiredRoute="/app/gestion-empresas"><GestionEmpresas /></ProtectedRoute>
          } />
          <Route path="gestion-roles" element={
            <ProtectedRoute requiredRoute="/app/gestion-roles"><GestionRoles /></ProtectedRoute>
          } />

          {/* =================== MÓDULOS DE POSE =================== */}
          <Route path="pose">
            <Route path="routes" element={
              <ProtectedRoute requiredRoute="/app/pose/routes"><ConfiguracionRutas /></ProtectedRoute>
            } />
            <Route path="image" element={
              <ProtectedRoute requiredRoute="/app/pose/image"><CargaImagen /></ProtectedRoute>
            } />
            <Route path="video" element={
              <ProtectedRoute requiredRoute="/app/pose/video"><GenerarImagenes /></ProtectedRoute>
            } />
            <Route path="verify" element={
              <ProtectedRoute requiredRoute="/app/pose/verify"><VerificarImagenes /></ProtectedRoute>
            } />
          </Route>

          {/* =================== DETECCIÓN DE EVENTOS =================== */}
          <Route path="events">
            <Route path="individual">
              <Route path="video" element={
                <ProtectedRoute requiredRoute="/app/events/individual/video"><VideoDetection /></ProtectedRoute>
              } />
              <Route path="live" element={
                <ProtectedRoute requiredRoute="/app/events/individual/live"><LiveDetection /></ProtectedRoute>
              } />
            </Route>
            <Route path="multi">
              <Route path="video" element={
                <ProtectedRoute requiredRoute="/app/events/multi/video"><VideoActionMultiPerson /></ProtectedRoute>
              } />
              <Route path="live" element={
                <ProtectedRoute requiredRoute="/app/events/multi/live"><LiveActionMultiPerson /></ProtectedRoute>
              } />
            </Route>
          </Route>

        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;