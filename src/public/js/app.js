const socket = io();

const welcome = document.getElementById("welcome");
const nickname = document.getElementById("nickname");
const welcomeForm  = welcome.querySelector("form");
const nicknameForm = nickname.querySelector("form");
const room = document.getElementById("room")


welcome.hidden = true;
room.hidden = true;

let roomName;

function addMessage(message){
    const ul = room.querySelector("ul")
    const li = document.createElement("li")
    li.innerText = message;
    ul.appendChild(li);
}

function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#message input");
    const value = input.value;
    socket.emit("new_message", input.value, roomName, () => { addMessage(`You : ${value}`)}
    );
    input.value = "";
}


function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room : ${roomName}`
    const messageForm = room.querySelector("#message");
    messageForm.addEventListener("submit", handleMessageSubmit);
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    input.value = "";
}

function handleNicknameSubmit(event) {
    event.preventDefault();
    welcome.hidden = false;
    nickname.hidden = true;
    const input = nickname.querySelector("input");
    const value = input.value;
    socket.emit("create_nickname", value);
}

nicknameForm.addEventListener("submit", handleNicknameSubmit);
welcomeForm.addEventListener("submit", handleRoomSubmit);

socket.on('welcome', (user) => {
    addMessage(`${user} joined!`)
})

socket.on("bye", (user) =>{
    addMessage(`${user} left ㅠㅠ`)
})

socket.on("new_message", addMessage);
