var socket = io();
var savedOrientation={alpha:null};
$('form').submit(function(){
	socket.emit('chat message', $('#m').val());
	$('#m').val('');
	return false;
});
socket.on('chat message', function(msg){
	$('#messages').append($('<li>').text(msg));
});
socket.on('touch', function(msg){
	$('#currentPosition').html(msg);
});
window.addEventListener('mousemove', function (e) {
	//socket.emit('touch', JSON.stringify({x:e.x,y:e.y,rot:0}));
}, false);
window.addEventListener('touchmove', function (e) {
	//socket.emit('touch', JSON.stringify({x:e.screenX,y:e.screenY,rot:rotation}));
}, false);
// window.addEventListener('devicemotion', function (e) {
//   socket.emit('devicemotion', JSON.stringify(e));
// }, false);
var compareAndReplaceOld = function(newObj, oldObj, precision) {
	var ret = {hasChanged: false};
	var cat = "";
	for (var field in newObj) {
		if (newObj.hasOwnProperty(field)) {
			if (!isNaN(newObj[field])) {
				var val = newObj[field].toFixed(precision);
				if (oldObj[field]!==val) {
					oldObj[field]=val;
					ret.hasChanged = true;
				}
			}
		}
	}
	// if (ret.hasChanged) {
	//   $('#log').html(JSON.stringify(oldObj));
	// }
	return ret;
};
window.addEventListener('deviceorientation', function (e) {
	// { alpha: 321.7861149626408,
	//   beta: 1.1175007911558708,
	//   gamma: -0.3371626239283329,
	//   webkitCompassHeading: 102.759765625,
	//   webkitCompassAccuracy: 25 }
	var or = compareAndReplaceOld(e, savedOrientation, 1);
	if (or.hasChanged) {
		socket.emit('deviceorientation', JSON.stringify(savedOrientation));
	}
}, false);
