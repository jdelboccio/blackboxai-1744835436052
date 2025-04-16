class GameRoom {
    constructor(code) {
        this.code = code;
        this.players = [];
        this.currentQuestion = null;
        this.answers = new Map();
        this.scores = new Map();
        this.round = 0;
        this.status = 'waiting'; // waiting, playing, reviewing
        this.maxPlayers = 8;
        this.minPlayers = 2;
        this.roundTime = 60; // seconds
    }

    addPlayer(playerId, playerName) {
        if (this.players.length >= this.maxPlayers) {
            return false;
        }
        
        this.players.push({
            id: playerId,
            name: playerName,
            score: 0
        });
        this.scores.set(playerId, 0);
        return true;
    }

    removePlayer(playerId) {
        this.players = this.players.filter(p => p.id !== playerId);
        this.scores.delete(playerId);
        return this.players.length;
    }

    submitAnswer(playerId, answer) {
        if (this.status !== 'playing') return false;
        if (!answer.trim()) return false;
        
        // Check if answer is unique
        const existingAnswers = Array.from(this.answers.values());
        if (existingAnswers.includes(answer.toLowerCase().trim())) {
            return false;
        }
        
        this.answers.set(playerId, answer.toLowerCase().trim());
        return true;
    }

    allPlayersAnswered() {
        return this.answers.size === this.players.length;
    }

    calculateScores(votes) {
        // Points system:
        // - Finding the truth: 1000 points
        // - Getting others to pick your lie: 500 points per person fooled
        
        const newScores = new Map(this.scores);
        const truthVotes = new Map(); // Track who voted for the truth
        
        votes.forEach((votedAnswerId, voterId) => {
            if (votedAnswerId === 'truth') {
                // Player found the truth
                newScores.set(voterId, (newScores.get(voterId) || 0) + 1000);
                truthVotes.set(voterId, true);
            } else {
                // Player was fooled, award points to the lie creator
                newScores.set(votedAnswerId, (newScores.get(votedAnswerId) || 0) + 500);
            }
        });
        
        this.scores = newScores;
        return {
            scores: Object.fromEntries(this.scores),
            truthVotes: Object.fromEntries(truthVotes)
        };
    }

    resetRound() {
        this.currentQuestion = null;
        this.answers.clear();
        this.round++;
        return this.round;
    }

    canStart() {
        return this.players.length >= this.minPlayers;
    }

    getGameState() {
        return {
            code: this.code,
            players: this.players,
            round: this.round,
            status: this.status,
            scores: Object.fromEntries(this.scores)
        };
    }
}

// Sample questions database (to be expanded)
const questions = [
    {
        question: "¿Qué famoso plato venezolano fue creado por accidente en un restaurante de Caracas en 1950?",
        answer: "La Reina Pepiada",
        category: "Comida",
        fact: "La arepa Reina Pepiada fue creada en honor a Susana Duijm, Miss Mundo 1955."
    },
    {
        question: "¿Qué palabra venezolana significa 'chévere' en otros países latinos?",
        answer: "Fino",
        category: "Lenguaje",
        fact: "La palabra 'fino' es parte del vocabulario coloquial venezolano que significa 'excelente' o 'muy bueno'."
    },
    {
        question: "¿Cuál es el nombre del famoso teleférico de Caracas?",
        answer: "El Warairarepano",
        category: "Lugares",
        fact: "Anteriormente conocido como Teleférico de El Ávila, fue renombrado en 2001 a su nombre indígena Warairarepano."
    },
    {
        question: "¿Qué bebida tradicional venezolana se hace con arroz, leche y canela?",
        answer: "Chicha",
        category: "Bebidas",
        fact: "La chicha es una bebida tradicional que se consume tanto en Venezuela como en otros países de América Latina."
    },
    {
        question: "¿Qué equipo de béisbol venezolano tiene más títulos en la Liga Venezolana de Béisbol Profesional?",
        answer: "Leones del Caracas",
        category: "Deportes",
        fact: "Los Leones del Caracas han ganado 20 títulos en la historia de la liga."
    }
];

function getRandomQuestion(usedQuestions = []) {
    const availableQuestions = questions.filter(q => !usedQuestions.includes(q.question));
    if (availableQuestions.length === 0) return null;
    
    return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
}

module.exports = {
    GameRoom,
    getRandomQuestion,
    questions
};
