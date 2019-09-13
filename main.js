/***************************************/

// server configuration

const port = 5000;

// import express
var express = require("express");

var app = express();

// run server
var server = app.listen(port, function(){
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
        
        var roomId;
        var res = {};
        
        roomId = data.roomId;
        password = data.password;
        
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
        
        // remove from room
        roomList[roomId].removePlayer(socket.id);
        
        // set player's status
        players[socket.id].status = player.playerStatus.inRoomlist;        
        
        fn(); // acknowledgement
    });
    
    // delete the player from players
    socket.on("disconnect", function(){
        delete players[socket.id];
        console.log(socket.id + " - has been removed");
    });
});

/***************************************/

// server memory

var player = require("./server/player");
var room = require("./server/room");
var game = require("./server/game");

// keep tracking of players by their socket.id
// the reason of using object instead of array is that make possible (key,value) concept
var players = {};

// keep tracking of rooms
var roomList = {};
var roomListSharedInfo = {};
room.init(roomList,roomListSharedInfo,players); // initiliaze 
