var io;
var UUID;

var maps = require("./maps");

exports.init = function(_io,_UUID){
    io = _io;
    UUID = _UUID;
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
    this.ships = {};
    this.particules = {}; // store particules as an object rather than an array
    
    this.addNewShip = function(playerIndex,type,verticalVelocity,horizontalVelocity, ...args){
        var newShipId = UUID.create().toString();
        let newShip = new ship(newShipId,room.id,"rect",verticalVelocity,horizontalVelocity,args);
        this.ships[newShipId] = new Proxy(newShip,new shipGeneralHandler(newShipId,room.id));
        io.in(room.id).emit("newShip",newShip.drawable());
        
        return newShipId;
    };
    
    this.addNewParticule = function(type,verticalVelocity, ...args){
        var newParticuleId = UUID.create().toString();
        let newParticule = new particule(newParticuleId,room.id,type,verticalVelocity,args);
        this.particules[newParticuleId] = new Proxy(newParticule,new particuleGeneralHandler(newParticuleId,room.id));
        io.in(room.id).emit("newParticule",newParticule.drawable());
    };
    
    this.deleteParticule = function(id){
        delete this.particules[id];
        io.in(room.id).emit("deleteParticule",id);
    };
    
    // type can be pressed or released
    this.moveShip = function(shipId,keyCode,type){ 
        
        // if type is released then reset velocity
        var reset = type == "pressed" ? 1 : 0;
        switch(keyCode){
            case 38: // UP
                this.ships[shipId].verticalVelocity = -5 * reset;
                break;
            case 40: // DOWN
                this.ships[shipId].verticalVelocity = 5 * reset;
                break;
            case 37: // LEFT
                this.ships[shipId].horizontalVelocity = -5 * reset;
                break;
            case 39: // RIGHT
                this.ships[shipId].horizontalVelocity = 5 * reset;
                break;
        }
                
    };
    
    // type can be pressed or released
    this.fire = function(shipId,type){
                
        if(type == "pressed") this.ships[shipId].fireHoldDate = Date.now();
        
        else if(type == "released"){
            // avoid released request not after a pressed one
            if(this.ships[shipId].fireHoldDate == null) return;
            
            // calculate factor
            var t = Date.now();
            var temp = parseInt((t - this.ships[shipId].fireHoldDate) / 100, 10);
            var factor = temp > 5 ? 5 : temp;
            
            // eliminate shapes that have no area
            if(factor == 0) return;
            
            var width = factor * 5;
            var height = factor * 5;
            var x = this.ships[shipId].args[0] + (this.ships[shipId].args[2] / 2);
            var y;
            var verticalVelocity;
            
            var isUp = this.ships[shipId].args[1] < this.selectedMap.borderY ? true : false;
            
            if(isUp){
                y = this.ships[shipId].args[1] + this.ships[shipId].args[3] + 15;
                verticalVelocity = 2;
            }
            else {
                y = this.ships[shipId].args[1] - height - 15;
                verticalVelocity = -2;
            }
                        
            this.addNewParticule("rect",verticalVelocity,x,y,width,height);
            
            this.ships[shipId].fireHoldDate = null; // reset time
            
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

var particuleGeneralHandler = function(id,roomId){
  this.set = function(target,property,value){
      
      if(property == "hp" && value > 0){
                    
          io.in(roomId).emit("particuleGeneral",id,property,value);
          
          // w/h : 5 10 15 20 25
          // hp : 25 100 225 400 625
          
          var factor = Math.floor(Math.sqrt(Math.floor(value/25)));
          factor = factor == 0 ? 1 : factor;
          
          target.args[2] = factor * 5;
          target.args[3] = factor * 5;
      }
      
      target[property] = value;
      
  }
};

var particuleArgsHandler = function(id,roomId){
  this.set = function(target,property,value){
      io.in(roomId).emit("particuleArgs",id,property,value);
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
            id: this.id,
            type: this.type,
            args: this.args,
            hp: this.hp
        }
    };
};

var particule = function(id,roomId,type, verticalVelocity, ...args){
    this.id = id;
    this.type = type;
    this.hp = parseInt(args[0][2]) * parseInt(args[0][2]);
    this.verticalVelocity = verticalVelocity;
    this.args = new Proxy(args[0],new particuleArgsHandler(id,roomId));
    
    this.drawable = function(){
        return {
            id: this.id,
            type: this.type,
            args: this.args,
            hp: this.hp
        }
    }
    
};