var roomList;
var players;
var roomListSharedInfo;
var io;

var game = require("./game");
var UUID = require('uuid-js');
var engine = require("./engine");

// initialize function
exports.init = function(_roomList,_roomListSharedInfo,_players,_io){
    roomList = _roomList;
    roomListSharedInfo = _roomListSharedInfo;
    players = _players;
    io = _io;
    game.init(io);
}

// room object
exports.room = function(title,private,password,admin){
        
    // auto-id assigner
    this.id = UUID.create().toString();
    
    this.title = title;
    this.private = private;
    this.password = password;
    this.admin = admin;
    this.players = []; // keep track of players
    this.playerLimit = 2;
    
    this.game = new game.game(this);
    
    this.sharedInfo = function(){
        return {
            id: this.id,
            title: this.title,
            private: this.private,
        }
    };
    
    this.addPlayer = function(id){
        this.players.push(id);
        this.game.playersNickname.push(players[id].nickname);
        this.game.playersGameStatus.push(game.playersGameStatus.awating);
        
        // notify clients in the room that there is a new player
        io.to(this.id).emit("addPlayer", players[id].nickname);
    };
    
    this.removePlayer = function(id){
        var index = this.players.findIndex(el => el == id);
        
        this.players.splice(index,1);
        
        // remove from game object
        this.game.playersNickname.splice(index,1);
        this.game.playersGameStatus.splice(index,1);
        
        // notify clients in the room that a new player leaved
        io.in(this.id).emit("removePlayer", index);
        
        // if no one is in the room then delete the room
        if(this.players.length == 0) this.deleteRoom();
    };
    
    this.deleteRoom = function(){
        delete roomList[this.id];
        delete roomListSharedInfo[this.id];
    };
    
    this.setPlayerGameStatus = function(id,status){
        var index = this.players.findIndex(el => el == id);
        
        this.game.playersGameStatus[index] = game.playersGameStatus[status];
        
        // notify clients in the room that indexed player's status has changed to ready
        io.in(this.id).emit("setReadyPlayer", index, status);
        
    }
    
    this.startGame = function(){
        
        if(this.players.length != 2) return; // 2 players condition
        
        var startGame = true;
        for(var i = 0; i < this.game.playersGameStatus.length; i++){
            if(this.game.playersGameStatus[i] != game.playersGameStatus.ready){
                startGame = false;
                break;
            }
        }
        
        // if all players are ready then start the game
        if(startGame){
            this.game.status = game.gameStatus.play; // change game status of the game
            io.in(this.id).emit("gameStatus",game.gameStatus.play); // emit this to all clients
            
            // Initiliaze the ships
            this.game.addNewShip(0,this.id,"rect",0,0,400,50,50,25);
            this.game.addNewShip(1,this.id,"rect",0,0,400,450,50,25);
            
            // set gameInterval and start rendering
            var passGame = this.game;
            this.gameInterval = setInterval(function(){engine.engine(passGame);},1000/60);
            
            
        }
        
    };
    
    this.addPlayer(admin); // add admin
    
}