import { Group } from 'three';
// Potentially useful stuff, just wanted to save a copy from the stuff we deleted
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';    
import * as THREE from 'three' // Probably need to change later, doing this for now for simplicity

class Ball extends Group {
    constructor(parent, color) {
        // Call parent Group() constructor
        super();

        // Init state
        this.state = {
            // The direction of the ball, start by just going straight down
            vel: new THREE.Vector3(0, -0.01, 0),
        };


        const geometry = new THREE.SphereGeometry(0.3, 8, 8);
        const material = new THREE.MeshPhongMaterial(
            {
                color: color,
                flatShading: true
            }
        );
        this.mesh = new THREE.Mesh(geometry, material);

        this.name = 'ball';

        parent.add(this.mesh);

        // Add self to parent's update list
        parent.addToUpdateList(this);
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

        
        // Just bounce up and down for now
        if (this.mesh.position.y > -1 && this.mesh.position.y < 1) {
            this.mesh.position.y += this.state.vel.y
        } else {
            this.mesh.position.y -= this.state.vel.y
            this.state.vel.y *= -1
        }

        // Advance tween animations, if any exist
        // TWEEN.update();
    }
}

export default Ball;
