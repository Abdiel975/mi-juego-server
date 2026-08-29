const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
app.set('trust proxy', true);

app.use((req, res, next) => {
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userIp = rawIp ? rawIp.split(',')[0].trim() : 'IP no detectada';
    const userAgent = req.headers['user-agent'] || 'Desconocido';

    console.log(`[CUMPLEAÑOS] Visita de IP: ${userIp} | Dispositivo: ${userAgent}`);
    next();
});

// Página de broma de cumpleaños
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>¡FELIZ CUMPLEAÑOS! 🎉</title>
            <style>
                body { background: #0f172a; color: #fff; font-family: 'Arial', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; text-align: center; }
                .card { background: #1e293b; padding: 40px; border-radius: 20px; border: 2px solid #38bdf8; box-shadow: 0 10px 25px rgba(0,0,0,0.5); max-width: 400px; }
                h1 { color: #facc15; font-size: 2.5rem; margin-bottom: 10px; }
                p { font-size: 1.2rem; color: #cbd5e1; }
                .btn { background: #22c55e; color: white; border: none; padding: 15px 25px; font-size: 1rem; border-radius: 10px; cursor: pointer; font-weight: bold; margin-top: 15px; }
                .btn:hover { background: #16a34a; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>🎂 ¡Feliz Cumple! 🎂</h1>
                <p>Te preparé una sorpresa especial de cumpleaños en código...</p>
                <button class="btn" onclick="alert('🎉 ¡Que la pases genial hoy bro! Un abrazo. 🎉')">Abrir Regalo</button>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Servidor activo en puerto ${PORT}`);
});
