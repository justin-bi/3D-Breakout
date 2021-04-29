import * as Dat from 'dat.gui';
import { Scene, Color } from 'three';
import { Flower, Land } from 'objects';
import { BasicLights } from 'lights';
import * as THREE from 'three' // Probably need to change later, doing this for now for simplicity

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
        const geometry = new THREE.SphereGeometry(0.7, 8, 8);
        const material = new THREE.MeshPhongMaterial(
            {
                color: 0x222222,
                flatShading: true
            }
        );
        const sphere = new THREE.Mesh(geometry, material);

        // Add in a platform object
        const platformGeom = new THREE.BoxGeometry(5, 1, 1);
        const platformMat = new THREE.MeshPhongMaterial({ color: 0xdd1111, flatShading: true });
        const platformMesh = new THREE.Mesh(platformGeom, platformMat);
        platformMesh.translateY(-2);

        this.add(lights, sphere, platformMesh);
        console.log(platformMesh.position)

        // this.add(land, flower, lights);


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
