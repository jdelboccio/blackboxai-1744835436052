// Initialize Socket.IO connection
const socket = io();

// Game state
let gameCode = null;
let playerName = null;

// DOM Elements
const createGameBtn = document.getElementById('createGameBtn');
const joinGameBtn = document.getElementById('joinGameBtn');
const gameCodeInput = document.getElementById('gameCode');
const playerNameInput = document.getElementById('playerName');
const landingPage = document.getElementById('landing');
const gameRoom = document.getElementById('gameRoom');

// Create Game
function createGame() {
    playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert('Por favor ingresa tu nombre');
        return;
    }
    
    socket.emit('createGame', playerName);
}

// Join Game
function joinGame() {
    const code = gameCodeInput.value.trim().toUpperCase();
    playerName = playerNameInput.value.trim();
    
    if (!code || !playerName) {
        alert('Por favor ingresa el código del juego y tu nombre');
        return;
    }
    
    socket.emit('joinGame', { gameCode: code, playerName });
}

// Socket event handlers
socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('gameCreated', ({ gameCode }) => {
    showGameRoom(gameCode);
});

socket.on('playerJoined', ({ players }) => {
    updatePlayerList(players);
});

socket.on('error', ({ message }) => {
    alert(message);
});

// UI Functions
function showGameRoom(code) {
    gameCode = code;
    landingPage.classList.add('hidden');
    gameRoom.classList.remove('hidden');
    
    // Update game room UI
    gameRoom.innerHTML = `
        <div class="bg-white/20 backdrop-blur-lg rounded-lg p-6 text-center">
            <h2 class="text-2xl font-bold mb-4">Sala de Juego</h2>
            <p class="mb-4">Código: <span class="font-mono font-bold">${code}</span></p>
            <div id="playerList" class="mb-6">
                <h3 class="text-xl mb-2">Jugadores</h3>
                <ul class="space-y-2" id="players"></ul>
            </div>
            <button onclick="startGame()" class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg w-full transition duration-300">
                <i class="fas fa-play mr-2"></i>Comenzar Juego
            </button>
        </div>
    `;
}

function updatePlayerList(players) {
    const playersList = document.getElementById('players');
    if (!playersList) return;
    
    playersList.innerHTML = players
        .map(player => `
            <li class="bg-white/10 backdrop-blur rounded p-2">
                <i class="fas fa-user mr-2"></i>${player.name}
                ${player.score ? ` - ${player.score} puntos` : ''}
            </li>
        `)
        .join('');
}

function startGame() {
    if (!gameCode) return;
    socket.emit('startGame', { gameCode });
}

// Export functions for HTML
window.createGame = createGame;
window.joinGame = joinGame;
window.startGame = startGame;
