var roomList;
var players;
var roomListSharedInfo;
var io;

var game = require("./game");
game.init(io);

var UUID = require('uuid-js');

// initialize function
exports.init = function(_roomList,_roomListSharedInfo,_players,_io){
    roomList = _roomList;
    roomListSharedInfo = _roomListSharedInfo;
    players = _players;
    io = _io;
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
    
    this.game = new game.game(this.id);
    
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
        
        // notify clients in the room that there is a new player
        io.to(this.id).emit("addPlayer", players[id].nickname);
    };
    
    this.removePlayer = function(id){
        var index = this.players.findIndex(el => el == id);
        
        this.players.splice(index,1);
        this.game.playersNickname.splice(index,1);
        
        // notify clients in the room that there is a new player
        io.in(this.id).emit("removePlayer", index);
        
        // if no one is in the room then delete the room
        if(this.players.length == 0) this.deleteRoom();
    };
    
    this.deleteRoom = function(){
        delete roomList[this.id];
        delete roomListSharedInfo[this.id];
    };
    
    this.addPlayer(admin); // add admin
    
}