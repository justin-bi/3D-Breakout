import { Group } from 'three';
import * as THREE from 'three';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';


// The bricks that the ball breaks
class Brick extends Group {

    // Take in the parent scene, a color
    constructor(parent, color, brickGeom, translateVec) {
        // Call parent Group() constructor
        super();

        // Init state
        this.state = {
            // Put any state things you want here
        };

        const brickMat = new THREE.MeshPhongMaterial({ color: color, flatShading: true });
        this.mesh = new THREE.Mesh(brickGeom, brickMat);
        this.mesh.name = 'brick';
        this.mesh.position.add(translateVec);

        // add a reference to the brick object to its mesh
        this.mesh.userData.brick = this;

        parent.add(this.mesh);

        // Add self to parent's update list (if needed)
        parent.addToUpdateList(this);
    }

    breakBrick() {
        const shrink = new TWEEN.Tween(this.mesh.scale)
        .to(new THREE.Vector3(0, 0, 0), 200)
        .easing(TWEEN.Easing.Back.In);

        shrink.onComplete(() => {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            try{
                this.mesh.parent.remove(this.mesh);
            } catch(err) {
                // Shouldn't pop in here anymore, but here just in case
                console.log(this);
                console.warn(err);
            }
        });

        shrink.start();
    }

    update(timeStamp) {
        // Placeholder in case other updates are desired
    }
}

export default Brick;
