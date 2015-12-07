var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.get('/main.css', function(req, res){
  res.sendfile('main.css');
});

app.get('/', function(req, res){
  res.sendfile('remote.html');
});

app.get('/client.js', function(req, res){
  res.sendfile('client.js');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
  socket.on('touch', function(msg){
    io.emit('touch', msg);
  });
  // socket.on('devicemotion', function(msg){
  //   console.log(JSON.parse(msg));
  // });
  socket.on('deviceorientation', function(msg){
    io.emit('deviceorientation', msg);
  });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});
