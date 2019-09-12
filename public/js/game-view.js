var gameViewVue = new Vue({
    el: "#game-view", 
    data: {
        hide: true,
        roomSharedInfo: "",
        game: ""
    },
    methods: {
        leave: function(){
            this.hide = true;
        }
    }
});

function loadGameView(data){
    roomListVue.hide = true;
    
    gameViewVue.hide = false;
    gameViewVue.roomSharedInfo = data.roomSharedInfo;
    gameViewVue.game = data.game;
}