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
        showError('por favor ingresa tu nombre');
        return;
    }
    
    socket.emit('createGame', playerName);
}

// Join Game
function joinGame() {
    const code = gameCodeInput.value.trim().toUpperCase();
    playerName = playerNameInput.value.trim();
    
    if (!code || !playerName) {
        showError('por favor ingresa el código del juego y tu nombre');
        return;
    }
    
    socket.emit('joinGame', { gameCode: code, playerName });
}

// Socket event handlers
socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('gameCreated', ({ gameCode, players }) => {
    showGameRoom(gameCode, players);
});

socket.on('playerJoined', ({ players }) => {
    updatePlayerList(players);
});

socket.on('error', ({ message }) => {
    showError(message);
});

socket.on('gameStarted', ({ question, round }) => {
    showGameQuestion(question, round);
});

socket.on('showAnswers', ({ answers }) => {
    showAnswerOptions(answers);
});

socket.on('roundEnd', ({ correctAnswer, scores, fact }) => {
    showRoundResults(correctAnswer, scores, fact);
});

// UI Functions
function showGameRoom(code, players) {
    gameCode = code;
    landingPage.classList.add('hidden');
    gameRoom.classList.remove('hidden');
    
    gameRoom.innerHTML = `
        <div class="space-y-8 animate-fade-up">
            <div class="bg-white rounded-2xl p-8 shadow-xl hover-lift">
                <h2 class="text-3xl font-bold mb-2 gradient-text text-center">sala de juego</h2>
                <p class="text-center mb-6">código: <span class="font-mono font-bold text-xl">${code}</span></p>
                
                <div class="mb-8">
                    <h3 class="text-xl mb-4 font-bold text-center">jugadores</h3>
                    <ul id="players" class="space-y-3"></ul>
                </div>
                
                <button onclick="startGame()" 
                        class="button-hover bg-black hover:bg-gray-900 text-white w-full py-4 rounded-xl text-lg font-bold flex items-center justify-center transition-all duration-300">
                    <i class="fas fa-play mr-3"></i>
                    comenzar juego
                </button>
            </div>
            
            <div class="bg-white rounded-2xl p-8 shadow-xl hover-lift">
                <h3 class="text-xl font-bold mb-4 gradient-text">invita a tus amigos</h3>
                <p class="text-gray-600 mb-4">comparte el código con tus amigos para que se unan al juego</p>
                <div class="flex items-center space-x-3">
                    <input type="text" value="${code}" 
                           class="input-field flex-1 px-4 py-3 rounded-xl text-lg bg-gray-50" 
                           readonly>
                    <button onclick="copyGameCode('${code}')" 
                            class="button-hover bg-black text-white px-4 py-3 rounded-xl">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    updatePlayerList(players);
}

function updatePlayerList(players) {
    const playersList = document.getElementById('players');
    if (!playersList) return;
    
    playersList.innerHTML = players
        .map(player => `
            <li class="bg-gray-50 rounded-xl p-4 flex items-center justify-between group hover:bg-gray-100 transition-all duration-300">
                <div class="flex items-center">
                    <i class="fas fa-user mr-3 text-gray-400 group-hover:text-black transition-colors duration-300"></i>
                    <span class="font-medium">${player.name}</span>
                </div>
                ${player.score ? `<span class="font-bold">${player.score} pts</span>` : ''}
            </li>
        `)
        .join('');
}

function showGameQuestion(question, round) {
    gameRoom.innerHTML = `
        <div class="space-y-8 animate-fade-up">
            <div class="bg-white rounded-2xl p-8 shadow-xl">
                <div class="text-center mb-8">
                    <h3 class="text-lg text-gray-500 mb-2">ronda ${round}</h3>
                    <h2 class="text-2xl font-bold gradient-text">${question}</h2>
                </div>
                
                <div class="space-y-4">
                    <input type="text" id="answerInput" 
                           placeholder="escribe tu respuesta engañosa..." 
                           class="input-field w-full px-5 py-4 rounded-xl text-lg bg-gray-50"
                           maxlength="50">
                    <button onclick="submitAnswer()" 
                            class="button-hover bg-black hover:bg-gray-900 text-white w-full py-4 rounded-xl text-lg font-bold flex items-center justify-center transition-all duration-300">
                        <i class="fas fa-paper-plane mr-3"></i>
                        enviar respuesta
                    </button>
                </div>
            </div>
            
            <div class="bg-white rounded-2xl p-6 shadow-xl">
                <div id="timer" class="text-center text-2xl font-bold">
                    30
                </div>
            </div>
        </div>
    `;
    
    startTimer(30);
}

function showAnswerOptions(answers) {
    gameRoom.innerHTML = `
        <div class="space-y-8 animate-fade-up">
            <div class="bg-white rounded-2xl p-8 shadow-xl">
                <h2 class="text-2xl font-bold mb-6 text-center gradient-text">¡vota por la respuesta correcta!</h2>
                <div class="space-y-4">
                    ${answers.map((answer, index) => `
                        <button onclick="submitVote('${answer}')" 
                                class="button-hover w-full p-4 rounded-xl text-left hover:bg-gray-100 transition-all duration-300 group">
                            <span class="font-mono mr-3 text-gray-400 group-hover:text-black">${index + 1}</span>
                            ${answer}
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function showRoundResults(correctAnswer, scores, fact) {
    gameRoom.innerHTML = `
        <div class="space-y-8 animate-fade-up">
            <div class="bg-white rounded-2xl p-8 shadow-xl">
                <h2 class="text-2xl font-bold mb-6 text-center gradient-text">resultados</h2>
                
                <div class="mb-8 p-6 bg-gray-50 rounded-xl">
                    <h3 class="text-lg font-bold mb-2">respuesta correcta:</h3>
                    <p class="text-xl">${correctAnswer}</p>
                    <p class="text-gray-600 mt-4">${fact}</p>
                </div>
                
                <div class="space-y-4">
                    ${Object.entries(scores)
                        .sort(([,a], [,b]) => b - a)
                        .map(([player, score]) => `
                            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <span class="font-medium">${player}</span>
                                <span class="font-bold">${score} pts</span>
                            </div>
                        `).join('')}
                </div>
            </div>
            
            <button onclick="nextRound()" 
                    class="button-hover bg-black hover:bg-gray-900 text-white w-full py-4 rounded-xl text-lg font-bold flex items-center justify-center transition-all duration-300">
                <i class="fas fa-arrow-right mr-3"></i>
                siguiente ronda
            </button>
        </div>
    `;
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg animate-scale-in';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => errorDiv.remove(), 300);
    }, 3000);
}

function copyGameCode(code) {
    navigator.clipboard.writeText(code).then(() => {
        showError('código copiado al portapapeles');
    });
}

function startTimer(duration) {
    let timeLeft = duration;
    const timerElement = document.getElementById('timer');
    
    const timerInterval = setInterval(() => {
        timeLeft--;
        if (timerElement) {
            timerElement.textContent = timeLeft;
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitAnswer();
        }
    }, 1000);
}

function startGame() {
    if (!gameCode) return;
    socket.emit('startGame', { gameCode });
}

function submitAnswer() {
    const answerInput = document.getElementById('answerInput');
    if (!answerInput || !answerInput.value.trim()) return;
    
    socket.emit('submitAnswer', {
        gameCode,
        answer: answerInput.value.trim()
    });
}

function submitVote(answer) {
    socket.emit('submitVote', {
        gameCode,
        answer
    });
}

function nextRound() {
    socket.emit('nextRound', { gameCode });
}

// Export functions for HTML
window.createGame = createGame;
window.joinGame = joinGame;
window.startGame = startGame;
window.submitAnswer = submitAnswer;
window.submitVote = submitVote;
window.nextRound = nextRound;
window.copyGameCode = copyGameCode;
