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
        this.mesh.width = width

        // Fields related to platform movement
        this.mesh.leftPressed = false;
        this.mesh.rightPressed = false;
        this.mesh.speed = 0.1
        // console.log(this)

        // add a reference to the platform object to its mesh
        this.mesh.userData.platform = this;

        var platform = this.mesh;
        platform.xDist = xDistance;
        parent.add(platform);

        let handleKeydownEvents = function (event) {
            // Ignore keypresses typed into a text box
            if (event.target.tagName === "INPUT") return;
            // don't move platform unless at least one ball is moving
            if (!parent.inPlay || parent.gameOver) return;

            const moveBegin = new TWEEN.Tween(platform.scale)
                .to(new THREE.Vector3(1.1, 0.9, 1), 100)
                .easing(TWEEN.Easing.Quadratic.Out);

            if (event.key == "ArrowLeft") {
                platform.leftPressed = true;
                moveBegin.start()
            }
            else if (event.key == "ArrowRight") {
                platform.rightPressed = true;
                moveBegin.start()
            }
            else return;
        }
        parent.addToUpdateList(this);


        let handleKeyUpEvents = function (event) {
            // Ignore keypresses typed into a text box
            if (event.target.tagName === "INPUT") return;
            // don't move platform unless at least one ball is moving
            if (!parent.inPlay || parent.gameOver) {
                // When not in play, we want both of these to be false, else if they're true while the game ends, 
                // platform keeps moving
                platform.leftPressed = false;
                platform.rightPressed = false;
            }


            const moveEnd = new TWEEN.Tween(platform.scale)
                .to(new THREE.Vector3(1, 1, 1), 100)
                .easing(TWEEN.Easing.Quadratic.Out);

            if (event.key == "ArrowLeft") {
                platform.leftPressed = false;
                moveEnd.start()
            }
            else if (event.key == "ArrowRight") {
                platform.rightPressed = false;
                moveEnd.start()
            } 
            else return;

        }
        window.addEventListener("keydown", handleKeydownEvents);
        window.addEventListener("keyup", handleKeyUpEvents);
    }

    update(timeStamp) {
        const mesh = this.mesh
        if (mesh.leftPressed) {
            mesh.translateX(-mesh.speed);
            // This code makes sure no part of the platform exits the borders
            if (mesh.position.x < -mesh.xDist + mesh.width / 2) {
                mesh.position.x = -mesh.xDist + mesh.width / 2
            }
        }
        if (mesh.rightPressed) {
            mesh.translateX(mesh.speed);
            // This code makes sure no part of the platform exits the borders
            if (mesh.position.x > mesh.xDist - mesh.width / 2) {
                mesh.position.x = mesh.xDist - mesh.width / 2
            }
        }

        // Update any TWEENs
        TWEEN.update()
    }
}

export default Platform;
