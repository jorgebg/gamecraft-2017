function updateBot(bot) {
  if (bot.socket.id in state.players) {
    let botState = state.players[bot.socket.id];
    let targetField;
    if (bot.targetId in state.fields) {
      targetField = state.fields[bot.targetId];
    } else if (Math.random() < bot.difficulty) {
      let fieldIds = Object.keys(state.fields);
      bot.targetId = fieldIds[Math.floor(Math.random()*fieldIds.length)];
      targetField = state.fields[bot.targetId];
    }
    // let targetField = false;
    // let targetDistance = -1;
    // for (let id in state.fields) {
    //   let fieldState = state.fields[id];
    //   let distance = Math.sqrt(Math.pow(fieldState.x-botState.x, 2), Math.pow(fieldState.y-botState.y, 2));
    //   if (targetDistance === -1 || distance < targetDistance) {
    //     console.log(distance);
    //     targetField = fieldState;
    //   }
    // }
    let keys = [];
    if (targetField) {
      let threshold = Math.sqrt(targetField.radius);
      if (targetField.x < botState.x - threshold) {
        keys.push('ArrowLeft');
      } else if (targetField.x > botState.x + threshold) {
        keys.push('ArrowRight');
      } else {
        // console.log('STOP X');
      }
      if (targetField.y < botState.y - threshold) {
        keys.push('ArrowUp');
      } else if (targetField.y > botState.y + threshold) {
        keys.push('ArrowDown');
      } else {
          // console.log('STOP Y');
      }
    }
    for (key in bot.keysdown) {
      let press = keys.indexOf(key) !== -1;
      if(!press && bot.keysdown[key]) {
        bot.keysdown[key] = false;
        bot.socket.emit('keyup', key);
        // console.log('keyup', key);
      } else if(press && !bot.keysdown[key]) {
        bot.keysdown[key] = true;
        bot.socket.emit('keydown', key);
        // console.log('keydown', key);
      }
    }
  }
}

var N_BOTS = 1;

function addBot() {
  var bot = {
    'socket': io(socket.io.uri),
    'targetId': false,
    'difficulty': 0.1,
    'keysdown': {
      'ArrowUp': false,
      'ArrowDown': false,
      'ArrowLeft': false,
      'ArrowRight': false,
    },
    'updateBot': function() {
      updateBot(bot);
    }
  }
  bot.socket.emit('set name', player.name + ' Bot ' + N_BOTS);
  N_BOTS++;
  bots.push(bot);
}

function kickBot() {
  var bot = bots.pop();
  bot.socket.close();
}
