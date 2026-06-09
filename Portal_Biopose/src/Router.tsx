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

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default root -> show login first */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />

        {/* Protected Routes under /app (Layout) */}
        <Route path="/app" element={<Layout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<GestionUsuarios />} />

          <Route path="pose">
            <Route path="routes" element={<ConfiguracionRutas />} />
            <Route path="image" element={<CargaImagen />} />
            <Route path="video" element={<GenerarImagenes />} />
            <Route path="verify" element={<VerificarImagenes />} />
          </Route>

          <Route path="events">
            <Route path="individual">
              <Route path="video" element={<VideoDetection />} />
              <Route path="live" element={<LiveDetection />} />
            </Route>
            <Route path="multi">
              <Route path="video" element={<VideoActionMultiPerson />} />
              <Route path="live" element={<LiveActionMultiPerson />} />
            </Route>
          </Route>

          <Route path="gestion-empresas" element={<GestionEmpresas />} />
          <Route path="gestion-roles" element={<GestionRoles />} />
        </Route>

        {/* Fallback: redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;