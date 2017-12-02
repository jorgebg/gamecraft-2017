const p2 = require('p2');
const level = require('../public/assets/level1.json')


class Player {
  constructor(name, socket) {
    this.name = name;
    this.socket = socket;
    this.keysdown = {
      'ArrowUp': false,
      'ArrowLeft': false,
      'ArrowRight': false,
    }
  }
}
Player.N = 0;


class Game {
  constructor(io) {
    this.io = io;
    this.players = [];
    this.height = level.height * level.tileheight;
    this.width = level.width * level.tilewidth;

    io.on('connection', (socket) => {
      Player.N++;
      let name = `Player ${Player.N}`;
      let player = new Player(name, socket);

      this.players.push(player);

      socket.emit('set name', name);

      socket.on('disconnect', () => {
        this.players.splice(this.players.indexOf(player), 1);
      });

      socket.on('set name', (name) => {
        socket.name = name;
        io.emit('set name', name);
      });

      socket.on('chat message', (msg) => {
        io.emit('chat message', socket.name, msg);
      });

      socket.on('keydown', (key) => {
        // console.log('keydown', key);
        player.keysdown[key] = true;
      });

      socket.on('keyup', (key) => {
        // console.log('keyup', key);
        player.keysdown[key] = false;
      });
    });

  }

  run() {

    // Create a physics world, where bodies and constraints live
    var world = new p2.World({
        gravity:[0, -250]
    });


    // var planeShape = new p2.Plane();
    // var plane = new p2.Body({
    //     position:[0, this.height],
    // });
    // plane.addShape(planeShape);
    // world.addBody(plane);

    // Create an empty dynamic body
    var playerBody = new p2.Body({
        mass: 5,
        position: [0, 0]
    });

    // Add a circle shape to the body.
    var playerShape = new p2.Box({ width: 32, height: 32 });
    playerBody.addShape(playerShape);

    // ...and add the body to the world.
    // If we don't add it to the world, it won't be simulated.
    world.addBody(playerBody);

    // Create an infinite ground plane.
    var groundBody = new p2.Body({
        mass: 0, // Setting mass to 0 makes the body static
        // angle: 0,
        // position: [0, 0],
    });
    var groundShape = new p2.Plane();
    groundBody.addShape(groundShape);
    world.addBody(groundBody);

    // // Create an infinite left plane.
    // var leftBody = new p2.Body({
    //     mass: 0, // Setting mass to 0 makes the body static
    //     angle: Math.PI,
    // });
    // var leftShape = new p2.Plane();
    // leftBody.addShape(leftShape);
    // world.addBody(leftBody);
    //
    //
    // // Create an infinite right plane.
    // var rightBody = new p2.Body({
    //     mass: 0, // Setting mass to 0 makes the body static
    //     angle: Math.PI,
    //     position: [500, 0],
    // });
    // var rightShape = new p2.Plane();
    // rightBody.addShape(rightShape);
    // world.addBody(rightBody);

    // To get the trajectories of the bodies,
    // we must step the world forward in time.
    // This is done using a fixed time step size.
    var timeStep = 1 / 30; // seconds

    // The "Game loop". Could be replaced by, for example, requestAnimationFrame.
    setInterval(() => {

        // The step method moves the bodies forward in time.
        world.step(timeStep);

        // Print the circle position to console.
        // Could be replaced by a render call.
        // playerBody.velocity = [-150, 0];
        // if (playerBody.position[0] < 0) {
        //   playerBody.position[0] = 0;
        //   playerBody.velocity[0] = 0;
        // } else if (playerBody.position[0] > this.width) {
        //   playerBody.position[0] = this.width - playerShape.width;
        //   playerBody.velocity[0] = 0;
        // }
        // console.log(playerBody.position);
        for (let player of this.players) {
          if(player.keysdown.ArrowUp) {
            playerBody.velocity[1] = 300;
          }
          if(player.keysdown.ArrowLeft) {
            playerBody.velocity[0] = -150;
          } else if(player.keysdown.ArrowRight) {
            playerBody.velocity[0] = 150;
          } else {
            playerBody.velocity[0] = 0;
          }
          console.log(player.keysdown);
          // console.log(playerBody.position);
        }
        this.io.emit('position', playerBody.position[0], this.height-playerBody.position[1]);

    }, 1000 * timeStep);

  }

}


module.exports = Game;
