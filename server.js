import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import Durak from "./gameLogic.js";

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

const game = new Durak();

io.on("connection", (socket) => {
  const player = {
    id: socket.id,
    // isReady: false,
  };

  socket.on("joinGame", (name) => {
    // socket.join("gameRoom");
    player.name = name;
    const gameState = game.addPlayer(player);
    socket.broadcast.emit("message", `${player.name} has joined the game.`);
    io.emit("gameState", gameState);
  });

  socket.on("message", (msg) => {
    socket.broadcast.emit("message", msg);
  });

  socket.on("getNewCard", (playerId) => {
    // if (game.state !== "GAME_STARTED" || game.currentPlayerId !== playerId)
    //   return;
    const gameState = game.takeCardFromDeck(playerId);
    if (gameState) {
      io.emit("gameState", gameState);
      socket.emit("message", "You drew a new card.");
    } else {
      socket.emit("message", "You cannot draw a card right now.");
    }
  });

  socket.on("putCardOnTable", ({ playerId, card }) => {
    // if (game.state !== "GAME_STARTED" || game.currentPlayerId !== playerId)
    //   return;
    const gameState = game.putCardOnTable(playerId, card);
    if (gameState) {
      io.emit("gameState", gameState);
      socket.emit("message", `You put ${card.name} on the table.`);
    } else {
      socket.emit("message", "You cannot put that card on the table.");
    }
  });

  socket.on("endTurn", () => {
    // if (game.state !== "GAME_STARTED" || game.currentPlayerId !== playerId)
    //   return;
    const gameState = game.endTurn();
    io.emit("gameState", gameState);
    if (gameState.turn) {
      io.emit("message", `Round ${gameState.turn} is starting.`);
    }
  });

  socket.on("disconnect", () => {
    const gameState = game.removePlayer(player);
    socket.broadcast.emit("message", `${player.name} has left the game.`);
    io.emit("gameState", gameState);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
