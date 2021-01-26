const express = require("express");
const socketio = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = socketio(server);               // Instance of socket.io

const router  = require("./Router/router.js");

app.use(router);    //Middleware

const PORT = process.env.PORT || 5000;


server.listen(PORT, () => console.log(`Server is Running ${PORT}`) );