class Tile {
  constructor(x, y) {
    this.matrixPos = createVector(x, y);
    this.pixelPos = createVector(x * tileSize + xoff, y * tileSize + yoff);
    this.safe = false;
    this.goal = false;
    this.wall = false;
    this.edges = [];

    // NEW for BFS Visualization
    this.visitedByBFS = false;
    this.inShortestPath = false;
  }

  show() {
    if (this.inShortestPath) {
      fill('#00ff00'); // green for final path
    } else if (this.visitedByBFS) {
      fill('#a0c4ff'); // light blue for explored tiles
    } else if (this.wall) {
      fill(0); // wall
    } else if (this.safe || this.goal) {
      fill('#FFD700'); // goal/safe zone
    } else {
      fill('#E8E3FF'); // default path
    }

    stroke(50);
    strokeWeight(1);
    rect(this.pixelPos.x, this.pixelPos.y, tileSize, tileSize);
  }

  showEdges() {
    for (let i = 0; i < this.edges.length; i++) {
      stroke(0);
      strokeWeight(4);
      switch (this.edges[i]) {
        case 1:
          line(this.pixelPos.x + tileSize, this.pixelPos.y, this.pixelPos.x + tileSize, this.pixelPos.y + tileSize);
          break;
        case 2:
          line(this.pixelPos.x, this.pixelPos.y + tileSize, this.pixelPos.x + tileSize, this.pixelPos.y + tileSize);
          break;
        case 3:
          line(this.pixelPos.x, this.pixelPos.y, this.pixelPos.x, this.pixelPos.y + tileSize);
          break;
        case 4:
          line(this.pixelPos.x, this.pixelPos.y, this.pixelPos.x + tileSize, this.pixelPos.y);
          break;
      }
    }
  }
}
