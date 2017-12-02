const server = require('./lib/server');
const port = process.env.PORT || 3000;


server.listen(port, function(){
  console.log('listening on *:' + port);
});
