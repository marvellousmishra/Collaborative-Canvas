document.addEventListener("DOMContentLoaded", function() {
    
  // Initializing the canvas and create context
  var canvas  = document.getElementById('drawing');
  var context = canvas.getContext('2d');
  context.lineWidth = 2;
	context.lineCap = 'round';
  var dragging = false,
	dragStartLocation,
	snapshot;
	var clickX = [];
	var clickY = [];
	var paint;
  var socket  = io.connect();

  // mouse event handlers
  canvas.addEventListener('mousedown', dragStart, false);
	canvas.addEventListener('mousemove', drag, false);
	canvas.addEventListener('mouseup', dragStop, false);

  //Function to get Coordinates of the pointer
	function getPointerCoordinates(e) {

		var x = e.clientX - canvas.getBoundingClientRect().left,
		y = e.clientY - canvas.getBoundingClientRect().top;
		return {x: x, y: y};
  }
  
  // Saves current status of the canvas
	function captureCurrentStatus() {
    snapshot = context.getImageData(0, 0, canvas.width, canvas.height);
  }
  
  // Restores the previous status of the canvas
	function restoreStatus() {
		context.putImageData(snapshot, 0, 0);
	} 

	//Draw the line
	function drawLine(x1,y1,x2,y2) {
		// context.strokeStyle = '#'+color;
		// context.fillStyle = '#'+color;
		context.beginPath();
		context.moveTo(x1,y1);
		context.lineTo(x2,y2);
		context.stroke();

  }

  // Sends the function parameters to the clients
	function sending(x1,x2,y1,y2){
		var prop={x1:x1,x2:x2,y1:y1,y2:y2};
		var a=JSON.stringify(prop);
		return a;
  }
  
  // Main draw function that calls the other draw functions
	function draw(x1,y1,x2,y2){
    a=sending(x1,x2,y1,y2);
      socket.emit('line',a);
  }

  //To show currently drawn item
	function currentDraw(x1,y1,x2,y2){
    drawLine(x1,y1,x2,y2);
  }

  //Starts the dragging, Saves starting x and y coordinates as well
	function dragStart(event) {
			dragging = true;
			dragStartLocation = getPointerCoordinates(event);
			captureCurrentStatus();
			x1=dragStartLocation.x;
			y1=dragStartLocation.y;
	}

	// Callback for  mouse dragging
	function drag(event) {
			var position;
			if (dragging === true) {
				restoreStatus();
				position = getPointerCoordinates(event);
				x2=position.x;
				y2=position.y;
				currentDraw(x1,y1,x2,y2);
			}
	}

	// Callback when mouse drag is stopped, sets ending x,y coordinates and sends data to server
	function dragStop(event) {
			dragging = false;
			restoreStatus();
			var position = getPointerCoordinates(event);
			x2=position.x;
			y2=position.y;
			draw(x1,y1,x2,y2);
  }
  
  // Recieving functions
	socket.on('line',function(data){
		var b=JSON.parse(data);
		drawLine(b.x1,b.y1,b.x2,b.y2);
	});
});
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  // var mouse = { 
  //      click: false,
  //      move: false,
  //      pos: {x:0, y:0},
  //      pos_prev: false
  //   };
  //   // get canvas element and create context
  //   var canvas  = document.getElementById('drawing');
  //   var context = canvas.getContext('2d');
  //   var width   = window.innerWidth;
  //   var height  = window.innerHeight;
  //   var socket  = io.connect();
 
  //   // set canvas to full browser width/height
  //   canvas.width = width;
  //   canvas.height = height;
 
  //   // register mouse event handlers
  //   canvas.onmousedown = function(e){ mouse.click = true; };
  //   canvas.onmouseup = function(e){ mouse.click = false; };
 
  //   canvas.onmousemove = function(e) {
  //      // normalize mouse position to range 0.0 - 1.0
  //      mouse.pos.x = e.clientX / width;
  //      mouse.pos.y = e.clientY / height;
  //      mouse.move = true;
  //   };
 
  //   // draw line received from server
  //    socket.on('draw_line', function (data) {
  //      var line = data.line;
  //      context.beginPath();
  //      context.moveTo(line[0].x * width, line[0].y * height);
  //      context.lineTo(line[1].x * width, line[1].y * height);
  //      context.stroke();
  //   });
    
  //   // main loop, running every 25ms
  //   function mainLoop() {
  //      // check if the user is drawing
  //      if (mouse.click && mouse.move && mouse.pos_prev) {
  //         // send line to to the server
  //         socket.emit('draw_line', { line: [ mouse.pos, mouse.pos_prev ] });
  //         mouse.move = false;
  //      }
  //      mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
  //      setTimeout(mainLoop, 25);
  //   }
  //   mainLoop();
