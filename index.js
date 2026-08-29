const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
app.set('trust proxy', true);

app.use((req, res, next) => {
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userIp = rawIp ? rawIp.split(',')[0].trim() : 'IP no detectada';
    const userAgent = req.headers['user-agent'] || 'Desconocido';

    console.log(`[JUGADOR CONECTADO] IP: ${userIp} | Dispositivo: ${userAgent}`);
    next();
});

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Mini Minecraft 3D</title>
            <style>
                body { margin: 0; overflow: hidden; font-family: sans-serif; }
                #crosshair { position: absolute; top: 50%; left: 50%; width: 10px; height: 10px; background: white; transform: translate(-50%, -50%); border-radius: 50%; pointer-events: none; border: 1px solid black; }
                #instructions { position: absolute; top: 10px; left: 10px; color: white; background: rgba(0,0,0,0.7); padding: 10px; border-radius: 8px; }
            </style>
        </head>
        <body>
            <div id="crosshair"></div>
            <div id="instructions">
                <b>🎮 Feliz Cumple 🎉</b><br>
                • Clic en la pantalla para controlar la cámara<br>
                • W, A, S, D = Moverse<br>
                • Clic Izquierdo = Poner Bloque<br>
                • Clic Derecho = Quitar Bloque
            </div>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/PointerLockControls.js"></script>
            <script>
                const scene = new THREE.Scene();
                scene.background = new THREE.Color(0x87ceeb);

                const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
                const renderer = new THREE.WebGLRenderer();
                renderer.setSize(window.innerWidth, window.innerHeight);
                document.body.appendChild(renderer.domElement);

                const light = new THREE.DirectionalLight(0xffffff, 1);
                light.position.set(10, 20, 10).normalize();
                scene.add(light);
                scene.add(new THREE.AmbientLight(0x404040));

                const controls = new THREE.PointerLockControls(camera, document.body);
                document.body.addEventListener('click', () => controls.lock());

                // Crear Terreno de Cubos
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const material = new THREE.MeshLambertMaterial({ color: 0x557a2b });
                const blocks = [];

                for (let x = -5; x <= 5; x++) {
                    for (let z = -5; z <= 5; z++) {
                        const cube = new THREE.Mesh(geometry, material);
                        cube.position.set(x, 0, z);
                        scene.add(cube);
                        blocks.push(cube);
                    }
                }

                camera.position.set(0, 2, 5);

                // Movimiento
                let moveF = false, moveB = false, moveL = false, moveR = false;
                document.addEventListener('keydown', (e) => {
                    if (e.code === 'KeyW') moveF = true;
                    if (e.code === 'KeyS') moveB = true;
                    if (e.code === 'KeyA') moveL = true;
                    if (e.code === 'KeyD') moveR = true;
                });
                document.addEventListener('keyup', (e) => {
                    if (e.code === 'KeyW') moveF = false;
                    if (e.code === 'KeyS') moveB = false;
                    if (e.code === 'KeyA') moveL = false;
                    if (e.code === 'KeyD') moveR = false;
                });

                function animate() {
                    requestAnimationFrame(animate);
                    if (controls.isLocked) {
                        if (moveF) controls.moveForward(0.1);
                        if (moveB) controls.moveForward(-0.1);
                        if (moveL) controls.moveRight(-0.1);
                        if (moveR) controls.moveRight(0.1);
                    }
                    renderer.render(scene, camera);
                }
                animate();
            </script>
        </body>
        </html>
    `);
});

app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
