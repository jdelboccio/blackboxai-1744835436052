
Built by https://www.blackbox.ai

---

```markdown
# Queladilla

**Queladilla** is a Latin-themed trivia game inspired by Fibbage. This multiplayer game allows players to connect and compete in a fun, interactive environment, testing their knowledge on various topics.

## Project Overview

The goal of Queladilla is to provide players with an engaging trivia experience, allowing them to answer questions, submit votes for answers, and keep track of scores in real-time. The game uses WebSocket technology for real-time communication between the server and clients, ensuring a smooth and responsive gameplay experience.

## Installation

To set up the Queladilla project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/queladilla.git
   ```

2. **Navigate into the project directory:**
   ```bash
   cd queladilla
   ```

3. **Install dependencies:**
   Make sure you have Node.js and npm installed. Then, run the following command to install the required packages:
   ```bash
   npm install
   ```

## Usage

To start the server, use the following command:

```bash
npm start
```

For development (with hot reloading), you can use:

```bash
npm run dev
```

The server will start on port **8000** or any port specified by the environment variable `PORT`.

## Features

- **Multiplayer support:** Players can join or create game rooms.
- **Real-time gameplay:** Utilizes Socket.IO for a seamless real-time interaction.
- **Dynamic trivia questions:** Get various trivia questions presented to players.
- **Scoring system:** Players earn points for correct answers and for fooling others with their responses.
- **Player management:** Ability to track players joining and leaving the game.

## Dependencies

The project relies on the following dependencies, specified in the `package.json`:

- `cors`: ^2.8.5
- `express`: ^4.21.2
- `socket.io`: ^4.8.1

**Development Dependencies:**
- `nodemon`: ^2.0.22

## Project Structure

The project is organized as follows:

```
queladilla/
├── public/               # Contains static assets (HTML, CSS, JavaScript)
│   └── ...
├── gameLogic.js          # Contains the main game logic, handling game states
├── server.js             # Entry point for the server application
├── package.json          # npm dependencies, scripts, and metadata
└── package-lock.json     # Lock file for npm dependencies
```

### Important Files
- **server.js:** This file sets up the Express server and WebSocket connections, handling all the game logic through Socket.IO.
- **gameLogic.js:** Contains the `GameRoom` class which manages game state, players, scores, and question handling.

## Contributing

Contributions are welcome! Feel free to submit a pull request or create an issue for any suggestions or bugs you find.

## License

This project is licensed under the [MIT License](LICENSE).
```