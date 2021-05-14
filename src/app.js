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
import './assets/css/style.css'
import loopedMus from './assets/sounds/loop-mus.mp3';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min';
import * as THREE from 'three'
import { Color } from 'three';

// Initialize core ThreeJS components
const camera = new PerspectiveCamera();
var scene = new BreakoutScene(camera);  // Pass camera in to see if objects are in view
const renderer = new WebGLRenderer({ antialias: true });

const CAMERA_POS_Z = [10, 11, 12, 13, 14, 15, 16];

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
controls.target = new Vector3(0, 1.5, 0);  // Changes where the cam focuses
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 8;
controls.maxDistance = 12;
controls.update();

let lastLevel = 0;

// Render loop
const onAnimationFrameHandler = (timeStamp) => {
    TWEEN.update();
    controls.update();
    renderer.render(scene, camera);
    scene.update && scene.update(timeStamp);

    // if the level has changed adjust camera
    if (scene.currentLevelNum > lastLevel) {
        camera.position.set(0, 1.5, CAMERA_POS_Z[[scene.currentLevelNum]]);
    }

    // Update the points scored
    pointText.innerText = "Points: " + scene.points.toString().padStart(4, '0');

    lastLevel = scene.currentLevelNum;
    window.requestAnimationFrame(onAnimationFrameHandler);
};
let id = window.requestAnimationFrame(onAnimationFrameHandler);

// Resize Handler
const windowResizeHandler = () => {
    const { innerHeight, innerWidth } = window;
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
};
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);

// make points container
let pointContainer = document.createElement('div');
pointContainer.id = "point-container";
document.body.appendChild(pointContainer);

let pointText = document.createElement('h1');
pointText.innerText = "Points: " + scene.points.toString().padStart(4, '0');
pointContainer.appendChild(pointText);

// make title
let titleContainer = document.createElement('div');
titleContainer.id = "title-container";
document.body.appendChild(titleContainer);

let titleText = document.createElement('h1');
titleText.innerText = "3D BREAKOUT";
titleContainer.appendChild(titleText);

// make instructions window
let instructionsContainer = document.createElement('div');
instructionsContainer.id = "instructions-container";
document.body.appendChild(instructionsContainer);

// make instructions title
let instructionsTitle = document.createElement('h1');
instructionsTitle.innerText = "INSTRUCTIONS";
instructionsContainer.appendChild(instructionsTitle);

// create a line break between title and content
let instructionsText = document.createElement('p');
instructionsText.innerHTML = "";
instructionsContainer.appendChild(instructionsText);

// make instructions table
let table = document.createElement('table');
instructionsContainer.appendChild(table);

let space = table.insertRow();
space.insertCell(0).innerHTML = "[SPACEBAR]";
space.insertCell(1).innerHTML = "START game";

let up = table.insertRow();
up.insertCell(0).innerHTML = "[&#8593;]";
up.insertCell(1).innerHTML = "Start the ball";

let left = table.insertRow();
left.insertCell(0).innerHTML = "[&#8592;]";
left.insertCell(1).innerHTML = "Move the platform left";

let right = table.insertRow();
right.insertCell(0).innerHTML = "[&#8594;]";
right.insertCell(1).innerHTML = "Move the platform right";

let pause = table.insertRow();
pause.insertCell(0).innerHTML = "[P]";
pause.insertCell(1).innerHTML = "PAUSE/RESUME";

let mouse = table.insertRow();
mouse.insertCell(0).innerHTML = "[MOUSE]";
mouse.insertCell(1).innerHTML = "Change perspective";

// the instruction window disappears when the game is in play
// and reappears when the game is paused
var isPaused = false;

// Music to loop, plays when game starts
var loopMus = new Audio(loopedMus);

let handlePlayerEvent = function (event) {
    // Ignore keypresses typed into a text box
    if (event.target.tagName === "INPUT") {
        return;
    }

    if (event.key == " ") {
        // if game is over, reload main screen
        if (scene.gameOver) {
            window.location.reload();
        }
        else if (scene.levelOver) {
            scene.levelOver = false;
            const LEVEL_COLORS = [0xCAF0F8, 0x90E0EF, 0x00B4D8, 0x0096C7, 0x0077B6, 0x023E8A, 0x03045E];
            // Tween for camera level transitions
            const viewRise = new TWEEN.Tween(controls.target)
                .to(new THREE.Vector3(0, 10, 0), 700)
                .easing(TWEEN.Easing.Quadratic.InOut);
            const camRise = new TWEEN.Tween(camera.position)
                .to(new THREE.Vector3(0, 10, 10), 700)
                .easing(TWEEN.Easing.Quadratic.InOut);

            const viewFall = new TWEEN.Tween(controls.target)
                .to(new THREE.Vector3(0, 1.5, 0), 700)
                .easing(TWEEN.Easing.Quadratic.InOut);

            const camFall = new TWEEN.Tween(camera.position)
                .to(new THREE.Vector3(0, 1.5, 10), 700)
                .easing(TWEEN.Easing.Quadratic.InOut);

            let newCol = new Color(LEVEL_COLORS[scene.currentLevelNum + 1]);
            const colorChange = new TWEEN.Tween(scene.background)
                .to(newCol, 500)
                .easing(TWEEN.Easing.Linear.None);

            camRise.onComplete(() => {
                scene.nextLevel();
                camFall.start();
                viewFall.start();
            })

            camRise.start();
            viewRise.start();
            colorChange.start();

        }
        // if scene hasn't started yet, make the screen go away
        else if (!scene.gameStarted) {
            instructionsContainer.style.visibility = 'hidden';
            scene.levelStartContainer.style.visibility = 'visible';
            scene.gameStarted = true;

            // Start the game music in here, since autoplay isn't allowed
            if (!loopMus.isPlaying) {
                loopMus.volume = 0.2;
                loopMus.playbackRate = 0.9;
                loopMus.loop = true;
                loopMus.play();
            }
        }
        else if (!scene.levelStarted) {
            scene.levelStartContainer.style.visibility = 'hidden';
            scene.levelStarted = true;
        }
    }
    // pause events
    else if (event.key == "p") {
        if (isPaused && scene.levelStarted) {
            loopMus.volume = 0.2; // If the game gets unpaused, turn the volume up again. 
            instructionsContainer.style.visibility = 'hidden';
        }
        else {
            instructionsContainer.style.visibility = 'visible';
            loopMus.volume = 0.05; // If the game gets unpaused, turn the volume up again. 
        }

        isPaused = !isPaused;
    }
    else return;
}
window.addEventListener("keydown", handlePlayerEvent);


