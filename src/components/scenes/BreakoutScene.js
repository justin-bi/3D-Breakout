import * as Dat from 'dat.gui';
import { Scene, Color } from 'three';
// import { Flower, Land } from 'objects';
import { Ball, Border } from 'objects';
import { BasicLights } from 'lights';
import * as THREE from 'three' 

let COLORS = [0x00916e, 0xAEFFD8, 0xE44E5A, 0xFF990A, 0x6369D1];
const PLATFORM_COLOR = 0x00916e;
// the shade of black for border and ball
const BLACK_SHADE = 0x222222;

/**
 * Populate the passed-in scene with rows of bricks (number of rows is
 * numBricks); rows have alternating numbers of bricks with rows
 * with more bricks having exactly one more brick) and each row
 * having at least minBricksPerRow (e.g. 3 rows with minBricksPerRow = 4
 * could be row 1: 4 bricks, row 2: 5 bricks, row 3: 4 bricks); interval
 * represents the y distance above the origin to start placing the bricks at.
 * maxWidthOfBrick and heightOfBrick are the max width and height the brick can
 * be set to, but the actual width/height of brick will be slightly less
 * to create gaps between bricks. Finally, the function stores all of the bricks
 * it creates in a 2D array of bricks that it returns, and adds all of the meshes 
 * it creates for bricks to the scene.
 */
let populateWithBlocks = function(scene, numRows, minBricksPerRow, maxWidthOfBrick, maxHeightOfBrick, interval) {
    let bricks = [];

    // decrease width and height slightly to allow for gaps
    let actualWidth = maxWidthOfBrick * 0.95;
    let actualHeight = maxHeightOfBrick * 0.9;

    const brickGeom = new THREE.BoxGeometry(actualWidth, actualHeight, 1);

    // how we know which rows to alternate
    // since either even or odd will have an extra brick:
    // extraOddBrick = 1 - extraEvenBrick
    let extraEvenBrick = 1;

    // randomly chooses whether even or odd rows have more bricks
    if (Math.random() < 0.5)
        extraEvenBrick = 0;

    for (let i = 0; i < numRows; i++) {
        let rowOfBricks = [];

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

            const brickMat = new THREE.MeshPhongMaterial({ color: COLORS[colorIndex], flatShading: true });
            const brickMesh = new THREE.Mesh(brickGeom, brickMat);

            brickMesh.translateY((numRows - i) * 0.5 + interval);

            // case for an odd number of bricks
            let origin = numBricks/2 + (numBricks - 1)/2;
            let adjustment = 0.5;

            // if the number of bricks per row is even, adjust the origin and adjustment
            if (numBricks % 2 == 0) {
                adjustment = 0;
                origin = numBricks/2 + (numBricks - 2)/2;
            }

            brickMesh.translateX(origin - 2 * j - adjustment);

            scene.add(brickMesh);
            rowOfBricks.push(brickMesh);
        }

        bricks.push(rowOfBricks);
    }

    return bricks;
};

/**
 * Add a visual border around the scene in question which has
 * a distance of xDistance from x coordinate of origin and
 * distance of yDistance from y coordinate of origin and
 * is at z = 0. The color of the border should be the
 * passed-in borderColor. The thickness of the border should be
 * the passed-in thickness. Return an object containing all
 * of the border meshes as fields.
 */
let addBorder = function(scene, xDistance, yDistanceAbove, yDistanceBelow, borderColor, thickness) {
    // use one border material for entire border
    const borderMat = new THREE.MeshPhongMaterial({ color: borderColor, flatShading: true });

    const height = yDistanceAbove - yDistanceBelow;

    const yShift = yDistanceAbove - height/2;
    const sideBorderGeom = new THREE.BoxGeometry(thickness, (yDistanceAbove - yDistanceBelow), 1);

    // Add in the left border
    const leftTranslate = new THREE.Vector3(xDistance, yShift, 0);
    const leftBorderMesh = new Border(scene, sideBorderGeom, leftTranslate)

    // Add right border
    const rightTranslate = new THREE.Vector3(-xDistance, yShift, 0);
    const rightBorderMesh = new Border(scene, sideBorderGeom, rightTranslate);

    // add in the thickness here to acocunt for corners
    const horizontalBorderGeom = new THREE.BoxGeometry(xDistance * 2 + thickness, thickness, 1);

    // Add top border
    const topTranslate = new THREE.Vector3(0, yDistanceAbove, 0);
    const topBorderMesh = new Border(scene, horizontalBorderGeom, topTranslate);

    // Add bottom border
    const bottomTranslate = new THREE.Vector3(0, yDistanceBelow, 0);
    const bottomBorderMesh = new Border(scene, horizontalBorderGeom, bottomTranslate);

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
        const ball = new Ball(this, BLACK_SHADE);
        this.add(ball);

        const lights = new BasicLights();

        const MAX_WIDTH_OF_BRICKS = 2;
        const MAX_HEIGHT_OF_BRICKS = 0.5;
        const MAX_BRICKS_PER_ROW = 5;
        const NUM_ROWS = 3;

        // how much space to leave betwen the origin and the start of blocks
        const SPACE_ABOVE_ORIGIN = 2;
        // how much space to leave between origin and cursor
        const SPACE_BELOW_ORIGIN = 2;

        // Add in a platform object
        const PLATFORM_HEIGHT = 0.3;

        const platformGeom = new THREE.BoxGeometry(5, PLATFORM_HEIGHT, 1);
        const platformMat = new THREE.MeshPhongMaterial({ color: PLATFORM_COLOR, flatShading: true });
        const platformMesh = new THREE.Mesh(platformGeom, platformMat);
        platformMesh.translateY(-SPACE_BELOW_ORIGIN);

        // bricks is the array of bricks we've created
        let bricks = populateWithBlocks(this, NUM_ROWS, MAX_BRICKS_PER_ROW - 1, MAX_WIDTH_OF_BRICKS, 
            MAX_HEIGHT_OF_BRICKS, SPACE_ABOVE_ORIGIN);

        let xDistance = (MAX_BRICKS_PER_ROW * MAX_WIDTH_OF_BRICKS)/2;
        let yDistanceAbove = MAX_HEIGHT_OF_BRICKS * NUM_ROWS + SPACE_ABOVE_ORIGIN;
        let yDistanceBelow =  -(SPACE_BELOW_ORIGIN + PLATFORM_HEIGHT);
        // the offset to ensure that the border doesn't intersect with the bricks
        const OFFSET = 0.3;

        // borderMesh holds all of the meshes that we created as borders
        let borderMesh = 
            addBorder(this, xDistance + OFFSET, yDistanceAbove + 2 * OFFSET, yDistanceBelow - OFFSET, BLACK_SHADE, 0.2);

        this.add(lights, platformMesh);  
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
}

export default BreakoutScene;
