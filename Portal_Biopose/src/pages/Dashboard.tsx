import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';
import { useDashboard } from '../hooks/useDashboard';

const Dashboard = () => {
  const { showTutorialModal, userName, saveFirstTutorial } = useDashboard();

  return (
    <section className='main_section_container' id='main_section_container'>
      <div className='content_first_section reveal'>
        <div className='section_first_left'>
          <h1>¿Qué es BoiPose?</h1>
          <h3>Estimación de poses humanas</h3>
          <p>
            BoiPose utiliza como base MediaPipe para estimar las diferentes poses 
            del cuerpo humano y generar 14 keypoints como puntos claves al realizar la estimación.
          </p>
        </div>
        <div className='section_first_rigth'>
          <img src='https://aihub.qualcomm.com/_next/image?url=https%3A%2F%2Fqaihub-public-assets.s3.us-west-2.amazonaws.com%2Fqai-hub-models%2Fmodels%2Fopenpose%2Fweb-assets%2Fmodel_demo.png&w=1920&q=75' alt='Demo OpenPose' />
        </div>
      </div>

      <div className='content_second_section reveal delay-100'>
        <div className='cards_container'>
          <h2 className="text-center font-bold text-sky-400 pb-12 text-4xl">Lo que puedes lograr</h2>
          <div className='cards'>
            <div className='card_element rounded-xl overflow-hidden shadow-2xl transform transition hover:-translate-y-2 hover:shadow-cyan-500/50'>
              <div className='content_info_card' id='folder'>
                <h4><Link to='/configuracion-rutas' className='nav-link text-white'>Configuración Personalizada</Link></h4>
              </div>
            </div>
            <div className='card_element rounded-xl overflow-hidden shadow-2xl transform transition hover:-translate-y-2 hover:shadow-cyan-500/50'>
              <div className='content_info_card' id='img'>
                <h4><Link to='/generar-imagenes' className='nav-link text-white font-semibold text-lg'>Detección en Imágenes</Link></h4>
              </div>
            </div>
            <div className='card_element rounded-xl overflow-hidden shadow-2xl transform transition hover:-translate-y-2 hover:shadow-cyan-500/50'>
              <div className='content_info_card' id='video'>
                <h4><Link to='/video-action-multi-person' className='nav-link text-white font-semibold text-lg'>Detección en Videos</Link></h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='content_third_section reveal delay-200'>
        <div className='content_title w-full md:w-1/3 lg:w-1/4'>
          <h2 className='title_third_section shadow-xl rounded-3xl bg-blue-600 text-white p-8 md:p-16 relative overflow-hidden'>
            <span className="relative z-10 text-2xl font-bold">Tiempos de respuesta más rápidos con MediaPipe</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-600 opacity-50 z-0"></div>
          </h2>
        </div>
        <div className='container_graphic_compare flex-grow ml-0 md:ml-12'>
          <div className='openpose_card'>
            <img src='/assets/Openpose.png' alt='OpenPose' />
            <h2>OpenPose</h2>
          </div>
          <div className='mediapipe_card'>
            <img src='/assets/mediapipe.png' alt='MediaPipe' />
            <h2>MediaPipe</h2>
          </div>
          <div className='yolo_card'>
            <img src='/assets/yolo.png' alt='Yolo' />
            <h2>Yolo</h2>
          </div>
        </div>
      </div>

      {showTutorialModal && (
        <div id='modal_first_session' className='modal_first_session'>
          <div className='modal_first_session_sub'>
            <div className='bg_blur'></div>
            <img className='tutorial-img' src='/assets/say_hi_tutorial.gif' alt='Tutorial' />
            <div className='content_modal_first_step'>
              <h1>Bienvenido <span id='userTutorial' className='userTutorial'>{userName}</span></h1>
              
              <div className='content_form'>
                <h3>Antes de continuar, completemos esto:</h3>
                <div className='content_elements'>
                  <label>¿Dónde guardaremos tus imágenes?</label>
                  <p>Crea una carpeta en tu equipo y pega la ruta aqui</p>
                  <input type='text' id='txtPath' placeholder='C:\ ruta_a_tu_carpeta' />

                  <label>¿Cada cuántos frames desea obtener una imagen?</label>
                  <p>Puedes elegir entre 1 - 24 FPS <strong>(Frames Por Segundo)</strong></p>
                  <input type='number' id='txtFPS' placeholder='Elige un valor' min='1' max='24' />

                  <div className='content_button'>
                    <button type='button' className='button_first_tutorial' onClick={saveFirstTutorial}>Continuar</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Dashboard;