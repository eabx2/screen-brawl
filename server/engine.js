exports.engine = function(game){
        
    // movement of ships
    game.ships.forEach(function(ship){
        ship.args[0] = ship.args[0] + ship.horizontalVelocity;
        ship.args[1] = ship.args[1] + ship.verticalVelocity;
    });
    
};