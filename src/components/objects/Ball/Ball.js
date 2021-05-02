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
            vel: new THREE.Vector3(0.05, -0.05, 0),
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
                parent.inPlay = true;
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

        // Updated moving code
        this.mesh.position.add(this.state.vel)

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

                // The object the ball collides with
                const object = collisionResults[0].object;

                // NOTE! All the bounce code below might be able to be improved, since collision results return the face that 
                // it collided with, meaning we can use the normals. This method still works, but should it fail, might want 
                // to look into that switch

                // Everything that the ball bounces off of is a box mesh (hopefully it stays that way haha),
                // so to calculate which way its angle should go, find the angle of the dirVec that caused the 
                // collision. Then, if it's within a certain range, cause it to reflect a certain way. 
                let angle = dirVec.clone().angleTo(new THREE.Vector3(1, 0, 0)) / Math.PI * 180 // Converting to degrees is easier

                // First, handle cases where the ball collides mostly on the left or right
                if (angle < 30 || (angle >= 150 && angle < 210) || angle >= 330) {
                    this.state.vel.x *= -1
                } 
                // Otherwise, handle cases where it mostly bounces top or bottom
                else if ((angle >= 60 && angle < 120) || (angle >= 240 && angle < 300)) { 
                    this.state.vel.y *= -1
                } 
                // Else, we assume it mostly bounced off a corner and reflect both
                else {
                    this.state.vel.y *= -1
                    this.state.vel.x *= -1
                }

                if (object.name === "paddle") {
                    // Note that it should do something special for the paddle, eg if it hits a certain area of 
                    // the paddle it should change angle towards that direction, if the paddle is moving towards it
                    // the ball should move in the same direction, etc. 
                }

                // Need this mult factor, otherwise it gets stuck, lower values don't work when it directly
                // hits the middle of two blocks, but this might change when we add in brick removal

                // We want to make sure that while the object still collides with this object, we keep moving it
                // let thisObjCollision = rayCast.intersectObjects([object, this]);
                // console.log(thisObjCollision)
                // while (thisObjCollision.length > 1 && thisObjCollision[0].length < dirVec.length()) {
                //     // While more than one object is intersecting
                //     this.mesh.position.add(this.state.vel.clone().multiplyScalar(2))
                // }

                this.mesh.position.add(this.state.vel.clone().multiplyScalar(2))

                if (object.name === "brick") {
                    this.mesh.parent.removeBrick(object.userData.brick);
                } else if (object.name === "bottomBorder") {
                    this.mesh.parent.handleBallHittingBottom(this); 
                }

                break;
            }
        }
    }
}

export default Ball;
