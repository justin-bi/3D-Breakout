import { Group } from 'three';
// Potentially useful stuff, just wanted to save a copy from the stuff we deleted
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import * as THREE from 'three' // Probably need to change later, doing this for now for simplicity

let ballI = 0;

class Ball extends Group {
    constructor(parent, radius, color, translateVec) {
        // Call parent Group() constructor
        super();

        // Init state
        this.state = {
            // The direction of the ball, start by just going straight down
            vel: new THREE.Vector3(-0.05, 0.05, 0),
        };

        const geometry = new THREE.SphereGeometry(radius, 8, 8);

        // Build the vertices because three js is wack lmao
        // Want to store the vertices as Vector3s
        let vertices = [];
        // this.mesh.geometry.attributes.position;
        for (let vi = 0; vi < geometry.attributes.position.count; vi++) {
            let vert = new THREE.Vector3(
                geometry.attributes.position.array[vi * 3], 
                geometry.attributes.position.array[vi * 3 + 1], 
                geometry.attributes.position.array[vi * 3 + 2]
            )
            vertices.push(vert) 
        }
        this.verts = vertices;

        const material = new THREE.MeshPhongMaterial(
            {
                color: color,
                flatShading: true
            }
        );

        // keeps track of whether ball is moving
        this.moving = false;

        this.mesh = new THREE.Mesh(geometry, material);
        // Get a better starting position
        this.mesh.position.add(new THREE.Vector3(0, 0.1, 0))

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

        let handleBallEvent = function (event) {
            // Ignore keypresses typed into a text box
            if (event.target.tagName === "INPUT") {
                return;
            }

            // if the level has not started, is paused or over, you shouldn't be able to start again
            if (!parent.levelStarted || parent.paused || parent.levelOver) return;

            // start ball moving
            if (event.key == "ArrowUp") {
                parent.ballStarted = true;
                parent.inPlay = true;

                for (let i = 0; i < parent.balls.length; i++) {
                    parent.balls[i].moving = true;
                }
            }
            else return;
        };

        window.addEventListener("keydown", handleBallEvent);
    }

    update(timeStamp) {

        // if the ball has not begun moving, do not start yet
        if (!this.moving) return;

        // Updated moving code
        this.mesh.position.add(this.state.vel);

        // Code from here: https://stackoverflow.com/questions/11473755/how-to-detect-collision-in-three-js
        // Open to ideas, since this seems a tad complex
        let pos = this.mesh.position.clone();

        for (let vi = 0; vi < this.verts.length; vi++) {
            // I think this doesn't actually transform anything, since this mesh was declared at the
            // origin, but it's just here for thoroughness
            let globalVert = this.verts[vi].clone().applyMatrix4(this.mesh.matrix);
            const dirVec = globalVert.sub(this.mesh.position);
            const rayCast = new THREE.Raycaster();
            rayCast.set(pos, dirVec.clone().normalize());
            let collisionResults = rayCast.intersectObjects(this.parent.children);

            // If the ray collides with something, and the first collision (sorted in order of distance)
            // is less than the distance to the edge of the mesh itself, got a collision
            if (collisionResults.length > 0 && collisionResults[0].distance < dirVec.length()) {

                // If it collided, first move it back to its position BEFORE the collisions, guaranteed to not be in a 
                // collision at this point
                this.mesh.position.sub(this.state.vel);

                // The object the ball collides with
                const object = collisionResults[0].object;

                // NOTE! All the bounce code below might be able to be improved, since collision results return the face that 
                // it collided with, meaning we can use the normals. This method still works, but should it fail, might want 
                // to look into that switch

                // Everything that the ball bounces off of is a box mesh (hopefully it stays that way haha),
                // so to calculate which way its angle should go, find the angle of the dirVec that caused the 
                // collision. Then, if it's within a certain range, cause it to reflect a certain way. 
                const angle = dirVec.clone().angleTo(new THREE.Vector3(1, 0, 0)) / Math.PI * 180 // Converting to degrees is easier

                // First, handle cases where the ball collides mostly on the left or right
                if (angle < 30 || (angle >= 150 && angle < 210) || angle >= 330) {
                    this.state.vel.x *= -1;
                }
                // Otherwise, handle cases where it mostly bounces top or bottom
                else if ((angle >= 60 && angle < 120) || (angle >= 240 && angle < 300)) {
                    this.state.vel.y *= -1;
                }
                // Else, we assume it mostly bounced off a corner and reflect both
                else {
                    this.state.vel.y *= -1;
                    this.state.vel.x *= -1;
                }

                if (object.name === "paddle") {
                    // Note that it should do something special for the paddle, eg if it hits a certain area of 
                    // the paddle it should change angle towards that direction, if the paddle is moving towards it
                    // the ball should move in the same direction, etc. 

                    // This code makes sure that if the ball is colliding with the paddle, it ensures that the ball ends up 
                    // outside the paddle
                    this.mesh.position.y = object.position.y + object.geometry.parameters.height + this.mesh.geometry.parameters.radius

                    const ballX = this.mesh.position.x
                    const halfWidth = object.geometry.parameters.width / 2
                    const platX = object.position.x

                    const offset = (ballX - platX) / halfWidth  // Will be [-1, 1]
                    console.log(offset)

                    // const platLeft = object.position.x - object.geometry.parameters.width
                    // const platRight = object.position.x + object.geometry.parameters.width
                    // console.log(ballX, platLeft, platRight, object)
                    // console.log(object.position)
                }

                // Do this hack for now
                this.mesh.position.add(this.state.vel);

                if (object.name === "brick") {
                    this.parent.removeBrick(object.userData.brick);
                } else if (object.name === "bottomBorder") {
                    this.parent.handleBallHittingBottom(this);
                }

                break;
            }
        }
    }
}

export default Ball;
