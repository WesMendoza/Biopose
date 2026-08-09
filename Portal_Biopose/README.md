# Portal BioPose - FrontEnd

Este es el frontend del proyecto **BioPose** desarrollado con React, TypeScript y Vite.

---

## 🛠️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:
* **Node.js** (versión 18 o superior recomendada)
* **npm** (incluido con Node.js)

---

## 🚀 Instalación de Dependencias

Para instalar todas las librerías necesarias del proyecto, ejecuta el siguiente comando en la terminal desde la carpeta `Portal_Biopose`:

```powershell
npm install
```

---

## 🌍 Manejo de Entornos y Archivos `.env`

El proyecto está configurado para manejar dos ambientes mediante archivos de variables de entorno y modos de Vite:

1. **Ambiente Desplegado (Producción)**:
   * Administrado por el archivo [.env](.env).
   * Apunta a la API pública de producción:
     ```env
     VITE_API_BASE_URL=https://16.58.233.154.nip.io
     ```

2. **Ambiente Local (Desarrollo)**:
   * Administrado por el archivo [.env.dev](.env.dev).
   * Apunta a tu servidor Django local:
     ```env
     VITE_API_BASE_URL=http://127.0.0.1:8000
     ```

---

## 💻 Comandos del Proyecto

### 1. Iniciar en Desarrollo (Local - Apuntando a Backend Local)
Levanta la aplicación localmente conectándose a tu backend local (`http://127.0.0.1:8000`):
```powershell
npm run dev
```

### 2. Compilar para Producción
Genera la versión compilada y optimizada para producción (usará la API de producción configurada en el archivo `.env`):
```powershell
npm run build
```
* Generará una carpeta llamada `/dist` con los archivos listos para desplegar.

### 3. Probar la versión de Producción Localmente
Levanta un servidor local para probar la versión generada en `/dist`:
```powershell
npm run preview
```

---

## 📁 Estructura de Scripts en `package.json`

Los scripts configurados en el proyecto son:

```json
"scripts": {
  "dev": "vite --mode dev",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```
