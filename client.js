var socket = io();
var savedOrientation={alpha:null, sensor:null};

var sensor = null;


var setSensor = function (leftOrRight) {
	savedOrientation.sensor = leftOrRight;
	socket.emit('deviceorientation', JSON.stringify(savedOrientation));
};

var setField = function(key, value) {
	savedOrientation[key]=value;
	socket.emit('deviceorientation', JSON.stringify(savedOrientation));
};

var emitOrientation = _.throttle(function() {
	socket.emit('deviceorientation', JSON.stringify(savedOrientation));
}, 40);

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
	return ret;
};


if (navigator.geolocation) {
    navigator.geolocation.watchPosition(showPosition);
} else {
    d3.select("#lat_anim").text("No Geo");
}

function showPosition(position) {
	// coords.latitude	The latitude as a decimal number
	// coords.longitude	The longitude as a decimal number
	// coords.accuracy	The accuracy of position
	// coords.altitude	The altitude in meters above the mean sea level
	// coords.altitudeAccuracy	The altitude accuracy of position
	// coords.heading	The heading as degrees clockwise from North
	// coords.speed	The speed in meters per second
	// timestamp	The date/time of the response
	d3.select("#lat_anim").text(position.coords.latitude);
	d3.select("#lon_anim").text(position.coords.longitude);
	d3.select("#alt_anim").text(position.coords.altitude.toFixed(0));
	d3.select("#speed_anim").text(position.coords.speed);
	d3.select("#pos_prec_anim").attr('r', position.coords.accuracy);
	savedOrientation.lat=position.coords.latitude;
	savedOrientation.lon=position.coords.longitude;
	savedOrientation.alt=position.coords.altitude;
	savedOrientation.speed=position.coords.speed;
	savedOrientation.acc=position.coords.accuracy;
}

window.addEventListener('deviceorientation', function (e) {
	// { alpha: 321.7861149626408,
	//   beta: 1.1175007911558708,
	//   gamma: -0.3371626239283329,
	//   webkitCompassHeading: 102.759765625,
	//   webkitCompassAccuracy: 25 }
	if (e.alpha) {
		d3.select("#heading").text(("000"+e.webkitCompassHeading.toFixed(0)).slice(-3));
		d3.select("#pitch").text(e.beta.toFixed(0));
		d3.select("#roll").text(e.gamma.toFixed(0));
	}
	var or = compareAndReplaceOld(e, savedOrientation, 1);
	if (or.hasChanged) {
		emitOrientation();
		//socket.emit('deviceorientation', JSON.stringify(savedOrientation));
	}
}, false);
