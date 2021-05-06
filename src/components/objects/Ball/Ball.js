import { Group } from 'three';
import * as THREE from 'three'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min';


let ballI = 0;  // DEBUGGING tool, delete when finalizing

class Ball extends Group {
    constructor(parent, radius, color, translateVec, startVelocityVec) {
        // Call parent Group() constructor
        super();

        // Init state
        this.state = {
            // The direction of the ball, start by just going straight down
            vel: startVelocityVec,
            dir: startVelocityVec.clone().normalize(),
            speed: startVelocityVec.x / startVelocityVec.clone().normalize().x  // A way to get the speed for a normed vec
        };

        const geometry = new THREE.SphereGeometry(radius, 10, 10);
        this.radius = radius;

        // Easy way to store the vertices
        let vertices = [];
        for (let vi = 0; vi < geometry.attributes.position.count; vi++) {
            let vert = new THREE.Vector3(
                geometry.attributes.position.array[vi * 3],
                geometry.attributes.position.array[vi * 3 + 1],
                geometry.attributes.position.array[vi * 3 + 2]
            );
            vertices.push(vert);
        }
        this.verts = vertices;

        // ANGLE code
        this.minAngle = 30;
        this.maxAngle = 60;

        const material = new THREE.MeshPhongMaterial({ color: color, flatShading: true });
        this.origColor = material.color.clone();    // For color tweening

        // keeps track of whether ball is moving
        this.moving = false;

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.add(new THREE.Vector3(0, 0.01, 0)) // Need a small offset for smoother start

        this.mesh.name = 'ball';
        this.parent = parent;

        this.mesh.position.add(translateVec);

        // add a reference to the ball object to its mesh
        this.mesh.userData.ball = this;

        // Add self to parent scene
        parent.add(this.mesh);
        // Add self to parent's update list
        parent.addToUpdateList(this);

        // Get the boundaries for the ball
        // Hesistant to do this in the constructor stage, as parent might not have the borders in its children yet, 
        // works for now, but need to make sure the borders are added before the ball is added to the scene
        const leftBorder = this.parent.children.find(x => x.name === "leftBorder")
        this.minX = leftBorder.position.x + leftBorder.geometry.parameters.width / 2 + this.radius;

        const rightBorder = this.parent.children.find(x => x.name === "rightBorder")
        this.maxX = rightBorder.position.x - rightBorder.geometry.parameters.width / 2 - this.radius;

        const bottomBorder = this.parent.children.find(x => x.name === "bottomBorder");
        this.minY = bottomBorder.position.y + bottomBorder.geometry.parameters.width / 2 + this.radius;

        const topBorder = this.parent.children.find(x => x.name === "topBorder");
        this.maxY = topBorder.position.y - topBorder.geometry.parameters.height / 2 - this.radius;

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

    // This function clamps the position values of the ball to make sure that it never goes outside the boundaries of the 
    // screen. 
    clampBounds() {
        this.position.x = Math.max(this.minX, Math.min(this.maxX, this.position.x)); // Clamp x
        this.position.y = Math.max(this.minY, Math.min(this.maxY, this.position.y)); // Clamp y
    }

    // Initiate the tweening of colors
    changeColors(object) {
        if (object == null) return;

        const lighten = new TWEEN.Tween(this.mesh.material.color)
            .to(object.material.color.clone().addScalar(0.3), 100)
            .easing(TWEEN.Easing.Exponential.Out);

        const darken = new TWEEN.Tween(this.mesh.material.color)
            .to(this.origColor.clone(), 400)
            .easing(TWEEN.Easing.Linear.None);

        lighten.onComplete(() => darken.start());

        lighten.start()
    }

    update(timeStamp) {

        // Update any TWEEN stuff
        TWEEN.update()

        // if the ball has not begun moving, do not start yet
        if (!this.moving) return;

        // Updated moving code
        this.mesh.position.add(this.state.vel);

        // Collision code from here: https://stackoverflow.com/questions/11473755/how-to-detect-collision-in-three-js

        // First, collect all the collisions to sort (makes for better collisions when sorted)
        const collisions = [];
        for (let vi = 0; vi < this.verts.length; vi++) {
            // Not sure if applyMat4 needed, but here for thoroughness
            const globalVert = this.verts[vi].clone().applyMatrix4(this.mesh.matrix);
            const dirVec = globalVert.sub(this.mesh.position);
            const rayCast = new THREE.Raycaster();
            rayCast.set(this.mesh.position, dirVec.clone().normalize());
            const collisionResults = rayCast.intersectObjects(this.parent.children);

            // In here, just collect the collision results
            if (collisionResults.length > 0 && collisionResults[0].distance < dirVec.length()
                && collisionResults[0].object.collidable !== false) {
                collisionResults[0].dirVec = dirVec.clone()
                collisions.push(collisionResults[0])
                if (collisionResults[0].object.name === "brick") {
                    // console.log(collisionResults[0].object)
                }
            }
        }

        // If there are any collisions, sort them then handle them
        if (collisions.length > 0) {

            // Test changing the color
            this.changeColors(collisions[0].object);

            collisions.sort((a, b) => (a.distance > b.distance) ? 1 : -1)
            // If collided, first move ball back to its position one timestep BEFORE the collisions, 
            // guaranteed to not be in a collision at this point
            this.mesh.position.sub(this.state.vel);

            // The object the ball collides with
            const object = collisions[0].object;

            // Grab the angle of the closest dirVec collided with in degrees (use unit circle degrees)
            const angle = collisions[0].dirVec.clone().angleTo(new THREE.Vector3(1, 0, 0)) / Math.PI * 180

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

                // This code makes sure that if the ball is colliding with the paddle, it ensures that the ball ends up 
                // outside the paddle
                const guaranteedHeight = object.position.y + (object.geometry.parameters.height / 2) + this.radius;
                this.mesh.position.y = Math.max(this.mesh.position.y, guaranteedHeight)

                const halfWidth = object.geometry.parameters.width / 2
                const offset = (this.mesh.position.x - object.position.x) / halfWidth  // Offset in [-1, 1]

                let percent;
                let newAngle;
                let onLeft;
                let inMiddle = true;
                const cutoff = 0.1

                if (offset > cutoff && object.rightPressed) {
                    percent = (offset - cutoff) / (1 - cutoff)  // val in [0, 1]
                    onLeft = false;
                    inMiddle = false;
                } else if (offset < -cutoff && object.leftPressed) {
                    percent = (offset + cutoff) / (-1 + cutoff) // val in [0, 1]
                    onLeft = true;
                    inMiddle = false;
                }

                // If it's in the middle, nothing special needs to happen, can just the general bounce code
                // If it's not, need to ensure certain directions. 
                if (!inMiddle) {
                    newAngle = this.maxAngle - (this.maxAngle - this.minAngle) * percent
                    newAngle = Math.max(Math.min(this.maxAngle, newAngle), this.minAngle)

                    // Now that we have the new angle, find the vector by converting this to radians
                    let radAngle = newAngle * Math.PI / 180;    // Maybe have the angles be in rads from the start
                    let newDir = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), radAngle)
                    if (onLeft) {
                        newDir.x *= -1
                    }
                    newDir.normalize()
                    this.state.vel = newDir.multiplyScalar(this.state.speed)
                }
            }

            this.mesh.position.add(this.state.vel);

            if (object.name === "brick" && object.collidable !== false) {
                console.log(object)
                this.parent.removeBrick(object.userData.brick);
            } else if (object.name === "bottomBorder") {
                this.parent.handleBallHittingBottom(this);
            }

            // Ensure the ball is in valid position compared to borders
            this.clampBounds()

        }
    }
}




export default Ball;
