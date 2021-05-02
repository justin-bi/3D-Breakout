import * as Dat from 'dat.gui';
import { Scene, Color } from 'three';
// import { Flower, Land } from 'objects';
import { Ball, Border, Brick, Heart } from 'objects';
import { Platform } from 'objects';
import { BasicLights } from 'lights';
import * as THREE from 'three' 

/* COLOR SCHEME */

// colors for the bricks
const COLORS = [0x00916e, 0xAEFFD8, 0xE44E5A, 0xFF990A, 0x6369D1];
// color of the platform
const PLATFORM_COLOR = 0x00916e;
// the shade of black for border and ball
const BLACK_SHADE = 0x222222;

/* GAMEPLAY */

// the number of lives the player gets to start
const NUMBER_OF_LIVES = 3;

/**
 * Populate the passed-in scene with rows of bricks (number of rows is
 * numBricks); rows have alternating numbers of bricks with rows
 * with more bricks having exactly one more brick) and each row
 * having at least minBricksPerRow (e.g. 3 rows with minBricksPerRow = 4
 * could be row 1: 4 bricks, row 2: 5 bricks, row 3: 4 bricks); interval
 * represents the y distance above the origin to start placing the bricks at.
 * maxWidthOfBrick and heightOfBrick are the max width and height the brick can
 * be set to, but the actual width/height of brick will be slightly less
 * to create gaps between bricks. Finally, the function returns the
 * number of bricks created.
 */
let populateWithBlocks = function(scene, numRows, minBricksPerRow, maxWidthOfBrick, 
    maxHeightOfBrick, interval) {
    let totalBricks = 0;

    // decrease width and height slightly to allow for gaps
    let actualWidth = maxWidthOfBrick * 0.95;
    let actualHeight = maxHeightOfBrick * 0.9;

    const brickGeom = new THREE.BoxGeometry(actualWidth, actualHeight, 1);

    // how we know which rows to alternate since either even 
    // or odd will have an extra brick: extraOddBrick = 1 - extraEvenBrick
    let extraEvenBrick = 1;

    // randomly chooses whether even or odd rows have more bricks
    if (Math.random() < 0.5)
        extraEvenBrick = 0;

    for (let i = 0; i < numRows; i++) {
        let numBricks = minBricksPerRow;

        // makes sure we alternate number of bricks
        if (i % 2 == 0)
            numBricks += extraEvenBrick;
        else
            numBricks += (1 - extraEvenBrick);

        // determines which color to start pattern of colors at
        let colorStart = Math.floor(Math.random() * COLORS.length);

        for (let j = 0; j < numBricks; j++) {
            let colorIndex = (colorStart + j) % COLORS.length;


            // case for an odd number of bricks
            let origin = numBricks/2 + (numBricks - 1)/2;
            let adjustment = 0.5;

            // if the number of bricks per row is even, adjust the origin and adjustment
            if (numBricks % 2 == 0) {
                adjustment = 0;
                origin = numBricks/2 + (numBricks - 2)/2;
            }

            const translateVec = new THREE.Vector3(
                origin - 2 * j - adjustment,
                (numRows - i) * 0.5 + interval,
                0
            );

            const brick = new Brick(scene, COLORS[colorIndex], brickGeom, translateVec);
            totalBricks++;
        }
    }

    return totalBricks;
};

/**
 * Adds visual borders around the scene in question which has
 * a distance of xDistance from x coordinate of origin and
 * distance of yDistance from y coordinate of origin and
 * is at z = 0. The color of the border should be the
 * passed-in borderColor. The thickness of the border should be
 * the passed-in thickness. Return an object containing all
 * of the border meshes as fields.
 */
let addBorders = function(scene, xDistance, yDistanceAbove, yDistanceBelow, borderColor, thickness) {
    // use one border material for entire border
    const borderMat = new THREE.MeshPhongMaterial({ color: borderColor, flatShading: true });

    const height = yDistanceAbove - yDistanceBelow;

    const yShift = yDistanceAbove - height/2;
    const sideBorderGeom = new THREE.BoxGeometry(thickness, (yDistanceAbove - yDistanceBelow), 1);

    // Add in the left border
    const leftTranslate = new THREE.Vector3(xDistance, yShift, 0);
    const leftBorderMesh = new Border(scene, sideBorderGeom, "leftBorder", leftTranslate);

    // Add right border
    const rightTranslate = new THREE.Vector3(-xDistance, yShift, 0);
    const rightBorderMesh = new Border(scene, sideBorderGeom, "rightBorder", rightTranslate);

    // add in the thickness here to acocunt for corners
    const horizontalBorderGeom = new THREE.BoxGeometry(xDistance * 2 + thickness, thickness, 1);

    // Add top border
    const topTranslate = new THREE.Vector3(0, yDistanceAbove, 0);
    const topBorderMesh = new Border(scene, horizontalBorderGeom, "topBorder", topTranslate);

    // Add bottom border
    const bottomTranslate = new THREE.Vector3(0, yDistanceBelow, 0);
    const bottomBorderMesh = new Border(scene, horizontalBorderGeom, "bottomBorder", bottomTranslate);

    // NOTE: this is a bit of a misnomer, these are border classes, use (name).mesh to access the mesh
    let borderMesh = {
        left: leftBorderMesh,
        right: rightBorderMesh,
        top: topBorderMesh,
        bottom: bottomBorderMesh
    };

    return borderMesh;
};

class BreakoutScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            updateList: []
        };

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);

        // Add the ball to the scene
        // const ball = new Ball(this, BLACK_SHADE, new THREE.Vector3(0, 0, 0));

        const lights = new BasicLights();

        // how much space to leave betwen the origin and the start of blocks
        const SPACE_ABOVE_ORIGIN = 2;
        // how much space to leave between origin and platform
        const SPACE_BELOW_ORIGIN = 1;

        // specifies size, num of rows and bricks we want
        const MAX_WIDTH_OF_BRICKS = 2;
        const MAX_HEIGHT_OF_BRICKS = 0.5;
        const MAX_BRICKS_PER_ROW = 5;
        const NUM_ROWS = 3;

        // needed for height of border
        const PLATFORM_HEIGHT = 0.3;

        // bricks is the array of bricks we've created
        this.bricksLeft = populateWithBlocks(this, NUM_ROWS, MAX_BRICKS_PER_ROW - 1, MAX_WIDTH_OF_BRICKS,
            MAX_HEIGHT_OF_BRICKS, SPACE_ABOVE_ORIGIN);

        let xDistance = (MAX_BRICKS_PER_ROW * MAX_WIDTH_OF_BRICKS)/2;
        let yDistanceAbove = MAX_HEIGHT_OF_BRICKS * NUM_ROWS + SPACE_ABOVE_ORIGIN;
        let yDistanceBelow =  -(SPACE_BELOW_ORIGIN + PLATFORM_HEIGHT);

        // thickness of border
        const THICKNESS = 0.2;
        // the offset to ensure that the border doesn't intersect with the bricks
        const OFFSET = 0.3;

        // borderMesh holds all of the meshes that we created as borders
        let borderMesh =
            addBorders(this, xDistance + OFFSET, yDistanceAbove + 2 * OFFSET,
                yDistanceBelow - 2 * OFFSET, BLACK_SHADE, THICKNESS);

        // Decide platform width based on how many bricks there are
        const PLATFORM_WIDTH = Math.min((0.33 * MAX_WIDTH_OF_BRICKS * MAX_BRICKS_PER_ROW), 5);

        this.platform = new Platform(this, PLATFORM_COLOR, PLATFORM_WIDTH,
            PLATFORM_HEIGHT, SPACE_BELOW_ORIGIN, xDistance);    // Pass in xDistance to set limits

        // save the beginning platform position for this game
        this.defaultPlatformPosition = this.platform.mesh.position.clone();

        // Add the ball to the scene
        const RADIUS = 0.3;

        const translateVec = new THREE.Vector3(0, -SPACE_BELOW_ORIGIN + PLATFORM_HEIGHT/2 + RADIUS, 0);
        const ball = new Ball(this, RADIUS, BLACK_SHADE, translateVec);

        this.balls = [];
        this.balls.push(ball);

        // Save the default position of ball for later
        this.defaultBallPosition = ball.mesh.position.clone();

        // set the number of lives to default at first
        this.livesLeft = NUMBER_OF_LIVES;

        // add hearts which represent lives to scene
        let hearts = [];
        let xSpace = 1;

        for (let i = 0; i < this.livesLeft; i++) {
            hearts.push(new Heart(this, 0xE44E5A, (xDistance + OFFSET)/2 + i * xSpace,
                yDistanceAbove + 2 * OFFSET + PLATFORM_HEIGHT
                + THICKNESS + OFFSET * 2, 0.03));
        }

        this.hearts = hearts;

        // keep track of whether it's in play (it is when at least one ball is moving)
        this.inPlay = false;
        // is the game over?
        this.gameOver = false;

        this.add(lights);

        // listener can be found below
        window.addEventListener("keydown", this.handleEvents);
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

        if (this.bricksLeft <= 0) this.endGame();
        // TODO: end game when zero bricks left
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
        let current = NUMBER_OF_LIVES - this.livesLeft - 1;
        this.hearts[current].remove();
        this.handleReset(ball);

        if (this.livesLeft <= 0) this.endGame();
    }

    /**
     * Resets the passed-in ball to starting position.
     */
    handleReset(ball) {
        // adjust the ball so it stops moving and it returns to starting pos
        let changeInBallPosition = new THREE.Vector3().addVectors(this.defaultBallPosition,
            ball.mesh.position.clone().multiplyScalar(-1));

        ball.mesh.position.add(changeInBallPosition);
        ball.moving = false;
        this.inPlay = false;

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

        // TODO: go to end screen
    }
}

export default BreakoutScene;
