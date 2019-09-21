exports.playerStatus = {
    inNickname: "inNickname",
    inRoomlist: "inRoomlist",
    inRoom: "inRoom",
    inGame: "inGame"
}

exports.player = function(){
    
    /**** General ****/
    
    this.status = exports.playerStatus.inNickname;
    this.nickname = "";
    this.inRoomId = "";
    
};