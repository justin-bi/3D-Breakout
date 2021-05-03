import * as Dat from 'dat.gui';
import { Scene } from 'three';
import { Level } from 'levels';
import { BasicLights } from 'lights';
import * as THREE from 'three';

import Happy from '../../assets/images/yay.gif';
import Sad from '../../assets/images/noo.gif';

/* COLOR SCHEME */

// color for the background
const BACKGROUND_COLOR = 0x7ec0ee;
// colors for the bricks
const BRICK_COLORS = [0x00916e, 0xAEFFD8, 0xE44E5A, 0xFF990A, 0x6369D1];
// color of the platform
const PLATFORM_COLOR = 0x00916e;
// the shade of black for border
const BORDER_COLOR = 0x222222;
// the shade of black for ball
const BALL_COLOR = 0x222222;

/* LEVEL VALUES */
const LIVES_PER_LEVEL = [4, 4, 3, 3, 3, 2, 2];
// these should be rainbow - taken from this palette: https://coolors.co/f94144-f3722c-f8961e-f9c74f-90be6d-43aa8b-577590
const LEVEL_COLORS = [0xF94144, 0xF3722C, 0xF8961E, 0xF9C74F, 0x90BE6D, 0x43AA8B, 0x577590];
const ROWS_PER_LEVEL = [2, 3, 4, 5, 6, 7, 7];
const MIN_BRICKS_PER_ROW_PER_LEVEL = [3, 4, 4, 5, 5, 6, 6];
// TODO: ADD INCREASED BALL SPEED
// const BALL_SPEED_PER_LEVEL = [];

// set up game won message
var gameWonContainer = document.createElement('div');
gameWonContainer.id = "game-end-container";
document.body.appendChild(gameWonContainer);

let gameWonTitle = document.createElement('h1');
gameWonTitle.innerText = "YAY!";
gameWonContainer.appendChild(gameWonTitle);

let gameWonText1 = document.createElement('p');
gameWonText1.innerHTML = "You beat this level!";
gameWonContainer.appendChild(gameWonText1);

let gameWonImg = document.createElement('img');
gameWonImg.src = Happy;
gameWonImg.alt=":)";
gameWonContainer.appendChild(gameWonImg);

let gameWonText2 = document.createElement('p');
gameWonText2.innerHTML = "Press [SPACEBAR] to continue the game.";
gameWonContainer.appendChild(gameWonText2);

gameWonContainer.style.visibility = "hidden";

// set up game lost message
let gameLostContainer = document.createElement('div');
gameLostContainer.id = "game-end-container";
document.body.appendChild(gameLostContainer);

let gameLostTitle = document.createElement('h1');
gameLostTitle.innerText = "OH NO!"
gameLostContainer.appendChild(gameLostTitle);

let gameLostText1 = document.createElement('p');
gameLostText1.innerHTML = "You didn't beat this level.";
gameLostContainer.appendChild(gameLostText1);

let gameLostImg = document.createElement('img');
gameLostImg.src = Sad;
gameLostImg.alt=":(";
gameLostContainer.appendChild(gameLostImg);

let gameLostText2 = document.createElement('p');
gameLostText2.innerHTML = " <br><br> Press [SPACEBAR] to restart the game.";
gameLostContainer.appendChild(gameLostText2);

gameLostContainer.style.visibility = "hidden";


class BreakoutScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            updateList: []
        };

        const lights = new BasicLights();

        this.add(lights);

        this.currentLevelNum = 0;
        this.currentLevel = new Level(this, LEVEL_COLORS[0], BRICK_COLORS, BALL_COLOR, BORDER_COLOR, 
            PLATFORM_COLOR, ROWS_PER_LEVEL[0], MIN_BRICKS_PER_ROW_PER_LEVEL[0], LIVES_PER_LEVEL[0]);
        /** 
        this.currentLevel = new Level(this, BACKGROUND_COLOR, BRICK_COLORS, BALL_COLOR, BORDER_COLOR, 
            PLATFORM_COLOR, 3, 4, 3);
        */

        var scene = this;

        let handleKeydownEvent = function(event) {
            // Ignore keypresses typed into a text box
            if (event.target.tagName === "INPUT") {
                return;
            }

            // should only pause during a game
            if (!scene.ballStarted || scene.gameOver) return;

            // start ball moving
            if (event.key == "p"){
                scene.handlePause();
            }
            else return;
        }

        // listener can be found below
        window.addEventListener("keydown", handleKeydownEvent);
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
        this.bricksLeft--;
        brick.remove();

        if (this.bricksLeft <= 0) {
            this.gameWon = true;
            this.endGame();
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

        // hearts should be removed in reverse order than
        // they were added
        let current = this.currentLevel.numLives - this.livesLeft - 1;
        this.hearts[current].remove();

        if (this.livesLeft <= 0) {
            return this.endGame();
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
    }

    endGame() {
        this.inPlay = false;
        this.gameOver = true;

        for (let i = 0; i < this.balls.length; i++) {
            this.balls[i].moving = false;
        }

        // make game won message
        if (this.gameWon) {
            gameWonContainer.style.visibility = "visible";
        }
        else {
            gameLostContainer.style.visibility = "visible";
        }
    }
}

export default BreakoutScene;
