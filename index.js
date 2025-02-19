require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);
const PORT = process.env.PORT || 4000;

// set view engine to ejs
app.set("view engine", "ejs");

// serve public folder
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index");
});

io.on("connection", (socket) => {
  const socketId = socket.id;
  console.log(`client connection -> ${socketId}`);
  socket.on("send-location", (coords) => {
    console.log(`client location -> ${socketId}`);
    io.emit("receive-location", { id: socketId, ...coords });
  });
  socket.on("disconnect", () => {
    console.log(`client disconnected -> ${socket.id}`);
    io.emit("user-disconnect", socket.id);
  });
  socket.on("send-route", (route) => {
    console.log(`client route -> ${socketId}`);
    io.emit("receive-route", route);
  });
});

server.listen(PORT, () => {
  console.log("Server is running on port 3000");
});
