var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
  socket.on('mousePos', function(msg){
    io.emit('mousePos', msg);
  });
  socket.on('touchPos', function(msg){
    console.log(JSON.parse(msg));
  });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});
