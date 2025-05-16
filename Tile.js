class Tile {
  constructor(x, y) {
    this.matrixPos = createVector(x, y)
    this.pixelPos = createVector(x * tileSize + xoff, y * tileSize + yoff)
    this.safe = false
    this.goal = false
    this.wall = false
    this.edges = []
  }

  show() {
    // Draw background tile
    if (this.wall) {
      fill(0) // Black walls like Pacman maze
    } else if (this.safe || this.goal) {
      fill('#FFD700') // Glowing gold for goal/safe zones
    } else {
      fill('#E8E3FF') // Light purple paths
    }

    stroke(50) // Subtle grid lines
    strokeWeight(1)
    rect(this.pixelPos.x, this.pixelPos.y, tileSize, tileSize)
  }

  showEdges() {
    for (let i = 0; i < this.edges.length; i++) {
      stroke(0)
      strokeWeight(4)
      switch (this.edges[i]) {
        case 1: // Right
          line(this.pixelPos.x + tileSize, this.pixelPos.y, this.pixelPos.x + tileSize, this.pixelPos.y + tileSize)
          break
        case 2: // Bottom
          line(this.pixelPos.x, this.pixelPos.y + tileSize, this.pixelPos.x + tileSize, this.pixelPos.y + tileSize)
          break
        case 3: // Left
          line(this.pixelPos.x, this.pixelPos.y, this.pixelPos.x, this.pixelPos.y + tileSize)
          break
        case 4: // Top
          line(this.pixelPos.x, this.pixelPos.y, this.pixelPos.x + tileSize, this.pixelPos.y)
          break
      }
    }
  }
}
