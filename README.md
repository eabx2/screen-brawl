# screen-brawl
A multiplayer HTML5 game, runs on Node.js server

### Project Definition

This project is a basic application of Node.js environment. It is a multiplayer game where two players try to shoot each other.
To establish a proper HTTP server, Express.js is used. The comminucation between clients and server is handled by Socket.io in both 
client-side and server-side. In this project, Vue.js is essential framework to provide data-reactive and flexible user interface in 
client-side. To manipulate HTML5 elements and make fluent game graphics, p5.js is used. Thus, a sketch -game screen- can be provided.

### How to Play

A player may take two actions: move and fire. The moving action is easily controlled by arrow keys. The firing action is something
more different than the regular ones. The size of the particle which is created by the firing action is defined by the holding time
of space button. The longer the space button is pressed, the larger the particle size.

### Deployment

The game is deployed on the heroku server and is ready to play.

https://screen-brawl.herokuapp.com/
