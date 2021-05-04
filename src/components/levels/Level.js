import { Group } from 'three';
import { Color } from 'three';
import * as THREE from 'three';
import { Ball, Border, Brick, Heart, Platform } from 'objects';

class Level extends Group {
    constructor(parent, backgroundColor, brickColors, ballColor, borderColor, platformColor,
        numRows, minBricksPerRow, numLives) {
        // Call parent Group() constructor
        super();

        // set level fields
        this.parent = parent;
        this.numRows = numRows;
        this.minBricksPerRow = minBricksPerRow;
        this.brickColors = brickColors;
        this.borderColor = borderColor;
        this.numLives = numLives;

        // we want one more brick per row
        let maxBricksPerRow = minBricksPerRow + 1;

        // Set background to a nice color
        parent.background = new Color(backgroundColor);

        /* GRAPHICS DETAILS */

        // how much space to leave betwen the origin and the start of blocks
        const SPACE_ABOVE_ORIGIN = 2;
        // how much space to leave between origin and platform
        const SPACE_BELOW_ORIGIN = 1;

        // specifies size, num of rows and bricks we want
        const MAX_WIDTH_OF_BRICKS = 2;
        const MAX_HEIGHT_OF_BRICKS = 0.5;

        // needed for height of border
        const PLATFORM_HEIGHT = 0.3;

        /* ADD OBJECTS */

        // bricks is the array of bricks we've created
        parent.bricksLeft = this.populateWithBlocks(MAX_WIDTH_OF_BRICKS,
            MAX_HEIGHT_OF_BRICKS, SPACE_ABOVE_ORIGIN);

        let xDistance = ((maxBricksPerRow) * MAX_WIDTH_OF_BRICKS)/2;
        let yDistanceAbove = MAX_HEIGHT_OF_BRICKS * this.numRows + SPACE_ABOVE_ORIGIN;
        let yDistanceBelow =  -(SPACE_BELOW_ORIGIN + PLATFORM_HEIGHT);

        // thickness of border
        const THICKNESS = 0.2;
        // the offset to ensure that the border doesn't intersect with the bricks
        const OFFSET = 0.3;

        // add the border colors
        this.addBorders(xDistance + OFFSET, yDistanceAbove + 2 * OFFSET,
            yDistanceBelow - 2 * OFFSET, THICKNESS);

        // Decide platform width based on how many bricks there are
        const PLATFORM_WIDTH = Math.min((0.33 * MAX_WIDTH_OF_BRICKS * maxBricksPerRow), 5);

        parent.platform = new Platform(parent, platformColor, PLATFORM_WIDTH,
            PLATFORM_HEIGHT, SPACE_BELOW_ORIGIN, xDistance);    // Pass in xDistance to set limits

        // save the beginning platform position for this game
        parent.defaultPlatformPosition = parent.platform.mesh.position.clone();

        // Add the ball to the scene
        const RADIUS = 0.3;

        const translateVec = new THREE.Vector3(0, -SPACE_BELOW_ORIGIN + PLATFORM_HEIGHT/2 + RADIUS, 0);
        let ball = new Ball(this.parent, RADIUS, ballColor, translateVec);

        parent.balls = [];
        parent.balls.push(ball);

        // Save the default position of ball for later
        parent.defaultBallPosition = ball.mesh.position.clone();

        // set the number of lives to default at first
        parent.livesLeft = numLives;

        // add hearts which represent lives to scene
        let hearts = [];
        let xSpace = 1;

        for (let i = 0; i < parent.livesLeft; i++) {
            hearts.push(new Heart(parent, 0xE44E5A, (xDistance + OFFSET) -  i * xSpace,
                yDistanceAbove + 2 * OFFSET + PLATFORM_HEIGHT
                + THICKNESS + OFFSET * 2, 0.03));
        }

        parent.hearts = hearts;

        /* GAMEPLAY VARIABLES */

        // keep track of whether it's in play (it is when at least one ball is moving)
        parent.inPlay = false;
        // has the level started?
        parent.levelStarted = false;
        // has the ball started (we've hit the arrow up key)?
        parent.ballStarted = false;
        // level paused
        parent.paused = false;
        // did the player win?
        parent.levelWon = false;
        // has the level ended?
        parent.levelOver = false;
    }

    /**
     * Populate the parent scene with rows of bricks (number of rows is
     * this level's numRows); rows have alternating numbers of bricks with rows
     * with more bricks having exactly one more brick) and each row
     * having at least minBricksPerRow (e.g. 3 rows with minBricksPerRow = 4
     * could be row 1: 4 bricks, row 2: 5 bricks, row 3: 4 bricks); interval
     * represents the y distance above the origin to start placing the bricks at.
     * maxWidthOfBrick and heightOfBrick are the max width and height the brick can
     * be set to, but the actual width/height of brick will be slightly less
     * to create gaps between bricks. Finally, the function returns the
     * number of bricks created. The colors of the bricks
     * will be from the level's set brick colors.
     */
    populateWithBlocks(maxWidthOfBrick, maxHeightOfBrick, interval) {
        let totalBricks = 0;

        // decrease width and height slightly to allow for gaps
        let actualWidth = maxWidthOfBrick * 0.95;
        let actualHeight = maxHeightOfBrick * 0.9;

        // how we know which rows to alternate since either even
        // or odd will have an extra brick: extraOddBrick = 1 - extraEvenBrick
        let extraEvenBrick = 1;

        // randomly chooses whether even or odd rows have more bricks
        if (Math.random() < 0.5)
            extraEvenBrick = 0;

        for (let i = 0; i < this.numRows; i++) {
            let numBricks = this.minBricksPerRow;

            // makes sure we alternate number of bricks
            if (i % 2 == 0)
                numBricks += extraEvenBrick;
            else
                numBricks += (1 - extraEvenBrick);

            // determines which color to start pattern of colors at
            let colorStart = Math.floor(Math.random() * this.brickColors.length);

            for (let j = 0; j < numBricks; j++) {
                const brickGeom = new THREE.BoxGeometry(actualWidth, actualHeight, 1);
                let colorIndex = (colorStart + j) % this.brickColors.length;


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
                    (this.numRows - i) * 0.5 + interval,
                    0
                );

                const brick = new Brick(this.parent, this.brickColors[colorIndex], brickGeom, translateVec);
                totalBricks++;
            }
        }

        return totalBricks;
    }

    /**
     * Adds visual borders around the parent scene which have
     * a distance of xDistance from x coordinate of origin and
     * distance of yDistance from y coordinate of origin and
     * is at z = 0. The thickness of the border should be
     * the passed-in thickness. Return an object containing all
     * of the border meshes as fields.
     */
    addBorders(xDistance, yDistanceAbove, yDistanceBelow, thickness) {
        // use one border material for entire border
        const borderMat = new THREE.MeshPhongMaterial({ color: this.borderColor, flatShading: true });

        const height = yDistanceAbove - yDistanceBelow;

        const yShift = yDistanceAbove - height/2;
        const sideBorderGeom = new THREE.BoxGeometry(thickness, (yDistanceAbove - yDistanceBelow), 1);

        // Add in the left border
        const leftTranslate = new THREE.Vector3(xDistance, yShift, 0);
        const leftBorderMesh = new Border(this.parent, sideBorderGeom, "leftBorder", leftTranslate);

        // Add right border
        const rightTranslate = new THREE.Vector3(-xDistance, yShift, 0);
        const rightBorderMesh = new Border(this.parent, sideBorderGeom, "rightBorder", rightTranslate);

        // add in the thickness here to acocunt for corners
        const horizontalBorderGeom = new THREE.BoxGeometry(xDistance * 2 + thickness, thickness, 1);

        // Add top border
        const topTranslate = new THREE.Vector3(0, yDistanceAbove, 0);
        const topBorderMesh = new Border(this.parent, horizontalBorderGeom, "topBorder", topTranslate);

        // Add bottom border
        const bottomTranslate = new THREE.Vector3(0, yDistanceBelow, 0);
        const bottomBorderMesh = new Border(this.parent, horizontalBorderGeom, "bottomBorder", bottomTranslate);

        // NOTE: this is a bit of a misnomer, these are border classes, use (name).mesh to access the mesh
        let borderMesh = {
            left: leftBorderMesh,
            right: rightBorderMesh,
            top: topBorderMesh,
            bottom: bottomBorderMesh
        };

        return borderMesh;
    }
}

export default Level;
