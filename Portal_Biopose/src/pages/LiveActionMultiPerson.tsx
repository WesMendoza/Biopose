import React, { useState } from 'react';
import { Camera, StopCircle, PlayCircle, AlertTriangle, Users, RotateCcw, ExternalLink, Search, X, Clock, Flame, Zap } from 'lucide-react';
import { useLiveActionMultiPerson } from '../hooks/useLiveActionMultiPerson';
import type { FinalActionDetection } from '../hooks/useLiveActionMultiPerson';

// =========================================================================
// ICONOS POR TIPO DE EVENTO
// =========================================================================
const ACTION_ICONS: Record<string, React.ReactNode> = {
  PELEAR: <Flame className="w-4 h-4" />,
  DISTURBIO: <Zap className="w-4 h-4" />,
};

const ACTION_COLORS: Record<string, string> = {
  PELEAR: 'bg-red-100 text-red-700 border-red-300',
  DISTURBIO: 'bg-orange-100 text-orange-700 border-orange-300',
};

const ACTION_LABELS_DISPLAY: Record<string, string> = {
  PELEAR: 'Pelea',
  DISTURBIO: 'Disturbio',
};

const LiveActionMultiPerson = () => {
  const {
    isStreaming,
    isFinished,
    framesSkip, setFramesSkip,
    poseMode, setPoseMode,
    operationMode, setOperationMode,
    deviceType, setDeviceType,
    remoteUrl, setRemoteUrl,
    error,
    numPeople,
    realtimeDetections,
    finalDetections,
    imgRef: renderCanvasRef,
    videoRef,
    canvasRef,
    toggleStream,
    resetAll,
    isValidRemoteUrl,
  } = useLiveActionMultiPerson();

  const [showModal, setShowModal] = useState(false);
  const [urlError, setUrlError] = useState(false);

  const handleToggle = () => {
    if (!isStreaming && deviceType === 'remote') {
      if (!remoteUrl || !isValidRemoteUrl(remoteUrl)) {
        setUrlError(true);
        return;
      }
    }
    setUrlError(false);
    toggleStream();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Detección de Acciones en Vivo Multipersona</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-700">Controles de Transmisión</h4>
            <p className="text-gray-500 text-sm">
              El sistema analizará la cámara en busca de peleas o disturbios en tiempo real.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleToggle}
              className={`flex items-center px-4 py-2 rounded-md text-white font-medium transition-colors ${
                isStreaming ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isStreaming ? (
                <><StopCircle className="w-5 h-5 mr-2" />Detener</>
              ) : (
                <><PlayCircle className="w-5 h-5 mr-2" />Empezar detección en vivo</>
              )}
            </button>

            <select
              value={deviceType}
              onChange={(e) => {
                setDeviceType(e.target.value as 'local' | 'remote');
                setUrlError(false);
              }}
              disabled={isStreaming}
              className="px-3 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
            >
              <option value="local">Dispositivo local</option>
              <option value="remote">Dispositivo remoto</option>
            </select>

            <select
              value={operationMode}
              onChange={(e) => setOperationMode(e.target.value)}
              disabled={isStreaming}
              className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="Modo Operativo (Por defecto)">Modo Operativo (Por defecto)</option>
              <option value="Modo Analítico (Esqueletos)">Modo Analítico (Esqueletos)</option>
              <option value="Modo Debug (Tracking)">Modo Debug (Tracking)</option>
            </select>

            <select
              value={poseMode}
              onChange={(e) => setPoseMode(e.target.value as '2D' | '3D')}
              disabled={isStreaming}
              className="px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
            >
              <option value="2D">Estimación postural: 2D</option>
              <option value="3D">Estimación postural: 3D</option>
            </select>

            <button
              onClick={resetAll}
              className="flex items-center px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reiniciar
            </button>
          </div>
        </div>

        {deviceType === 'remote' && (
          <div className="mt-2">
            <input
              type="text"
              value={remoteUrl}
              onChange={(e) => {
                setRemoteUrl(e.target.value);
                setUrlError(false);
              }}
              disabled={isStreaming}
              placeholder="Ingrese la cadena de conexión (HTTP o RTSP), ej: rtsp://192.168.1.100:554/stream"
              className={`w-full px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                urlError ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
              } disabled:opacity-50`}
            />
            {urlError && (
              <span className="text-red-500 text-xs mt-1 block">
                La cadena ingresada no corresponde a una conexión HTTP o RTSP válida.
              </span>
            )}
          </div>
        )}

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100 flex flex-col h-full">
            <h4 className="text-lg font-semibold text-gray-700 flex items-center mb-3">
              <Camera className="w-5 h-5 mr-2 text-indigo-500" />
              Cámara procesada
            </h4>
            <hr className="mb-4 border-gray-200" />

            <div className="flex-grow bg-gray-900 rounded-md flex items-center justify-center overflow-hidden min-h-[400px] relative">
              {isStreaming && (
                <div className="absolute top-4 right-4 flex items-center bg-black/50 px-2 py-1 rounded text-white text-xs z-10">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2" />
                  EN VIVO
                </div>
              )}

              <video 
                ref={videoRef} 
                className="w-full h-full object-contain absolute top-0 left-0"
                style={{ display: (isStreaming && deviceType === 'local') ? 'block' : 'none' }} 
                autoPlay playsInline muted 
              />

              <canvas
                ref={renderCanvasRef}
                className="w-full h-full object-contain absolute top-0 left-0"
                style={{ 
                   display: isStreaming || isFinished ? 'block' : 'none',
                   mixBlendMode: (isStreaming && deviceType === 'local') ? 'screen' : 'normal',
                   pointerEvents: 'none'
                }}
              />

              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {!isStreaming && !isFinished && (
                <div className="text-center p-6 flex flex-col items-center">
                  <Camera className="w-16 h-16 text-gray-600 mb-3 opacity-50" />
                  <p className="text-gray-400 italic">Active la cámara para iniciar la detección en vivo</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">

          {!isStreaming && realtimeDetections.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-700 flex items-center mb-3">
                <AlertTriangle className="w-5 h-5 mr-2 text-indigo-500" />
                Información
              </h4>
              <hr className="mb-4 border-gray-200" />
              <p className="text-sm text-gray-600 mb-3">
                El sistema de redes neuronales identifica interacciones complejas en tiempo real:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Flame className="w-4 h-4 text-red-500" />
                  <span>Peleas y agresiones</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <span>Disturbios / Aglomeraciones anómalas</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 flex-grow">
            <h4 className="text-lg font-semibold text-gray-700 flex items-center mb-3">
              <Users className="w-5 h-5 mr-2 text-indigo-500" />
              Resultados y Alertas
            </h4>
            <hr className="mb-4 border-gray-200" />

            <div className="space-y-4">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <span className="text-xs text-gray-500 uppercase font-semibold">Estado Actual</span>
                <p className="text-sm font-medium mt-1">
                  {isStreaming ? 'Analizando interacciones...' : isFinished ? 'Análisis finalizado' : 'En espera'}
                </p>
              </div>

              {isStreaming && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <span className="text-xs text-blue-500 uppercase font-semibold">Personas en Escena</span>
                  <p className="text-lg font-bold text-blue-700 mt-1">{numPeople}</p>
                </div>
              )}

              <div className={`p-3 rounded-md border ${
                realtimeDetections.length > 0
                  ? 'bg-red-50 border-red-200'
                  : 'bg-green-50 border-green-200'
              }`}>
                <span className={`text-xs uppercase font-semibold ${
                  realtimeDetections.length > 0 ? 'text-red-500' : 'text-green-500'
                }`}>Acciones Detectadas</span>
                <p className={`text-sm font-medium mt-1 ${
                  realtimeDetections.length > 0 ? 'text-red-700' : 'text-green-700'
                }`}>
                  {realtimeDetections.length} acción(es) detectada(s)
                </p>
              </div>

              {realtimeDetections.length > 0 && (
                <div className="space-y-2">
                  {realtimeDetections.map((det, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium ${
                        ACTION_COLORS[det.behavior] || 'bg-gray-100 text-gray-700 border-gray-300'
                      }`}
                    >
                      {ACTION_ICONS[det.behavior] || <AlertTriangle className="w-4 h-4" />}
                      <span>{det.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {isStreaming && (
                <div className="flex items-center justify-center gap-2 text-gray-500 text-sm py-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
                  <span>Analizando...</span>
                </div>
              )}

              {isFinished && finalDetections.length > 0 && (
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Visualizar Resultados ({finalDetections.length} eventos)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">
                Acciones Detectadas en Vivo
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow">
              {finalDetections.length === 0 ? (
                <p className="text-center text-gray-500">No se detectaron acciones.</p>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">
                    Resumen de acciones detectadas durante la sesión:
                  </p>
                  {finalDetections.map((det: FinalActionDetection, idx: number) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-2 p-3 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                         <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                              ACTION_COLORS[det.tipo_evento] || 'bg-gray-100 text-gray-700 border-gray-300'
                            }`}
                          >
                            {ACTION_ICONS[det.tipo_evento]}
                            {ACTION_LABELS_DISPLAY[det.tipo_evento] || det.tipo_evento}
                         </span>
                         <div className="flex items-center gap-1 text-indigo-600 font-mono text-sm font-bold min-w-[60px]">
                           <Clock className="w-4 h-4" />
                           {formatTime(det.segundo_inicio)} - {formatTime(det.segundo_fin)}
                         </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 flex justify-between">
                        <span>Duración: {Math.max(0, Math.round((det.segundo_fin - det.segundo_inicio) * 10) / 10)}s</span>
                        <span>Confianza: {Math.round(det.confianza * 100)}%</span>
                        <span>Personas involucradas: {det.personas_involucradas}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveActionMultiPerson;