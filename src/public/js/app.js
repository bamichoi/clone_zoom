const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameras")

let myStream;
let muted = false;
let cameraOff = false;  
let myPeerConnection;
let myDataChannel;

async function getCameras(){
    try{ 
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput");
        const currentCamera = myStream.getVideoTracks()[0];
        cameras.forEach(camera => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if (currentCamera.label == camera.label ) {
                option.selected = true;
            }
            cameraSelect.appendChild(option);    
        })
    } catch(e) {
        console.log(e);
    }
}

async function getMedia(deviceId) {
    const initialConstrains = {
        audio: true,
        video: { facingMode: "user" }
    };
    const cameraConstrains = {
        audio: true,
        video: { deviceId: { exact: deviceId} }
    };
    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId? cameraConstrains : initialConstrains
        );
        myFace.srcObject = myStream;
        if (!deviceId) {
            await getCameras();
        }
    } catch(e){
        console.log(e);
    }
}



function handleMuteBtnClick(){
    myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    if(!muted){
        muted = true;
        muteBtn.innerText = "Unmute";
    }
    else {
        muted = false;
        muteBtn.innerText = "Mute";
    }
}

function handleCameraBtnClick(){
    myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    if(!cameraOff){
        cameraOff = true;
        cameraBtn.innerText = "Turn camera on";
    }
    else {
        cameraOff = false;
        cameraBtn.innerText = "Turn camera off";
    }

}

async function handleCameraChange(){
    await getMedia(cameraSelect.value)
    if(myPeerConnection){
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = myPeerConnection.getSenders().find(sender => sender.track.kind == "video");
        videoSender.replaceTrack(videoTrack);
        
    }
}

muteBtn.addEventListener("click", handleMuteBtnClick);
cameraBtn.addEventListener("click", handleCameraBtnClick);
cameraSelect.addEventListener("input", handleCameraChange);


// RTC code

function makeConnection(){
    myPeerConnection = new RTCPeerConnection();
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addstream", handleAddStream);
    myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data){
    socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data){
    console.log("peerstream", data.stream)
    peerStream = document.getElementById("peerStream");
    peerFace = document.getElementById("peerFace");
    peerFace.srcObject = data.stream;
}


// Nickname, Enter Room and Chat part

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


function showUserCount(newCount){
    const h3 = room.querySelector("h3");
    h3.innerText = `Room : ${roomName} (${newCount})`
}


function showRoom(newCount) {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room : ${roomName}  (${newCount})`;
    const messageForm = room.querySelector("#message");
    messageForm.addEventListener("submit", handleMessageSubmit);
    
    
}

async function handleRoomSubmit(event) {
    event.preventDefault();
    await getMedia();
    makeConnection();
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

socket.on('welcome', async (user, newCount) => {
    showUserCount(newCount);
    addMessage(`${user} joined!`);
    myDataChannel = myPeerConnection.createDataChannel("chat");
    myDataChannel.addEventListener("message", console.log)
    console.log("made data channel")
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    console.log("send the offer");
    socket.emit("offer", offer, roomName);

});

socket.on("offer", async(offer) => {
    myPeerConnection.addEventListener("datachannel", (event) => {
        myDataChannel = event.channel;
        myDataChannel.addEventListener("message", console.log)
    }); 
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
});

socket.on("answer", (answer) => {
    myPeerConnection.setRemoteDescription(answer);
})

socket.on("ice", (ice) => {
    console.log("got ice");
    myPeerConnection.addIceCandidate(ice);
})

socket.on("bye", (user, newCount) =>{
    showUserCount(newCount)
    addMessage(`${user} left ??????`);
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = ""
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    })
});

