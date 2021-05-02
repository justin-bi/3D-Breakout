import { Group } from 'three';
// Potentially useful stuff, just wanted to save a copy from the stuff we deleted
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import * as THREE from 'three'; // Probably need to change later, doing this for now for simplicity

class Platform extends Group {
    constructor(parent, color, width, height, yPosition) {
        // Call parent Group() constructor
        super();

        // Init state
        this.state = {
            // Empty for now, can populate later if wanted
        };

        this.name = 'paddle';

        const geometry = new THREE.BoxGeometry(width, height, 1);
        const material = new THREE.MeshPhongMaterial({ color: color, flatShading: true });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.name = 'paddle';
        this.mesh.translateY(-yPosition);

        // add a reference to the platform object to its mesh
        this.mesh.userData.platform = this;

        var platform = this.mesh;
        parent.add(this.mesh);

        let handlePlatformEvents = function(event) {
            // Ignore keypresses typed into a text box
            if (event.target.tagName === "INPUT") {
                return;
            }

            if (event.key == "ArrowLeft"){
                platform.translateX(0.15);
            }
            else if (event.key == "ArrowRight"){
                platform.translateX(-0.15);
            } 
            else return;
        }

        window.addEventListener("keydown", handlePlatformEvents);
    }

    // Not needed, but just wanted to keep this code somewhere such that we don't need to completley
    // spin() {
    //     // Add a simple twirl
    //     this.state.twirl += 6 * Math.PI;

    //     // Use timing library for more precice "bounce" animation
    //     // TweenJS guide: http://learningthreejs.com/blog/2011/08/17/tweenjs-for-smooth-animation/
    //     // Possible easings: http://sole.github.io/tween.js/examples/03_graphs.html
    //     const jumpUp = new TWEEN.Tween(this.position)
    //         .to({ y: this.position.y + 1 }, 300)
    //         .easing(TWEEN.Easing.Quadratic.Out);
    //     const fallDown = new TWEEN.Tween(this.position)
    //         .to({ y: 0 }, 300)
    //         .easing(TWEEN.Easing.Quadratic.In);

    //     // Fall down after jumping up
    //     jumpUp.onComplete(() => fallDown.start());

    //     // Start animation
    //     jumpUp.start();
    // }

    update(timeStamp) {
    }
}

export default Platform;
