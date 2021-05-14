import { Group } from 'three';
import * as THREE from 'three'
import x2 from '../../../assets/textures/x2.png'
import x10 from '../../../assets/textures/x10.png'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min';

// and the import from BreakoutScene.js
class Multiplier extends Group {
    constructor(parent, width, isTimes2) {
        // Call parent Group() constructor
        super();

        // Init state
        this.state = {
            // Put any state things you want here
        };

        const geometry = new THREE.BoxGeometry(width, width, width);

        const loader = new THREE.TextureLoader();
        const texture = isTimes2 ? x2 : x10;    // Load in the relevant multiplier texture
        const materials = new THREE.MeshPhongMaterial({ map: loader.load(texture) })

        const cube = new THREE.Mesh(geometry, materials);
        this.mesh = cube;
        this.distRad = 15;
        this.mesh.position.z = -this.distRad;
        this.mesh.name = "multiplier"
        this.multiplyValue = isTimes2 ? 2 : 10;
        this.isTimes2 = isTimes2;

        parent.add(this.mesh);   // Or this.mesh, most likely

        // Add self to parent's update list (if needed)
        parent.addToUpdateList(this);

        // This gets a random point on the sphere the x10 multiplier should move around,
        // check out this: https://mathworld.wolfram.com/SpherePointPicking.html, from A3
        if (!this.isTimes2) {

            // Gets new random position on sphere
            let u = Math.random() * 2 - 1; // Random value [-1, 1]
            let theta = Math.random() * 2 * Math.PI; // Random value [0, 2PI]

            this.mesh.position.set(
                Math.sqrt(1 - u ** 2) * Math.cos(theta),
                Math.sqrt(1 - u ** 2) * Math.sin(theta),
                u
            );
            this.mesh.position.multiplyScalar(this.distRad);

            // Both tweens
            const shrink = new TWEEN.Tween(this.mesh.scale)
                .to(new THREE.Vector3(0, 0, 0), 5000)
                .easing(TWEEN.Easing.Exponential.In);

            const expand = new TWEEN.Tween(this.mesh.scale)
                .to(new THREE.Vector3(1, 1, 1), 5000)
                .easing(TWEEN.Easing.Exponential.Out);

            // What to do when the tweens complete
            shrink.onComplete(() => {
                // Another new position
                let newU = Math.random() * 2 - 1; // Random value [-1, 1]
                let newTheta = Math.random() * 2 * Math.PI; // Random value [0, 2PI]

                this.mesh.position.set(
                    Math.sqrt(1 - newU ** 2) * Math.cos(newTheta),
                    Math.sqrt(1 - newU ** 2) * Math.sin(newTheta),
                    newU
                );
                this.mesh.position.multiplyScalar(this.distRad);
                expand.start();
            })

            expand.onComplete(() => {
                shrink.start();
            })

            shrink.start();

        }
    }

    update(timeStamp) {
        TWEEN.update();

        // The x2 multiplier just orbits around the screen
        if (this.isTimes2) {
            const speed = 2000

            this.mesh.position.set(
                Math.cos(timeStamp / speed) * this.distRad,
                0,
                Math.sin(timeStamp / speed) * this.distRad
            );

            this.mesh.rotation.set(
                0, -timeStamp / speed, 0
            )
        }

    }
}

export default Multiplier;
