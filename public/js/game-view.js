var gameViewVue = new Vue({
    el: "#game-view", 
    data: {
        hide: true, // hide at the beginning
        readyButtonText: "Ready",
        roomSharedInfo: "",
        game: ""
    },
    methods: {
        leaveRoom: function(){
            socket.emit("leaveRoom", function(){
                roomListVue.hide = false;
                gameViewVue.hide = true;
            });
        },
        clickReady: function(){
            if(this.readyButtonText == "Ready"){
                socket.emit("setReadyMe");
                this.readyButtonText = "Cancel"
            }
            else {
                socket.emit("setCancelMe");
                this.readyButtonText = "Ready";
            }
        }
    }
});

socket.on("addPlayer", function(newPlayerNickname){
    gameViewVue.game.playersNickname.push(newPlayerNickname);
    gameViewVue.game.playersGameStatus.push("awating"); // default status
});

socket.on("removePlayer", function(removePlayerIndex){
    gameViewVue.game.playersNickname.splice(removePlayerIndex,1);
    gameViewVue.game.playersGameStatus.splice(removePlayerIndex,1);
});

socket.on("setReadyPlayer", function(readyPlayerindex,status){
    Vue.set(gameViewVue.game.playersGameStatus,readyPlayerindex,status)
    // gameViewVue.game.playersGameStatus[readyPlayerindex] = status; // is NOT reactive
});

function loadGameView(data){
    roomListVue.hide = true; // hide roomlist
    
    gameViewVue.hide = false; // show gameview
    gameViewVue.roomSharedInfo = data.roomSharedInfo;
    gameViewVue.game = data.game;
}