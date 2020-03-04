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
    },
    watch: {
        "game.status": function(newStatus,oldStatus){
            if(newStatus == "play"){
                setup();
                loop(); // start drawing
            }
            else if(newStatus == "settings"){
                gameViewVue.game.ships = {}; // reset ships
                gameViewVue.game.particules = {}; // reset particules
                noLoop(); // stop drawing
            }
            else if(newStatus == "done"){
                noCanvas();
                gameViewVue.clickReady();
            }
        }
    }
});


function loadGameView(data){
    roomListVue.hide = true; // hide roomlist

    gameViewVue.hide = false; // show gameview
    gameViewVue.roomSharedInfo = data.roomSharedInfo;
    gameViewVue.game = data.game;
    
}

/**** Settings ****/

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

socket.on("selectedMap", function(map){
   gameViewVue.game.selectedMap = map; 
});

/**** Game-Area ****/

socket.on("newShip", function(ship){
    gameViewVue.game.ships[ship.id] = ship;
});

socket.on("shipGeneral", function(shipId,property,value){
    gameViewVue.game.ships[shipId][property] = value;
});

socket.on("shipArgs", function(shipId,property,value){
    gameViewVue.game.ships[shipId].args[property] = value;
});

socket.on("newParticule", function(particule){
    gameViewVue.game.particules[particule.id] = particule; 
});

socket.on("deleteParticule", function(id){
    delete gameViewVue.game.particules[id]; 
});

socket.on("particuleArgs", function(id,property,value){
    gameViewVue.game.particules[id].args[property] = value;
});

socket.on("particuleGeneral", function(id,property,value){
    gameViewVue.game.particules[id][property] = value;
});

