const p2 = require('p2');


class Player {
  constructor(id, body) {
    this.body = body;
    this.id = id;
    this.score = 0;
    if (id in Player.ID_NAME_MAP) {
      this.name = Player.ID_NAME_MAP[id];
    } else {
      this.setName(`Player ${Player.N}`);
      Player.N++;
    }
    this.keysdown = {
      'ArrowUp': false,
      'ArrowDown': false,
      'ArrowLeft': false,
      'ArrowRight': false,
    }
  }
  setName(name) {
    this.name = Player.ID_NAME_MAP[this.id] = name;
  }
}
Player.N = 1;
Player.ID_NAME_MAP = {};
Player.SPEED = 200;


class Game {
  constructor(io) {
    this.io = io;
    this.height = 600;
    this.width = 800;
    this.world = new p2.World();

    this.players = {};

    io.on('connection', (socket) => {
      let player = this.addPlayer(socket.id)

      socket.emit('set name', player.name);

      socket.on('disconnect', () => {
        this.removePlayer(player);
      });

      socket.on('set name', (name) => {
        player.setName(name);
        io.emit('set name', name);
      });

      socket.on('chat message', (msg) => {
        io.emit('chat message', player.name, msg);
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

  addPlayer(id) {
      // Create an empty dynamic body
      var body = new p2.Body({
          mass: 5,
          position: [200, 200]
      });
      var shape = new p2.Circle({ radius: 32 });
      body.addShape(shape);
      this.world.addBody(body);

      // Add player
      let player = new Player(id, body);
      this.players[player.id] = player;
      return player
  }

  removePlayer(player) {
    this.world.removeBody(player.body);
    delete this.players[player.id];
  }

  getState() {
    let players = {};
    for (let id in this.players) {
      let player = this.players[id];
      players[id] = {
        name: player.name,
        x: player.body.position[0],
        y: this.height-player.body.position[1],
        score: player.score,
      }
    }
    return {
      'players': players,
    };
    // this.io.emit('position', body.position[0], this.height-body.position[1]);
  }

  run() {

    // To get the trajectories of the ,
    // we must step the world forward in time.
    // This is done using a fixed time step size.
    var timeStep = 1 / 30; // seconds

    // The "Game loop". Could be replaced by, for example, requestAnimationFrame.
    setInterval(() => {

        // The step method moves the  forward in time.
        this.world.step(timeStep);

        for (let id in this.players) {
          let player = this.players[id];
          let body = player.body;

          // Boundaries
          if (body.position[0] < 32) {
            body.position[0] = 32;
            body.velocity[0] = 0;
          } else if (body.position[0] > (this.width - 32)) {
            body.position[0] = this.width - 32;
            body.velocity[0] = 0;
          }
          if (body.position[1] < 32) {
            body.position[1] = 32;
            body.velocity[1] = 0;
          } else if (body.position[1] > (this.height - 32)) {
            body.position[1] = this.height - 32;
            body.velocity[1] = 0;
          }

          // Movements
          if(player.keysdown.ArrowUp) {
            body.velocity[1] = Player.SPEED;
          } else if(player.keysdown.ArrowDown) {
            body.velocity[1] = -Player.SPEED;
          } else {
            body.velocity[1] = 0;
          }
          if(player.keysdown.ArrowLeft) {
            body.velocity[0] = -Player.SPEED;
          } else if(player.keysdown.ArrowRight) {
            body.velocity[0] = Player.SPEED;
          } else {
            body.velocity[0] = 0;
          }
          // console.log(player.keysdown);
          // console.log(body.position);
        }
        this.io.emit('state', this.getState());

    }, 1000 * timeStep);

  }

}


module.exports = Game;
