# J-MZ Tness · Seguimiento Físico & Entrenamiento con IA

Plataforma integral de seguimiento físico, nutrición, evolución fotográfica y rutinas de entrenamiento inteligente potenciadas con Google Gemini AI y sincronización en la nube con Firebase.

---

## 📁 Estructura del Proyecto

```
jmz-tness/
├── package.json               # Configuración de dependencias y scripts de ejecución
├── netlify.toml               # Configuración de despliegue para Netlify y redirección de APIs
├── tsconfig.json              # Configuración de TypeScript
├── vite.config.ts             # Configuración del empaquetador Vite y Tailwind CSS v4
├── index.html                 # Punto de entrada HTML con meta tags PWA
├── server.ts                  # Servidor backend Express para desarrollo y API de Gemini
├── DEPLOY_INSTRUCTIONS.md     # Guía detallada de despliegue a producción ($0/mes)
│
├── netlify/
│   └── functions/             # Funciones serverless para Netlify ($0/mes)
│       ├── chat.ts            # Entrenador virtual con Gemini
│       ├── generate-routine.ts# Generador de rutinas personalizadas
│       └── analyze-meal.ts    # Análisis de comidas por visión computacional
│
├── server/
│   └── geminiBackend.ts       # Lógica server-side compartida para llamadas seguras a Gemini
│
├── src/
│   ├── App.tsx                # Componente principal y navegación
│   ├── main.tsx               # Registro de React y Service Worker PWA
│   ├── index.css              # Estilos Tailwind y tema oscuro #121212
│   ├── components/            # Componentes de interfaz (Entrenos, IA, Fotos, Peso, etc.)
│   ├── context/               # AuthContext (Firebase Auth) y DataContext (Firestore Sync)
│   ├── services/              # Motor de sobrecarga progresiva, Firebase SDK, Storage
│   ├── constants/             # Rutinas predeterminadas y catálogo de alimentos
│   └── types/                 # Definiciones e interfaces de TypeScript
│
├── public/
│   ├── manifest.json          # Manifiesto PWA para instalación en iPhone y Android
│   ├── sw.js                  # Service worker para caché sin conexión
│   ├── favicon.ico            # Ícono original de la aplicación
│   └── icon-192.png           # Ícono PWA para móviles
│
└── backup/
    └── legacy-v1/             # Respaldo original intacto de la versión anterior
```

---

## 🚀 Inicio Rápido (Local)

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   Copia `.env.example` a `.env` y coloca tu clave gratuita de Gemini:
   ```bash
   GEMINI_API_KEY="tu_clave_de_google_ai_studio"
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🌐 Despliegue en Netlify ($0 / mes)

1. Sube este proyecto a tu repositorio de GitHub.
2. En [Netlify](https://app.netlify.com/), conecta tu repositorio.
3. Netlify leerá automáticamente `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Functions directory:** `netlify/functions`
4. En **Site Settings** > **Environment variables**, agrega:
   - `GEMINI_API_KEY`
5. ¡Listo! Tu aplicación estará publicada con funciones de IA operativas y certificado SSL gratuito.
