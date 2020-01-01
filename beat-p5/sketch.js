const width = window.innerWidth;
const height = window.innerHeight;
const padding = 30;
let pulse = 0;
let pulseDir = true;

function setup() {
	createCanvas(width, height);
	rectMode(CENTER);
}

function generatePointsAround(radius, center) {	
	const points = [];
	const nrOfPoints = 16;
	for (let i = 0; i < nrOfPoints; i++) {
		const angle = (2 * Math.PI / nrOfPoints * i) - Math.PI / 2;
		console.log(angle);
		const x = center.x + radius * Math.cos(angle);
		const y = center.y + radius * Math.sin(angle);
		points.push({x, y});
	}

	return points;
}

function step() {
	if (pulseDir) {
		pulse -= 0.01;
	} else {
		pulse += 0.01;
	}
	if (Math.abs(pulse) > 1) {
		pulseDir = !pulseDir;
		//pulse = 0;
	};
}

function draw() {
	// Clear the screen
	background(0);

	// Do step methods
	step();

	// Debug output
	drawDebug();

	// Draw stuff
	drawTitle();
	drawPoint({ x: width/2, y: height/2 }, 80);
	generatePointsAround(80, { x: width/2, y: height/2 }).forEach(pos => {
		drawPoint(pos, 20);
		drawText(Math.round(pos.x), pos);
	});
}

function drawDebug() {
	let line = 0;
	fill('green');
	textAlign(LEFT);
	textSize(12);
	text(pulseDir, padding, padding*(++line));
	text(pulse, padding, padding*(++line));
}

function drawTitle() {
	fill(255);
	textAlign(CENTER);
	textSize(24);
	text("ROOT", width/2, padding);
}

function drawText(output, position, size = 12) {
	fill(255);
	textAlign(CENTER);
	textSize(size);
	text(output, position.x, position.y);
}

function drawPoint(position, size) {
	fill('red');
	size = size + (pulse/10 * size)
	ellipse(position.x, position.y, size, size);
}