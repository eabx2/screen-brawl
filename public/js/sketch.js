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
        
        gameViewVue.game.ships.forEach(function(ship){
            switch(ship.type){
                case "rect":
                    rect(ship.args[0],ship.args[1],ship.args[2],ship.args[3]);
                    text(ship.hp,ship.args[0],ship.args[1],ship.args[2],ship.args[3]);
                    break;
                default:
            }
        });
        
        gameViewVue.game.particules.forEach(function(particule,index,particules){
            
            // fix me: delete a particule causes an inconsistency between clients and server
            if(particule.args[1] > gameViewVue.game.selectedMap.height || particule.args[1] < 0){
                //game.deleteParticule(index);
                return;
            }
            
            // ignore particule with zero hp
            if(particule.hp == 0) return;
                    
            switch(particule.type){
                case "rect":
                    rect(particule.args[0],particule.args[1],particule.args[2],particule.args[3]);
                    break;
                default:
            }
        });
        
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