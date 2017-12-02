
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update, render: render });

function preload() {
    game.load.image('stars', 'assets/starfield.jpg');
    game.load.spritesheet('ship', 'assets/humstar.png', 32, 32);
}

var player;
var starfield;
var cursors;

function create() {

    //  Enable P2
    game.physics.startSystem(Phaser.Physics.P2JS);

    //  Turn on impact events for the world, without this we get no collision callbacks
    game.physics.p2.setImpactEvents(true);

    game.physics.p2.restitution = 0.8;

    //  Create our collision groups
    var playerCollisionGroup = game.physics.p2.createCollisionGroup();

    //  This part is vital if you want the objects with their own collision groups to still collide with the world bounds
    //  (which we do) - what this does is adjust the bounds to use its own collision group.
    game.physics.p2.updateBoundsCollisionGroup();

    starfield = game.add.tileSprite(0, 0, 800, 600, 'stars');
    starfield.fixedToCamera = true;

    //  Create our player sprite
    player = game.add.sprite(200, 200, 'ship');
    player.scale.set(2);
    player.smoothed = false;
    player.animations.add('fly', [0,1,2,3,4,5], 10, true);
    player.play('fly');

    game.physics.p2.enable(player, false);
    player.body.setCircle(28);
    player.body.fixedRotation = true;

    var style = { font: "12px Arial", fill: "#fff", align: "center"};
    player.text = game.add.text(0, 0, "Player 1", style);

    //  Set the players collision group
    player.body.setCollisionGroup(playerCollisionGroup);

    game.camera.follow(player);

    cursors = game.input.keyboard.createCursorKeys();


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
    game.physics.arcade.moveToXY(player, server.player.x, server.player.y, 30, 30);
    // game.physics.arcade.moveToXY(player.text, server.player.x, server.player.y - player.height, 30, 30);
    player.text.x = server.player.x - player.text.width/2;
    player.text.y = server.player.y - 48;
    //
    // game.physics.arcade.collide(player, layer);
    //
    // player.body.velocity.x = 0;
    //
    // if (cursors.left.isDown)
    // {
    //     player.body.velocity.x = -150;
    //
    //     if (facing != 'left')
    //     {
    //         player.animations.play('left');
    //         facing = 'left';
    //     }
    // }
    // else if (cursors.right.isDown)
    // {
    //     player.body.velocity.x = 150;
    //
    //     if (facing != 'right')
    //     {
    //         player.animations.play('right');
    //         facing = 'right';
    //     }
    // }
    // else
    // {
    //     if (facing != 'idle')
    //     {
    //         player.animations.stop();
    //
    //         if (facing == 'left')
    //         {
    //             player.frame = 0;
    //         }
    //         else
    //         {
    //             player.frame = 5;
    //         }
    //
    //         facing = 'idle';
    //     }
    // }
    //
    // if (cursors.up.isDown && player.body.onFloor() && game.time.now > jumpTimer)
    // {
    //     player.body.velocity.y = -250;
    //     jumpTimer = game.time.now + 750;
    // }

}

function render () {

    // game.debug.text(game.time.physicsElapsed, 32, 32);
    // game.debug.body(player);
    // game.debug.bodyInfo(player, 16, 24);

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
