import * as Dat from 'dat.gui';
import { Scene, Color } from 'three';
import { Flower, Land } from 'objects';
import { BasicLights } from 'lights';
import * as THREE from 'three' // Probably need to change later, doing this for now for simplicity

// let COLORS = [0x00916e, 0xfeefe5, 0xffcf00, 0xee6123, 0xfa003f];

let COLORS = [0x00916e, 0xAEFFD8, 0xE44E5A, 0xFF990A, 0x6369D1];

let populateWithBlocks = function(scene, numRows, minBricksPerRow, maxBricksPerRow, interval) {
    
    for (let i = 0; i < numRows; i++) {
        let diff = maxBricksPerRow - minBricksPerRow; 

        let numBricks = Math.floor(Math.random() * diff) + minBricksPerRow;
        // REMOVE
        numBricks = maxBricksPerRow;

        let colorStart = Math.floor(Math.random() * COLORS.length);

        for (let j = 0; j < maxBricksPerRow; j++) {
            let colorIndex = (colorStart + j) % COLORS.length;

            const platformGeom = new THREE.BoxGeometry(1.9, 0.45, 1);
            const platformMat = new THREE.MeshPhongMaterial({ color: COLORS[colorIndex], flatShading: true });
            const platformMesh = new THREE.Mesh(platformGeom, platformMat);

            platformMesh.translateY((numRows - i) * 0.5 + interval);

            let origin = -numBricks/2;

            console.log(origin);

            platformMesh.translateX(origin + 2 * j - 1.05);
            console.log(origin + j);

            scene.add(platformMesh);
        }
    }
}

class SeedScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            // gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: 1,
            updateList: [],
        };

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);
        // this.background = new Color(0xff0000);

        // Add meshes to scene
        const land = new Land();    // Just here so we have some perspective
        // this.add(land);
        // const flower = new Flower(this);
        const lights = new BasicLights();

        // Add in a ball object (Note that this should probably go in the objects folder later, doing 
        // this here now for testing, same with the platform object)
        const geometry = new THREE.SphereGeometry(0.3, 8, 8);
        const material = new THREE.MeshPhongMaterial(
            {
                color: 0x222222,
                flatShading: true
            }
        );
        const sphere = new THREE.Mesh(geometry, material);

        // Add in a platform object
        const platformGeom = new THREE.BoxGeometry(5, 0.5, 1);
        const platformMat = new THREE.MeshPhongMaterial({ color: 0x00916e, flatShading: true });
        const platformMesh = new THREE.Mesh(platformGeom, platformMat);
        platformMesh.translateY(-2);

        populateWithBlocks(this, 3, 1, 5, 2);

        this.add(lights, sphere, platformMesh);
        console.log(platformMesh.position);

        // Populate GUI (We probably don't want a GUI, at least not like this)
        // this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { rotationSpeed, updateList } = this.state;
        // Probably don't want the camera to rotate at this time
        // this.rotation.y = (rotationSpeed * timeStamp) / 10000;

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }
}

export default SeedScene;
