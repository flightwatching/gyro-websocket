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
}, 50);

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


// {
//  "gyro": {
//   "alpha": "40.6",
//   "sensor": null,
//   "beta": "0.2",
//   "gamma": "-0.4",
//   "webkitCompassHeading": "260.8",
//   "webkitCompassAccuracy": "25.0",
//   "lat": 43.63396481062827,
//   "lon": 1.3739950980362494,
//   "alt": 151.8798828125,
//   "speed": null,
//   "acc": 65,
//   "mode": "C"
//  }
// }
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
	oldObj.alpha=newObj.alpha.toFixed(0);
	oldObj.beta=newObj.beta.toFixed(2);
	oldObj.gamma=newObj.gamma.toFixed(2);
	// oldObj.webkitCompassHeading=newObj.webkitCompassHeading;
	// oldObj.webkitCompassAccuracy=newObj.webkitCompassAccuracy;
	oldObj.acc=newObj.acc;
	ret.hasChanged=true;
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


window.addEventListener('devicemotion', function (evt) {
	savedOrientation.x=evt.acceleration.x.toFixed(1);
	savedOrientation.y=evt.acceleration.y.toFixed(1);
	savedOrientation.z=evt.acceleration.z.toFixed(1);
	emitOrientation();
}, false);

window.addEventListener('deviceorientation', function (evt) {
	// { alpha: 321.7861149626408,
	//   beta: 1.1175007911558708,
	//   gamma: -0.3371626239283329,
	//   webkitCompassHeading: 102.759765625,
	//   webkitCompassAccuracy: 25 }
	if (evt.alpha) {
		var wkCompass = evt.webkitCompassHeading || 0;
		d3.select("#heading").text(("000"+wkCompass).slice(-3));
		var wkbeta = evt.beta || 0;
		d3.select("#pitch").text(wkbeta.toFixed(0));
		var wkgamma = evt.gamma || 0;
		d3.select("#roll").text(wkgamma.toFixed(0));
	}
	savedOrientation.alpha=evt.alpha.toFixed(0);
	savedOrientation.beta=evt.beta.toFixed(2);
	savedOrientation.gamma=evt.gamma.toFixed(2);
	savedOrientation.acc=evt.acc;
	emitOrientation();
}, false);
