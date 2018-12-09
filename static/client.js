document.addEventListener("DOMContentLoaded", function() {
    
  // Initializing the canvas and create context
  var canvas = document.getElementById('drawing');
  var context = canvas.getContext('2d');
  var fillBox = document.getElementById("fillBox");

  context.lineWidth = 2;
	context.lineCap = 'round';
  var isDrag = false,
	dragStartLocation,
	screenshot,
  sides,
	angle;
	var clickX = [];
	var clickY = [];
	var paint;
  var socket = io.connect();

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
	function capture() {
    screenshot = context.getImageData(0, 0, canvas.width, canvas.height);
  }
  
  // Restores the previous status of the canvas
	function restore() {
		context.putImageData(screenshot, 0, 0);
	} 

	//Draw the line
	function drawLine(x1,y1,x2,y2,color) {
		context.strokeStyle = '#'+color;
		context.fillStyle = '#'+color;
		context.beginPath();
		context.moveTo(x1,y1);
		context.lineTo(x2,y2);
		context.stroke();
  }

  //Draw the circle
  function drawCircle(x1,y1,x2,y2,fill,color) {
		context.strokeStyle = '#'+color;
		context.fillStyle = '#'+color;
		var radius = Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
		context.beginPath();
		context.arc(x1, y1, radius, 0, 2 * Math.PI, false);
		if(fill){
			context.fill();
		}
		else{
			context.stroke();
		}
	}
 
  //Function for Polygon
	function drawPolygon(x1,y1,x2,y2,sides,angle,fill,color) {
		context.strokeStyle = '#'+color;
		context.fillStyle = '#'+color;
		var coordinates = [],
		radius = Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2)),
		index = 0;
		for (index = 0; index < sides; index++) {
			coordinates.push({x: x1 + radius * Math.cos(angle+Math.PI/4), y: y1 - radius * Math.sin(angle+Math.PI/4)});
			angle += Math.PI/2;
		}
		context.beginPath();
		context.moveTo(coordinates[0].x, coordinates[0].y);
		for (index = 1; index < sides; index++) {
			context.lineTo(coordinates[index].x, coordinates[index].y);
		}
		context.closePath();
		if(fill){
			context.fill();
		}
		else{
			context.stroke();
		}
	}

  // Main draw function that calls the other draw functions
	function draw(x1,y1,x2,y2){
    line=$("#radiobutton1")[0];
		circle=$("#radiobutton2")[0];
		polygon=$("#radiobutton3")[0];

		var selectedColor=$('#c_picker').val();
    if(line.checked === true ){
			data=serializeData(x1,x2,y1,y2,sides,angle,fillBox.checked,selectedColor);
			socket.emit('line',data);
		}
		if(circle.checked === true){
			data=serializeData(x1,x2,y1,y2,sides,angle,fillBox.checked,selectedColor);
			socket.emit('circle',data);
		}
		if(polygon.checked === true){
			data=serializeData(x1,x2,y1,y2,sides,angle,fillBox.checked,selectedColor);
			socket.emit('square',data);
    }
  }
  //To show currently drawn item
	function currentDraw(x1,y1,x2,y2){
		line=$("#radiobutton1")[0];
		circle=$("#radiobutton2")[0];
		polygon=$("#radiobutton3")[0];

		var selectedColor=$('#c_picker').val();
		if(line.checked === true ){
			drawLine(x1,y1,x2,y2,fillBox.checked,color);}

		if(circle.checked === true){
			drawCircle(x1,y1,x2,y2,fillBox.checked,color);
		}
		if(polygon.checked === true){
			drawpolygon(x1,y1,x2,y2,4,Math.PI/2,fillBox.checked,color);
		}
  }

  //Starts the dragging, Saves starting x and y coordinates as well
	function dragStart(event) {
			isDrag = true;
			dragStartLocation = getPointerCoordinates(event);
			capture();
			x1=dragStartLocation.x;
			y1=dragStartLocation.y;
	}

	// Callback for  mouse dragging
	function drag(event) {
			var position;
			if (isDrag === true) {
				restore();
				position = getPointerCoordinates(event);
				x2=position.x;
				y2=position.y;
				currentDraw(x1,y1,x2,y2);
			}
	}

	// Callback when mouse drag is stopped, sets ending x,y coordinates and sends data to server
	function dragStop(event) {
			isDrag = false;
			restore();
			var position = getPointerCoordinates(event);
			x2=position.x;
			y2=position.y;
			draw(x1,y1,x2,y2);
  }
  
  // Sends the function parameters to the clients
	function serializeData(x1,x2,y1,y2){
		var prop={x1:x1,x2:x2,y1:y1,y2:y2};
		var a=JSON.stringify(prop);
		return a;
  }
  // Recieving functions
	socket.on('line',function(data){
		var b=JSON.parse(data);
		drawLine(b.x1,b.y1,b.x2,b.y2);
	});
});