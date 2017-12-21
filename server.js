var sleep = require('sleep');
var port = 8080;
var Gpio = require('onoff').Gpio;
var LED = new Gpio(4, 'out');

var app = require('express')();
var http = require('http').Server(app);
http.listen(port, function(){
	console.log('listening on port:' + port);
});

var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

//var ledPreviousState = LED.readSync();
//setInterval(function() {
//	if(!LED.readSync() == ledPreviousState){
//		socket.emit();
//	}
//}, 2000);

io.on('connection', function(socket){
	//socket.emit();
	console.log('new user');
	socket.on('led', function(msg){
		//LED.writeSync(msg);
		LED.writeSync(1);
		console.log('entered led event ' + msg);
		io.emit('led', LED.readSync());
		console.log('emited ' + LED.readSync());
		sleep.msleep(200);
		LED.writeSync(0);
		io.emit('led', LED.readSync());
	});
});

setInterval(function(){
	console.log('interval sent');
	io.emit('test', 'Hello from interval');


}, 3000);
