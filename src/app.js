/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import { WebGLRenderer, PerspectiveCamera, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BreakoutScene } from './components/scenes';
import './css/style.css'

// Initialize core ThreeJS components
const scene = new BreakoutScene();
const camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({ antialias: true });

// Set up camera
camera.position.set(0, 1.5, 10);
camera.lookAt(new Vector3(0, 0, 0));    // To change where this looks, look at controls.target below

// Set up renderer, canvas, and minor CSS adjustments
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;
canvas.style.display = 'block'; // Removes padding below canvas
document.body.style.margin = 0; // Removes margin around page
document.body.style.overflow = 'hidden'; // Fix scrolling
document.body.appendChild(canvas);

// Set up controls
const controls = new OrbitControls(camera, canvas);
controls.target = new Vector3(0, 1.5, 0)  // Changes where the cam focuses
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 4;
controls.maxDistance = 16;
controls.update();

// Render loop
const onAnimationFrameHandler = (timeStamp) => {
    controls.update();
    renderer.render(scene, camera);
    scene.update && scene.update(timeStamp);
    window.requestAnimationFrame(onAnimationFrameHandler);
};
window.requestAnimationFrame(onAnimationFrameHandler);

// Resize Handler
const windowResizeHandler = () => {
    const { innerHeight, innerWidth } = window;
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
};
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);


// make title
let titleContainer = document.createElement('div');
titleContainer.id = "title-container";
document.body.appendChild(titleContainer);

let titleText = document.createElement('h1');
titleText.innerText = "3D BREAKOUT";
titleContainer.appendChild(titleText);

// make instructions
let instructionsContainer = document.createElement('div');
instructionsContainer.id = "instructions-container";
document.body.appendChild(instructionsContainer);

let instructionsTitle = document.createElement('h1');
instructionsTitle.innerText = "INSTRUCTIONS";
instructionsContainer.appendChild(instructionsTitle);



let instructionsText = document.createElement('p');
instructionsText.innerHTML = "&#8593;: Start <br> <br>" +
                              "&#8592;: Move the platform left <br> <br>" +
                              "&#8594;: Move the platform right <br> <br>" +
                              "P: Pause <br> <br>" +
                              "Mouse: Move the camera";
instructionsContainer.appendChild(instructionsText);
