import * as THREE from "three";
import * as dat from "dat.gui";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { Simulation } from "./simulation.js";
import { ChoiceScreen } from "./choiceScreen.js";

let renderer, debugUI, choiceScreen, composer, outputPass;
let simActive = false;
let sim = new Simulation();

async function init(useDebug) {
	//load choice screen
	choiceScreen = new ChoiceScreen();
	let choiceInitResult = await choiceScreen.Init(window);
	if (choiceInitResult === false) {
		console.log("Error loading choice screen");
		return;
	}

	//setup renderer
	renderer = new THREE.WebGLRenderer({
		antialias: true,
		premultipliedAlpha: false,
	});

	renderer.alpha = true;
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0x000000, 0);
	renderer.setPixelRatio(window.devicePixelRatio);

	//set up post-processing
	outputPass = new OutputPass();
	composer = new EffectComposer(renderer);
	composer.addPass(choiceScreen.renderPass);
	composer.addPass(outputPass);

	if (useDebug) {
		setupDebugUI();
	}

	// add event listeners to the window
	window.addEventListener("touchstart", onTouchStarted, false);
	window.addEventListener("click", onMouseClicked, false);
	window.addEventListener("resize", onWindowResize, false);

	//disable pinch-zoom
	document.addEventListener(
		"touchmove",
		(e) => {
			if (e.touches.length > 1) {
				e.preventDefault();
			}
		},
		{ passive: false }
	);

	document.body.appendChild(renderer.domElement);

	document.getElementById("backButton").onclick = function () {
		location.href = "https://trafficalm.com/resources/software";
	};
}

function setupDebugUI() {
	debugUI = new dat.GUI();
	//
	//  const directionalLightFolder = debugUI.addFolder("Light");
	//  directionalLightFolder.add(directionalLight.position, "x", -100, 100, 0.01);
	//  directionalLightFolder.add(directionalLight.position, "y", -100, 100, 0.01);
	//  directionalLightFolder.add(directionalLight.position, "z", -100, 100, 0.01);
	//
	//  const remoteFolder = debugUI.addFolder("Remote");
	//  remoteFolder.add(remote.model.position, "x", -0.1, 0.1, 0.001);
	//  remoteFolder.add(remote.model.position, "y", -0.1, 0.1, 0.001);
	//  remoteFolder.add(remote.model.position, "z", -5, 5, 0.001);
	//  remoteFolder.add(remote.model.rotation, "x", 0, Math.PI * 2);
	//  remoteFolder.add(remote.model.rotation, "y", 0, Math.PI * 2);
	//  remoteFolder.add(remote.model.rotation, "z", 0, Math.PI * 2);
	//
	//  const signFolder = debugUI.addFolder("Sign");
	//  signFolder.add(sign.model.position, "x", -0.1, 0.1, 0.001);
	//  signFolder.add(sign.model.position, "y", -0.1, 1, 0.001);
	//  signFolder.add(sign.model.position, "z", -10, 10, 0.001);
	//  signFolder.add(sign.model.rotation, "x", 0, Math.PI * 2);
	//  signFolder.add(sign.model.rotation, "y", 0, Math.PI * 2);
	//  signFolder.add(sign.model.rotation, "z", 0, Math.PI * 2);
	//
	//  const cameraFolder = debugUI.addFolder("Camera");
	//  cameraFolder.add(camera.position, "x", -0.1, 0.1, 0.001);
	//  cameraFolder.add(camera.position, "y", -0.1, 1, 0.001);
	//  cameraFolder.add(camera.position, "z", -20, 20, 0.001);
	//  cameraFolder.add(camera.rotation, "x", 0, Math.PI * 2);
	//  cameraFolder.add(camera.rotation, "y", 0, Math.PI * 2);
	//  cameraFolder.add(camera.rotation, "z", 0, Math.PI * 2);
	debugUI.close();
}

function onWindowResize() {
	if (simActive === true) {
		sim.OnResize(window.innerWidth, window.innerHeight);
	} else {
		choiceScreen.OnResize(window.innerWidth, window.innerHeight);
	}

	renderer.setSize(window.innerWidth, window.innerHeight);
	composer.setSize(window.innerWidth, window.innerHeight);
}

async function initSim(useNewRemote) {
	if (useNewRemote === true) {
		let simInit1Result = await sim.Init(
			window,
			useNewRemote,
			choiceScreen.remoteNew
		);

		if (simInit1Result === false) {
			console.log("Error loading simulation");
			return false;
		}
	} else {
		let simInit2Result = await sim.Init(
			window,
			useNewRemote,
			choiceScreen.remoteOld
		);

		if (simInit2Result === false) {
			console.log("Error loading simulation");
			return false;
		}
	}

	//hide 'choose remote' message
	document.getElementById("choose-remote-message").style.display = "none";

	composer = new EffectComposer(renderer);
	composer.addPass(sim.renderPass);
	composer.addPass(outputPass);

	simActive = true;

	return true;
}

async function onMouseClicked(event) {
	let location = getNormalizedCoordinates(event.clientX, event.clientY);

	if (simActive === false) {
		let remoteChoice = choiceScreen.OnInput(location);
		if (remoteChoice !== "") {
			initSim(remoteChoice === "new");
		}
	} else {
		sim.OnInput(location);
	}
}

async function onTouchStarted(event) {
	//prevent default behavior to avoid double triggering
	//event.preventDefault();

	//retrieve touch location
	let touch = event.touches[0];
	let location = getNormalizedCoordinates(touch.clientX, touch.clientY);

	if (simActive === false) {
		let remoteChoice = choiceScreen.OnInput(location);
		if (remoteChoice !== "") {
			initSim(remoteChoice === "new");
		}
	} else {
		sim.OnInput(location);
	}
}

function animate() {
	requestAnimationFrame(animate);
	if (simActive === true) {
		sim.Update();
	}

	composer.render();
}

function getNormalizedCoordinates(screenX, screenY) {
	//calculate position in normalized device coordinates (-1 to +1)
	const rect = renderer.domElement.getBoundingClientRect();
	var x = ((screenX - rect.left) / rect.width) * 2 - 1;
	var y = -((screenY - rect.top) / rect.height) * 2 + 1;
	return new THREE.Vector2(x, y);
}

await init(false);
animate();
