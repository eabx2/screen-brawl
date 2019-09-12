var roomList;
var players;

var game = require("./game");
var UUID = require('uuid-js');

// initialize function
exports.init = function(_roomList,_players){
    roomList = _roomList;
    players = _players;
}

// room object
exports.room = function(title,private,password,founder){
        
    // auto-id assigner
    this.id = UUID.create().toString();
    
    this.title = title;
    this.private = private;
    this.password = password;
    this.founder = founder;
    this.players = [founder]; // keep track of players
    
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
        this.game.playersNickname.push(players[id]);
    };
    
    this.removePlayer = function(id){
        //..
    }
    
    this.addPlayer(founder); // add founder
    
}