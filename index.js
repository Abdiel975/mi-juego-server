const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// Configuración obligatoria para leer IPs reales detrás del proxy de Render
app.set('trust proxy', true);

// Middleware de registro de IP
app.use((req, res, next) => {
    // 1. Intentar obtener la IP desde las cabeceras del proxy
    let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

    // 2. Limpiar la IP si viene con una lista de proxys
    if (userIp && userIp.includes(',')) {
        userIp = userIp.split(',')[0].trim();
    }

    const userAgent = req.headers['user-agent'] || 'Desconocido';

    // Evitar registrar archivos estáticos o peticiones internas repetitivas
    if (req.url === '/') {
        console.log(`\n========================================`);
        console.log(`🎯 [NUEVA CONEXIÓN DETECTADA]`);
        console.log(`📍 IP: ${userIp}`);
        console.log(`📱 Dispositivo: ${userAgent}`);
        console.log(`========================================\n`);
    }
    
    next();
});

// Ruta principal con la plantilla del juego estilo Minecraft 2D
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>CraftWorld Online v1.0.4</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; user-select: none; }
                body, html { width: 100%; height: 100%; overflow: hidden; background: #1a1a1a; color: white; }
                #menu { position: absolute; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('https://images.unsplash.com/photo-1627856013091-fed6e4e30025?q=80&w=1000') center/cover; z-index: 10; }
                .title { font-size: 3.5rem; text-shadow: 4px 4px #000; color: #55ff55; font-weight: 900; margin-bottom: 5px; }
                .subtitle { font-size: 1.1rem; color: #aaa; margin-bottom: 25px; }
                .box { background: rgba(0, 0, 0, 0.8); padding: 30px; border-radius: 12px; border: 2px solid #555; text-align: center; width: 320px; }
                input[type="text"] { width: 100%; padding: 12px; font-size: 1rem; border-radius: 6px; border: none; margin-bottom: 15px; text-align: center; background: #333; color: #fff; }
                .btn { width: 100%; padding: 12px; font-size: 1.1rem; background: #2e7d32; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
                .btn:hover { background: #388e3c; }
                #game-ui { display: none; width: 100%; height: 100%; position: relative; }
                canvas { display: block; background: #70b5ff; }
                #hud { position: absolute; top: 15px; left: 15px; background: rgba(0,0,0,0.6); padding: 10px 20px; border-radius: 8px; border: 1px solid #444; }
            </style>
        </head>
        <body>
            <div id="menu">
                <h1 class="title">CRAFTWORLD</h1>
                <p class="subtitle">v1.0.4 Web Edition</p>
                <div class="box">
                    <input type="text" id="nickname" placeholder="Nombre de usuario" value="Jugador1">
                    <button class="btn" onclick="startGame()">ENTRAR AL SERVIDOR</button>
                </div>
            </div>
            <div id="game-ui">
                <div id="hud">Servidor: US-East-1 | Ping: 24ms</div>
                <canvas id="gameCanvas"></canvas>
            </div>
            <script>
                function startGame() {
                    document.getElementById('menu').style.display = 'none';
                    document.getElementById('game-ui').style.display = 'block';
                    initGame();
                }
                function initGame() {
                    const canvas = document.getElementById('gameCanvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                    const tileSize = 40;
                    let player = { x: canvas.width / 2, y: canvas.height / 2 - 100, vx: 0, vy: 0, size: 30, grounded: false };
                    let keys = {};
                    let blocks = [];
                    for (let x = 0; x < canvas.width; x += tileSize) {
                        for (let y = canvas.height - 200; y < canvas.height; y += tileSize) {
                            let color = (y === canvas.height - 200) ? '#557a2b' : '#8b5a2b';
                            blocks.push({ x, y, width: tileSize, height: tileSize, color });
                        }
                    }
                    window.addEventListener('keydown', e => keys[e.code] = true);
                    window.addEventListener('keyup', e => keys[e.code] = false);
                    canvas.addEventListener('mousedown', (e) => {
                        const rect = canvas.getBoundingClientRect();
                        const mx = Math.floor((e.clientX - rect.left) / tileSize) * tileSize;
                        const my = Math.floor((e.clientY - rect.top) / tileSize) * tileSize;
                        if (e.button === 0) blocks.push({ x: mx, y: my, width: tileSize, height: tileSize, color: '#557a2b' });
                        else if (e.button === 2) blocks = blocks.filter(b => !(b.x === mx && b.y === my));
                    });
                    canvas.addEventListener('contextmenu', e => e.preventDefault());
                    function loop() {
                        if (keys['KeyA'] || keys['ArrowLeft']) player.vx = -4;
                        else if (keys['KeyD'] || keys['ArrowRight']) player.vx = 4;
                        else player.vx = 0;
                        if ((keys['KeyW'] || keys['Space']) && player.grounded) { player.vy = -12; player.grounded = false; }
                        player.vy += 0.6;
                        player.x += player.vx;
                        player.y += player.vy;
                        player.grounded = false;
                        blocks.forEach(b => {
                            if (player.x < b.x + b.width && player.x + player.size > b.x &&
                                player.y < b.y + b.height && player.y + player.size > b.y) {
                                if (player.vy > 0 && player.y + player.size - player.vy <= b.y) {
                                    player.y = b.y - player.size;
                                    player.vy = 0;
                                    player.grounded = true;
                                }
                            }
                        });
                        if (player.y > canvas.height) { player.x = canvas.width / 2; player.y = 100; player.vy = 0; }
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        blocks.forEach(b => {
                            ctx.fillStyle = b.color;
                            ctx.fillRect(b.x, b.y, b.width, b.height);
                            ctx.strokeStyle = '#000';
                            ctx.strokeRect(b.x, b.y, b.width, b.height);
                        });
                        ctx.fillStyle = '#ff3333';
                        ctx.fillRect(player.x, player.y, player.size, player.size);
                        ctx.fillStyle = '#fff';
                        ctx.fillText(document.getElementById('nickname').value, player.x - 5, player.y - 8);
                        requestAnimationFrame(loop);
                    }
                    loop();
                }
            </script>
        </body>
        </html>
    `);
});

app.listen(PORT, () => console.log(`Servidor activo en el puerto ${PORT}`));
