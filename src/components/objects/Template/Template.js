import { Group } from 'three';

// CHANGE THE NAME
// Also be sure to update /objects/index.js 
// and the import from BreakoutScene.js
class Template extends Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();

        // Init state
        this.state = {
            // Put any state things you want here
        };

        parent.add(this);   // Or this.mesh, most likely

        // Add self to parent's update list (if needed)
        parent.addToUpdateList(this);
    }

    update(timeStamp) {
        // Put any updates you want to occur in here
    }
}

// CHANGE THIS to whatever object you want to make
export default Template;
