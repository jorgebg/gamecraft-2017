
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update, render: render });

function preload() {
    // Leep running when losing focus
    game.disableVisibilityChange = true;

    game.load.image('stars', 'assets/starfield.jpg');
    game.load.spritesheet('ship', 'assets/humstar.png', 32, 32);
    game.load.image('particle_small', 'assets/particle_small.png');
}

var player;
var starfield;
var state = {
  'players': {}
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

var BOT = false;
var BOT_TARGET_ID = false;

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

    for (let id in state.fields) {
      let fieldState = state.fields[id];
      let fieldSprite = getOrCreateField(id, fieldState);

      fieldSprite.scale.set((fieldState.radius * 2)/28);
      fieldSprite.x = fieldState.x-fieldState.radius;
      fieldSprite.y = fieldState.y-fieldState.radius;
      // game.physics.arcade.moveToXY(fieldSprite, fieldState.x, fieldState.y, 30, 30);
    }

    for (let id in fields) {
      if (!(id in state.fields)) {
        removeField(id);
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
    fieldSprite.smoothed = false;
    // fieldSprite.animations.add('fly', [0,1,2,3,4,5], 10, true);
    // fieldSprite.play('fly');

    // game.physics.p2.enable(fieldSprite, false);
    // fieldSprite.body.setCircle(fieldState.radius * 2);
    // fieldSprite.body.fixedRotation = true;
    // fieldSprite.body.collisionResponse = false;

    fields[id] = fieldSprite;
    return fieldSprite;
  }
}

function removeField(id) {
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



function autopilot() {
    if (BOT) {
      let playerState = state.players[socket.id];
      let targetField;
      if (BOT_TARGET_ID in state.fields) {
        targetField = state.fields[BOT_TARGET_ID];
      } else {
        let fieldIds = Object.keys(state.fields);
        BOT_TARGET_ID = fieldIds[Math.floor(Math.random()*fieldIds.length)];
        targetField = state.fields[BOT_TARGET_ID];
      }
      // let targetField = false;
      // let targetDistance = -1;
      // for (let id in state.fields) {
      //   let fieldState = state.fields[id];
      //   let distance = Math.sqrt(Math.pow(fieldState.x-playerState.x, 2), Math.pow(fieldState.y-playerState.y, 2));
      //   if (targetDistance === -1 || distance < targetDistance) {
      //     console.log(distance);
      //     targetField = fieldState;
      //   }
      // }
      let keys = [];
      if (targetField) {
        let threshold = Math.sqrt(targetField.radius);
        if (targetField.x < playerState.x - threshold) {
          keys.push('ArrowLeft');
        } else if (targetField.x > playerState.x + threshold) {
          keys.push('ArrowRight');
        } else {
          // console.log('STOP X');
        }
        if (targetField.y < playerState.y - threshold) {
          keys.push('ArrowUp');
        } else if (targetField.y > playerState.y + threshold) {
          keys.push('ArrowDown');
        } else {
            // console.log('STOP Y');
        }
      }
      for (key in keysdown) {
        let press = keys.indexOf(key) !== -1;
        if(!press && keysdown[key]) {
          keysdown[key] = false;
          socket.emit('keyup', key);
          // console.log('keyup', key);
        } else if(press && !keysdown[key]) {
          keysdown[key] = true;
          socket.emit('keydown', key);
          // console.log('keydown', key);
        }
      }
    }
}

$(function () {
  var refreshIntervalId;
  $("#autopilot").change(function() {
      if(this.checked) {
          BOT = true;
          var refreshIntervalId = setInterval(autopilot, 10);
      } else {
          BOT = false;
          clearInterval(refreshIntervalId);
      }
  });
});
