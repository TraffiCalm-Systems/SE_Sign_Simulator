import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class Remote {
  constructor(useNewRemote) {
    this.buttons = {};
    this.buttonKeys = [];
    this.led = null;
    this.ledON = false;
    this.loaded = false;
    this.model = null;
    this.modelName = useNewRemote ? "remote_new.glb" : "remote_old.glb";
    this.useNewRemote = useNewRemote;
    this.raycaster = new THREE.Raycaster();
    this.showDebug = false;
    this.buttonHighlight = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      emissiveIntensity: 1.0,
    });
    this.buttonNormal = null;
    this.highlightSequence = [];
    this.sequenceStage = 0;
    this.highlightGroup = new Set();
  }

  Initialize(initialState) {
    this.model.position.set(0, 0, 0);
    this.model.rotation.set(0, 0, -30);
    this.updateButtonHighlights();
    this.setHighlightSequencing(initialState.sequencePattern);
  }

  Import() {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        this.modelName,
        (remoteModel) => {
          this.model = remoteModel.scene;
          this.setupCollision();
          resolve(this);
        },
        undefined,
        (error) => {
          reject(error);
        }
      );
    });
  }

  CheckUserInput(screenLocation, camera) {
    //collect the transformed collision cubes from each button mesh
    let collisionCubes = [];

    this.buttonKeys.forEach((key) => {
      this.buttons[key].children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          collisionCubes.push({ cube: child, key: key });
        }
      });
    });

    this.raycaster.setFromCamera(screenLocation, camera);
    const intersections = this.raycaster.intersectObjects(
      collisionCubes.map((cc) => cc.cube),
      true
    );

    if (intersections.length > 0) {
      let intersectedCube = intersections[0].object;

      //find the key associated with the intersected cube
      let associatedKey = collisionCubes.find(
        (cc) => cc.cube === intersectedCube
      ).key;

      let button = intersectedCube.parent.parent; //the button mesh itself
      if (this.pressButton(button) === true) {
        //return the key of the pressed button
        return associatedKey;
      }
    }

    //no button was pressed
    return "";
  }

  mapRemoteButtons(button) {
    if (this.useNewRemote === true) {
      switch (button.name) {
        case "Button_01":
          this.buttons["sign"] = button;
          break;
        case "Button_02":
          this.buttons["aux1"] = button;
          break;
        case "Button_03":
          this.buttons["power"] = button;
          break;
        case "Button_04":
          this.buttons["aux2"] = button;
          break;
        case "Button_05":
          this.buttons["f1"] = button;
          break;
        case "Button_06":
          this.buttons["f2"] = button;
          break;
        case "Button_07":
          this.buttons["f3"] = button;
          break;
        case "Button_08":
          this.buttons["f4"] = button;
          break;
        case "Button_09":
          this.buttons["f5"] = button;
          break;
        case "Button_10":
          this.buttons["f6"] = button;
          break;
        case "Button_11":
          this.buttons["test"] = button;
          break;
        case "Button_12":
          this.buttons["stepup"] = button;
          break;
        case "Button_13":
          this.buttons["setup"] = button;
          break;
        case "Button_14":
          this.buttons["stepleft"] = button;
          break;
        case "Button_15":
          this.buttons["ok"] = button;
          break;
        case "Button_16":
          this.buttons["stepright"] = button;
          break;
        case "Button_17":
          this.buttons["menu"] = button;
          break;
        case "Button_18":
          this.buttons["stepdown"] = button;
          break;
        case "Button_19":
          this.buttons["exit"] = button;
          break;
        case "Button_20":
          this.buttons["1"] = button;
          break;
        case "Button_21":
          this.buttons["2"] = button;
          break;
        case "Button_22":
          this.buttons["3"] = button;
          break;
        case "Button_23":
          this.buttons["4"] = button;
          break;
        case "Button_24":
          this.buttons["5"] = button;
          break;
        case "Button_25":
          this.buttons["6"] = button;
          break;
        case "Button_26":
          this.buttons["7"] = button;
          break;
        case "Button_27":
          this.buttons["8"] = button;
          break;
        case "Button_28":
          this.buttons["9"] = button;
          break;
        case "Button_29":
          this.buttons["demo"] = button;
          break;
        case "Button_30":
          this.buttons["0"] = button;
          break;
        case "Button_31":
          this.buttons["enter"] = button;
          break;
        default:
          break;
      }
    } else {
      switch (button.name) {
        case "Button_01":
          this.buttons["sign"] = button;
          break;
        case "Button_02":
          this.buttons["aux1"] = button;
          break;
        case "Button_03":
          this.buttons["power"] = button;
          break;
        case "Button_04":
          this.buttons["aux2"] = button;
          break;
        case "Button_05":
          this.buttons["f1"] = button;
          break;
        case "Button_06":
          this.buttons["f2"] = button;
          break;
        case "Button_07":
          this.buttons["f3"] = button;
          break;
        case "Button_08":
          this.buttons["f4"] = button;
          break;
        case "Button_09":
          this.buttons["f5"] = button;
          break;
        case "Button_10":
          this.buttons["f6"] = button;
          break;
        case "Button_11":
          this.buttons["test"] = button;
          break;
        case "Button_12":
          this.buttons["stepup"] = button;
          break;
        case "Button_13":
          this.buttons["setup"] = button;
          break;
        case "Button_14":
          this.buttons["stepleft"] = button;
          break;
        case "Button_15":
          this.buttons["ok"] = button;
          break;
        case "Button_16":
          this.buttons["stepright"] = button;
          break;
        case "Button_17":
          this.buttons["menu"] = button;
          break;
        case "Button_18":
          this.buttons["stepdown"] = button;
          break;
        case "Button_19":
          this.buttons["exit"] = button;
          break;
        case "Button_20":
          this.buttons["1"] = button;
          break;
        case "Button_21":
          this.buttons["2"] = button;
          break;
        case "Button_22":
          this.buttons["3"] = button;
          break;
        case "Button_23":
          this.buttons["4"] = button;
          break;
        case "Button_24":
          this.buttons["5"] = button;
          break;
        case "Button_25":
          this.buttons["6"] = button;
          break;
        case "Button_26":
          this.buttons["7"] = button;
          break;
        case "Button_27":
          this.buttons["8"] = button;
          break;
        case "Button_28":
          this.buttons["9"] = button;
          break;
        case "Button_29":
          this.buttons["demo"] = button;
          break;
        case "Button_30":
          this.buttons["0"] = button;
          break;
        case "Button_31":
          this.buttons["enter"] = button;
          break;
        default:
          break;
      }
    }
  }

  pressButton(button) {
    if (button.userData.pushed) return false;

    //move button down and light the remote LED
    button.userData.pushed = true;
    button.position.y -= 0.0025;
    this.setLED(true);

    //after a short delay return button to it's normal position and darken the LED
    setTimeout(() => {
      this.setLED(false);
      button.position.y += 0.0025;
      button.userData.pushed = false;
    }, 250);
    return true;
  }

  setupCollision() {
    //apply the remote control world transform
    this.model.updateMatrixWorld(true);

    this.model.traverse((child) => {
      //also apply the world transform of the child mesh
      child.updateMatrixWorld(true);

      //check if the object name contains 'Button' and at most 1 underscore
      if (!(child instanceof THREE.Object3D)) {
        //do nothing - we are only interested in the meshes
      } else if (
        child.name.includes("Button") &&
        /^([^_]*_){1}[^_]*$/.test(child.name)
      ) {
        //traverse button elements (labels and main button) and combine bounding boxes of all child objects

        let combinedBBox = new THREE.Box3();

        child.traverse((subChild) => {
          if (
            subChild instanceof THREE.Mesh &&
            subChild.material.name === "ButtonMaterial"
          ) {
            //get worldspace bounding box of the button mesh
            let bbox = subChild.geometry.boundingBox;
            combinedBBox.union(bbox);

            //also if the button material has not been collected, do it now
            if (this.buttonNormal === null) {
              this.buttonNormal = subChild.material;
            }
          }
        });

        const size = combinedBBox.getSize(new THREE.Vector3());
        const collisionCube = new THREE.Mesh(
          new THREE.BoxGeometry(size.x * 1.0, size.y * 1, size.z * 1.0),
          new THREE.MeshBasicMaterial({
            visible: this.showDebug,
            wireframe: true,
          })
        );

        child.add(collisionCube);
        child.userData.pushed = false;

        this.mapRemoteButtons(child);
      } else if (child.name.includes("LED")) {
        //store the LED mesh for easy retrieval
        this.led = child;
      }
    });

    this.buttonKeys = Object.keys(this.buttons);
  }

  setHighlightNonSequencing(group) {
    this.highlightGroup.clear();
    group.forEach((button) => {
      this.highlightGroup.add(button);
    });
    this.buttonKeys.forEach((key) => {
      if (this.highlightGroup.has(key)) {
        this.buttons[key].material = this.buttonHighlight;
      } else {
        this.buttons[key].material = this.buttonNormal;
      }
    });
    this.highlightSequence = [];
  }

  setHighlightSequencing(pattern) {
    this.highlightSequence = pattern;
    this.highlightGroup.clear();
  }

  setLED(on) {
    if (!this.led || !this.led.geometry || !this.led.geometry.attributes.uv) {
      console.error("LED object not found");
      return;
    }

    if (on === this.ledON) {
      return;
    }

    this.ledON = on;

    let uvs = this.led.geometry.attributes.uv;
    let uvArray = uvs.array;

    for (let i = 0; i < uvArray.length; i += 2) {
      uvArray[i] += on === true ? -0.5 : 0.5;
      if (uvArray[i] > 1) uvArray[i] -= 1;
      if (uvArray[i] < 0) uvArray[i] += 1;
    }
    uvs.needsUpdate = true;
  }

  updateButtonHighlights() {
    let timeout = 500;

    if (this.highlightSequence.length > 0 && this.highlightGroup.size === 0) {
      this.sequenceStage =
        (this.sequenceStage + 1) % this.highlightSequence.length;

      if (this.highlightSequence[this.sequenceStage] === "blank") {
        timeout = 1000;
      }

      //go through all buttons, updating materials appropriately
      this.buttonKeys.forEach((key) => {
        if (key === this.highlightSequence[this.sequenceStage]) {
          this.buttons[key].material = this.buttonHighlight;
        } else {
          this.buttons[key].material = this.buttonNormal;
        }
      });
    }

    setTimeout(() => this.updateButtonHighlights(), timeout);
  }
}
