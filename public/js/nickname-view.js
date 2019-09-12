var nicknameViewDiv = document.getElementById("nickname-view");
var nicknameInputButton = document.getElementById("nickname-input-button");
var nicknameInput = document.getElementById("nickname-input");

nicknameInputButton.onclick = function(){
    var nickname = nicknameInput.value;
    // send nickname and load room-list
    socket.emit("nickname",{nickname: nickname},function(roomList){
        // server callback
        // make nickname-view invisible
        nicknameViewDiv.style.display = "none";
        loadRoomList(roomList);
    });
}
