
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update, render: render });

function preload() {
    game.load.image('stars', 'assets/starfield.jpg');
    game.load.spritesheet('ship', 'assets/humstar.png', 32, 32);
}

var player;
var starfield;
var state = {
  'players': {}
};
var players = {};
var playerCollisionGroup;

function create() {

    //  Enable P2
    game.physics.startSystem(Phaser.Physics.P2JS);

    //  Turn on impact events for the world, without this we get no collision callbacks
    game.physics.p2.setImpactEvents(true);

    game.physics.p2.restitution = 0.8;

    //  Create our collision groups
    playerCollisionGroup = game.physics.p2.createCollisionGroup();

    //  This part is vital if you want the objects with their own collision groups to still collide with the world bounds
    //  (which we do) - what this does is adjust the bounds to use its own collision group.
    game.physics.p2.updateBoundsCollisionGroup();

    starfield = game.add.tileSprite(0, 0, 800, 600, 'stars');
    starfield.fixedToCamera = true;



    socket.on('state', function(nextState){
      state = nextState;
    });

    server = {
      'player': {
        'x': 200,
        'y': 200,
      }
    }
    socket.on('position', function(x, y){
      server.player.x = x;
      server.player.y = y;
    });
}

function update() {
    var playerSprite;
    var playerState;

    for (let id in state.players) {
      let playerState = state.players[id];
      let playerSprite = getOrCreatePlayer(id, playerState);

      game.physics.arcade.moveToXY(playerSprite, playerState.x, playerState.y, 30, 30);
      // game.physics.arcade.moveToXY(player.text, server.player.x, server.player.y - player.height, 30, 30);
      if (playerSprite.text.text != playerState.name) {
        playerSprite.text.text = playerState.name;
      }
      game.world.bringToTop(playerSprite.text);
      playerSprite.text.x = playerState.x - playerSprite.text.width/2;
      playerSprite.text.y = playerState.y - 48;
    }

    for (let id in players) {
      if (!(id in state.players)) {
        removePlayer(id);
      }
    }


}

function render () {
    var n = 1;
    for(var id in state.players) {
      var player = state.players[id];
      game.debug.text(player.name + ': ' + player.score, 32, n*32);
      n += 1;
    }
    // game.debug.text(game.time.physicsElapsed, 32, 32);
    // game.debug.body(player);
    // game.debug.bodyInfo(player, 16, 24);

}

function getOrCreatePlayer(id, playerState) {
  if (id in players) {
    return players[id];
  } else {
    playerSprite = game.add.sprite(playerState.x, playerState.y, 'ship');
    playerSprite.scale.set(2);
    playerSprite.smoothed = false;
    playerSprite.animations.add('fly', [0,1,2,3,4,5], 10, true);
    playerSprite.play('fly');

    game.physics.p2.enable(playerSprite, false);
    playerSprite.body.setCircle(28);
    playerSprite.body.fixedRotation = true;

    var style = { font: "12px Arial", fill: "#fff", align: "center"};
    playerSprite.text = game.add.text(0, 0, playerState.name, style);

    //  Set the players collision group
    playerSprite.body.setCollisionGroup(playerCollisionGroup);

    // game.camera.follow(player);
    players[id] = playerSprite;
    return playerSprite;
  }
}

function removePlayer(id) {
    players[id].text.destroy();
    players[id].destroy();
    delete players[id];
}

var keysdown = {
  'ArrowUp': false,
  'ArrowDown': false,
  'ArrowLeft': false,
  'ArrowRight': false,
};

document.addEventListener('keydown', function(evt) {
  if(evt.key in keysdown && !(keysdown[evt.key])) {
    keysdown[evt.key] = true;
    socket.emit('keydown', evt.key);
  }
});

document.addEventListener('keyup', function(evt) {
  if(evt.key in keysdown && keysdown[evt.key]) {
    keysdown[evt.key] = false;
    socket.emit('keyup', evt.key);
  }
});
