import { Group } from 'three';
// Potentially useful stuff, just wanted to save a copy from the stuff we deleted
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import * as THREE from 'three'; // Probably need to change later, doing this for now for simplicity

class Platform extends Group {
    constructor(parent, color, width, height, yPosition, xDistance) {
        // Call parent Group() constructor
        super();

        // Init state
        this.state = {
            // Empty for now, can populate later if wanted
        };

        this.xDist = xDistance
        this.name = 'paddle';

        const geometry = new THREE.BoxGeometry(width, height, 1);
        const material = new THREE.MeshPhongMaterial({ color: color, flatShading: true });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.name = 'paddle';
        this.mesh.translateY(-yPosition);

        // add a reference to the platform object to its mesh
        this.mesh.userData.platform = this;

        var platform = this.mesh;
        platform.xDist = xDistance;
        parent.add(this.mesh);

        let handlePlatformEvents = function(event) {
            this.speed = 0.5
            // Ignore keypresses typed into a text box
            if (event.target.tagName === "INPUT") {
                return;
            }

            if (event.key == "ArrowLeft"){  
                platform.translateX(-this.speed);
                // This code makes sure no part of the platform exits the borders
                if (platform.position.x < -platform.xDist + width / 2) {
                    platform.position.x = -platform.xDist + width / 2
                }
            }
            else if (event.key == "ArrowRight"){
                platform.translateX(this.speed);
                // This code makes sure no part of the platform exits the borders
                if (platform.position.x > platform.xDist - width / 2) {
                    platform.position.x = platform.xDist - width / 2
                }
            } 
            else return;
        }

        window.addEventListener("keydown", handlePlatformEvents);
    }

    update(timeStamp) {

    }
}

export default Platform;
