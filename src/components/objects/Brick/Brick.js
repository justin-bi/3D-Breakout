import { Group } from 'three';
import * as THREE from 'three'

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

    remove() {
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        this.mesh.parent.remove(this.mesh);
    }

    update(timeStamp) {
        // Put any updates you want to occur in here
    }
}

export default Brick;