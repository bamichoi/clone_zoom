import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import express from "express";

const app = express();

app.set('view engine', "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));


const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials : true,
    }
});

instrument(wsServer, {
    auth:false
});

function getPublicRooms() {
    const { sockets : {adapter : {sids, rooms}}} = wsServer;
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if(sids.get(key) === undefined){
            publicRooms.push(key)
        }
    })
    return publicRooms;
}

function countUser(roomName){
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", socket => { 
    socket.onAny((event) => {
        console.log(`Socket Event:${event}`);});
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done(countUser(roomName));
        socket.to(roomName).emit("welcome", socket.nickname, countUser(roomName));
        wsServer.sockets.emit("room_change", getPublicRooms());
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname, countUser(room) -1 ));
    });
    socket.on("disconnect", () =>{
        wsServer.sockets.emit("room_change", getPublicRooms());
    })
    socket.on("new_message", (message, roomName, done) => {
        socket.to(roomName).emit("new_message", `${socket.nickname}: ${message}`);
        done();
    });
    socket.on("create_nickname", nickname => socket["nickname"] = nickname);
    wsServer.sockets.emit("room_change", getPublicRooms());
    socket.on("offer", (offer, roomName) => {
        socket.to(roomName).emit("offer", offer);
    });
    socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
    });
    socket.on("ice", (ice, roomName) => {
        socket.to(roomName).emit("ice", ice);
    });
});


const handleListen = () => console.log("Listening on http://localhost:3000");
httpServer.listen(3000, handleListen);
