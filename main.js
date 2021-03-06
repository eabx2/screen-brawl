/***************************************/

// server configuration

const port = 5000;

// import express
var express = require("express");

var app = express();

// run server
var server = app.listen(process.env.PORT || port, function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log("screen-brawl server is listening at http://" + host + ":" + port);
});

// pass public folder
app.use(express.static("public"));

/***************************************/

// socket activations

// pass server to socket -sockets need a http server-
var io = require("socket.io")(server);

io.sockets.on("connection", function(socket){
    
    // add the player into players
    players[socket.id] = new player.player();
    console.log(socket.id + " - has been added");
    
    /*** inNickname functions ***/

    socket.on("nickname", function(data, fn){
        // only work nickname status
        if(players[socket.id].status != player.playerStatus.inNickname) return; 
        
        players[socket.id].nickname = data.nickname;
        console.log(socket.id + " - nickname: " + data.nickname);
        
        // set player's status
        players[socket.id].status = player.playerStatus.inRoomlist;
        
        // send roomlist to the player
        fn(roomListSharedInfo);
    });
    
    /*** inRoomlist functions ***/
    
    socket.on("refreshRoomList", function(fn){
        // only work roomlist status
        if(players[socket.id].status != player.playerStatus.inRoomlist) return; 
        
        fn(roomListSharedInfo);
    });
    
    socket.on("createRoom", function(data,fn){
        // only work roomlist status
        if(players[socket.id].status != "inRoomlist") return; 
        
        // pass socket.id client automatically
        var newRoom = new room.room(data.title,data.private,data.password,socket.id);
        
        // add newRoom into global roomList
        roomList[newRoom.id] = newRoom;
        
        roomListSharedInfo[newRoom.id] = newRoom.sharedInfo();
        
        // set response
        var res = {};
        res["game"] = roomList[newRoom.id].game;
        res["roomSharedInfo"] = roomListSharedInfo[newRoom.id];
        
        // set player's status and roomId
        players[socket.id].status = player.playerStatus.inRoom;
        players[socket.id].inRoomId = newRoom.id;
        
        // take the socket into a special channel
        socket.join(newRoom.id);
        
        fn(res); // acknowledgement
    });
    
    socket.on("joinRoom", function(data,fn){
        
        // only work roomlist status
        if(players[socket.id].status != player.playerStatus.inRoomlist) return; 
        
        var roomId = data.roomId;
        
        if(roomList[roomId].players.length == roomList[roomId].playerLimit) return
        
        // if game is not in settings status then reject join request
        if(roomList[roomId].game.status != game.gameStatus.settings) return;
        
        var res = {};
        
        var password = data.password;
        
        if(!roomList[roomId].private || roomList[roomId].password == password){
            res["okay"] = true;

            // request has been accepted join the client into the requested room
            roomList[roomId].addPlayer(socket.id);
            
            // prepare response
            res["game"] = roomList[roomId].game;
            res["roomSharedInfo"] = roomListSharedInfo[roomId];
            
            // set player's status and roomId
            players[socket.id].status = player.playerStatus.inRoom;    
            players[socket.id].inRoomId = roomId;
            
            // take the socket into a special channel
            socket.join(roomId);
        }
        
        else res["okay"] = false;
        
        fn(res);
    });
    
    socket.on("leaveRoom", function(fn){
        if(players[socket.id].status != player.playerStatus.inRoom) return; 
        
        var roomId = players[socket.id].inRoomId;
        
        // reset player's room id
        players[socket.id].inRoomId = "";
        
        // remove from room
        roomList[roomId].removePlayer(socket.id);
        
        // remove from channel
        socket.leave(roomId);
        
        // set player's status
        players[socket.id].status = player.playerStatus.inRoomlist;        
        
        fn(); // acknowledgement
    });
    
    /*** inRoom functions ***/
    
    socket.on("setReadyMe", function(fn){
        if(players[socket.id].status != player.playerStatus.inRoom) return;
        
        var roomId = players[socket.id].inRoomId;
        
        // only accept when the room is in setting
        if(roomList[roomId].game.status != game.gameStatus.settings) return;
        
        roomList[roomId].setPlayerGameStatus(socket.id,game.playersGameStatus.ready);
        
        fn();
    });
    
    socket.on("setCancelMe", function(fn){
        if(players[socket.id].status != player.playerStatus.inRoom) return;

        var roomId = players[socket.id].inRoomId;
        
        // only accept when the room is in setting
        if(roomList[roomId].game.status != game.gameStatus.settings) return;
        
        roomList[roomId].setPlayerGameStatus(socket.id,game.playersGameStatus.awating);
        
        fn();
    });
    
    socket.on("startGame", function(){
        if(players[socket.id].status != player.playerStatus.inRoom) return;

        var roomId = players[socket.id].inRoomId;
        
        // only accept when the room is in setting
        if(roomList[roomId].game.status != game.gameStatus.settings) return;
        
        // if the client is not admin then return
        if(roomList[roomId].admin != socket.id) return;
        
        roomList[roomId].startGame();
    });
    
    /*** Game-Area ***/
    
    socket.on("key",function (keyCode,type){
        if(players[socket.id].status != player.playerStatus.inRoom) return;
        
        var roomId = players[socket.id].inRoomId;
        
        // only accept when the room is in setting
        if(roomList[roomId].game.status != game.gameStatus.play) return;
        
        var shipId = players[socket.id].shipId;
                
        // fire
        if(keyCode == 32) 
            roomList[roomId].game.fire(shipId,type);
        else
            roomList[roomId].game.moveShip(shipId,keyCode,type);

    });
    
    // delete the player from players
    socket.on("disconnect", function(){
        
        var roomId = players[socket.id].inRoomId;
        
        // if the game that socket is involved is still in settings status then remove player
                
        if(players[socket.id].status == player.playerStatus.inRoom && roomList[roomId].game.status == game.gameStatus.settings)
            roomList[roomId].removePlayer(socket.id)
        
        delete players[socket.id];
        console.log(socket.id + " - has been removed");
    });
    
});

/***************************************/

// server memory

var player = require("./server/player");
var room = require("./server/room");
var game = require("./server/game");
//var game = require("./server/game");

// keep tracking of players by their socket.id
// the reason of using object instead of array is that make possible (key,value) concept
var players = {};

// keep tracking of rooms
var roomList = {};
var roomListSharedInfo = {};
room.init(roomList,roomListSharedInfo,players,io); // initiliaze 
