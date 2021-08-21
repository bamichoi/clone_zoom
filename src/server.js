import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set('view engine', "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));


const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", socket => { 
    socket.on("enter_room", (message, done) => {
        console.log(message);
        setTimeout(() => {
            done()}, 10000);
        }); 
 });


/* 
const sockets = [];
wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "anonymous"
    console.log("Connected to Browser✅");
    socket.on("close", () =>{
        console.log("Discconected from the Browser❌");
    });
    socket.on("message", (message) =>{
        const parsedMessage = JSON.parse(message)
        switch (parsedMessage.type) {
            case "new_message" :
                sockets.forEach(aSocket => aSocket.send(`${socket.nickname}: ${parsedMessage.payload}`));
                break
            case "nickname" :
                socket["nickname"] = parsedMessage.payload;
                break
        }
    });
}); */

const handleListen = () => console.log("Listening on http://localhost:3000");
httpServer.listen(3000, handleListen);
