function setup(){
    
    var canvas;
    
    if(gameViewVue.game)
        canvas = createCanvas(gameViewVue.game.selectedMap.width,gameViewVue.game.selectedMap.height);
    else
        canvas = createCanvas(800,500);
    
    canvas.parent("game-area");
    background(250);
    //frameRate(30);
    noLoop();
}

function draw(){
    background(200);
    
    try{
        line(0,gameViewVue.game.selectedMap.borderY,gameViewVue.game.selectedMap.width,gameViewVue.game.selectedMap.borderY);
        
        for(key in gameViewVue.game.ships){
            var ship = gameViewVue.game.ships[key];
            
            switch(ship.type){
                case "rect":
                    rect(ship.args[0],ship.args[1],ship.args[2],ship.args[3]);
                    text(ship.hp,ship.args[0],ship.args[1],ship.args[2],ship.args[3]);
                    break;
                default:
            }
        };
        
        for(key in gameViewVue.game.particules){
            
            // ignore particule with zero hp
            if(gameViewVue.game.particules[key].hp == 0) continue;
            
            switch(gameViewVue.game.particules[key].type){
                case "rect":
                    rect(gameViewVue.game.particules[key].args[0],gameViewVue.game.particules[key].args[1],gameViewVue.game.particules[key].args[2],gameViewVue.game.particules[key].args[3]);
                    break;
                default:
            }
            
        }
        
    } catch(e){
        
    }
    
}

function keyPressed(){
    switch(keyCode){
        case LEFT_ARROW:
        case RIGHT_ARROW:
        case UP_ARROW:
        case DOWN_ARROW:
        case 32:
            socket.emit("key",keyCode,"pressed");
            break;
    }
}

function keyReleased(){
    switch(keyCode){
        case LEFT_ARROW:
        case RIGHT_ARROW:
        case UP_ARROW:
        case DOWN_ARROW:
        case 32:
            socket.emit("key",keyCode,"released");
            break;
    }
}