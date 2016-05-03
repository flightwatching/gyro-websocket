var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var log = require('util');


app.get('/main.css', function(req, res){
  res.sendfile('main.css');
});

app.get('/', function(req, res){
  res.sendfile('remote.html');
});

app.get('/client.js', function(req, res){
  res.sendfile('client.js');
});

var started=false;
var simuStarted = false;
var status = {connectCounter:0, i:0, a:0, b:0, c:0};

function generateSimu() {
  if (!simuStarted)
    return;
  var val = JSON.stringify(status);
  var i = (status.i++)*Math.PI/180;
  status.a=10*Math.sin(i)+Math.random()*0.5;
  status.b=10*Math.cos(i)+Math.random()*0.5;
  status.c=Math.sqrt(i)+Math.random()*0.5;
  io.emit('simu', val);
  var generateSimuThread = setTimeout(generateSimu,1000);
}



io.on('connection', function(socket) {
  status.connectCounter++;
  log.log ("we have "+status.connectCounter+" users")
  if (!started) {
    socket.on('touch', function(msg){
      io.emit('touch', msg);
    });
    socket.on('deviceorientation', function(msg){
      io.emit('deviceorientation', msg);
    });
    started = true;
  }
  if (!simuStarted) {
    log.log("starting simu because we have users");
    simuStarted=true;
    generateSimu();
  }
  socket.on('disconnect', function() {
    status.connectCounter--;
    if (status.connectCounter<=0) {
      log.log("Stopping simu because no more users");
      simuStarted=false;
    }
  });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});
