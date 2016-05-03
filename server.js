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

var started=false;
var simuStarted = false;
var status = {connectCounter:0, i:0};

function generateSimu() {
  if (!simuStarted)
    return;
  var val = JSON.stringify(status);
  status.i++;
  io.emit('simu', val);
  var generateSimuThread = setTimeout(generateSimu,1000);
}



io.on('connection', function(socket) {
  status.connectCounter++;
  console.info ("we have "+status.connectCounter+" users")
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
    console.info("starting simu because we have users");
    simuStarted=true;
    generateSimu();
  }
  socket.on('disconnect', function() {
    status.connectCounter--;
    if (status.connectCounter<=0) {
      console.info("Stopping simu because no more users");
      simuStarted=false;
    }
  });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});
