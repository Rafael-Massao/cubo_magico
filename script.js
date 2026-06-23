const cube = document.getElementById('cube');
const compass = document.getElementById('compass');
const miniCube = document.getElementById('mini-cube');

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotation = { x: -30, y: 45 };

let cubeState = [];

const faceColors = {
    U: 'color-U', D: 'color-D', F: 'color-F',
    B: 'color-B', L: 'color-L', R: 'color-R'
};

function initCube() {
    cubeState = [];
    let idCounter = 0;
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                if (x === 0 && y === 0 && z === 0) continue;
                cubeState.push({
                    id: `piece-${idCounter++}`,
                    x: x, y: y, z: z,
                    faces: {
                        U: y === -1 ? faceColors.U : null,
                        D: y === 1  ? faceColors.D : null,
                        F: z === 1  ? faceColors.F : null,
                        B: z === -1 ? faceColors.B : null,
                        L: x === -1 ? faceColors.L : null,
                        R: x === 1  ? faceColors.R : null
                    }
                });
            }
        }
    }
    renderCube();
    updateSceneRotation();
}

function renderCube() {
    if (!cube) return;
    cube.innerHTML = ''; 
    cubeState.forEach(p => {
        const pieceDiv = document.createElement('div');
        pieceDiv.className = 'piece';
        pieceDiv.setAttribute('data-id', p.id);
        pieceDiv.style.transform = `translate3d(${p.x * 102}px, ${p.y * 102}px, ${p.z * 102}px)`;

        if (p.faces.U) createSticker(pieceDiv, 'rotateX(90deg) translateZ(50px)', p.faces.U);
        if (p.faces.D) createSticker(pieceDiv, 'rotateX(-90deg) translateZ(50px)', p.faces.D);
        if (p.faces.F) createSticker(pieceDiv, 'rotateY(0deg) translateZ(50px)', p.faces.F);
        if (p.faces.B) createSticker(pieceDiv, 'rotateY(180deg) translateZ(50px)', p.faces.B);
        if (p.faces.L) createSticker(pieceDiv, 'rotateY(-90deg) translateZ(50px)', p.faces.L);
        if (p.faces.R) createSticker(pieceDiv, 'rotateY(90deg) translateZ(50px)', p.faces.R);
        cube.appendChild(pieceDiv);
    });
}

function createSticker(parent, transform, colorClass) {
    const sticker = document.createElement('div');
    sticker.className = `sticker ${colorClass}`;
    sticker.style.transform = transform;
    parent.appendChild(sticker);
}

function permuteFaces(faces, f1, f2, f3, f4) {
    let tmp = faces[f1];
    faces[f1] = faces[f2];
    faces[f2] = faces[f3];
    faces[f3] = faces[f4];
    faces[f4] = tmp;
}

function moveLayer(filterFn, rotationAxis, angle, updateStateFn) {
    if (cube.querySelector('.pivot-tmp')) return; 
    const pivot = document.createElement('div');
    pivot.className = 'pivot-tmp';
    pivot.style.position = 'absolute';
    pivot.style.width = '100%';
    pivot.style.height = '100%';
    pivot.style.transformStyle = 'preserve-3d';
    cube.appendChild(pivot);

    const piecesToMove = cubeState.filter(filterFn);
    piecesToMove.forEach(p => {
        const el = cube.querySelector(`[data-id="${p.id}"]`);
        if (el) pivot.appendChild(el);
    });

    pivot.getBoundingClientRect(); 
    pivot.style.transition = 'transform 0.22s ease-in-out';
    pivot.style.transform = `rotate${rotationAxis}(${angle}deg)`;

    setTimeout(() => {
        piecesToMove.forEach(updateStateFn);
        pivot.remove();
        renderCube(); 
    }, 220);
}

// --- MOVIMENTOS ---
function rotateTop() { 
    moveLayer(p => p.y === -1, 'Y', -90, (p) => {
        let oldX = p.x; let oldZ = p.z; p.x = -oldZ; p.z = oldX;
        permuteFaces(p.faces, 'F', 'R', 'B', 'L');
    });
}
function rotateBottom() { 
    moveLayer(p => p.y === 1, 'Y', 90, (p) => {
        let oldX = p.x; let oldZ = p.z; p.x = oldZ; p.z = -oldX;
        permuteFaces(p.faces, 'F', 'L', 'B', 'R');
    });
}
function rotateRight() { 
    moveLayer(p => p.x === 1, 'X', -90, (p) => {
        let oldY = p.y; let oldZ = p.z; p.y = oldZ; p.z = -oldY;
        permuteFaces(p.faces, 'F', 'U', 'B', 'D');
    });
}
function rotateLeft() { 
    moveLayer(p => p.x === -1, 'X', 90, (p) => {
        let oldY = p.y; let oldZ = p.z; p.y = -oldZ; p.z = oldY;
        permuteFaces(p.faces, 'F', 'D', 'B', 'U');
    });
}
function rotateFront() { 
    moveLayer(p => p.z === 1, 'Z', 90, (p) => {
        let oldX = p.x; let oldY = p.y; p.x = -oldY; p.y = oldX;
        permuteFaces(p.faces, 'U', 'L', 'D', 'R');
    });
}
function rotateBack() { 
    moveLayer(p => p.z === -1, 'Z', -90, (p) => {
        let oldX = p.x; let oldY = p.y; p.x = oldY; p.y = -oldX;
        permuteFaces(p.faces, 'U', 'R', 'D', 'L');
    });
}

function rotateTopPrime() {
    moveLayer(p => p.y === -1, 'Y', 90, (p) => {
        let oldX = p.x; let oldZ = p.z; p.x = oldZ; p.z = -oldX;
        permuteFaces(p.faces, 'F', 'L', 'B', 'R');
    });
}
function rotateBottomPrime() {
    moveLayer(p => p.y === 1, 'Y', -90, (p) => {
        let oldX = p.x; let oldZ = p.z; p.x = -oldZ; p.z = oldX;
        permuteFaces(p.faces, 'F', 'R', 'B', 'L');
    });
}
function rotateRightPrime() {
    moveLayer(p => p.x === 1, 'X', 90, (p) => {
        let oldY = p.y; let oldZ = p.z; p.y = -oldZ; p.z = oldY;
        permuteFaces(p.faces, 'F', 'D', 'B', 'U');
    });
}
function rotateLeftPrime() {
    moveLayer(p => p.x === -1, 'X', -90, (p) => {
        let oldY = p.y; let oldZ = p.z; p.y = oldZ; p.z = -oldY;
        permuteFaces(p.faces, 'F', 'U', 'B', 'D');
    });
}
function rotateFrontPrime() {
    moveLayer(p => p.z === 1, 'Z', -90, (p) => {
        let oldX = p.x; let oldY = p.y; p.x = oldY; p.y = -oldX;
        permuteFaces(p.faces, 'U', 'R', 'D', 'L');
    });
}
function rotateBackPrime() {
    moveLayer(p => p.z === -1, 'Z', 90, (p) => {
        let oldX = p.x; let oldY = p.y; p.x = -oldY; p.y = oldX;
        permuteFaces(p.faces, 'U', 'L', 'D', 'R');
    });
}

function updateSceneRotation() {
    const transformStr = `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;
    if (cube) cube.style.transform = transformStr;
    if (compass) compass.style.transform = transformStr;
    if (miniCube) miniCube.style.transform = transformStr; // Sincroniza o mini cubo
}

// Eventos de clique
document.getElementById('btn-u').addEventListener('click', rotateTop);
document.getElementById('btn-u-prime').addEventListener('click', rotateTopPrime);
document.getElementById('btn-d').addEventListener('click', rotateBottom);
document.getElementById('btn-d-prime').addEventListener('click', rotateBottomPrime);
document.getElementById('btn-f').addEventListener('click', rotateFront);
document.getElementById('btn-f-prime').addEventListener('click', rotateFrontPrime);
document.getElementById('btn-b').addEventListener('click', rotateBack);
document.getElementById('btn-b-prime').addEventListener('click', rotateBackPrime);
document.getElementById('btn-l').addEventListener('click', rotateLeft);
document.getElementById('btn-l-prime').addEventListener('click', rotateLeftPrime);
document.getElementById('btn-r').addEventListener('click', rotateRight);
document.getElementById('btn-r-prime').addEventListener('click', rotateRightPrime);

// Teclado
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    const isPrime = e.shiftKey;
    if (isPrime) {
        switch(key) {
            case 'u': rotateTopPrime(); break;
            case 'd': rotateBottomPrime(); break;
            case 'f': rotateFrontPrime(); break;
            case 'b': rotateBackPrime(); break;
            case 'l': rotateLeftPrime(); break;
            case 'r': rotateRightPrime(); break;
        }
    } else {
        switch(key) {
            case 'u': rotateTop(); break;
            case 'd': rotateBottom(); break;
            case 'f': rotateFront(); break;
            case 'b': rotateBack(); break;
            case 'l': rotateLeft(); break;
            case 'r': rotateRight(); break;
        }
    }
});

// Drag do mouse
document.addEventListener('mousedown', (e) => {
    if(e.clientX > 340) {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    }
});
document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaMove = { x: e.clientX - previousMousePosition.x, y: e.clientY - previousMousePosition.y };
    rotation.y += deltaMove.x * 0.4;
    rotation.x -= deltaMove.y * 0.4;
    updateSceneRotation();
    previousMousePosition = { x: e.clientX, y: e.clientY };
});
document.addEventListener('mouseup', () => { isDragging = false; });

initCube();