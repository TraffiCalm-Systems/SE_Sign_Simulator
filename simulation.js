import * as THREE from "three";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { Remote } from "./remote.js";
import { Sign } from "./sign.js";
import { Transition3D } from "./transition3d.js";

export class Simulation {
	constructor() {
		this.renderPass = null;
		this.scene = null;
		this.directionalLight = null;
		this.camera = null;
		this.cameraTransition = null;
		this.currentState = null;
		this.sign = null;
		this.remote = null;
		this.remoteTransition = null;
		this.windowWidth = 0;
		this.windowHeight = 0;
		this.state = {};
		this.commandChain = "";
		this.editingMenuItem = false;
		this.signUnlocked = false;
		this.volatileMenuValue = 0;
		this.schedulestring = "";
		this.helpStage = "none";
		this.allowRemoteInput = true;

		//UI elements
		this.helpButton = document.getElementById("helpButton");
		this.nextButton = document.getElementById("nextButton");
		this.overlay = document.getElementById("overlay");
		this.title = document.getElementById("title");
		this.explanation = document.getElementById("explanation");

		this.helpButton.addEventListener("click", () => {
			this.helpButtonPressed();
		});

		this.nextButton.addEventListener("click", () => {
			this.nextButtonPressed();
		});

		this.scene = new THREE.Scene();
		new RGBELoader().load("moonless_golf_1k.hdr", (texture) => {
			texture.mapping = THREE.EquirectangularReflectionMapping;
			this.scene.environment = texture;
		});
		//setup scene lighting
		this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
		this.directionalLight.position.set(0, 48.68, -19);
		this.directionalLight.castShadow = false;
		this.scene.add(this.directionalLight);
		this.sign = new Sign();
	}

	async Init(window, useNewRemote, remote) {
		this.windowWidth = window.innerWidth;
		this.windowHeight = window.innerHeight;

		this.state = this.createState(useNewRemote);

		//load scene with image-based lighting
		//import meshes
		const importResults = await Promise.all([
			this.sign.Import().catch((error) => ({
				error,
				instance: sign,
				type: "Sign",
			})),
		]);

		//process the results
		importResults.forEach((result) => {
			if (result.error) {
				console.error(`Error loading model: `, result.error);
				//TODO: handle the error for each instance based on `result.instance` or `result.type`
				return false;
			}
		});

		this.camera = new THREE.PerspectiveCamera(
			45,
			this.windowWidth / this.windowHeight,
			0.1,
			5
		);

		this.remote = remote;

		this.cameraTransition = new Transition3D(this.camera);
		this.remoteTransition = new Transition3D(this.remote.model);

		//set initial scene up
		this.camera.position.set(0, 1, -0.007);
		this.camera.rotation.set(5.9, 0, 0);

		this.currentState = this.state.LOCKED;
		this.title.textContent = this.currentState.name;
		this.explanation.textContent = this.currentState.sign_explanation;

		this.scene.add(this.remote.model);
		this.remote.Initialize(this.currentState);

		this.scene.add(this.sign.model);
		this.sign.Initialize(this.currentState);

		this.renderPass = new RenderPass(this.scene, this.camera);

		this.OnResize(this.windowWidth, this.windowHeight);
		this.MoveCamera(true);

		//hide loading-screen and show help button
		this.helpButton.style.visibility = "visible";
		return true;
	}

	helpButtonPressed() {
		this.allowRemoteInput = false;

		this.helpStage = "sign";

		//hide help button
		this.helpButton.style.visibility = "hidden";

		//set overlay information to sign info
		this.explanation.textContent = this.currentState.sign_explanation;
		this.updateScheduleExplanation();
		//move camera to feedback lights on sign
		this.MoveCamera(false);

		//after 1s, show overlay with sign info.
		setTimeout(() => {
			this.ShowOverlay(true);
		}, 1000);
	}

	nextButtonPressed() {
		if (this.helpStage === "sign") {
			//set overlay to show remote information
			this.explanation.textContent = this.currentState.remote_explanation;
			this.MoveCamera(true); //move camera back to remote

			this.helpStage = "remote";
		} else if (this.helpStage === "remote") {
			this.ShowOverlay(false);
			this.helpStage = "none";
			//close dialog
			this.ShowOverlay(false);
			//re-show help button
			this.helpButton.style.visibility = "visible";
			setTimeout(() => {
				this.allowRemoteInput = true;
			}, 500);
		}
	}

	MoveCamera(toRemote) {
		if (this.cameraTransition.active) return;

		this.isTransitioning = true;
		this.startTime = null; //reset start time for new transition

		let endCameraPos, endCameraRot, endRemotePos, endRemoteRot;

		if (toRemote) {
			endCameraPos = new THREE.Vector3(0, 0.185, -0.007);
			endCameraRot = new THREE.Euler(5.9, 0, 0);
			endRemotePos = new THREE.Vector3(0, 0.081, -0.21);
			endRemoteRot = new THREE.Euler(0.7, 0, 0);
		} else {
			endCameraPos = new THREE.Vector3(-0.21, 0.04, -2.175);
			endCameraRot = new THREE.Euler(6.3, 0, 0);
			endRemotePos = new THREE.Vector3(0, 0.081, -2.175);
			endRemoteRot = new THREE.Euler(0.7, 0, -8);
		}

		this.cameraTransition.StartTransition(
			this.camera.position,
			endCameraPos,
			this.camera.rotation,
			endCameraRot
		);

		this.remoteTransition.StartTransition(
			this.remote.model.position,
			endRemotePos,
			this.remote.model.rotation,
			endRemoteRot
		);
	}

	ShowOverlay(visible) {
		if (visible === true) {
			this.overlay.classList.remove("fade-out");
			this.overlay.classList.add("fade-in");
		} else {
			this.overlay.classList.remove("fade-in");
			this.overlay.classList.add("fade-out");
		}
	}

	OnInput(location) {
		if (this.allowRemoteInput !== true) return;

		let button = this.remote.CheckUserInput(location, this.camera);
		if (button !== "") {
			this.commandChain = this.commandChain.concat(button);

			//handle input depending on current state
			this.handleInput();

			//keep commandChain string to a sensible size
			if (this.commandChain.length > 64) {
				var start = this.commandChain.length - 32;
				this.commandChain = this.commandChain.substring(start);
			}
		}
	}

	OnResize(width, height) {
		this.windowWidth = width;
		this.windowHeight = height;
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
	}

	Update() {
		this.cameraTransition.Update();
		this.remoteTransition.Update();
	}

	createState(useNewRemote) {
		let menuKeyTxt = useNewRemote ? "ENTER" : "MENU";

		return {
			LOCKED: {
				feedbackPattern: "0000",
				highlightpattern: [],
				sequencePattern: ["blank", "sign", "exit", "ok"],
				name: "LOCKED",
				sign_explanation: "The sign is locked and operating normally.",
				remote_explanation:
					"To unlock the sign:\npress SIGN..\nthen EXIT..\nthen OK..",
			},
			PASSKEY: {
				feedbackPattern: "1001",
				highlightpattern: [
					"exit",
					"0",
					"1",
					"2",
					"3",
					"4",
					"5",
					"6",
					"7",
					"8",
					"9",
				],
				sequencePattern: [],
				name: "PASSCODE ENTRY",
				sign_explanation:
					"You now have several seconds to enter the 5 digit passcode.\n\nThe red status pattern will jump down one place for every correct digit entered.\n\nIf you enter a digit incorrectly, the sign will be returned to a LOCKED state.",
				remote_explanation:
					"Enter the 5 digit passcode.\n(the factory default is 00000)\n\nOr press EXIT to cancel.",
			},
			UNLOCKED: {
				feedbackPattern: "0000",
				highlightpattern: ["exit", "menu", "test", "demo", "power"],
				sequencePattern: [],
				name: "UNLOCKED",
				sign_explanation: "The sign is unlocked and ready for programming.",
				remote_explanation: `To start configuring the sign: press ${menuKeyTxt}\n\n• To enter DEMO mode: press DEMO\n\nTo enter TEST mode: press TEST\n\nTo enter STANDBY mode where a 24h schedule can be set up: press the POWER button\n\nTo sign out: press EXIT`,
			},
			SCHEDULEA: {
				feedbackPattern: "0000",
				highlightpattern: [
					"stepup",
					"stepdown",
					"stepleft",
					"stepright",
					"exit",
				],
				sequencePattern: [],
				name: "SCHEDULE: DELAY HOURS #1",
				sign_explanation:
					"This is where you will select the amount of hours that the sign will delay from the current time until it first switches on.",
				remote_explanation:
					"To set the number of DELAY HOURS (from the current time) until the schedule first powers the sign: press the UP or DOWN arrows\n\nThen to set the number of OPERATIONAL HOURS: press the LEFT and RIGHT arrows\n\nTo exit: press EXIT",
				min: 0,
				max: 23,
				current: 0,
			},
			SCHEDULEB: {
				feedbackPattern: "0000",
				highlightpattern: ["exit", "ok", "stepleft", "stepright"],
				sequencePattern: [],
				name: "SCHEDULE: OPERATIONAL HOURS #1",
				sign_explanation:
					"Now you are selecting the number of hours that the sign will be on for after the first delay.",
				remote_explanation:
					"To set the number of OPERATIONAL HOURS for the sign: press the LEFT or RIGHT arrows\n\nThen if you'd like the sign to come on a second time in the 24 hour period: press OK\n\nOr to save the schedule and go back to STANDBY mode: press EXIT\n\nNOTE: If the sign loses power or is switched out of STANDBY mode, the 24 hour schedule will be erased!",
				min: 0,
				max: 23,
				current: 0,
			},
			SCHEDULEC: {
				feedbackPattern: "0000",
				highlightpattern: [
					"stepup",
					"stepdown",
					"stepleft",
					"stepright",
					"exit",
				],
				sequencePattern: [],
				name: "SCHEDULE: DELAY #2",
				sign_explanation:
					"Now you are selecting the number of hours that the sign will delay for after it's first ON period.",
				remote_explanation:
					"To set the number of DELAY HOURS for the second delay: press the UP or DOWN arrows\n\nThen to set the second number of OPERATIONAL HOURS: press the LEFT and RIGHT arrows\n\nTo save the schedule as-is and go back to STANDBY mode: press EXIT\n\nNOTE: If the sign loses power or is switched out of STANDBY mode, the 24 hour schedule will be erased!",
				min: 0,
				max: 23,
				current: 0,
			},
			SCHEDULED: {
				feedbackPattern: "0000",
				highlightpattern: ["exit", "stepleft", "stepright"],
				sequencePattern: [],
				name: "SCHEDULE: ON HOURS #2",
				sign_explanation:
					"Now you are selecting the number of hours that the sign will be on for after the second delay.",
				remote_explanation:
					"To set the number of OPERATIONAL HOURS for the second period of activity: press the LEFT or RIGHT arrows\n\nThen to save the schedule and go back to STANDBY mode: press EXIT\n\nNOTE: If the sign loses power or is switched out of STANDBY mode, the 24 hour schedule will be erased!",
				min: 0,
				max: 23,
				current: 0,
			},
			TEST: {
				feedbackPattern: "0000",
				highlightpattern: ["exit", "menu"],
				sequencePattern: [],
				name: "TEST MODE",
				sign_explanation:
					"The sign is in test mode, and will repeatedly run through all 10 digits (0-9) on the right side of the display, then all 10 digits on the left side.",
				remote_explanation: `To start configuring the sign: press ${menuKeyTxt}\n\nTo exit TEST mode: press EXIT`,
			},
			DEMO: {
				feedbackPattern: "0000",
				highlightpattern: ["exit", "menu"],
				sequencePattern: [],
				name: "DEMO MODE",
				sign_explanation:
					"The sign is in demo mode, and will now sequence through an example of your sign's configured behavior.",
				remote_explanation: `To start configuring the sign: press ${menuKeyTxt}\n\nTo exit DEMO mode: press EXIT`,
			},
			STANDBY: {
				feedbackPattern: "0000",
				highlightpattern: ["power", "stepup", "stepdown"],
				sequencePattern: [],
				name: "STANDBY MODE",
				sign_explanation:
					"The sign will not respond to traffic when in standby mode, but it WILL switch itself on and off if a 24 hour schedule is set.",
				remote_explanation:
					"To set the HOURS OF DELAY (from the current time) until the schedule first switches the sign on: press the UP or DOWN arrows\n\nTo exit STANDBY mode (deletes any set schedules): press the POWER button",
			},
			MINSPEED: {
				feedbackPattern: "1000",
				highlightpattern: ["exit", "menu", "ok", "stepup", "stepdown"],
				sequencePattern: [],
				name: "MINIMUM SPEED",
				sign_explanation:
					"The sign is showing the speed at which it will start displaying feedback to drivers.",
				remote_explanation: `To change the setting:\n\nUNLOCK it by pressing OK\n\nSET it with the UP and DOWN arrows\n(or press zero and type in the value)\n\nSAVE it by pressing OK\n\n\nTo go to the next setting: press ${menuKeyTxt}\n\nTo exit: press EXIT`,
				min: 1,
				max: 99,
				current: 15,
			},
			SPEEDLIMIT: {
				feedbackPattern: "0100",
				highlightpattern: ["exit", "menu", "ok", "stepup", "stepdown"],
				sequencePattern: [],
				name: "SPEED LIMIT",
				sign_explanation:
					"The sign is showing the speed limit of the road that it is being deployed on.",
				remote_explanation: `To change the setting:\n\nUNLOCK it by pressing OK\n\nSET it with the UP and DOWN arrows\n(or press zero and type in the value)\n\nSAVE it by pressing OK\n\n\nTo go to the next setting: press ${menuKeyTxt}\n\nTo exit: press EXIT`,
				min: 2,
				max: 99,
				current: 25,
			},
			MAXSPEED: {
				feedbackPattern: "1100",
				highlightpattern: ["exit", "menu", "ok", "stepup", "stepdown"],
				sequencePattern: [],
				name: "MAXIMUM SPEED",
				sign_explanation:
					"The sign is showing the speed at which it will stop displaying feedback to drivers.",
				remote_explanation: `To change the setting:\n\nUNLOCK it by pressing OK\n\nSET it with the UP and DOWN arrows\n(or press zero and type in the value)\n\nSAVE it by pressing OK\n\n\nTo go to the next setting: press ${menuKeyTxt}\n\nTo exit: press EXIT`,
				min: 3,
				max: 99,
				current: 50,
			},
			SQUELCH: {
				feedbackPattern: "0010",
				highlightpattern: ["exit", "menu", "ok", "stepup", "stepdown"],
				sequencePattern: [],
				name: "RADAR SQUELCH",
				sign_explanation:
					"The default squelch setting is 20.\nIncreasing this value will help filter out unwanted detections.\nDecreasing this value will make the radar more sensitive.",
				remote_explanation: `To change the setting:\n\nUNLOCK it by pressing OK\n\nSET it with the UP and DOWN arrows\n(or press zero and type in the value)\n\nSAVE it by pressing OK\n\n\nTo go to the next setting: press ${menuKeyTxt}\n\nTo exit: press EXIT`,
				min: 0,
				max: 99,
				current: 20,
			},
			UNITS: {
				feedbackPattern: "1010",
				highlightpattern: ["exit", "menu", "ok", "stepup", "stepdown"],
				sequencePattern: [],
				name: "UNITS OPTION",
				sign_explanation:
					"The sign is showing the units it is using to measure speed.\n0 = MPH, 1 = KPH.",
				remote_explanation: `To change the setting:\n\nUNLOCK it by pressing OK\n\nSET it with the UP and DOWN arrows\n(or press zero and type in the value)\n\nSAVE it by pressing OK\n\n\nTo go to the next setting: press ${menuKeyTxt}\n\nTo exit: press EXIT`,
				min: 0,
				max: 1,
				current: 0,
			},
			BRIGHTNESS: {
				feedbackPattern: "0110",
				highlightpattern: ["exit", "menu", "ok", "stepup", "stepdown"],
				sequencePattern: [],
				name: "BRIGHTNESS",
				sign_explanation:
					"The sign is showing a value that can be tweaked to darken or brighten the numbers displayed.",
				remote_explanation: `To change the setting:\n\nUNLOCK it by pressing OK\n\nSET it with the UP and DOWN arrows\n(or press zero and type in the value)\n\nSAVE it by pressing OK\n\n\nTo go to the next setting: press ${menuKeyTxt}\n\nTo exit: press EXIT`,
				min: 0,
				max: 31,
				current: 16,
			},
			STARTOPTION: {
				feedbackPattern: "1110",
				highlightpattern: ["exit", "menu", "ok", "stepup", "stepdown"],
				sequencePattern: [],
				name: "START UP OPTION",
				sign_explanation:
					"This value corresponds to the sign's start-up behavior.\n0 = Start up in STANDBY mode,\n1 = Start up in NORMAL mode.",
				remote_explanation: `To change the setting:\n\nUNLOCK it by pressing OK\n\nSET it with the UP and DOWN arrows\n(or press zero and type in the value)\n\nSAVE it by pressing OK\n\n\nTo go to the next setting: press ${menuKeyTxt}\n\nTo exit: press EXIT`,
				min: 0,
				max: 1,
				current: 1,
			},
			PASSKEY1: {
				feedbackPattern: "0001",
				highlightpattern: ["exit", "menu", "ok", "stepup", "stepdown"],
				sequencePattern: [],
				name: "PASSKEY DIGIT #1",
				sign_explanation:
					"The sign is showing the first digit of the passcode.",
				remote_explanation: `To change the setting:\n\nUNLOCK it by pressing OK\n\nSET it with the UP and DOWN arrows\n(or press zero and type in the value)\n\nSAVE it by pressing OK\n\n\nTo go to the next setting: press ${menuKeyTxt}\n\nTo exit: press EXIT`,
				min: 0,
				max: 9,
				current: 0,
			},
			PASSKEY2: {
				feedbackPattern: "1001",
				highlightpattern: ["exit", "menu", "ok", "stepup", "stepdown"],
				sequencePattern: [],
				name: "PASSKEY DIGIT #2",
				sign_explanation:
					"The sign is showing the second digit of the passcode.",
				remote_explanation: `To change the setting:\n\nUNLOCK it by pressing OK\n\nSET it with the UP and DOWN arrows\n(or press zero and type in the value)\n\nSAVE it by pressing OK\n\n\nTo go to the next setting: press ${menuKeyTxt}\n\nTo exit: press EXIT`,
				min: 0,
				max: 9,
				current: 0,
			},
			PASSKEY3: {
				feedbackPattern: "0101",
				highlightpattern: ["exit", "menu", "ok", "stepup", "stepdown"],
				sequencePattern: [],
				name: "PASSKEY DIGIT #3",
				sign_explanation:
					"The sign is showing the third digit of the passcode.",
				remote_explanation: `To change the setting:\n\nUNLOCK it by pressing OK\n\nSET it with the UP and DOWN arrows\n(or press zero and type in the value)\n\nSAVE it by pressing OK\n\n\nTo go to the next setting: press ${menuKeyTxt}\n\nTo exit: press EXIT`,
				min: 0,
				max: 9,
				current: 0,
			},
			PASSKEY4: {
				feedbackPattern: "1101",
				highlightpattern: ["exit", "menu", "ok", "stepup", "stepdown"],
				sequencePattern: [],
				name: "PASSKEY DIGIT #4",
				sign_explanation:
					"The sign is showing the fourth digit of the passcode.",
				remote_explanation: `To change the setting:\n\nUNLOCK it by pressing OK\n\nSET it with the UP and DOWN arrows\n(or press zero and type in the value)\n\nSAVE it by pressing OK\n\n\nTo go to the next setting: press ${menuKeyTxt}\n\nTo exit: press EXIT`,
				min: 0,
				max: 9,
				current: 0,
			},
			PASSKEY5: {
				feedbackPattern: "0011",
				highlightpattern: ["exit", "menu", "ok", "stepup", "stepdown"],
				sequencePattern: [],
				name: "PASSKEY DIGIT #5",
				sign_explanation:
					"The sign is showing the fifth digit of the passcode.",
				remote_explanation: `To change the setting:\n\nUNLOCK it by pressing OK\n\nSET it with the UP and DOWN arrows\n(or press zero and type in the value)\n\nSAVE it by pressing OK\n\n\nTo go to the next setting: press ${menuKeyTxt}\n\nTo exit: press EXIT`,
				min: 0,
				max: 9,
				current: 0,
			},
		};
	}

	clearCommandChain() {
		this.commandChain = "";
	}

	handleExit() {
		this.signUnlocked = false;
		this.sign.SetUnlocked(false);

		//get whether we are in on or standby
		let startup = this.state.STARTOPTION.current;
		if (startup > 0) {
			this.setState(this.state.LOCKED);
		} else {
			this.setState(this.state.STANDBY);
		}
	}

	//===========================
	handleInput() {
		switch (this.currentState) {
			case this.state.LOCKED:
				if (this.commandChain.includes("signexitok")) {
					this.setState(this.state.PASSKEY);
				}
				break;
			case this.state.PASSKEY:
				this.handleLogin();
				break;
			case this.state.UNLOCKED:
				if (this.commandChain.includes("exit")) {
					this.handleExit();
				} else if (this.commandChain.includes("menu")) {
					this.setState(this.state.MINSPEED);
				} else if (this.commandChain.includes("power")) {
					this.setStandBy(true);
					this.setState(this.state.STANDBY);
				} else if (this.commandChain.includes("test")) {
					this.sign.EnableTestMode();
					this.setState(this.state.TEST);
				} else if (this.commandChain.includes("demo")) {
					this.sign.demoModeValue = this.state.MINSPEED.current;
					this.sign.EnableDemoMode(
						this.state.MINSPEED.current,
						this.state.SPEEDLIMIT.current,
						this.state.MAXSPEED.current
					);
					this.setState(this.state.DEMO);
				}
				break;
			case this.state.SCHEDULEA:
				this.handleScheduleItem(true);
				if (
					this.commandChain.includes("stepleft") ||
					this.commandChain.includes("stepright")
				) {
					this.setState(this.state.SCHEDULEB);
				} else if (this.commandChain.includes("exit")) {
					this.setState(this.state.STANDBY);
				}
				break;
			case this.state.SCHEDULEB:
				this.handleScheduleItem(false);
				if (this.commandChain.includes("ok")) {
					this.setState(this.state.SCHEDULEC);
				} else if (this.commandChain.includes("exit")) {
					this.setState(this.state.STANDBY);
				}
				break;
			case this.state.SCHEDULEC:
				this.handleScheduleItem(true);
				if (
					this.commandChain.includes("stepleft") ||
					this.commandChain.includes("stepright")
				) {
					this.setState(this.state.SCHEDULED);
				} else if (this.commandChain.includes("exit")) {
					this.setState(this.state.STANDBY);
				}
				break;
			case this.state.SCHEDULED:
				this.handleScheduleItem(false);
				if (
					this.commandChain.includes("stepleft") ||
					this.commandChain.includes("stepright")
				) {
					this.setState(this.state.SCHEDULED);
				} else if (this.commandChain.includes("exit")) {
					this.setState(this.state.STANDBY);
				}
				break;
			case this.state.TEST:
				if (this.commandChain.includes("exit")) {
					this.sign.ClearTestMode();
					this.setState(this.state.UNLOCKED);
				} else if (this.commandChain.includes("menu")) {
					this.sign.ClearTestMode();
					this.setState(this.state.MINSPEED);
				}
				break;
			case this.state.DEMO:
				if (this.commandChain.includes("exit")) {
					this.sign.ClearDemoMode();
					this.setState(this.state.UNLOCKED);
				} else if (this.commandChain.includes("menu")) {
					this.sign.ClearDemoMode();
					this.setState(this.state.MINSPEED);
				}
				break;
			case this.state.STANDBY:
				if (this.commandChain.includes("stepup")) {
					this.setState(this.state.SCHEDULEA);
				} else if (this.commandChain.includes("stepdown")) {
					this.setState(this.state.SCHEDULEA);
				} else if (this.commandChain.includes("power")) {
					this.resetSchedule();
					this.setStandBy(false);
					this.setState(this.state.UNLOCKED);
				}
				break;
			case this.state.MINSPEED:
				this.handleMenuItem();
				if (this.commandChain.includes("exit")) {
					this.handleExit();
				}
				if (this.commandChain.includes("menu")) {
					this.setState(this.state.SPEEDLIMIT);
				}
				break;
			case this.state.SPEEDLIMIT:
				this.handleMenuItem();
				if (this.commandChain.includes("exit")) {
					this.handleExit();
				}
				if (this.commandChain.includes("menu")) {
					this.setState(this.state.MAXSPEED);
				}
				break;
			case this.state.MAXSPEED:
				this.handleMenuItem();
				if (this.commandChain.includes("exit")) {
					this.handleExit();
				}
				if (this.commandChain.includes("menu")) {
					this.setState(this.state.SQUELCH);
				}
				break;
			case this.state.SQUELCH:
				this.handleMenuItem();
				if (this.commandChain.includes("exit")) {
					this.handleExit();
				}
				if (this.commandChain.includes("menu")) {
					this.setState(this.state.UNITS);
				}
				break;
			case this.state.UNITS:
				this.handleMenuItem();
				if (this.commandChain.includes("exit")) {
					this.handleExit();
				}
				if (this.commandChain.includes("menu")) {
					this.setState(this.state.BRIGHTNESS);
				}
				break;
			case this.state.BRIGHTNESS:
				this.handleMenuItem();
				if (this.commandChain.includes("exit")) {
					this.handleExit();
				}
				if (this.commandChain.includes("menu")) {
					this.setState(this.state.STARTOPTION);
				}
				break;
			case this.state.STARTOPTION:
				this.handleMenuItem();
				if (this.commandChain.includes("exit")) {
					this.handleExit();
				}
				if (this.commandChain.includes("menu")) {
					this.setState(this.state.PASSKEY1);
				}
				break;
			case this.state.PASSKEY1:
				this.handleMenuItem();
				if (this.commandChain.includes("exit")) {
					this.handleExit();
				}
				if (this.commandChain.includes("menu")) {
					this.setState(this.state.PASSKEY2);
				}
				break;
			case this.state.PASSKEY2:
				this.handleMenuItem();
				if (this.commandChain.includes("exit")) {
					this.handleExit();
				}
				if (this.commandChain.includes("menu")) {
					this.setState(this.state.PASSKEY3);
				}
				break;
			case this.state.PASSKEY3:
				this.handleMenuItem();
				if (this.commandChain.includes("exit")) {
					this.handleExit();
				}
				if (this.commandChain.includes("menu")) {
					this.setState(this.state.PASSKEY4);
				}
				break;
			case this.state.PASSKEY4:
				this.handleMenuItem();
				if (this.commandChain.includes("exit")) {
					this.handleExit();
				}
				if (this.commandChain.includes("menu")) {
					this.setState(this.state.PASSKEY5);
				}
				break;
			case this.state.PASSKEY5:
				this.handleMenuItem();
				if (this.commandChain.includes("exit")) {
					this.handleExit();
				}
				if (this.commandChain.includes("menu")) {
					this.setState(this.state.UNLOCKED);
				}
				break;
		}
	}

	handleLogin() {
		if (this.signUnlocked === true) return;

		if (this.commandChain.includes("exit")) {
			this.handleExit();
			return;
		}

		let digit1 = this.state.PASSKEY1.current.toString();
		let digit2 = this.state.PASSKEY2.current.toString();
		let digit3 = this.state.PASSKEY3.current.toString();
		let digit4 = this.state.PASSKEY4.current.toString();
		let digit5 = this.state.PASSKEY5.current.toString();
		let storedPasskey = digit1 + digit2 + digit3 + digit4 + digit5;

		if (this.commandChain.length > storedPasskey.length) {
			this.handleExit();
			return;
		}

		let pattern = "1001";
		for (var i = 0; i < this.commandChain.length; i++) {
			if (storedPasskey.indexOf(this.commandChain[i]) == -1) {
				this.handleExit();
				return;
			}
			switch (i) {
				case 0:
					pattern = "1000";
					break;
				case 1:
					pattern = "0100";
					break;
				case 2:
					pattern = "0010";
					break;
				case 3:
					pattern = "0001";
					break;
			}
		}

		//light up just the next led down (and all of them on 5)
		this.sign.SetFeedbackLEDPattern(pattern);

		if (this.commandChain == storedPasskey) {
			this.signUnlocked = true;
			this.sign.SetUnlocked(true);
			this.setState(this.state.UNLOCKED);
		}
	}

	handleMenuItem() {
		//handle user pressing OK
		if (this.commandChain.includes("ok")) {
			this.clearCommandChain();
			//customer is already editing a menu item. Time to save it.
			if (this.editingMenuItem === true) {
				this.editingMenuItem = false;

				//if we are editing the start up option specifically, set standby state as well.
				if (this.currentState.name === this.state.STARTOPTION.name) {
					this.state.STARTOPTION.current = this.volatileMenuValue;
					this.setStandBy(this.volatileMenuValue);
				}

				//if we are editing minspeed
				if (this.currentState.name === this.state.MINSPEED.name) {
					//don't save volatile memory if value is higher than speed limit or max speed
					if (
						this.volatileMenuValue >= this.state.SPEEDLIMIT.current ||
						this.volatileMenuValue >= this.state.MAXSPEED.current
					) {
						this.sign.SetDigits(this.currentState.current);
						return;
					}
				}
				//if we are editing speed limit
				if (this.currentState.name === this.state.SPEEDLIMIT.name) {
					//don't save volatile memory if value is higher than max speed
					if (this.volatileMenuValue >= this.state.MAXSPEED.current) {
						this.sign.SetDigits(this.currentState.current);
						return;
					}
					//or push down min speed value if needed
					if (this.state.MINSPEED.current >= this.volatileMenuValue) {
						this.state.MINSPEED.current = Math.max(
							this.volatileMenuValue - 1,
							1
						);
					}
				}
				if (this.currentState.name === this.state.MAXSPEED.name) {
					//push down speed limit value if needed
					if (this.state.SPEEDLIMIT.current >= this.volatileMenuValue) {
						this.state.SPEEDLIMIT.current = Math.max(
							this.volatileMenuValue - 1,
							2
						);
					}
					//and push down min speed value if needed
					if (this.state.MINSPEED.current >= this.state.SPEEDLIMIT.current) {
						this.state.MINSPEED.current = Math.max(
							this.state.SPEEDLIMIT.current - 1,
							1
						);
					}
				}
				//finally store volatile value in sign state
				this.currentState.current = this.volatileMenuValue;
			} //customer is not already editing a menu item so unlock it and set volatile menu.
			else {
				this.editingMenuItem = true;
				this.volatileMenuValue = this.currentState.current;
			}
			return;
		}

		//if user has not pressed OK, handle when we are 'within' the editing procedure
		if (this.editingMenuItem === true) {
			//handle step up and step down operations
			if (this.commandChain.includes("stepup")) {
				this.clearCommandChain();
				this.volatileMenuValue = this.volatileMenuValue + 1;
				if (this.volatileMenuValue > this.currentState.max) {
					this.volatileMenuValue = this.currentState.max;
				}
				this.sign.SetDigits(this.volatileMenuValue);
			} else if (this.commandChain.includes("stepdown")) {
				this.clearCommandChain();
				this.volatileMenuValue = this.volatileMenuValue - 1;
				if (this.volatileMenuValue < this.currentState.min) {
					this.volatileMenuValue = this.currentState.min;
				}
				this.sign.SetDigits(this.volatileMenuValue);
			}
			//handle numeric input
			else if (this.commandChain.includes("0")) {
				//parse string for numbers
				let numstr = this.commandChain;
				if (/^\d+$/.test(numstr) === false) {
					this.clearCommandChain();
					// console.log("non-digit entered!");
					return;
				}

				if (numstr.length > 2) {
					//there are three digits including a leading zero
					var leftdigit = parseInt(numstr[1]);
					var rightdigit = parseInt(numstr[2]);
					this.setLeftDigit(leftdigit);
					this.setRightDigit(rightdigit);
					this.volatileMenuValue = leftdigit * 10 + rightdigit;
					this.clearCommandChain();
				} else if (numstr.length > 1) {
					//there are two digits including a leading zero
					var rightdigit = parseInt(numstr[1]);
					this.clearLeftDigit();
					this.setRightDigit(rightdigit);
					this.volatileMenuValue = rightdigit;
				} //there is only one digit
				else {
					var rightdigit = parseInt(numstr[0]);
					this.clearLeftDigit();
					this.setRightDigit(rightdigit);
					this.volatileMenuValue = rightdigit;
				}
				//boundary checks
				if (this.volatileMenuValue > this.currentState.max) {
					this.volatileMenuValue = this.currentState.max;
				}
				if (this.volatileMenuValue < this.currentState.min) {
					this.volatileMenuValue = this.currentState.min;
				}
			}
		}
	}

	handleScheduleItem(usesupdown) {
		var increment = "stepup";
		var decrement = "stepdown";

		if (usesupdown === false) {
			increment = "stepright";
			decrement = "stepleft";
		}

		//handle step up and step down operations
		if (this.commandChain.includes(increment)) {
			this.clearCommandChain();

			this.currentState.current = this.currentState.current + 1;
			if (this.currentState.current > this.currentState.max) {
				this.currentState.current = this.currentState.max;
			}
			this.sign.SetDigits(this.currentState.current);
		} else if (this.commandChain.includes(decrement)) {
			this.clearCommandChain();
			this.currentState.current = this.currentState.current - 1;
			if (this.currentState.current < this.currentState.min) {
				this.currentState.current = this.currentState.min;
			}
			this.sign.SetDigits(this.currentState.current);
		}
		//handle numeric input
		else if (this.commandChain.includes("0")) {
			//parse string for numbers
			let numstr = this.commandChain;

			if (/^\d+$/.test(numstr) === false) {
				clearCommandChain();
				// console.log("non-digit entered!");
				return;
			}

			if (numstr.length > 2) {
				//there are three digits including a leading zero
				var leftdigit = parseInt(numstr[1]);
				var rightdigit = parseInt(numstr[2]);
				this.setLeftDigit(leftdigit);
				this.setRightDigit(rightdigit);
				this.currentState.current = leftdigit * 10 + rightdigit;
				this.clearCommandChain();
			} else if (numstr.length > 1) {
				//there are two digits including a leading zero
				var rightdigit = parseInt(numstr[1]);
				this.clearLeftDigit();
				this.setRightDigit(rightdigit);
				this.currentState.current = rightdigit;
			} //there is only one digit
			else {
				var rightdigit = parseInt(numstr[0]);
				this.clearLeftDigit();
				this.setRightDigit(rightdigit);
				this.currentState.current = rightdigit;
			}
			//boundary checks
			if (this.currentState.current > this.currentState.max) {
				this.currentState.current = this.currentState.max;
			}
			if (this.currentState.current < this.currentState.min) {
				this.currentState.current = this.currentState.min;
			}
		}
	}

	//===========================

	resetSchedule() {
		this.schedulestring = "";
		this.state.SCHEDULEA.current = 0;
		this.state.SCHEDULEB.current = 0;
		this.state.SCHEDULEC.current = 0;
		this.state.SCHEDULED.current = 0;
	}

	setStandBy(value) {
		this.resetSchedule();

		this.sign.standby = value;
		this.sign.SetStandbyMode(value);

		if (value === false) {
			this.state.STARTOPTION.current = 1;
		} else {
			this.state.STARTOPTION.current = 0;
		}
	}

	setState(newState) {
		//clear the command chain
		this.clearCommandChain();

		//set the new sign state
		this.currentState = newState;

		//set title and explanation and next steps text
		this.title.textContent = this.currentState.name;

		//update the sign feedback pattern
		this.sign.SetFeedbackLEDPattern(this.currentState.feedbackPattern);

		//set remote button sequence or group lighting
		if (this.currentState.sequencePattern.length > 0) {
			this.remote.setHighlightSequencing(this.currentState.sequencePattern);
		} else if (this.currentState.highlightpattern.length > 0) {
			this.remote.setHighlightNonSequencing(this.currentState.highlightpattern);
		}

		//set digits
		if (this.currentState.hasOwnProperty("current")) {
			this.sign.SetDigits(this.currentState.current);
		} else {
			this.sign.ClearDigits();
		}
	}

	updateScheduleExplanation() {
		if (this.helpStage !== "sign") return;
		if (this.currentState.name.includes("STANDBY")) {
			if (this.schedulestring === "") {
				this.explanation.textContent =
					this.currentState.sign_explanation +
					"\n\nCurrently the sign is not running a schedule.";
				return;
			} else {
				this.explanation.textContent =
					this.currentState.sign_explanation + this.schedulestring;
				return;
			}
		}

		if (this.currentState.name.includes("SCHEDULE")) {
			//get current time
			var pm = false;
			var today = new Date();
			var h = today.getHours();
			h = h + this.state.SCHEDULEA.current;
			if (h >= 24) {
				h = h - 24;
			}
			if (h > 12) {
				h = h - 12;
				pm = true;
			}
			if (h < 10) {
				h = "0" + h;
			}
			var m = today.getMinutes();
			if (m < 10) {
				m = "0" + m;
			}

			//SCHEDULEA
			this.schedulestring =
				"\n\nCurrently the sign is scheduled to:\n• come on at " + h + ":" + m;
			pm === false
				? (this.schedulestring = this.schedulestring + " am")
				: (this.schedulestring = this.schedulestring + " pm");

			if (this.currentState.name.includes("DELAY #1")) {
				this.explanation.textContent =
					this.currentState.sign_explanation + this.schedulestring;
				return;
			}

			//SCHEDULEB
			this.schedulestring +=
				"\n• stay on for " + this.state.SCHEDULEB.current + " hours.";
			if (this.currentState.name.includes("HOURS #1")) {
				this.explanation.textContent =
					this.currentState.sign_explanation + this.schedulestring;
				return;
			}

			//SCHEDULEC
			this.schedulestring +=
				"\n• then switch off for " + this.state.SCHEDULEC.current + " hours.";
			if (this.currentState.name.includes("DELAY #2")) {
				this.explanation.textContent =
					this.currentState.sign_explanation + this.schedulestring;
				return;
			}

			this.schedulestring +=
				"\n• and finally come back on for " +
				this.state.SCHEDULED.current +
				" hours.";
			this.explanation.textContent =
				this.currentState.sign_explanation + this.schedulestring;
		}
	}
}
