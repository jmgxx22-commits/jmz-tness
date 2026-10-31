# J-MZ Tness · Manual de Puesta en Producción y Despliegue

¡Felicitaciones! **J-MZ Tness** ha sido transformado en una plataforma de alto rendimiento, multiusuario y potenciada con Inteligencia Artificial (Google Gemini), conservando el 100% de su diseño original, colores, tipografías y algoritmos de progresión.

---

## 1. Ejecución Local

Para probar o ejecutar el proyecto en tu máquina local:

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo en modo fullstack
npm run dev
```

Abre tu navegador en `http://localhost:3000`.

---

## 2. Publicación Gratuita en Netlify ($0 / mes)

El proyecto está preparado para ejecutarse en Netlify sin pagar suscripción:

### Opción A: Despliegue desde GitHub (Recomendado)
1. Sube este código a un repositorio privado o público en GitHub.
2. Ingresa a [Netlify](https://app.netlify.com/) e inicia sesión.
3. Haz clic en **"Add new site"** > **"Import an existing project"** > Selecciona tu repositorio de GitHub.
4. Netlify detectará automáticamente el archivo `netlify.toml` con las configuraciones:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
5. En **Site configuration** > **Environment variables**, agrega tu clave de Gemini:
   - `GEMINI_API_KEY`: tu clave gratuita obtenida de Google AI Studio.
6. Haz clic en **Deploy Site**. En menos de 2 minutos tu sitio estará en vivo con HTTPS y funciones de IA operativas.

---

## 3. Configuración de Firebase Authentication ($0 / mes - Spark Free Tier)

El proyecto ya tiene aprovisionado Firestore y las reglas de seguridad desplegadas. Para habilitar el registro con Correo y con Google:

1. Ve a la consola de Firebase: [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Selecciona el proyecto: **lustrous-aspect-c01dl**
3. En el menú lateral izquierdo, haz clic en **Build (Compilación)** > **Authentication**.
4. Haz clic en **Get Started (Comenzar)**.
5. En la pestaña **Sign-in method**:
   - **Correo electrónico/Contraseña**: Habilítalo y guarda.
   - **Google**: Habilítalo, selecciona tu correo de soporte y guarda.
6. En **Settings** > **Authorized domains**, asegúrate de que el dominio de tu sitio (ej. `gym-progress-mz.netlify.app` o tu dominio personalizado) esté agregado a la lista de dominios autorizados.

---

## 4. Instalación como App (PWA) en iPhone y Android

### En iPhone (iOS):
1. Abre Safari y navega a la URL de tu aplicación.
2. Toca el botón **Compartir** (el ícono del cuadro con la flecha hacia arriba en la barra inferior).
3. Desplázate hacia abajo y selecciona **"Agregar a inicio"** (o "Add to Home Screen").
4. Confirma el nombre **"J-MZ Tness"** y toca **Agregar**.
5. ¡Listo! Se abrirá como una aplicación nativa a pantalla completa sin la barra del navegador.

### En Android:
1. Abre Chrome y visita la aplicación.
2. Aparecerá automáticamente un aviso en la parte inferior **"Agregar J-MZ Tness a la pantalla principal"** o pulsa en los 3 puntos superiores y selecciona **"Instalar aplicación"**.

---

## 5. Migración de Datos Existentes

Si ya tenías entrenamientos, pesos o comidas en la versión anterior:
1. Abre la aplicación en el mismo navegador donde usabas la versión anterior.
2. Verás un cartel naranja destacado: **"Datos Anteriores Detectados"**.
3. Haz clic en **"Importar Datos Anteriores"**.
4. Tus entrenamientos, pesos históricos, metas nutricionales y fotos de IndexedDB quedarán inmediatamente asociados a tu perfil.

---

## 6. Seguridad y Costos Garantizados

- **Costo mensual**: $0.00 USD. Utiliza el plan Spark Gratuito de Firebase y el tier gratuito de Google Gemini API (`gemini-3.1-flash-lite`).
- **Seguridad**: Reglas de Firestore estrictas desplegadas (`firestore.rules`). Ningún usuario puede ver, modificar o alterar los entrenamientos, medidas o fotos de otro usuario.
- **GEMINI_API_KEY**: Nunca se expone al cliente; todas las solicitudes pasan a través del backend seguro (`/api/gemini/*` en local o `.netlify/functions/*` en Netlify).
