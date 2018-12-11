document.addEventListener("DOMContentLoaded", function() {
    
	// Initializing the canvas and create context
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');
	context.lineWidth = $('#sizebox').val();
	context.lineCap = 'round';
	var isDrag = false,
	dragStartLocation,
	screenshot,
	sides,
	angle;
	var clickX = [];
	var clickY = [];
	var pendown;

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
	function drawLine(x1,y1,x2,y2,fill,color,size) {
		context.strokeStyle = color;
		context.fillStyle = color;
		context.lineWidth = size;
		context.beginPath();
		context.moveTo(x1,y1);
		context.lineTo(x2,y2);
		context.stroke();
  	}

	//Draw the circle
	function drawCircle(x1,y1,x2,y2,fill,color,size) {
		context.lineWidth = $('#sizebox').val();
		context.strokeStyle = color;
		context.fillStyle = color;
		context.lineWidth = size;
		var radius = Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
		context.beginPath();
		context.arc(x1, y1, radius, 0, 2 * Math.PI, false);
		if(fill) {
			context.fill();
		}
		else {
			context.stroke();
		}
	}
	
  	//Function for Polygon
	function drawPolygon(x1,y1,x2,y2,sides,angle,fill,color,size) {
		context.strokeStyle = color;
		context.fillStyle = color;
		context.lineWidth = size;
		var coordinates = [],
		radius = Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2)),
		i = 0;
		for (i = 0; i < sides; i++) {
			coordinates.push({x: x1 + radius * Math.cos(angle+Math.PI/4), y: y1 - radius * Math.sin(angle+Math.PI/4)});
			angle += Math.PI/2;
		}
		context.beginPath();
		context.moveTo(coordinates[0].x, coordinates[0].y);
		for (i = 1; i < sides; i++) {
			context.lineTo(coordinates[i].x, coordinates[i].y);
		}
		context.closePath();
		if(fill){
			context.fill();
		}
		else{
			context.stroke();
		}
	}

	//Function for pen
	//Appending coordinates for Dnamic drawing in an array
	function appendClick(x, y){
		clickX.push(x);
		clickY.push(y);
	}

	// Function to draw the dynamic array
	function redraw(color,size){
		context.strokeStyle = color;
		context.lineWidth = size;
		for(var i=0; i < clickX.length; i++) {
			console.log(clickX[i-1], clickY[i-1], clickX[i]-1, clickY[i]);		
			context.beginPath();
			if(i){
			  context.moveTo(clickX[i-1], clickY[i-1]);
			}	
			else{
			  context.moveTo(clickX[i]-1, clickY[i]);
			}
			context.lineTo(clickX[i], clickY[i]);
			context.closePath();
			context.stroke();
		}
	}

	//Function to draw the received dynamic array 
	function redrawCanvas(color,size){
		redraw(color,size);
		pendown = false;
  		clickX = [];
		clickY = [];
	}

	//Drawing the dynamic array when mouse leaves the canvas
	function stopPen(){
		var tool = $("#eraser")[0].checked ? 'eraser' : 'pen';
		var color = $("#eraser")[0].checked ? '#dfe3ee' : $('#colorbox').val();
		pendown = false;
		var coordinates_array = JSON.stringify({x:clickX,y:clickY,color:color,size:$('#sizebox').val()});
		socket.emit(tool, coordinates_array);
		clickX = [];
		clickY = [];
	}

	//stop drawing when pointer leaves the canvas
	$('#canvas').mouseleave(function(e){stopPen();});

  	// Main draw function
	function draw(x1,y1,x2,y2){
		fillBox = $("#fillbox")[0];
		line= $("#line")[0];
		circle=$("#circle")[0];
		polygon=$("#square")[0];
		var selectedColor=$('#colorbox').val();
		var selectedSize = $('#sizebox').val();
    	if(line.checked === true ){
			data=serializeData(x1,x2,y1,y2,sides,angle,fillBox.checked,selectedColor,selectedSize);
			socket.emit('line',data);
		}
		if(circle.checked === true){
			data=serializeData(x1,x2,y1,y2,sides,angle,fillBox.checked,selectedColor,selectedSize);
			socket.emit('circle',data);
		}
		if(polygon.checked === true){
			data=serializeData(x1,x2,y1,y2,sides,angle,fillBox.checked,selectedColor,selectedSize);
			socket.emit('polygon',data);
		}
  	}
  	//To show currently drawn item
	function currentDraw(x1,y1,x2,y2){
		fillBox=$("#fillbox")[0];
		line=$("#line")[0];
		circle=$("#circle")[0];
		polygon=$("#square")[0];
		var selectedColor=$('#colorbox').val();
		var selectedSize = $('#sizebox').val();
		if(line.checked === true ){
			drawLine(x1,y1,x2,y2,fillBox.checked,selectedColor,selectedSize);
		}
		if(circle.checked === true){
			drawCircle(x1,y1,x2,y2,fillBox.checked,selectedColor,selectedSize);
		}
		if(polygon.checked === true){
			drawPolygon(x1,y1,x2,y2,4,Math.PI/2,fillBox.checked,selectedColor,selectedSize);
		}
	}

  	//Starts the dragging and save the starting coordinates  
	function dragStart(event){
		if($("#pen")[0].checked === true || $("#eraser")[0].checked === true){
			dragStartLocation = getPointerCoordinates(event);
			pendown = true;
			appendClick(dragStartLocation.x, dragStartLocation.y);
		}
		else{
			isDrag = true;
			dragStartLocation = getPointerCoordinates(event);
			capture();
			x1=dragStartLocation.x;
			y1=dragStartLocation.y;
		}
	}

	// Callback for  mouse dragging
	function drag(event) {
		if($("#pen")[0].checked === true || $("#eraser")[0].checked === true){
			if(pendown){
				dragStartLocation = getPointerCoordinates(event);
				appendClick(dragStartLocation.x, dragStartLocation.y);
				redraw(( $("#eraser")[0].checked ? "#dfe3ee" : $('#colorbox').val()),$('#sizebox').val());
			}
		}
		else{
			var position;
			if (isDrag === true) {
				restore();
				position = getPointerCoordinates(event);
				x2=position.x;
				y2=position.y;
				currentDraw(x1,y1,x2,y2);
			}
		}
	}

	// Callback when mouse drag is stopped, sets ending x,y coordinates and sends data to server
	function dragStop(event) {
		if($("#pen")[0].checked === true || $("#eraser")[0].checked === true){
			stopPen();
		}
		else {
			isDrag = false;
			restore();
			var position = getPointerCoordinates(event);
			x2=position.x;
			y2=position.y;
			draw(x1,y1,x2,y2);
		}
 	}
  
 	// Serialize function parameters for sending it to the clients
	function serializeData(x1,x2,y1,y2,sides,angle,fill,color,size){
		var prop={x1:x1,x2:x2,y1:y1,y2:y2,sides:sides,angle:angle,fill:fill,color:color,size:size};
		var a=JSON.stringify(prop);
		return a;
	}
	
	// Sending Clear Instruction
	$("#clear").click(function(){
		socket.emit('clear');
		clickX = [];
		clickY = [];
	});

  	// Recieving functions
	var socket = io.connect();
	socket.on('line',function(data){
		var line_data=JSON.parse(data);
		drawLine(line_data.x1,line_data.y1,line_data.x2,line_data.y2,line_data.fill,line_data.color,line_data.size);
	});

	socket.on('circle',function(data){
		var circle_data=JSON.parse(data);
		drawCircle(circle_data.x1,circle_data.y1,circle_data.x2,circle_data.y2,circle_data.fill,circle_data.color,circle_data.size);
	});

	socket.on('polygon',function(data){
		var poly_data=JSON.parse(data);
		drawPolygon(poly_data.x1,poly_data.y1,poly_data.x2,poly_data.y2,4,Math.PI/2,poly_data.fill,poly_data.color,poly_data.size);
	});

	socket.on('pen',function(data){
		var pen_data=JSON.parse(data);
		clickX=pen_data.x;
		clickY=pen_data.y;
		color=pen_data.color;
		size=pen_data.size;
		redrawCanvas(color,size);
	});

	socket.on('clear',function(){
		context.clearRect ( 0 , 0 , canvas.width, canvas.height );
	});
	
	socket.on('eraser',function(data){
		var pen_data=JSON.parse(data);
		clickX=pen_data.x;
		clickY=pen_data.y;
		color=pen_data.color;
		size=pen_data.size;
		redrawCanvas(color,size);
	});
});