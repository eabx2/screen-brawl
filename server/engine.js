var collide = require("../lib/p5.collide2d.min");

exports.engine = function(game){
        
    // movement of ships
    game.ships.forEach(function(ship){
        
        var requestedX = ship.args[0] + ship.horizontalVelocity;
        var requestedY = ship.args[1] + ship.verticalVelocity;
        
        // width validation
        if(requestedX >= 0 && requestedX + ship.args[2] <= game.selectedMap.width){
            ship.args[0] = requestedX;
        }
        
        // height validation
        // block any Y request to outside of the area
        if(requestedY < 0 || requestedY + ship.args[3] > game.selectedMap.height) return;
        
        // borderY validation
        var isUp = ship.args[1] < game.selectedMap.borderY ? true : false;
        var temp1 = requestedY;
        if(isUp){
            var temp1 = temp1 + ship.args[3];
            // avoid being up as many as pixels of ship.verticalVelocity
            if(game.selectedMap.borderY - temp1 == ship.verticalVelocity) requestedY = requestedY + ship.verticalVelocity;
        }
        
        //var temp1 = isUp ? ship.args[3] + requestedY : requestedY; // if the current one is the up one then calculate it with its height
        if(isUp == (temp1 < game.selectedMap.borderY)) ship.args[1] = requestedY; 
                
    });
    
    // movement of particules and detection of collisions
    game.particules.forEach(function(particule,index,particules){
        
        // fix me: delete a particule causes an inconsistency between clients and server
        // delete particules which are outside of the canvas
        if(particule.args[1] > game.selectedMap.height || particule.args[1] < 0){
            //game.deleteParticule(index);
            return;
        }
        
        // ignore particule with zero hp
        if(particule.hp == 0) return;
        
        // detection of collisions
        
        // ships & particules
        game.ships.forEach(function(ship){
            var hit = collision(ship,particule);
            
            if(hit){
                ship.hp = ship.hp - particule.hp;
                particule.hp = 0; // kill the particule
                return;
            }
                        
        });
        
        // movement of particules
        
        var newY = particule.args[1] + particule.verticalVelocity;
        
        particule.args[1] = newY;
        
    });    
    
};

function collision(o1,o2){
    var hit;
    
    if(o1.type == "rect"){
        switch(o2.type){
            case "rect":
                hit = collide.collideFunctions().collideRectRect(o1.args[0],o1.args[1],o1.args[2],o1.args[3],o2.args[0],o2.args[1],o2.args[2],o2.args[3])
                break;
            default:
        }
    }
    
    return hit;
};
