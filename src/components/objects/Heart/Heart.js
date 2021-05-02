import { Group } from 'three';
import * as THREE from 'three'

class Heart extends Group {
    constructor(parent, color, x, y, scale) {
        // Call parent Group() constructor
        super();

        // Init state
        this.state = {
            // Put any state things you want here
        };

        const heartShape = new THREE.Shape();

        let SCALE = -scale;

        // adjust for the x and y values
        x -= 5 * SCALE;
        y += 5 * SCALE * 2;

        heartShape.moveTo( x + 5 * SCALE, y + 5 * SCALE);
        heartShape.bezierCurveTo( x + 5 * SCALE, y + 5 * SCALE, x + 4 * SCALE, y, x, y );
        heartShape.bezierCurveTo( x - 6 * SCALE, y, x - 6 * SCALE, y + 7 * SCALE, x - 6 * SCALE, y + 7 * SCALE);
        heartShape.bezierCurveTo( x - 6 * SCALE, y + 11 * SCALE, x - 3 * SCALE, y + 15.4 * SCALE, x + 5 * SCALE, 
            y + 19 * SCALE);
        heartShape.bezierCurveTo( x + 12 * SCALE, y + 15.4 * SCALE, x + 16 * SCALE, y + 11 * SCALE, 
            x + 16 * SCALE, y + 7 * SCALE);
        heartShape.bezierCurveTo( x + 16 * SCALE, y + 7 * SCALE, x + 16 * SCALE, y, x + 10 * SCALE, y );
        heartShape.bezierCurveTo( x + 7 * SCALE, y, x + 5 * SCALE, y + 5 * SCALE, x + 5 * SCALE, y + 5 * SCALE);


        const geometry = new THREE.ShapeGeometry( heartShape );
        const material = new THREE.MeshBasicMaterial( { color: color } );
        const mesh = new THREE.Mesh( geometry, material );

        this.mesh = mesh;

        this.mesh.name = "heart";
        this.mesh.userData.heart = this;

        parent.add(this.mesh);
    }

    remove() {
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        this.mesh.parent.remove(this.mesh);

        // TODO: make this cooler (perhaps make it into little blocks then have them drop)
    }

    update(timeStamp) {
        // Put any updates you want to occur in here
    }
}

export default Heart;
