var io;

var maps = require("./maps");

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
    this.selectedMap = maps.maps.map1;
    this.ships = [];
    this.particules = [];
    
    this.addNewShip = function(id,type,verticalVelocity,horizontalVelocity, ...args){
        let newShip = new ship(id,room.id,"rect",verticalVelocity,horizontalVelocity,args);
        this.ships.push(new Proxy(newShip,new shipGeneralHandler(id,room.id)));
        io.in(room.id).emit("newShip",newShip.drawable());
    };
    
    this.addNewParticule = function(index,type,verticalVelocity, ...args){
        let newParticule = new particule(index,room.id,type,verticalVelocity,args);
        this.particules.push(new Proxy(newParticule,new particuleGeneralHandler(index,room.id)));
        io.in(room.id).emit("newParticule",newParticule.drawable());
    };
    
    this.deleteParticule = function(index){
        this.particules.splice(index,1);
        io.in(room.id).emit("deleteParticule",index);
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
            
            // calculate factor
            var t = Date.now();
            var temp = parseInt((t - this.ships[index].fireHoldDate) / 100, 10);
            var factor = temp > 5 ? 5 : temp;
            
            // eliminate shapes that have no area
            if(factor == 0) return;
            
            var width = factor * 5;
            var height = factor * 5;
            var x = this.ships[index].args[0] + (this.ships[index].args[2] / 2);
            var y;
            var verticalVelocity;
            
            var isUp = this.ships[index].args[1] < this.selectedMap.borderY ? true : false;
            
            if(isUp){
                y = this.ships[index].args[1] + this.ships[index].args[3] + 15;
                verticalVelocity = 5;
            }
            else {
                y = this.ships[index].args[1] - height - 15;
                verticalVelocity = -5;
            }
                        
            this.addNewParticule(this.particules.length,"rect",verticalVelocity,x,y,width,height);
            
            this.ships[index].fireHoldDate = null; // reset time
            
        }
        
    };
        
};

var shipGeneralHandler = function(shipId,roomId){
  this.set = function(target,property,value){
      if(property == "hp") io.in(roomId).emit("shipGeneral",shipId,property,value);
      target[property] = value;
  }
};

var shipArgsHandler = function(shipId,roomId){
  this.set = function(target,property,value){
      io.in(roomId).emit("shipArgs",shipId,property,value);
      target[property] = value;
  }; 
};

var particuleGeneralHandler = function(index,roomId){
  this.set = function(target,property,value){
      if(property == "hp") io.in(roomId).emit("particuleGeneral",index,property,value);
      target[property] = value;
  }
};

var particuleArgsHandler = function(index,roomId){
  this.set = function(target,property,value){
      io.in(roomId).emit("particuleArgs",index,property,value);
      target[property] = value;
  }; 
};

var ship = function(id,roomId,type, verticalVelocity, horizontalVelocity, ...args){
    this.id = id;
    this.hp = 1000;
    this.type = type;
    this.verticalVelocity = verticalVelocity;
    this.horizontalVelocity = horizontalVelocity;
    this.fireHoldDate = null; // indicates the time that ship has start to prepare for fire
    this.args = new Proxy(args[0],new shipArgsHandler(this.id,roomId)); // proxy
    
    this.drawable = function(){
        return {
            type: this.type,
            args: this.args,
            hp: this.hp
        }
    };
};

var particule = function(index,roomId,type, verticalVelocity, ...args){
    this.type = type;
    this.hp = parseInt(args[0][2]) * parseInt(args[0][2]);
    this.verticalVelocity = verticalVelocity;
    this.args = new Proxy(args[0],new particuleArgsHandler(index,roomId));
    
    this.drawable = function(){
        return {
            type: this.type,
            args: this.args,
            hp: this.hp
        }
    }
    
};