
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update, render: render });

function preload() {
    // Leep running when losing focus
    // game.disableVisibilityChange = true;

    game.load.image('stars', 'assets/starfield.jpg');
    game.load.spritesheet('ship', 'assets/humstar.png', 32, 32);
    game.load.image('particle_small', 'assets/particle_small.png');
    game.load.audio('squit', 'assets/squit.wav');
    game.load.audio('lazer', 'assets/lazer.wav');
    game.load.audio('spaceman', 'assets/spaceman.wav');
    game.load.audio('music', 'assets/goaman_intro.mp3');
}

var player;
var starfield;
var state = {
  'players': {},
  'fields': {},
};
var players = {};
var playerCollisionGroup;
var fields = {};
var keysdown = {
  'ArrowUp': false,
  'ArrowDown': false,
  'ArrowLeft': false,
  'ArrowRight': false,
};
var squit, spaceman, lazer;
var bots = [];

function create() {

    //  Enable P2
    // game.physics.startSystem(Phaser.Physics.P2JS);
    //  Turn on impact events for the world, without this we get no collision callbacks
    // game.physics.p2.setImpactEvents(true);

    // game.physics.p2.restitution = 0.8;

    //  Create our collision groups
    // playerCollisionGroup = game.physics.p2.createCollisionGroup();

    //  This part is vital if you want the objects with their own collision groups to still collide with the world bounds
    //  (which we do) - what this does is adjust the bounds to use its own collision group.
    // game.physics.p2.updateBoundsCollisionGroup();

    starfield = game.add.tileSprite(0, 0, 800, 600, 'stars');
    starfield.fixedToCamera = true;

    squit = game.add.audio('squit', 0.7);
    lazer = game.add.audio('lazer', 0.02);
    spaceman = game.add.audio('spaceman', 0.1);
    music = game.add.audio('music', 0.3, true);
    music.play();

    socket.on('state', function(nextState){
      state = nextState;
    });
}

function update() {
    var playerSprite;
    var playerState;
    var overlaps = false;

    for (let id in state.players) {
      let playerState = state.players[id];
      let playerSprite = getOrCreatePlayer(id, playerState);

      // game.physics.arcade.moveToXY(playerSprite, playerState.x, playerState.y, 30, 30);
      playerSprite.x = playerState.x - playerSprite.width/2;
      playerSprite.y = playerState.y - playerSprite.height/2;
      // game.physics.arcade.moveToXY(player.text, server.player.x, server.player.y - player.height, 30, 30);
      if (playerSprite.text.text != playerState.name) {
        playerSprite.text.text = playerState.name;
      }
      game.world.bringToTop(playerSprite.text);
      playerSprite.text.x = playerState.x - playerSprite.text.width/2;
      playerSprite.text.y = playerState.y - 48;
      // console.log(playerState.overlaps);
      if(playerState.overlaps) {
        overlaps = true;
      }
    }
    if (overlaps && !lazer.isPlaying) {
      lazer.play();
    }

    for (let id in players) {
      if (!(id in state.players)) {
        removePlayer(id);
      }
    }

    for (let id in state.fields) {
      let fieldState = state.fields[id];
      let fieldSprite = getOrCreateField(id, fieldState);

      fieldSprite.scale.set((fieldState.radius * 2)/28);
      fieldSprite.x = fieldState.x-fieldState.radius;
      fieldSprite.y = fieldState.y-fieldState.radius;
      // game.physics.arcade.moveToXY(fieldSprite, fieldState.x, fieldState.y, 30, 30);
      game.world.bringToTop(fieldSprite);
    }

    for (let id in fields) {
      if (!(id in state.fields)) {
        removeField(id);
      }
    }

    for (let bot of bots) {
      bot.updateBot();
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

    // game.physics.p2.enable(playerSprite, false);
    // playerSprite.body.setCircle(28);
    // playerSprite.body.fixedRotation = true;

    var style = { font: "12px Arial", fill: "#fff", align: "center"};
    playerSprite.text = game.add.text(0, 0, playerState.name, style);

    //  Set the players collision group
    // playerSprite.body.setCollisionGroup(playerCollisionGroup);

    players[id] = playerSprite;
    return playerSprite;
  }
}

function removePlayer(id) {
    players[id].text.destroy();
    players[id].destroy();
    delete players[id];
}



function getOrCreateField(id, fieldState) {
  if (id in fields) {
    return fields[id];
  } else {
    var radius = fieldState.radius;
    fieldSprite = game.add.sprite(fieldState.x-radius, fieldState.y-radius, 'particle_small');

    // sprite.body.setSize(width, height, offsetX, offsetY);
    // fieldSprite.scale.setTo(fieldState.radius * 2, fieldState.radius * 2);

    fieldSprite.scale.set((radius * 2)/32);
    fieldSprite.alpha = 0;
    // fieldSprite.smoothed = false;

    game.add.tween(fieldSprite).to( { alpha: 1 }, 500, Phaser.Easing.Linear.None, true);
    // spaceman.play();

    fields[id] = fieldSprite;
    return fieldSprite;
  }
}

function removeField(id) {
    squit.play();
    fields[id].destroy();
    delete fields[id];
}



document.addEventListener('keydown', function(evt) {
  if(evt.key in keysdown && !(keysdown[evt.key])) {
    evt.preventDefault();
    keysdown[evt.key] = true;
    socket.emit('keydown', evt.key);
  }
}, false);

document.addEventListener('keyup', function(evt) {
  if(evt.key in keysdown && keysdown[evt.key]) {
    evt.preventDefault();
    keysdown[evt.key] = false;
    socket.emit('keyup', evt.key);
  }
}, false);
