function setup(){    
    var canvas = createCanvas(800,500);
    canvas.parent("game-area");
    background(250);
    //frameRate(30);
    noLoop();
}

function draw(){
    background(200);
    line(0,250,800,250);
    
    try{
        gameViewVue.game.ships.forEach(ship => {
            switch(ship.type){
                case "rect":
                    rect(ship.args[0],ship.args[1],ship.args[2],ship.args[3]);
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