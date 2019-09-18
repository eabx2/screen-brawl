var gameViewVue = new Vue({
    el: "#game-view", 
    data: {
        hide: true, // hide at the beginning
        roomSharedInfo: "",
        game: ""
    },
    methods: {
        leaveRoom: function(){
            socket.emit("leaveRoom", function(){
                roomListVue.hide = false;
                gameViewVue.hide = true;
            });
        }
    }
});

socket.on("addPlayer", function(newPlayerNickname){
    gameViewVue.game.playersNickname.push(newPlayerNickname);
});

socket.on("removePlayer", function(removePlayerIndex){
    gameViewVue.game.playersNickname.splice(removePlayerIndex,1);
});

function loadGameView(data){
    roomListVue.hide = true; // hide roomlist
    
    gameViewVue.hide = false; // show gameview
    gameViewVue.roomSharedInfo = data.roomSharedInfo;
    gameViewVue.game = data.game;
}