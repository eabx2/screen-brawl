exports.engine = function(game,map){
        
    // movement of ships
    game.ships.forEach(function(ship){
        
        var requestedX = ship.args[0] + ship.horizontalVelocity;
        var requestedY = ship.args[1] + ship.verticalVelocity;
        
        // width validation
        if(requestedX >= 0 && requestedX + ship.args[2] <= map.width){
            ship.args[0] = requestedX;
        }
        
        // height validation
        // block any Y request to outside of the area
        if(requestedY < 0 || requestedY + ship.args[3] > map.height) return;
        
        // borderY validation
        var isUp = ship.args[1] < map.borderY ? true : false;
        var temp1 = requestedY;
        if(isUp){
            var temp1 = temp1 + ship.args[3];
            // avoid being up as many as pixels of ship.verticalVelocity
            if(map.borderY - temp1 == ship.verticalVelocity) requestedY = requestedY + ship.verticalVelocity;
        }
        
        //var temp1 = isUp ? ship.args[3] + requestedY : requestedY; // if the current one is the up one then calculate it with its height
        if(isUp == (temp1 < map.borderY)) ship.args[1] = requestedY; 
                
    });
    
    // movement of particules
    game.particules.forEach(function(particule){
       
        var newY = particule.args[1] + particule.verticalVelocity;
        
        particule.args[1] = newY;
        
    });
    
};
