const express = require('express');
const app = express();

// Render asigna el puerto automáticamente mediante process.env.PORT
const PORT = process.env.PORT || 3000;

// Configuración para que Express confíe en los proxies de Render (indispensable para leer la IP real)
app.set('trust proxy', true);

app.use((req, res, next) => {
    // Captura la IP real del visitante
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    // Limpia la IP en caso de que devuelva una lista
    const userIp = rawIp ? rawIp.split(',')[0].trim() : 'IP no detectada';
    const userAgent = req.headers['user-agent'] || 'Desconocido';

    // Imprime la IP en los logs del servidor
    console.log(`[CONEXIÓN DETECTADA] IP: ${userIp} | Dispositivo: ${userAgent}`);
    next();
});

// Página de inicio de tu juego
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Cargando Juego...</title>
            <style>
                body { background: #111; color: #fff; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .card { background: #222; padding: 40px; border-radius: 10px; text-align: center; border: 1px solid #444; }
                .spinner { border: 4px solid #333; border-top: 4px solid #00ff88; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
        </head>
        <body>
            <div class="card">
                <h2>Cargando juego web...</h2>
                <div class="spinner"></div>
                <p>Conectando al servidor del juego...</p>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Servidor activo en el puerto ${PORT}`);
});