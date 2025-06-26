let grasses = [];

let prevMouseX;
let prevMouseY;
let windDir = 0;
const MAX_GRASSES = 5000;
let grassIdCounter = 0;

let frameCounter = 0;
const SORT_FREQUENCY = 5;
const BACKGROUND_UPDATE_FREQUENCY = 10;

function setup() {
  createCanvas(windowWidth, windowHeight);

  prevMouseX = mouseX;
  prevMouseY = mouseY;
  frameRate(15);
}

function draw() {
  background(255);

  let dx = mouseX - prevMouseX;
  let dy = mouseY - prevMouseY;

  windDir = lerp(windDir, dx * 0.002, 0.1);

  prevMouseX = mouseX;

  grasses.sort((a, b) => a.base.y - b.base.y);

  for (let g of grasses) {
    g.update(dy);
    g.display();
  }

  prevMouseY = mouseY;
}

function mouseDragged() {
  addGrass(mouseX, mouseY, 12);
}

function addGrass(x, y, count) {
  for (let i = 0; i < count; i++) {
    if (grasses.length >= MAX_GRASSES) {
      let oldestIndex = 0;
      let oldestId = grasses[0].id;
      
      for (let j = 1; j < grasses.length; j++) {
        if (grasses[j].id < oldestId) {
          oldestId = grasses[j].id;
          oldestIndex = j;
        }
      }
      
      grasses.splice(oldestIndex, 1);
    }
    grasses.push(new Grass(x + random(-20, 20), y + random(-20, 20), grassIdCounter++));
  }
}


class Grass {
  constructor(x, y, id) {
    this.id = id;
    this.base = createVector(x, y);

    this.len = random(15, 55);

    this.baseBend = random(-0.4, 0.43);

    this.angle = this.baseBend;

    this.targetAngle = this.baseBend;

    this.firmness = 0.75;

    this.color = lerpColor(color('#225400'), color('#B2D186'), random());

    this.flower = random(1) < 0.04;

    this.flowerColor = random(['#F44366',  '#BA68C8', '#EC407A']);

    this.windOffset = random(TWO_PI);

    this.strokeWeight = 1.2;

    let index = floor(random(4));
    this.soilWidth = 4 + (index * 2);
    this.soilThickness = 1.2;
  }

  update(dy) {
    let idleSway = 0.02 * sin(frameCount * 0.04 + this.windOffset);

    this.targetAngle = this.baseBend + idleSway;

    this.targetAngle += windDir;

    let d = dist(mouseX, mouseY, this.base.x, this.base.y);
    if (d < 50) {
      let localForce = map(d, 0, 50, 0.30, 0);

      localForce *= (windDir >= 0 ? 1 : -1);

      this.targetAngle += localForce;
    }

    let lateralPushStrength = map(abs(dy), 0, 20, 0, 0.1, true);
    if (this.base.x < mouseX) {
      this.targetAngle -= lateralPushStrength * (dy >= 0 ? 1 : -1);
    } else {
      this.targetAngle += lateralPushStrength * (dy >= 0 ? 1 : -1);
    }

    this.angle += (this.targetAngle - this.angle) * 0.1;
  }

  display() {
    this.displaySoil();
    this.displayGrass();
  }
  
  displayGrass() {
    noFill();

    strokeCap(SQUARE);

    let tipX = this.base.x + sin(this.angle) * this.len;
    let tipY = this.base.y - this.len;

    let ctrl1 = createVector(
    this.base.x + sin(this.angle) * this.len * 0.25,
    this.base.y - this.len * 0.5
    );

    let ctrl2 = createVector(
    this.base.x + sin(this.angle) * this.len * 0.6,
    this.base.y - this.len * 0.9
    );

    stroke(255);
    strokeWeight(this.strokeWeight + 1);
    beginShape();
    vertex(this.base.x, this.base.y);
    bezierVertex(ctrl1.x, ctrl1.y, ctrl2.x, ctrl2.y, tipX, tipY);
    endShape();

    stroke(this.color);
    strokeWeight(this.strokeWeight);
    beginShape();
    vertex(this.base.x, this.base.y);
    bezierVertex(ctrl1.x, ctrl1.y, ctrl2.x, ctrl2.y, tipX, tipY);
    endShape();

    noStroke();
    fill(this.color);
    circle(tipX, tipY, 1);

    if (this.flower) {
      fill(this.flowerColor);
      circle(tipX, tipY, 2.2);
    }

}
  
 displaySoil() {
  noStroke();
    fill('#E9CCAF');
    ellipse(this.base.x, this.base.y, this.soilWidth, this.soilWidth * 0.18);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
