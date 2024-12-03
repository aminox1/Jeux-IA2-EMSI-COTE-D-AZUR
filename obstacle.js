class Obstacle {
    constructor(x, y, r, color = "green") {
        this.pos = createVector(x, y);
        this.r = r;
        this.color = color;
    }

    show() {
        fill(this.color);
        noStroke();
        ellipse(this.pos.x, this.pos.y, this.r * 2);
    }
}
