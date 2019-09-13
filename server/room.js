var roomList;
var players;
var roomListSharedInfo;

var game = require("./game");
var UUID = require('uuid-js');

// initialize function
exports.init = function(_roomList,_roomListSharedInfo,_players){
    roomList = _roomList;
    roomListSharedInfo = _roomListSharedInfo;
    players = _players;
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
    
    this.game = new game.game();
    
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
    };
    
    this.removePlayer = function(id){
        var index = this.players.findIndex(el => el == id);
                
        this.players.splice(index,1);
        this.game.playersNickname.splice(index,1);
        
        // if no one is in the room then delete the room
        if(this.players.length == 0) this.deleteRoom();
    };
    
    this.deleteRoom = function(){
        delete roomList[this.id];
        delete roomListSharedInfo[this.id];
    };
    
    this.addPlayer(admin); // add admin
    
}