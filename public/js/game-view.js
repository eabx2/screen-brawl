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
                gameViewVue.readyButtonText = "Ready";
            });
        },
        clickReady: function(){
            if(this.readyButtonText == "Ready"){
                socket.emit("setReadyMe", function(){
                    gameViewVue.readyButtonText = "Cancel"
                });
            }
            else {
                socket.emit("setCancelMe", function(){
                    gameViewVue.readyButtonText = "Ready"; 
                });
            }
        },
        startGame: function(){
            socket.emit("startGame");
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

socket.on("setReadyPlayer", function(readyPlayerIndex,status){
    Vue.set(gameViewVue.game.playersGameStatus,readyPlayerIndex,status)
    // gameViewVue.game.playersGameStatus[readyPlayerindex] = status; // is NOT reactive
});

socket.on("gameStatus", function(gameStatus){
    gameViewVue.game.status = gameStatus;
});

function loadGameView(data){
    roomListVue.hide = true; // hide roomlist

    gameViewVue.hide = false; // show gameview
    gameViewVue.roomSharedInfo = data.roomSharedInfo;
    gameViewVue.game = data.game;
    
}