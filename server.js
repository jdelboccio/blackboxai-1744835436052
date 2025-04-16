const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const { GameRoom, getRandomQuestion } = require('./gameLogic');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Game state
const games = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New client connected');

    // Handle creating a new game
    socket.on('createGame', (playerName) => {
        const gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const gameRoom = new GameRoom(gameCode);
        gameRoom.addPlayer(socket.id, playerName);
        games.set(gameCode, gameRoom);

        socket.join(gameCode);
        socket.emit('gameCreated', { 
            gameCode,
            players: gameRoom.players
        });
    });

    // Handle joining a game
    socket.on('joinGame', ({ gameCode, playerName }) => {
        const gameRoom = games.get(gameCode);
        
        if (!gameRoom) {
            socket.emit('error', { message: 'Juego no encontrado' });
            return;
        }

        if (gameRoom.players.length >= gameRoom.maxPlayers) {
            socket.emit('error', { message: 'La sala está llena' });
            return;
        }

        gameRoom.addPlayer(socket.id, playerName);
        socket.join(gameCode);
        
        io.to(gameCode).emit('playerJoined', {
            players: gameRoom.players
        });
    });

    // Handle starting the game
    socket.on('startGame', ({ gameCode }) => {
        const gameRoom = games.get(gameCode);
        
        if (!gameRoom) {
            socket.emit('error', { message: 'Juego no encontrado' });
            return;
        }

        if (!gameRoom.canStart()) {
            socket.emit('error', { message: 'Se necesitan al menos 2 jugadores para comenzar' });
            return;
        }

        const question = getRandomQuestion();
        gameRoom.currentQuestion = question;
        gameRoom.status = 'playing';
        
        io.to(gameCode).emit('gameStarted', {
            question: question.question,
            round: gameRoom.round + 1
        });
    });

    // Handle submitting an answer
    socket.on('submitAnswer', ({ gameCode, answer }) => {
        const gameRoom = games.get(gameCode);
        
        if (!gameRoom || gameRoom.status !== 'playing') {
            socket.emit('error', { message: 'No se puede enviar respuesta en este momento' });
            return;
        }

        if (gameRoom.submitAnswer(socket.id, answer)) {
            socket.emit('answerSubmitted');

            if (gameRoom.allPlayersAnswered()) {
                const answers = Array.from(gameRoom.answers.values());
                answers.push(gameRoom.currentQuestion.answer);
                
                io.to(gameCode).emit('showAnswers', {
                    answers: answers.sort(() => Math.random() - 0.5)
                });
            }
        }
    });

    // Handle voting for an answer
    socket.on('submitVote', ({ gameCode, answer }) => {
        const gameRoom = games.get(gameCode);
        
        if (!gameRoom || gameRoom.status !== 'playing') {
            socket.emit('error', { message: 'No se puede votar en este momento' });
            return;
        }

        // Calculate scores and prepare for next round
        const scores = gameRoom.calculateScores();
        gameRoom.resetRound();
        
        io.to(gameCode).emit('roundEnd', {
            correctAnswer: gameRoom.currentQuestion.answer,
            scores: scores,
            fact: gameRoom.currentQuestion.fact
        });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected');
        games.forEach((gameRoom, gameCode) => {
            const remainingPlayers = gameRoom.removePlayer(socket.id);
            if (remainingPlayers === 0) {
                games.delete(gameCode);
            } else {
                io.to(gameCode).emit('playerLeft', {
                    players: gameRoom.players
                });
            }
        });
    });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
