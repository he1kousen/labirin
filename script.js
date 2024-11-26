const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');

const baseCellSize = 40; // Ukuran dasar setiap kotak
let cellSize = baseCellSize; // Ukuran kotak yang dapat berubah sesuai level
let currentLevel = 1; // Level awal
let score = 0; // Skor awal
let isGameActive = true; // Cegah input selama reset
let maze, player, goal;

// Function untuk memulai permainan
function startGame() {
    updateHUD(); // Update HUD pertama kali
    startNewLevel(); // Mulai level 1
    document.getElementById('tips').textContent = "Gunakan arrow untuk menggerakkan"; // Menambahkan teks tips
}

// Function untuk menggambar labirin
function drawMaze() {
    for (let row = 0; row < maze.length; row++) {
        for (let col = 0; col < maze[row].length; col++) {
            if (maze[row][col] === 1) {
                // Dinding dengan bayangan untuk kesan gelap
                ctx.fillStyle = '#333'; // Dinding lebih gelap
                ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                ctx.fillStyle = '#222'; // Bayangan pada dinding
                ctx.fillRect(
                    col * cellSize + 3,
                    row * cellSize + 3,
                    cellSize - 6,
                    cellSize - 6
                );
            } else {
                // Jalan dengan efek 3D dan warna gelap
                ctx.fillStyle = '#222'; // Warna jalan lebih gelap
                ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                ctx.fillStyle = '#444'; // Warna terang untuk jalan yang sedikit terlihat
                ctx.fillRect(
                    col * cellSize + 2,
                    row * cellSize + 2,
                    cellSize - 4,
                    cellSize - 4
                );
            }
        }
    }
}

// Function untuk menggambar pemain (warna biru terang agar menonjol di latar gelap)
function drawPlayer() {
    ctx.fillStyle = '#00f'; // Biru terang untuk pemain agar terlihat jelas
    ctx.beginPath();
    ctx.arc(
        player.x * cellSize + cellSize / 2,
        player.y * cellSize + cellSize / 2,
        cellSize / 3,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// Function untuk menggambar tujuan (warna hijau cerah agar menonjol)
function drawGoal() {
    ctx.fillStyle = '#32CD32'; // Hijau terang untuk tujuan
    ctx.fillRect(
        goal.x * cellSize + 10,
        goal.y * cellSize + 10,
        cellSize - 20,
        cellSize - 20
    );
}

// Function untuk menggambar ulang semua elemen (labirin, pemain, tujuan)
function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Bersihkan canvas
    drawMaze(); // Gambar labirin
    drawGoal(); // Gambar tujuan
    drawPlayer(); // Gambar pemain
}

// Function untuk memeriksa apakah pemain menang
function checkWin() {
    if (player.x === goal.x && player.y === goal.y && isGameActive) {
        isGameActive = false; // Hentikan input sementara
        document.getElementById('message').textContent = `Level ${currentLevel} Complete!`;

        // Tambah skor berdasarkan level
        score += currentLevel * 10;

        // Lanjut ke level berikutnya
        setTimeout(() => {
            if (currentLevel < 50) {
                currentLevel++;
                startNewLevel();
            } else {
                document.getElementById('message').textContent = 'You completed all levels!';
            }
        }, 2000);
    }
}

// Function untuk memulai level baru
function startNewLevel() {
    const gridSize = Math.min(10 + currentLevel, 50); // Grid maksimal 50x50
    cellSize = Math.floor(canvas.width / gridSize); // Sesuaikan ukuran kotak dengan grid
    maze = generateMaze(gridSize, gridSize); // Labirin baru
    player = { x: 1, y: 1 }; // Reset posisi pemain
    goal = findValidGoal(gridSize); // Cari posisi tujuan yang valid
    isGameActive = true; // Aktifkan input
    document.getElementById('message').textContent = ''; // Hapus pesan
    updateHUD(); // Update teks Level dan Score
    redraw(); // Gambar ulang
}

// Event listener untuk kontrol pemain
document.addEventListener('keydown', movePlayer);

function movePlayer(event) {
    if (!isGameActive) return; // Abaikan input jika permainan sedang reset
    const { x, y } = player;

    if (event.key === 'ArrowUp' && maze[y - 1][x] === 0) player.y--;
    if (event.key === 'ArrowDown' && maze[y + 1][x] === 0) player.y++;
    if (event.key === 'ArrowLeft' && maze[y][x - 1] === 0) player.x--;
    if (event.key === 'ArrowRight' && maze[y][x + 1] === 0) player.x++;

    redraw(); // Gambar ulang setelah pergerakan
    checkWin(); // Periksa apakah menang
}

// Function untuk mencari posisi tujuan yang valid
function findValidGoal(gridSize) {
    let validGoal = null;

    for (let y = gridSize - 2; y >= 0; y--) {
        for (let x = gridSize - 2; x >= 0; x--) {
            if (maze[y][x] === 0) {
                validGoal = { x, y };
                break;
            }
        }
        if (validGoal) break;
    }

    return validGoal || { x: gridSize - 2, y: gridSize - 2 };
}

// Function untuk membuat labirin secara dinamis
function generateMaze(rows, cols) {
    let maze = Array.from({ length: rows }, () => Array(cols).fill(1));

    function carvePassagesFrom(x, y) {
        const directions = [
            [0, -1], // Up
            [0, 1],  // Down
            [-1, 0], // Left
            [1, 0]   // Right
        ];

        directions.sort(() => Math.random() - 0.5); // Acak arah gerakan

        for (let [dx, dy] of directions) {
            const nx = x + dx * 2;
            const ny = y + dy * 2;

            if (ny >= 0 && ny < rows && nx >= 0 && nx < cols && maze[ny][nx] === 1) {
                maze[ny][nx] = 0;
                maze[y + dy][x + dx] = 0;
                carvePassagesFrom(nx, ny);
            }
        }
    }

    maze[1][1] = 0; // Titik awal
    carvePassagesFrom(1, 1);
    return maze;
}

// Function untuk memperbarui Level dan Score di HTML
function updateHUD() {
    document.getElementById('level').textContent = `Level: ${currentLevel}`;
    document.getElementById('score').textContent = `Score: ${score}`;
}

// Inisialisasi pertama
startGame();
