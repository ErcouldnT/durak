import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "dist")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const players = [];

function addPlayer(player) {
  if (players.length > 2) return; // no players more than 2 for now
  players.push(player);
}

function removePlayer(player) {
  const index = players.indexOf(player);
  if (index !== -1) {
    players.splice(index, 1);
  }
}
function createGameDeck() {
  const deck = [];
  const suits = ["Hearts", "Clubs", "Diamonds", "Spades"];
  const labels = ["6", "7", "8", "9", "10", "Jack", "Queen", "King", "Ace"];

  for (let i = 0; i < suits.length; i++) {
    const suit = suits[i];
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];

      const card = {
        name: label + " of " + suit, // this is an unique identifier
        suit,
        label,
        value: findRealCardValue(label),
        picture_url: "",
      };

      deck.push(card);
    }
  }
  return deck;
}

function findRealCardValue(label) {
  switch (label) {
    case "Jack":
      return 11;
    case "Queen":
      return 12;
    case "King":
      return 13;
    case "Ace":
      return 14;

    default:
      return Number(label);
  }
}

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function giveSixCardsToEveryPlayers(deck) {
  for (let i = 0; i < players.length; i++) {
    const player = players[i];

    player.cards = [
      deck.pop(),
      deck.pop(),
      deck.pop(),
      deck.pop(),
      deck.pop(),
      deck.pop(),
    ];
  }
}

function lookAtPlayersHandForValue(value, strongestCard) {
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    const playerHand = player.cards;

    // check if player has cards with strongest suit
    for (let i = 0; i < playerHand.length; i++) {
      const card = playerHand[i];

      // if player has the strongest suit card with value of xx
      if (card.suit === strongestCard.suit && card.value === value) {
        return player;
      }
    }
  }
  // if no one has the strongest suit of that value
  return null;
}

function findFirstPlayer(strongestCard) {
  if (lookAtPlayersHandForValue(6, strongestCard))
    return lookAtPlayersHandForValue(6, strongestCard);
  if (lookAtPlayersHandForValue(7, strongestCard))
    return lookAtPlayersHandForValue(7, strongestCard);
  if (lookAtPlayersHandForValue(8, strongestCard))
    return lookAtPlayersHandForValue(8, strongestCard);
  if (lookAtPlayersHandForValue(9, strongestCard))
    return lookAtPlayersHandForValue(9, strongestCard);
  if (lookAtPlayersHandForValue(10, strongestCard))
    return lookAtPlayersHandForValue(10, strongestCard);
  if (lookAtPlayersHandForValue(11, strongestCard))
    return lookAtPlayersHandForValue(11, strongestCard);
  if (lookAtPlayersHandForValue(12, strongestCard))
    return lookAtPlayersHandForValue(12, strongestCard);
  if (lookAtPlayersHandForValue(13, strongestCard))
    return lookAtPlayersHandForValue(13, strongestCard);
  if (lookAtPlayersHandForValue(14, strongestCard))
    return lookAtPlayersHandForValue(14, strongestCard);

  // if no one has the strongest suit, return first player
  return players[0];
}

function startGame() {
  const deck = createGameDeck();
  const shuffledDeck = shuffleDeck(deck);

  giveSixCardsToEveryPlayers(shuffledDeck);

  // first card in the deck is the strongest
  // const strongestSuit = strongestCard.suit; // "Hearts", "Clubs", "Diamonds" or "Spades"
  const strongestCard = shuffledDeck[0];

  const firstPlayer = findFirstPlayer(strongestCard);

  return {
    state: "GAME_STARTED",
    turn: 0,
    currentPlayerId: firstPlayer.id,
    players: players,
    deck: shuffledDeck,
    strongestCard: strongestCard,
  };
}

io.on("connection", (socket) => {
  const player = {
    id: socket.id,
    name: `Player ${players.length + 1}`,
    cards: [],
  };

  socket.broadcast.emit("message", `${player.name} has joined the game.`);
  addPlayer(player);

  if (players.length === 2) {
    const gameState = startGame();
    io.emit("gameState", gameState);
  }

  socket.on("message", (msg) => {
    socket.broadcast.emit("message", msg);
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("message", `${player.name} has left the game.`);
    removePlayer(player);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
