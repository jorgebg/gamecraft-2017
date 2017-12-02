const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const Game = require('./game');

app.use('/node_modules', express.static('node_modules'));
app.use('/', express.static('public'));

const game = new Game(io);
game.run();

module.exports = http;
