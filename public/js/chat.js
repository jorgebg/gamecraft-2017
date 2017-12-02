$(function () {
  // $('#message').focus();
  $('form.name').submit(function(){
    socket.emit('set name', $('#name').val());
    $('#name').val('');
    $('#message').focus();
    return false;
  });
  $('form.message').submit(function(){
    var msg = $('#message').val();
    if (msg) {
      if (msg == '/addbot') {
        addBot();
      } else if (msg == '/kickbot') {
        kickBot();
      } else {
        socket.emit('chat message', msg);
      }
      $('#message').val('');
      // $('#game').focus();
    }
    return false;
  });

  socket.on('set name', function(name){
    $('#name').attr('placeholder', name);
  });
  socket.on('chat message', function(name, msg){
    $('#messages').append($('<li>').text(name + ': ' + msg));
    $('#messages').animate({scrollTop: $('#messages').prop("scrollHeight")}, 200);
  });
});
