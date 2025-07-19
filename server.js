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
