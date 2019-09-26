var io;

exports.init = function(_io){
    io = _io;
};

/***************************************/

exports.gameStatus = {
    settings: "settings",
    play: "play"
};

exports.playersGameStatus = {
    awating: "awating",
    ready: "ready"  
};

exports.shipArgsHandler = function(shipId,roomId){
  this.set = function(target,property,value){
      io.in(roomId).emit("shipArgs",shipId,property,value);
      target[property] = value;
  }; 
};

exports.game = function(room){
    
    /**** General ****/    
    this.playersNickname = [];
    this.playersGameStatus = [];    
    this.status = exports.gameStatus.settings;
    
    /**** Game-Area ****/
    this.ships = [];
    this.particules = [];
    
    this.addNewShip = function(id,roomID,type,verticalVelocity,horizontalVelocity, ...args){
        let ship = new exports.ship(id,roomID,"rect",verticalVelocity,horizontalVelocity,args);
        this.ships.push(ship);
        io.in(room.id).emit("newShip",ship.drawable());
    };
    
    // type can be pressed or released
    this.moveShip = function(id,keyCode,type){ 
        var index = room.players.findIndex(el => el == id);
        
        // if type is released then reset velocity
        var reset = type == "pressed" ? 1 : 0;
        switch(keyCode){
            case 38: // UP
                this.ships[index].verticalVelocity = -5 * reset;
                break;
            case 40: // DOWN
                this.ships[index].verticalVelocity = 5 * reset;
                break;
            case 37: // LEFT
                this.ships[index].horizontalVelocity = -5 * reset;
                break;
            case 39: // RIGHT
                this.ships[index].horizontalVelocity = 5 * reset;
                break;
        }
                
    };
    
    this.fireHold = function(id){
        var index = room.players.findIndex(el => el == id);
        
    };
        
};

exports.ship = function(id,roomId,type, verticalVelocity, horizontalVelocity, ...args){
    this.id = id;
    this.type = type;
    this.verticalVelocity = verticalVelocity;
    this.horizontalVelocity = horizontalVelocity;
    this.fireHoldDate = ""; // indicates the time that ship has start to prepare for fire
    this.args = new Proxy(args[0],new exports.shipArgsHandler(this.id,roomId)); // proxy
    
    this.drawable = function(){
        return {
            type: this.type,
            args: this.args
        }
    };
};

exports.particules = function(type, verticalVelocity, ...args){
    this.type = type;
    this.verticalVelocity = verticalVelocity;
    this.args = args[0];
    
    this.drawble = function(){
        return {
            type: this.type,
            args: this.args
        }
    }
    
};