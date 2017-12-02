const p2 = require('p2');


class Player {
  constructor(name, socket) {
    this.name = name;
    this.socket = socket;
  }
}
Player.N = 0;


class Game {
  constructor(io) {
    this.players = [];

    io.on('connection', (socket) => {
      Player.N++;
      let name = `Player ${Player.N}`;
      let player = new Player(name, socket);

      this.players.push(player);

      socket.emit('set name', name);

      socket.on('set name', (name) => {
        socket.name = name;
        io.emit('set name', name);
      });

      socket.on('chat message', (msg) => {
        io.emit('chat message', socket.name, msg);
      });

     socket.on('disconnect', () => {
        this.players.splice(this.players.indexOf(player), 1);
     });
    });

  }

}


// Create a physics world, where bodies and constraints live
var world = new p2.World({
    gravity:[0, -9.82]
});

// Create an empty dynamic body
var circleBody = new p2.Body({
    mass: 5,
    position: [0, 10]
});

// Add a circle shape to the body.
var circleShape = new p2.Circle({ radius: 1 });
circleBody.addShape(circleShape);

// ...and add the body to the world.
// If we don't add it to the world, it won't be simulated.
world.addBody(circleBody);

// Create an infinite ground plane.
var groundBody = new p2.Body({
    mass: 0 // Setting mass to 0 makes the body static
});
var groundShape = new p2.Plane();
groundBody.addShape(groundShape);
world.addBody(groundBody);

// To get the trajectories of the bodies,
// we must step the world forward in time.
// This is done using a fixed time step size.
var timeStep = 1 / 30; // seconds

// The "Game loop". Could be replaced by, for example, requestAnimationFrame.
setInterval(function(){

    // The step method moves the bodies forward in time.
    world.step(timeStep);

    // Print the circle position to console.
    // Could be replaced by a render call.
    console.log("Circle y position: " + circleBody.position[1]);

}, 1000 * timeStep);

module.exports = Game;
