var collide = require("../lib/p5.collide2d.min");

exports.engine = function(game){
        
    // movement of ships
    for(key in game.ships){
        
        let ship = game.ships[key];
        
        var requestedX = ship.args[0] + ship.horizontalVelocity;
        var requestedY = ship.args[1] + ship.verticalVelocity;
        
        // width validation
        if(requestedX >= 0 && requestedX + ship.args[2] <= game.selectedMap.width){
            ship.args[0] = requestedX;
        }
        
        // height validation
        // block any Y request to outside of the area
        if(requestedY < 0 || requestedY + ship.args[3] > game.selectedMap.height) continue;
        
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
                
    };
        
    // movement of particules and detection of collisions
    for(key in game.particules){
        
        // fix me: delete a particule causes an inconsistency between clients and server
        // delete particules which are outside of the canvas
        if(game.particules[key].args[1] > game.selectedMap.height || game.particules[key].args[1] < 0){
            game.deleteParticule(key);
            continue;
        }
        
        // detection of collisions
        
        // ships vs particules
        for(shipKey in game.ships){
            let ship = game.ships[shipKey];
            // if the particules was deleted by previos ship fix it as break not continue
            if(!game.particules[key]) continue;
            
            var hit = collision(ship,game.particules[key]);
            
            if(hit){
                ship.hp = ship.hp - game.particules[key].hp;
                game.deleteParticule(key); // delete particule
                break;
            }
                        
        };
        
        // if the particules was deleted in ships vs particules iteration
        if(!game.particules[key]) continue;
        
        // particules vs particules        
        for(targetKey in game.particules){
            
            // if it is the particule itself then ignore
            if(game.particules[key].id == game.particules[targetKey].id) continue;
            
            var hit = collision(game.particules[key],game.particules[targetKey]);
            if(hit){
                var temp = game.particules[key].hp;
                game.particules[key].hp = game.particules[key].hp - game.particules[targetKey].hp;
                game.particules[targetKey].hp = game.particules[targetKey].hp - temp;
                
                if(game.particules[key].hp <= 0) game.deleteParticule(key);
                if(game.particules[targetKey].hp <= 0) game.deleteParticule(targetKey);
                
                break; // by the defined game mechanisms
            }
            
        }
        
        // if the particules was deleted in particules vs particules iteration
        if(!game.particules[key]) continue;
        
        // movement of particules
        
        var newY = game.particules[key].args[1] + game.particules[key].verticalVelocity;
        
        game.particules[key].args[1] = newY;
            
    }
};

function collision(o1,o2){
        
    var hit;
    
    if(o1.type == "rect"){
        switch(o2.type){
            case "rect":
                hit = collide.collideFunctions().collideRectRect(o1.args[0],o1.args[1],o1.args[2],o1.args[3],o2.args[0],o2.args[1],o2.args[2],o2.args[3]);
                break;
            default:
        }
    }
    
    return hit;

};
