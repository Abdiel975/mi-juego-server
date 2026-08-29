const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
app.set('trust proxy', true);

// Middleware de captura de IP
app.use((req, res, next) => {
    let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    if (userIp && userIp.includes(',')) {
        userIp = userIp.split(',')[0].trim();
    }
    const userAgent = req.headers['user-agent'] || 'Desconocido';

    if (req.url === '/') {
        console.log(`[CONEXIÓN DETECTADA] IP: ${userIp} | Dispositivo: ${userAgent}`);
    }
    next();
});

// Ruta del juego Minecraft 2D
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Minecraft 2D Web</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: sans-serif; user-select: none; }
        body { background: #1a1a1a; color: #fff; overflow: hidden; }
        canvas { display: block; background: #60a5fa; }
        #menu { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #111827; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 10; }
        .card { background: #1f2937; padding: 30px; border-radius: 12px; border: 1px solid #374151; text-align: center; width: 300px; }
        h1 { color: #10b981; margin-bottom: 10px; font-size: 2rem; }
        input { width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #4b5563; background: #374151; color: #fff; text-align: center; }
        button { width: 100%; padding: 10px; border-radius: 6px; border: none; background: #10b981; color: #fff; font-weight: bold; cursor: pointer; }
        button:hover { background: #059669; }
        #hud { position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.7); padding: 10px; border-radius: 6px; font-size: 0.85rem; pointer-events: none; }
    </style>
</head>
<body>
    <div id="menu">
        <div class="card">
            <h1>Minecraft 2D</h1>
            <input type="text" id="nick" value="Steve" placeholder="Tu apodo">
            <button onclick="start()">JUGAR</button>
        </div>
    </div>

    <div id="hud">
        <b>Controles:</b><br>
        A / D: Moverse<br>
        W / Espacio: Saltar<br>
        Clic Izquierdo: Minar (picar abajo)<br>
        Clic Derecho: Colocar bloque
    </div>

    <canvas id="cv"></canvas>

    <script>
    function start() {
        document.getElementById('menu').style.display = 'none';
        init();
    }

    function init() {
        const cv = document.getElementById('cv');
        const ctx = cv.getContext('2d');
        cv.width = window.innerWidth;
        cv.height = window.innerHeight;

        const TILE = 32;
        const COLS = Math.ceil(cv.width / TILE);
        const ROWS = 60;
        const surface = 10;

        // Generación de terreno
        let map = [];
        for (let r = 0; r < ROWS; r++) {
            map[r] = [];
            for (let c = 0; c < COLS; c++) {
                if (r < surface) map[r][c] = 0; // Aire
                else if (r === surface) map[r][c] = 1; // Pasto
                else if (r < surface + 5) map[r][c] = 2; // Tierra
                else map[r][c] = 3; // Piedra
            }
        }

        const colors = { 1: '#22c55e', 2: '#854d0e', 3: '#6b7280' };

        const p = {
            x: Math.floor(COLS / 2) * TILE,
            y: (surface - 2) * TILE,
            w: 22,
            h: 48,
            vx: 0,
            vy: 0,
            ground: false
        };

        const keys = {};
        window.addEventListener('keydown', e => keys[e.code] = true);
        window.addEventListener('keyup', e => keys[e.code] = false);

        cv.addEventListener('mousedown', e => {
            const c = Math.floor(e.clientX / TILE);
            const r = Math.floor(e.clientY / TILE);
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
                if (e.button === 0) map[r][c] = 0; // Romper bloque
                else if (e.button === 2 && map[r][c] === 0) map[r][c] = 3; // Colocar piedra
            }
        });
        cv.addEventListener('contextmenu', e => e.preventDefault());

        function loop() {
            if (keys['KeyA'] || keys['ArrowLeft']) p.vx = -4;
            else if (keys['KeyD'] || keys['ArrowRight']) p.vx = 4;
            else p.vx = 0;

            if ((keys['KeyW'] || keys['Space']) && p.ground) {
                p.vy = -9;
                p.ground = false;
            }

            p.vy += 0.4;
            p.x += p.vx;
            p.y += p.vy;
            p.ground = false;

            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    if (map[r][c] !== 0) {
                        const bx = c * TILE;
                        const by = r * TILE;
                        if (p.x < bx + TILE && p.x + p.w > bx && p.y < by + TILE && p.y + p.h > by) {
                            if (p.vy > 0 && p.y + p.h - p.vy <= by) {
                                p.y = by - p.h;
                                p.vy = 0;
                                p.ground = true;
                            }
                        }
                    }
                }
            }

            ctx.clearRect(0, 0, cv.width, cv.height);

            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    if (map[r][c] !== 0) {
                        ctx.fillStyle = colors[map[r][c]];
                        ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
                        ctx.strokeStyle = '#000';
                        ctx.strokeRect(c * TILE, r * TILE, TILE, TILE);
                    }
                }
            }

            ctx.fillStyle = '#ef4444';
            ctx.fillRect(p.x, p.y, p.w, p.h);

            requestAnimationFrame(loop);
        }
        loop();
    }
    </script>
</body>
</html>`);
});

app.listen(PORT, () => console.log(`Servidor activo en el puerto ${PORT}`)); 
