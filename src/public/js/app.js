const socket = io();

const welcome = document.getElementById("welcome");
const form  = welcome.querySelector("form");


function handleRoomSubmit(event) {
    event.preventDefault();
    const input =  form.querySelector("input");
    socket.emit("enter_room", { payload: input.value }, () => {
        console.log("Server is done!")
    });
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);




/* const messageList = document.querySelector("ul");
const nicknameForm = document.querySelector("#nickname");
const messageForm = document.querySelector("#message");
const socket = new WebSocket(`ws://${window.location.host}`)

function makeMessage(type, payload) {
    const message = {type, payload};
    return JSON.stringify(message)
}

socket.addEventListener("open", () => {
    console.log("Connected to Server✅");
});

socket.addEventListener("message", (message) => {
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
})

socket.addEventListener("close", () =>{
    console.log("Disconnected from Server❌");
})

function handleMessageSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));
    const li = document.createElement("li");
    li.innerText = `You : ${input.value};`
    messageList.append(li);
    input.value = "";
}

function handleNicknameSubmit(event) {
    event.preventDefault();
    const input = nicknameForm.querySelector("input");
    socket.send(makeMessage("nickname", input.value));
    input.value="";
}

messageForm.addEventListener("submit", handleMessageSubmit);
nicknameForm.addEventListener("submit", handleNicknameSubmit)



 */