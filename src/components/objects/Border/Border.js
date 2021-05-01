import { Group } from 'three';
import * as THREE from 'three' 

// Constants
const BLACK_SHADE = 0x222222;
const borderMat = new THREE.MeshPhongMaterial({ color: BLACK_SHADE, flatShading: true });

// Implements a border wall around the game
class Border extends Group {
    constructor(parent, geom, translateVec) {
        // Call parent Group() constructor
        super();

        // Init state
        this.state = {
            // Put any state things you want here
        };

        this.mesh = new THREE.Mesh(geom, borderMat);
        // Translates the vec at the starting position, maybe put this in its own function
        this.mesh.position.add(translateVec);  
        parent.add(this.mesh);

        // Add self to parent's update list
        parent.addToUpdateList(this);
    }

    update(timeStamp) {
        // Put any updates you want to occur in here
    }
}

export default Border;
