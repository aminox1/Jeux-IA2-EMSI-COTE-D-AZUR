class Vehicle {
    constructor(x, y, role = "follower") {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.maxSpeed = 6;
        this.maxForce = 0.4;
        this.color = role === "leader" ? "red" : "blue"; // Rouge pour le leader, bleu pour les autres
        this.role = role;
        this.separationDistance = 50;
        this.stopped = false; // Stop flag
    }

    arrive(target) {
        if (this.stopped) return;

        let desired = p5.Vector.sub(target, this.pos);
        let distance = desired.mag();
        let speed = this.maxSpeed;
        if (distance < 100) {
            speed = map(distance, 0, 100, 0, this.maxSpeed); // Slow down near the target
        }
        desired.setMag(speed);
        let steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxForce);
        this.applyForce(steer);
    }

    followLeader(leader, obstacles, vehicles) {
        if (this.stopped) return;

        let followForce = this.seek(leader.pos);
        let separateForce = this.separate(vehicles);
        let avoidForce = this.avoid(obstacles);

        followForce.mult(0.5);
        separateForce.mult(1.0);
        avoidForce.mult(1.5);

        this.applyForce(followForce);
        this.applyForce(separateForce);
        this.applyForce(avoidForce);
    }

    wander() {
        if (this.stopped) return;

        let wanderForce = p5.Vector.random2D().setMag(this.maxForce);
        this.applyForce(wanderForce);
    }

    avoidEdges() {
        if (this.stopped) return;

        let margin = 50;
        let steer = createVector(0, 0);

        if (this.pos.x < margin) steer.add(createVector(this.maxForce, 0));
        if (this.pos.x > width - margin) steer.add(createVector(-this.maxForce, 0));
        if (this.pos.y < margin) steer.add(createVector(0, this.maxForce));
        if (this.pos.y > height - margin) steer.add(createVector(0, -this.maxForce));

        this.applyForce(steer);
    }

    seek(target) {
        if (!target) return createVector(0, 0);

        let desired = p5.Vector.sub(target, this.pos).setMag(this.maxSpeed);
        let steer = p5.Vector.sub(desired, this.vel).limit(this.maxForce);
        return steer;
    }

    separate(vehicles) {
        let steer = createVector(0, 0);
        vehicles.forEach(v => {
            let distance = p5.Vector.dist(this.pos, v.pos);
            if (distance > 0 && distance < this.separationDistance) {
                let flee = p5.Vector.sub(this.pos, v.pos).setMag(this.maxForce);
                steer.add(flee);
            }
        });
        steer.limit(this.maxForce);
        return steer;
    }

    avoid(obstacles) {
        let steer = createVector(0, 0);
        obstacles.forEach(obstacle => {
            let distance = p5.Vector.dist(this.pos, obstacle.pos);
            if (distance < obstacle.r + this.separationDistance) {
                let flee = p5.Vector.sub(this.pos, obstacle.pos).setMag(this.maxForce);
                steer.add(flee);
            }
        });
        steer.limit(this.maxForce);
        return steer;
    }

    applyForce(force) {
        this.acc.add(force);
    }

    update() {
        if (!this.stopped) {
            this.vel.add(this.acc).limit(this.maxSpeed);
            this.pos.add(this.vel);
            this.acc.mult(0);
        }
    }

    show() {
        noStroke();
        fill(this.color);
        this.drawGhost();

        if (debugMode && this.role !== "leader") {
            this.debugVectors();
        }
    }

    drawGhost() {
        // Dessiner la forme de fantôme Pac-Man
        push();
        translate(this.pos.x, this.pos.y);

        // Corps du fantôme
        beginShape();
        fill(this.color);
        arc(0, 0, 40, 40, radians(180), radians(360), PIE); // Tête
        rect(-20, 0, 40, 20); // Bas du corps
        endShape();

        // Yeux du fantôme
        fill(255); // Blanc
        ellipse(-10, -10, 10, 10);
        ellipse(10, -10, 10, 10);

        fill(0); // Noir
        ellipse(-10, -10, 5, 5);
        ellipse(10, -10, 5, 5);

        pop();
    }

    debugVectors() {
        // Afficher les vecteurs de vitesse et d'accélération
        stroke(255, 255, 0);
        strokeWeight(2);
        line(this.pos.x, this.pos.y, this.pos.x + this.vel.x * 10, this.pos.y + this.vel.y * 10);

        stroke(255, 0, 0);
        strokeWeight(2);
        line(this.pos.x, this.pos.y, this.pos.x + this.acc.x * 50, this.pos.y + this.acc.y * 50);
    }
}
