var io;

exports.init = function(_io){
    io = _io;
}

/***************************************/

exports.gameStatus = {
    settings: "settings"
}

exports.game = function(roomId){
    
    /**** General ****/    
    this.playersNickname = [];
    this.status = "settings";
        
};
