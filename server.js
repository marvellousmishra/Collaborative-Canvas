// Setting express server
var express = require('express'), 
    app = express(),
    httpServer = require('http').createServer(app),
    io = require('socket.io').listen(httpServer);

// start webserver on port 8080
httpServer.listen(8080);

// routing to static files
app.use(express.static('./static'));
console.log("Server running on 127.0.0.1:8080");

// event-handler for new incoming connections
io.on('connection', function (socket) {
    
    //Line
	socket.on('line', function (data) {
		io.emit('line',data);
	});
});