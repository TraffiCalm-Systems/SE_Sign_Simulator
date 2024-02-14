import * as THREE from "three";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { Remote } from "./remote.js";

export class ChoiceScreen {
	constructor() {
		this.renderPass = null;
		this.scene = null;
		this.directionalLight = null;
		this.camera = null;
		this.remoteOld = null;
		this.remoteOldBB = null;
		this.remoteNew = null;
		this.remoteNewBB = null;
		this.windowWidth = 0;
		this.windowHeight = 0;
		this.raycaster = new THREE.Raycaster();
	}

	async Init(window) {
		this.windowWidth = window.innerWidth;
		this.windowHeight = window.innerHeight;

		//load scene with image-based lighting
		this.scene = new THREE.Scene();
		new RGBELoader().load("moonless_golf_1k.hdr", (texture) => {
			texture.mapping = THREE.EquirectangularReflectionMapping;
			this.scene.environment = texture;
		});

		//setup scene lighting
		this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
		this.directionalLight.position.set(0, 1, 0.85);
		this.directionalLight.castShadow = false;
		this.scene.add(this.directionalLight);

		this.camera = new THREE.PerspectiveCamera(
			45,
			this.windowWidth / this.windowHeight,
			0.1,
			5
		);

		this.remoteOld = new Remote(false);
		this.remoteNew = new Remote(true);

		//import meshes
		const importResults = await Promise.all([
			this.remoteOld
				.Import()
				.catch((error) => ({ error, instance: remoteOld, type: "Remote" })),
			this.remoteNew
				.Import()
				.catch((error) => ({ error, instance: remoteNew, type: "Remote" })),
		]);

		importResults.forEach((result) => {
			if (result.error) {
				console.error(`Error loading model: `, result.error);
				//TODO: handle the error for each instance based on `result.instance` or `result.type`
				return false;
			}
		});

		this.remoteOld.model.position.set(-0.025, 0.0, 0.0);
		this.remoteOld.model.rotation.set(1.5708, 0, 0);
		this.remoteOldBB = new THREE.Box3().setFromObject(this.remoteOld.model);

		this.remoteNew.model.position.set(0.025, 0.0, 0.0);
		this.remoteNew.model.rotation.set(1.5708, 0, 0);
		this.remoteNewBB = new THREE.Box3().setFromObject(this.remoteNew.model);

		this.OnResize(this.windowWidth, this.windowHeight);

		this.scene.add(this.remoteOld.model);
		this.scene.add(this.remoteNew.model);

		this.renderPass = new RenderPass(this.scene, this.camera);

		//hide loading-screen
		document.getElementById("loading-screen").style.display = "none";
	}

	OnResize(width, height) {
		this.windowWidth = width;
		this.windowHeight = height;
		this.camera.aspect = width / height;

		//calculate the camera distance needed to keep the remote controls in view
		const remoteSize = new THREE.Vector3();

		this.remoteOldBB.getSize(remoteSize);

		const fieldOfView = 45.0 * (Math.PI / 180); // Convert fov to radians
		const cameraDistance = Math.max(
			(remoteSize.x * 2.5) /
				(2 * Math.tan(fieldOfView * 0.5 * this.camera.aspect)),
			(remoteSize.y * 1.5) / (2 * Math.tan(fieldOfView * 0.5))
		);

		this.camera.position.set(0, 0.0, cameraDistance);

		this.camera.updateProjectionMatrix();
	}

	OnInput(location) {
		this.raycaster.setFromCamera(location, this.camera);

		var target = new THREE.Vector3();
		var choseOldRemote = this.raycaster.ray.intersectBox(
			this.remoteOldBB,
			target
		);

		var choseNewRemote = this.raycaster.ray.intersectBox(
			this.remoteNewBB,
			target
		);

		if (choseOldRemote !== null) {
			return "old";
		}

		if (choseNewRemote !== null) {
			return "new";
		}

		return "";
	}
}
