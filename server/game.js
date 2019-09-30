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

exports.game = function(room){
    
    /**** General ****/    
    this.playersNickname = [];
    this.playersGameStatus = [];    
    this.status = exports.gameStatus.settings;
    
    /**** Game-Area ****/
    this.ships = [];
    this.particules = [];
    
    this.addNewShip = function(id,type,verticalVelocity,horizontalVelocity, ...args){
        let ship = new exports.ship(id,room.id,"rect",verticalVelocity,horizontalVelocity,args);
        this.ships.push(ship);
        io.in(room.id).emit("newShip",ship.drawable());
    };
    
    this.addNewParticule = function(index,type,verticalVelocity, ...args){
        let particule = new exports.particule(index,room.id,type,verticalVelocity,args);
        this.particules.push(particule);
        io.in(room.id).emit("newParticule",particule.drawable());
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
    
    this.fire = function(id,type){
        var index = room.players.findIndex(el => el == id);
        
        if(type == "pressed") this.ships[index].fireHoldDate = Date.now();
        
        else if(type == "released"){
            // avoid released request not after a pressed one
            if(this.ships[index].fireHoldDate == null) return;
            
            var t = Date.now();
            var temp = parseInt((t - this.ships[index].fireHoldDate) / 1000, 10);
            var factor = temp > 5 ? 5 : temp;
            
            // eliminate shapes that have no area
            if(factor == 0) return;
            
            var x = this.ships[index].args[0] + (this.ships[index].args[2] / 2);
            var y;
            var verticalVelocity;
            
            var isUp = this.ships[index].args[1] < room.selectedMap.borderY ? true : false;
            
            if(isUp){
                y = this.ships[index].args[1] + 10;
                verticalVelocity = 15;
            }
            else {
                y = this.ships[index].args[1] + this.ships[index].args[2] + 10;
                verticalVelocity = -15;
            }
                        
            this.addNewParticule(this.particules.length,"rect",verticalVelocity,x,y,factor*5,factor*5);
            
            this.ships[index].fireHoldDate = null; // reset time
            
        }
        
    };
        
};

exports.shipArgsHandler = function(shipId,roomId){
  this.set = function(target,property,value){
      io.in(roomId).emit("shipArgs",shipId,property,value);
      target[property] = value;
  }; 
};

exports.particuleArgsHandler = function(index,roomId){
  this.set = function(target,property,value){
      io.in(roomId).emit("particuleArgs",index,property,value);
      target[property] = value;
  }; 
};

exports.ship = function(id,roomId,type, verticalVelocity, horizontalVelocity, ...args){
    this.id = id;
    this.type = type;
    this.verticalVelocity = verticalVelocity;
    this.horizontalVelocity = horizontalVelocity;
    this.fireHoldDate = null; // indicates the time that ship has start to prepare for fire
    this.args = new Proxy(args[0],new exports.shipArgsHandler(this.id,roomId)); // proxy
    
    this.drawable = function(){
        return {
            type: this.type,
            args: this.args
        }
    };
};

exports.particule = function(index,roomId,type, verticalVelocity, ...args){
    this.type = type;
    this.verticalVelocity = verticalVelocity;
    this.args = new Proxy(args[0],new exports.particuleArgsHandler(index,roomId));
    
    this.drawable = function(){
        return {
            type: this.type,
            args: this.args
        }
    }
    
};