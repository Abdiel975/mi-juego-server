const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
app.set('trust proxy', true);

// Registro de IP en tiempo real
app.use((req, res, next) => {
    let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    if (userIp && userIp.includes(',')) {
        userIp = userIp.split(',')[0].trim();
    }
    const userAgent = req.headers['user-agent'] || 'Desconocido';

    if (req.url === '/') {
        console.log(`\n========================================`);
        console.log(`🎯 [JUGADOR CONECTADO]`);
        console.log(`📍 IP: ${userIp}`);
        console.log(`📱 Dispositivo: ${userAgent}`);
        console.log(`========================================\n`);
    }
    next();
});

// Juego de Minecraft 2D con excavación hacia abajo
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>CraftWorld 2D - Mining Edition</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; font-family: sans-serif; user-select: none; }
                body { background: #111; color: #fff; overflow: hidden; }
                canvas { display: block; background: #60a5fa; }
                #hud { position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.7); padding: 12px; border-radius: 8px; border: 1px solid #444; font-size: 0.9rem; }
            </style>
        </head>
        <body>

        <div id="hud">
            <b>🎮 Minecraft 2D Web</b><br>
            • A / D o Flechas = Moverse<br>
            • Espacio / W = Saltar<br>
            • Clic Izquierdo = Picar / Romper bloque<br>
            • Clic Derecho = Poner bloque
        </div>

        <canvas id="game"></canvas>

        <script>
        const canvas = document.getElementById('game');
        const ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const TILE_SIZE = 32;
        const COLS = Math.ceil(canvas.width / TILE_SIZE);
        const ROWS = 60; // Profundidad hacia abajo

        const BLOCKS = { AIR: 0, GRASS: 1, DIRT: 2, STONE: 3 };
        const COLOR_MAP = {
            [BLOCKS.GRASS]: '#4ade80',
            [BLOCKS.DIRT]: '#854d0e',
            [BLOCKS.STONE]: '#6b7280'
        };

        // Generar terreno profundo
        let world = [];
        const surfaceY = 12;

        for (let r = 0; r < ROWS; r++) {
            world[r] = [];
            for (let c = 0; c < COLS; c++) {
                if (r < surfaceY) world[r][c] = BLOCKS.AIR;
                else if (r === surfaceY) world[r][c] = BLOCKS.GRASS;
                else if (r < surfaceY + 5) world[r][c] = BLOCKS.DIRT;
                else world[r][c] = BLOCKS.STONE;
            }
        }

        const player = {
            x: Math.floor(COLS / 2) * TILE_SIZE,
            y: (surfaceY - 2) * TILE_SIZE,
            width: 22,
            height: 50,
            vx: 0,
            vy: 0,
            grounded: false
        };

        const keys = {};
        window.addEventListener('keydown', e => keys[e.code] = true);
        window.addEventListener('keyup', e => keys[e.code] = false);

        // Picar hacia abajo o poner bloques
        canvas.addEventListener('mousedown', e => {
            const rect = canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            const col = Math.floor(clickX / TILE_SIZE);
            const row = Math.floor(clickY / TILE_SIZE);

            if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
                if (e.button === 0) world[row][col] = BLOCKS.AIR; // Destruir bloque
                else if (e.button === 2 && world[row][col] === BLOCKS.AIR) world[row][col] = BLOCKS.STONE; // Construir
            }
        });
        canvas.addEventListener('contextmenu', e => e.preventDefault());

        function update() {
            if (keys['KeyA'] || keys['ArrowLeft']) player.vx = -4;
            else if (keys['KeyD'] || keys['ArrowRight']) player.vx = 4;
            else player.vx = 0;

            if ((keys['Space'] || keys['KeyW'] || keys['ArrowUp']) && player.grounded) {
                player.vy = -9;
                player.grounded = false;
            }

            player.vy += 0.4; // Gravedad
            player.x += player.vx;
            player.y += player.vy;

            player.grounded = false;

            // Colisiones con bloques
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    if (world[r][c] !== BLOCKS.AIR) {
                        const bx = c * TILE_SIZE;
                        const by = r * TILE_SIZE;

                        if (player.x < bx + TILE_SIZE && player.x + player.width > bx &&
                            player.y < by + TILE_SIZE && player.y + player.height > by) {
                            
                            if (player.vy > 0 && player.y + player.height - player.vy <= by) {
                                player.y = by - player.height;
                                player.vy = 0;
                                player.grounded = true;
                            }
                        }
                    }
                }
            }
        }

        function render() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    const block = world[r][c];
                    if (block !== BLOCKS.AIR) {
                        ctx.fillStyle = COLOR_MAP[block];
                        ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                        ctx.strokeStyle = '#000';
                        ctx.strokeRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    }
                }
            }

            // Dibujar personaje
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(player.x, player.y, player.width, player.height);
        }

        function loop() {
            update();
            render();
            requestAnimationFrame(loop);
        }
        loop();
        </script>
        </body>
        </html>
    `);
});

app.listen(PORT, () => console.log(`Servidor activo en el puerto ${PORT}`));
