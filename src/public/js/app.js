const messageList = document.querySelector("ul");
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



