const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");

const app = express();

const server = http.createServer(app);

app.use(express.static(path.join(__dirname, "public")));

const io = socketio(server);

const {userConnected, connectedUsers, initializeChoices, makeMove, moves, choices} = require("./util/user");
const {createRoom, joinRoom, exitRoom, rooms} = require("./util/rooms");

io.on("connection", socket => {
    socket.on("create-room", (roomId) => {
        if(rooms[roomId]){
            const error = "This room already exists";
            socket.emit("display-error", error);
        }
        else{
            userConnected(socket.client.id);
            createRoom(roomId, socket.client.id);
            socket.emit("room-created", roomId);
            socket.emit("player-1-connected");
            socket.join(roomId);
        }
    } )

    socket.on("join-room", roomId =>{
        if(!rooms[roomId]){
            const error = "This room doesn't exist";
            socket.emit("display-error", error);
        }
        else{
            userConnected(socket.client.id);
            joinRoom(roomId, socket.client.id);
            socket.emit("room-joined", roomId);
            socket.emit("player-2-connected");
            socket.join(roomId);
        }
    })
    socket.on("join-random", () => {
        let roomId = "";

        for(let id in rooms){
            if(rooms[id][1] === ""){
                roomId = id;
                break;
            }
        }
        if(roomId === ""){
            const error = "All rooms are full";
            socket.emit("display-error", error);
        }
        else{
            userConnected(socket.client.id);
            joinRoom(roomId, socket.client.id);
            socket.emit("room-joined", roomId);
            socket.emit("player-2-connected");
            socket.join(roomId);
        }
    })
})

server.listen(5000, () => console.log("Server started on port 5000..."));
