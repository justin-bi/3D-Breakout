import * as Dat from 'dat.gui';
import { Scene } from 'three';
import { Level } from 'levels';
import { BasicLights } from 'lights';
import * as THREE from 'three';
import { Multiplier } from 'objects';

import LevelWinSound from '../../assets/sounds/winSound.mp3';
import GameWinSound from '../../assets/sounds/gameWin.mp3';
import GameOverSound from '../../assets/sounds/gameOver.mp3';
import Happy from '../../assets/images/yay.gif';
import Sad from '../../assets/images/noo.gif';


/* COLOR SCHEME */

// colors for the bricks
const BRICK_COLORS = [0x00916e, 0xAEFFD8, 0xE44E5A, 0xFF990A, 0x6369D1];
// color of the platform
const PLATFORM_COLOR = 0x00916e;
// the shade of black for border
const BORDER_COLOR = 0x222222;
// the shade of black for ball
const BALL_COLOR = 0x222222;

/* LEVEL VALUES */
const NUM_LEVELS = 7;

const NUM_LIVES_AT_START = 4;
// shade should darken with every level:
// taken from an example palette on coolors.io: https://coolors.co/03045e-023e8a-0077b6-0096c7-00b4d8-48cae4-90e0ef-ade8f4-caf0f8
const LEVEL_COLORS = [0xCAF0F8, 0x90E0EF, 0x00B4D8, 0x0096C7, 0x0077B6, 0x023E8A, 0x03045E];
const LEVEL_COLORS_IN_HEX = ["#CAF0F8", "#90E0EF", "#00B4D8", "0096C7", "0077B6", "023E8A", "03045E"];
const ROWS_PER_LEVEL = [2, 3, 4, 5, 6, 7, 7];
const MIN_BRICKS_PER_ROW_PER_LEVEL = [3, 4, 4, 5, 5, 6, 6];
const START_SPEED_PER_LEVEL = [new THREE.Vector3(-0.05, 0.05, 0), new THREE.Vector3(-0.05, 0.05, 0),
    new THREE.Vector3(-0.06, 0.06, 0), new THREE.Vector3(-0.06, 0.06, 0), new THREE.Vector3(-0.07, 0.07, 0),
    new THREE.Vector3(-0.07, 0.07, 0), new THREE.Vector3(-0.08, 0.08, 0)];
const PLATFORM_SPEED_PER_LEVEL = [0.1, 0.1, 0.11, 0.11, 0.12, 0.12, 0.13];

// temporary start speed till we improve collisions
const START_SPEED = new THREE.Vector3(-0.05, 0.05, 0);

let createDecisionContainer = function(id, h1Text, pText1, image, imgAlt, pText2) {
    var container = document.createElement('div');
    container.id = id;
    container.classList.add("decision-container");
    document.body.appendChild(container);

    let title = document.createElement('h1');
    title.innerText = h1Text;
    container.appendChild(title);

    let text1 = document.createElement('p');
    text1.innerHTML = pText1;
    container.appendChild(text1);

    let img = document.createElement('img');
    img.src = image;
    img.alt = imgAlt;
    container.appendChild(img);

    let text2 = document.createElement('p');
    text2.innerHTML = pText2;
    container.appendChild(text2);

    container.style.visibility = "hidden";

    return container;
}

var levelStartContainer = document.createElement('div');
levelStartContainer.id = "level-start-container";
document.body.appendChild(levelStartContainer);

let levelStartTitle = document.createElement('h1');
levelStartTitle.innerText = "Level";
levelStartContainer.appendChild(levelStartTitle);

let levelStartText = document.createElement('p');
levelStartText.innerHTML = "Press [SPACEBAR] to start level.";
levelStartContainer.appendChild(levelStartText);

levelStartContainer.style.visibility = "hidden";

class BreakoutScene extends Scene {
    constructor(camera) {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            updateList: []
        };

        const lights = new BasicLights();
        this.add(lights);
        this.lights = lights;

        // Included the camera in here to see what it sees
        this.camera = camera;

        // Add in points variable
        this.points = 0;

        // Testing multiplier stuff
        this.multipliers = []
        this.multipliers.push(new Multiplier(this, 1, true))
        this.multipliers.push(new Multiplier(this, 1, false))

        levelStartTitle.innerText = "Level 1";
        levelStartTitle.style.textShadow = "5px 5px " + LEVEL_COLORS_IN_HEX[0];

        this.levelStartContainer = levelStartContainer;

        this.currentLevelNum = 0;
        this.currentLevel = new Level(this, LEVEL_COLORS[0], BRICK_COLORS, BALL_COLOR, BORDER_COLOR,
            PLATFORM_COLOR, ROWS_PER_LEVEL[0], MIN_BRICKS_PER_ROW_PER_LEVEL[0], NUM_LIVES_AT_START,
            START_SPEED_PER_LEVEL[0], PLATFORM_SPEED_PER_LEVEL[0]);

        var scene = this;

        let handleKeydownEvent = function(event) {
            // Ignore keypresses typed into a text box
            if (event.target.tagName === "INPUT") {
                return;
            }

            // should only pause during a game
            if (!scene.ballStarted || scene.levelOver) return;

            // start ball moving
            if (event.key == "p"){
                scene.handlePause();
            }
            else return;
        }

        // has the game started?
        this.gameStarted = false;
        // is the whole game over?
        this.gameOver = false;

        // listener can be found below
        window.addEventListener("keydown", handleKeydownEvent);
        this.gameWonContainer = createDecisionContainer("game-win-container", "Congratulations!", "You beat the game!",
            Happy, ":)", "Press [SPACEBAR] to play again!");
        this.levelWonContainer = createDecisionContainer("level-win-container", "YAY!", "You beat this level!",
            Happy, ":)", "Press [SPACEBAR] to go to the next level.");
        this.gameLostContainer = createDecisionContainer("lose-container", "OH NO!", "You've lost the game!",
            Sad, ":(", "Press [SPACEBAR] to play again.");
    }

    // Call this with an object to make sure it updates every timeStamp
    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { updateList } = this.state;

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }

    /**
     * Removes the passed-in brick from the scene and
     * reduces the number of overall bricks.
     */
    removeBrick(brick) {
        brick.mesh.collidable = false;
        this.bricksLeft--;
        brick.breakBrick();

        this.camera.updateMatrix();
        this.camera.updateMatrixWorld();
        var frustum = new THREE.Frustum();
        frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse));

        let pointsToAdd = 1;
        this.multipliers.forEach((m) => {
            if (frustum.containsPoint(m.mesh.position) && m.mesh.scale.x > 0.1) {
                pointsToAdd *= m.multiplyValue;
            }
        })

        this.points += pointsToAdd;

        
        if (this.bricksLeft <= 0) {
            this.levelWon = true;
            this.endLevel();
        }
    }

    /**
     * Pauses the current scene.
     */
    handlePause() {
        if (!this.paused) {
            this.paused = true;
            this.inPlay = false;

            for (let i = 0; i < this.balls.length; i++) {
                this.balls[i].moving = false;
            }
        } else {
            this.paused = false;
            this.inPlay = true;

            for (let i = 0; i < this.balls.length; i++) {
                this.balls[i].moving = true;
            }
        }
    }

    /**
     * Handles when the passed-in ball hits the bottom border
     * of the game. This is equivalent to losing a life, and
     * as such, we reduce the number of lives, and
     * their visual representation, hearts.
    */
    handleBallHittingBottom(ball) {
        this.livesLeft--;

        // hearts should be removed in order added
        this.hearts[this.livesLeft].remove();

        if (this.livesLeft <= 0) {
            return this.endLevel();
        }

        this.handleReset(ball);
    }

    /**
     * Resets the passed-in ball to starting position.
     */
    handleReset(ball) {
        // adjust the ball so it stops moving and it returns to starting pos
        // Need to do it this way since mesh.position is readOnly
        let changeInBallPosition = new THREE.Vector3().addVectors(this.defaultBallPosition,
            ball.mesh.position.clone().multiplyScalar(-1));

        ball.mesh.position.add(changeInBallPosition);
        ball.moving = false;
        this.inPlay = false;
        this.ballStarted = false;

        // move platform back to starting position
        let changeInPlatformPosition = new THREE.Vector3().addVectors(this.defaultPlatformPosition,
            this.platform.mesh.position.clone().multiplyScalar(-1));
        this.platform.mesh.position.add(changeInPlatformPosition);
        this.platform.mesh.leftPressed = false;
        this.platform.mesh.rightPressed = false;
    }

    endLevel() {
        this.inPlay = false;
        this.levelOver = true;

        for (let i = 0; i < this.balls.length; i++) {
            this.balls[i].moving = false;
        }

        if (this.levelWon) {
            // if you win the game
            if (this.currentLevelNum + 1 >= NUM_LEVELS) {
                this.gameWonContainer.style.visibility = "visible";
                this.gameOver = true;

                var gameWinSound = new Audio(GameWinSound);
                gameWinSound.play();
            }
            // if you just win the level
            else {
                this.levelWonContainer.style.visibility = "visible";

                var levelWinSound = new Audio(LevelWinSound);
                levelWinSound.play();
            }
        }
        else {
            this.gameLostContainer.style.visibility = "visible";
            this.gameOver = true;

            var gameOverSound = new Audio(GameOverSound);
            gameOverSound.play();
        }
    }

    nextLevel() {
        let level =  ++this.currentLevelNum;

        this.levelWonContainer.style.visibility = "hidden";
        levelStartTitle.innerText = "Level " + (level + 1);
        levelStartTitle.style.textShadow = "5px 5px " + LEVEL_COLORS_IN_HEX[level];

        this.levelStartContainer.style.visibility = "visible";

        // remove all of the current elements:
        for (let i = this.children.length - 1; i >= 0; i--) {
            if(this.children[i].type !== "Mesh") continue;

            if(this.children[i].name === "multiplier") continue;    // Keep the multipliers constant per level

            this.children[i].geometry.dispose();
            this.children[i].material.dispose();
            this.remove(this.children[i]);
        }


        this.currentLevel = new Level(this, LEVEL_COLORS[level], BRICK_COLORS, BALL_COLOR, BORDER_COLOR, 
            PLATFORM_COLOR, ROWS_PER_LEVEL[level], MIN_BRICKS_PER_ROW_PER_LEVEL[level], this.livesLeft,
            START_SPEED_PER_LEVEL[level], PLATFORM_SPEED_PER_LEVEL[level]);
    }
}

export default BreakoutScene;
