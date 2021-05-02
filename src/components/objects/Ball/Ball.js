import { Group } from 'three';
// Potentially useful stuff, just wanted to save a copy from the stuff we deleted
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import * as THREE from 'three' // Probably need to change later, doing this for now for simplicity
import { Brick } from 'objects';

let ballI = 0;

class Ball extends Group {
    constructor(parent, radius, color, translateVec) {
        // Call parent Group() constructor
        super();

        // Init state
        this.state = {
            // The direction of the ball, start by just going straight down
            vel: new THREE.Vector3(0, -0.05, 0),
        };

        const geometry = new THREE.SphereGeometry(radius, 8, 8);
        const material = new THREE.MeshPhongMaterial(
            {
                color: color,
                flatShading: true
            }
        );

        // keeps track of whether ball is moving
        this.moving = false;

        this.mesh = new THREE.Mesh(geometry, material);

        this.mesh.name = 'ball';
        this.parent = parent;

        this.mesh.position.add(translateVec);

        // add a reference to the ball object to its mesh
        this.mesh.userData.ball = this;

        // Add self to parent scene
        parent.add(this.mesh);
        // Add self to parent's update list
        parent.addToUpdateList(this);

        var ball = this;

        let handleBallEvent = function(event) {
            // Ignore keypresses typed into a text box
            if (event.target.tagName === "INPUT") {
                return;
            }

            // start ball moving
            if (event.key == "ArrowUp"){
                ball.moving = true;
            }
            else return;
        };

        window.addEventListener("keydown", handleBallEvent);
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
        // if the ball has not begun moving, do not start yet
        if (!this.moving) return;

        this.mesh.position.y += this.state.vel.y;
        // Just bounce up and down for now
        // if (this.mesh.position.y > -1 && this.mesh.position.y < 3) {
        //     this.mesh.position.y += this.state.vel.y
        // } else {
        //     this.mesh.position.y -= this.state.vel.y
        //     this.state.vel.y *= -1
        // }

        // Code from here: https://stackoverflow.com/questions/11473755/how-to-detect-collision-in-three-js
        // Open to ideas, since this seems a tad complex
        let pos = this.mesh.position.clone();

        for (let vi = 0; vi < this.mesh.geometry.vertices.length; vi++) {
            let localVert = this.mesh.geometry.vertices[vi];
            // I think this doesn't actually transform anything, since this mesh was declared at the
            // origin, but it's just here for thoroughness
            let globalVert = localVert.clone().applyMatrix4(this.mesh.matrix);
            let dirVec = globalVert.sub(this.mesh.position);
            let rayCast = new THREE.Raycaster();
            rayCast.set(pos, dirVec.clone().normalize());
            let collisionResults = rayCast.intersectObjects(this.parent.children);

            // If the ray collides with something, and the first collision (sorted in order of distance)
            // is less than the distance to the edge of the mesh itself, got a collision
            if (collisionResults.length > 0 && collisionResults[0].distance < dirVec.length()) {
                // Right now this is assuming it just switches y direction, need to add in angle factor later
                this.state.vel.y *= -1;

                const object = collisionResults[0].object;

                if (object.name === "brick") {
                    this.mesh.parent.removeBrick(object.userData.brick);
                } else if (object.name === "bottomBorder") {
                    this.mesh.parent.handleBallHittingBottom(this);
                }

                // Need this mult factor, otherwise it gets stuck, lower values don't work when it directly
                // hits the middle of two blocks, but this might change when we add in brick removal
                this.mesh.position.y += this.state.vel.y * 2;
                break;
            }
        }
    }
}

export default Ball;
