const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
app.use(cors());
const io = socketio(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

const router = require("./Router/router.js");
const {
  addUser,
  getUser,
  removeUser,
  getUsersInRoom,
} = require("./Utils/helper");
const { use } = require("./Router/router.js");

app.use(router); //Middleware
;

//specific client instance
io.on("connection", (socket) => {
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.join(user.room);

    socket.emit("message", {
      user: "Admin",
      text: `${user.name}, welcome to the ${user.room}.`,
    }); 

    socket.broadcast.to(user.room).emit("message", {
      user: "Admin",
      text: `${user.name} has joined the room.`,
    });

    io.to(user.room).emit("roomData", {      //For updating the status of Users in Room
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();  //ususally for error handling from client side to trigger this
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("message", { user: user.name, text: message });
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", {
        user: "Admin",
        text: `${user.name} has left the chat room.`,
      });

      io.to(user.room).emit("roomData", {      //For updating the status of Users in Room
        room: user.romm,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(process.env.PORT || 5000, () => console.log(`Server is Running `));
