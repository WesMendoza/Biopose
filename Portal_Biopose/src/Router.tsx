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

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />
        
        {/* Protected Routes Wrapper could go here */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<GestionUsuarios />} />
          
          <Route path="/pose/routes" element={<ConfiguracionRutas />} />
          <Route path="/pose/image" element={<CargaImagen />} />
          <Route path="/pose/video" element={<GenerarImagenes />} />
          <Route path="/pose/verify" element={<VerificarImagenes />} />

          <Route path="/events/individual/video" element={<VideoDetection />} />
          <Route path="/events/individual/live" element={<LiveDetection />} />
          
          <Route path="/events/multi/video" element={<VideoActionMultiPerson />} />
          <Route path="/events/multi/live" element={<LiveActionMultiPerson />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;