let leader, vehicles = [], obstacles = [], stars = [];
let target, debugMode = false, followQueue = false;
let gameStarted = false; // Variable pour vérifier si le jeu a commencé
let bgImage; // Variable pour stocker l'image de fond
let score = 0; // Score du joueur
let lives = 3; // Vies du joueur

function preload() {
    bgImage = loadImage('background.jpg'); // Charger l'image de fond
}

function setup() {
    if (!gameStarted) return; // Ne rien configurer si le jeu n'a pas commencé
    createCanvas(windowWidth, windowHeight);

    // Initialisation du leader
    leader = new Vehicle(200, 200, "leader");
    vehicles.push(leader);

    // Ajouter des véhicules suiveurs
    for (let i = 0; i < 5; i++) {
        vehicles.push(new Vehicle(random(width), random(height), "follower"));
    }

    // Ajouter quelques étoiles au hasard
    for (let i = 0; i < 10; i++) {
        stars.push(new Star(random(width), random(height)));
    }
}

function draw() {
    if (!gameStarted) return; // Ne pas dessiner si le jeu n'a pas commencé

    // Dessiner l'image de fond
    background(bgImage);

    // Afficher le score et les vies
    fill(255);
    textSize(20);
    textAlign(LEFT, TOP);
    text(`Score: ${score}`, 20, 20);
    text(`Lives: ${lives}`, 20, 50);

    // Vérifier si le joueur a gagné
    if (score >= 100) {
        textSize(50);
        fill(0, 255, 0);
        textAlign(CENTER, CENTER);
        text("Bravo, vous avez terminé !", width / 2, height / 2);

        // Afficher un bouton pour rejouer
        let restartButton = createButton('Restart');
        restartButton.position(width / 2 - 50, height / 2 + 50);
        restartButton.style('padding', '10px 20px');
        restartButton.style('font-size', '20px');
        restartButton.style('background-color', '#00cc00');
        restartButton.style('border', 'none');
        restartButton.style('border-radius', '10px');
        restartButton.style('cursor', 'pointer');
        restartButton.mousePressed(() => {
            restartButton.remove(); // Supprimer le bouton après le clic
            restartGame(); // Redémarrer le jeu
        });

        noLoop(); // Arrêter le jeu
        return;
    }

    // Vérifier si le joueur a perdu
    if (lives <= 0) {
        textSize(50);
        fill(255, 0, 0);
        textAlign(CENTER, CENTER);
        text("Game Over", width / 2, height / 2);

        // Afficher un bouton pour rejouer
        let restartButton = createButton('Restart');
        restartButton.position(width / 2 - 50, height / 2 + 50);
        restartButton.style('padding', '10px 20px');
        restartButton.style('font-size', '20px');
        restartButton.style('background-color', '#ff0000');
        restartButton.style('color', '#ffffff');
        restartButton.style('border', 'none');
        restartButton.style('border-radius', '10px');
        restartButton.style('cursor', 'pointer');
        restartButton.mousePressed(() => {
            restartButton.remove(); // Supprimer le bouton après le clic
            restartGame(); // Redémarrer le jeu
        });

        noLoop(); // Arrêter le jeu
        return;
    }

    // Cible (souris)
    target = createVector(mouseX, mouseY);
    fill(255, 0, 0);
    noStroke();
    circle(target.x, target.y, 16);

    // Afficher les obstacles
    obstacles.forEach(o => o.show());

    // Afficher les étoiles
    stars.forEach(star => star.show());

    // Vérifier la collision avec les étoiles
    stars = stars.filter(star => {
        if (leader.pos.dist(star.pos) < 20) {
            score += 10; // Ajouter au score
            return false; // Retirer l'étoile
        }
        return true;
    });

    // Vérifier la collision avec les obstacles uniquement si file indienne activée
    if (followQueue) {
        obstacles.forEach(obstacle => {
            if (leader.pos.dist(obstacle.pos) < obstacle.r) {
                lives--; // Perdre une vie
                obstacle.color = "red"; // Marquer l'obstacle touché
            }
        });
    }

    // Mise à jour des véhicules
    vehicles.forEach((v, index) => {
        if (v.role === "leader") {
            v.arrive(target); // Le leader suit la souris
        } else if (followQueue) {
            v.arrive(vehicles[index - 1]?.pos || leader.pos); // File indienne
        } else {
            v.followLeader(leader, obstacles, vehicles); // Comportement normal
        }

        v.update();
        v.show();
    });
}

function mousePressed() {
    if (!gameStarted) return;

    // Ajouter un obstacle au clic
    let obstacle = new Obstacle(mouseX, mouseY, 50, "green");
    obstacles.push(obstacle);
}

function keyPressed() {
    if (!gameStarted) return;

    if (key === "d") {
        debugMode = !debugMode; // Activer/désactiver le mode debug
    }

    if (key === "w") {
        // Ajouter un véhicule avec comportement wander
        let wanderer = new Vehicle(random(width), random(height), "wanderer");
        wanderer.color = "blue";
        vehicles.push(wanderer);
    }

    if (key === "l") {
        // Basculer entre comportement normal et file indienne
        followQueue = !followQueue;
        if (followQueue) lives = 3; // Réinitialiser les vies en mode file indienne
    }
}

function startGame() {
    document.getElementById("welcome-screen").style.display = "none"; // Cacher l'écran de bienvenue
    gameStarted = true; // Démarrer le jeu
    setup(); // Configurer les éléments du jeu
    loop(); // Relancer la boucle
}

function restartGame() {
    lives = 3;
    score = 0;
    obstacles = [];
    stars = [];
    vehicles = [];
    leader = new Vehicle(200, 200, "leader");
    vehicles.push(leader);
    for (let i = 0; i < 5; i++) {
        vehicles.push(new Vehicle(random(width), random(height), "follower"));
    }
    for (let i = 0; i < 10; i++) {
        stars.push(new Star(random(width), random(height)));
    }
    loop();
}

document.getElementById("start-btn").addEventListener("click", startGame);

class Star {
    constructor(x, y) {
        this.pos = createVector(x, y);
    }

    show() {
        fill(255, 255, 0);
        noStroke();
        ellipse(this.pos.x, this.pos.y, 10);
    }
}
