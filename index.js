var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.use('/node_modules', express.static('node_modules'));
app.use('/', express.static('public'));


io.on('connection', function(socket){
  socket.name = 'Player 1';
  socket.emit('set name', socket.name);
  socket.on('set name', function(name){
    socket.name = name;
    io.emit('set name', name);
  });
  socket.on('chat message', function(msg){
    io.emit('chat message', socket.name, msg);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
