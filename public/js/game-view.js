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

function loadGameView(data){
    roomListVue.hide = true; // hide roomlist
    
    gameViewVue.hide = false; // show gameview
    gameViewVue.roomSharedInfo = data.roomSharedInfo;
    gameViewVue.game = data.game;
}