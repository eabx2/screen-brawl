var io;

exports.init = function(_io){
    io = _io;
};

/***************************************/

exports.gameStatus = {
    settings: "settings"
};

exports.playersGameStatus = {
    awating: "awating",
    ready: "ready"  
};

exports.game = function(roomId){
    
    /**** General ****/    
    this.playersNickname = [];
    this.playersGameStatus = [];    
    
    this.status = "settings";
};
