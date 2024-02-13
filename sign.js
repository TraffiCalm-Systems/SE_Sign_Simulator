import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class Sign {
  constructor() {
    this.model = null;
    this.digitLeft = null;
    this.digitRight = null;
    this.digitLeftValue = 0;
    this.digitRightValue = 0;
    this.originalUVsLeftDigit = [];
    this.originalUVsRightDigit = [];
    this.incrementU = 0.0909;
    this.feedback1 = null;
    this.feedback2 = null;
    this.feedback3 = null;
    this.feedback4 = null;
    this.feedback5 = null;
    this.feedbackUVsOff = [];
    this.feedbackUVsOn = [];
    this.testModeValue = 0;
    this.demoModeValue = 0;
    this.testModecoroutine = null;
    this.demoModecoroutine = null;
    this.demoModeFlashCount = 0;
    this.led5coroutine = null;
    this.passkeycoroutine = null;
    this.led5Delay = 1000;

    //bind some functions so they don't lose their binding when used as a callback
    this.EnableTestMode = this.EnableTestMode.bind(this);
    this.EnableDemoMode = this.EnableDemoMode.bind(this);
  }

  Initialize(initialState) {
    //set initial position
    this.model.position.set(0, 0.133, -2.401);

    //set the new sign state
    this.SetFeedbackLEDPattern(initialState.feedbackPattern);
    this.SetStandbyMode(false);
    this.ClearDigits();
  }

  Import() {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        "sign.glb",
        (signModel) => {
          this.model = signModel.scene;
          this.model.traverse(
            (child) => {
              if (child.name === "Digit-Left") {
                this.digitLeft = child.geometry.attributes.uv;
                for (let i = 0; i < this.digitLeft.count; i++) {
                  this.originalUVsLeftDigit.push(
                    this.digitLeft.getX(i),
                    this.digitLeft.getY(i)
                  );
                }
              }

              if (child.name === "Digit-Right") {
                this.digitRight = child.geometry.attributes.uv;
                for (let i = 0; i < this.digitRight.count; i++) {
                  this.originalUVsRightDigit.push(
                    this.digitRight.getX(i),
                    this.digitRight.getY(i)
                  );
                }
              }

              if (child.name === "Feedback1") {
                this.feedback1 = child;
                //also gather the feedback UVs here
                this.feedbackUVsOff = child.geometry.attributes.uv.clone();
                this.feedbackUVsOn = this.feedbackUVsOff.clone();

                for (let i = 0; i < this.feedbackUVsOn.count; i++) {
                  this.feedbackUVsOn.setX(i, this.feedbackUVsOn.getX(i) + 0.5);
                }
              }
              if (child.name === "Feedback2") {
                this.feedback2 = child;
              }
              if (child.name === "Feedback3") {
                this.feedback3 = child;
              }
              if (child.name === "Feedback4") {
                this.feedback4 = child;
              }
              if (child.name === "Feedback5") {
                this.feedback5 = child;
              }
            },
            (error) => {
              // onError callback
              console.error(
                "An error happened while traversing sign child meshes: ",
                error
              );
            }
          );
          resolve(this);
        },
        undefined,
        (error) => {
          reject(error);
        }
      );
    });
  }

  ClearDigits() {
    this.clearLeftDigit();
    this.clearRightDigit();
  }

  ClearFeedbackLEDs() {
    this.setFeedbackLED(1, false);
    this.setFeedbackLED(2, false);
    this.setFeedbackLED(3, false);
    this.setFeedbackLED(4, false);
  }

  ClearTestMode() {
    clearTimeout(this.testModecoroutine);
  }

  ClearDemoMode() {
    clearTimeout(this.demoModecoroutine);
  }

  EnableDemoMode(minSpeed, speedLimit, maxSpeed) {
    clearTimeout(this.demoModecoroutine);

    if (this.demoModeValue < speedLimit) {
      this.SetDigits(this.demoModeValue);
      this.demoModeValue = this.demoModeValue + 2;
      this.demoModecoroutine = setTimeout(() => {
        this.EnableDemoMode(minSpeed, speedLimit, maxSpeed);
      }, 1000);
    } else if (this.demoModeValue < maxSpeed - 3) {
      this.SetDigits(this.demoModeValue);
      if (this.demoModeFlashCount < 6) {
        this.demoModeFlashCount = this.demoModeFlashCount + 1;
      } else {
        this.demoModeValue = this.demoModeValue + 2;
        this.demoModeFlashCount = 0;
      }

      if (this.demoModeFlashCount % 2 === 0) {
        this.SetDigits(this.demoModeValue);
      } else {
        this.ClearDigits();
      }

      this.demoModecoroutine = setTimeout(() => {
        this.EnableDemoMode(minSpeed, speedLimit, maxSpeed);
      }, 175);
    } else {
      if (this.demoModeFlashCount < 6) {
        this.demoModeValue = maxSpeed;

        if (this.demoModeFlashCount % 2 === 0) {
          this.SetDigits(this.demoModeValue);
        } else {
          this.ClearDigits();
        }

        this.demoModeFlashCount = this.demoModeFlashCount + 1;
        this.demoModecoroutine = setTimeout(() => {
          this.EnableDemoMode(minSpeed, speedLimit, maxSpeed);
        }, 175);
      } else {
        this.demoModeFlashCount = 0;
        this.demoModeValue = minSpeed;
        this.demoModecoroutine = setTimeout(() => {
          this.EnableDemoMode(minSpeed, speedLimit, maxSpeed);
        }, 1000);
      }
    }
  }

  EnableTestMode() {
    this.SetDigits(this.testModeValue);
    if (this.testModeValue < 10) {
      this.testModeValue = this.testModeValue + 1;
    } else if (this.testModeValue < 91) {
      this.testModeValue = this.testModeValue + 10;
    } else {
      this.testModeValue = 0;
    }

    this.testModecoroutine = setTimeout(() => {
      this.EnableTestMode();
    }, 1000);
  }

  SetDigits(val) {
    this.ClearDigits();

    if (val < 0) return;
    if (val == 0) {
      this.setRightDigit(0);
      return;
    }

    var digarray = [];
    while (val > 0) {
      digarray.push(val % 10);
      val = parseInt(val / 10);
    }
    if (digarray.length > 0) {
      this.setRightDigit(digarray[0]);
    }
    if (digarray.length > 1) {
      this.setLeftDigit(digarray[1]);
    }
  }

  SetFeedbackLEDPattern(str) {
    this.ClearFeedbackLEDs();
    this.setFeedbackLED(1, str.charAt(0) == 1);
    this.setFeedbackLED(2, str.charAt(1) == 1);
    this.setFeedbackLED(3, str.charAt(2) == 1);
    this.setFeedbackLED(4, str.charAt(3) == 1);
  }

  SetUnlocked(unlocked) {
    if (unlocked === true) {
      //set the LEDs to full and to clear after a short delay.
      this.SetFeedbackLEDPattern("1111");
      this.passkeycoroutine = setTimeout(() => {
        this.SetFeedbackLEDPattern("0000");
      }, 11000);
    }
  }

  SetStandbyMode(value) {
    if (value === false) {
      this.led5Delay = 1000;
    } else {
      this.led5Delay = 15000;
    }

    clearTimeout(this.led5coroutine);
    this.led5coroutine = this.statusLEDBlinkActive();
  }

  //helper methods

  clearLeftDigit() {
    for (let i = 0; i < this.digitLeft.count; i++) {
      this.digitLeft.setXY(
        i,
        this.originalUVsLeftDigit[2 * i] + this.incrementU * 10,
        this.originalUVsLeftDigit[2 * i + 1]
      );
    }
    this.digitLeft.needsUpdate = true;
  }

  clearRightDigit() {
    for (let i = 0; i < this.digitRight.count; i++) {
      this.digitRight.setXY(
        i,
        this.originalUVsRightDigit[2 * i] + this.incrementU * 10,
        this.originalUVsRightDigit[2 * i + 1]
      );
    }
    this.digitRight.needsUpdate = true;
  }

  setFeedbackLED(num, on) {
    switch (num) {
      case 1:
        this.feedback1.geometry.attributes.uv =
          on === true ? this.feedbackUVsOn : this.feedbackUVsOff;
        this.feedback1.geometry.attributes.uv.needsUpdate = true;
        break;
      case 2:
        this.feedback2.geometry.attributes.uv =
          on === true ? this.feedbackUVsOn : this.feedbackUVsOff;
        this.feedback2.geometry.attributes.uv.needsUpdate = true;
        break;
      case 3:
        this.feedback3.geometry.attributes.uv =
          on === true ? this.feedbackUVsOn : this.feedbackUVsOff;
        this.feedback3.geometry.attributes.uv.needsUpdate = true;
        break;
      case 4:
        this.feedback4.geometry.attributes.uv =
          on === true ? this.feedbackUVsOn : this.feedbackUVsOff;
        this.feedback4.geometry.attributes.uv.needsUpdate = true;
        break;
      case 5:
        this.feedback5.geometry.attributes.uv =
          on === true ? this.feedbackUVsOn : this.feedbackUVsOff;
        this.feedback5.geometry.attributes.uv.needsUpdate = true;
        break;
      default:
        return;
    }
  }

  statusLEDBlinkActive() {
    this.setFeedbackLED(5, true);
    this.led5coroutine = setTimeout(() => {
      this.statusLEDBlinkPassive();
    }, 500);
  }

  statusLEDBlinkPassive() {
    this.setFeedbackLED(5, false);
    this.led5coroutine = setTimeout(() => {
      this.statusLEDBlinkActive();
    }, this.led5Delay);
  }

  setLeftDigit(num) {
    num = num % 11;
    for (let i = 0; i < this.digitLeft.count; i++) {
      this.digitLeft.setXY(
        i,
        this.originalUVsLeftDigit[2 * i] + this.incrementU * num,
        this.originalUVsLeftDigit[2 * i + 1]
      );
    }
    this.digitLeft.needsUpdate = true;
  }

  setRightDigit(num) {
    num = num % 11;
    for (let i = 0; i < this.digitRight.count; i++) {
      this.digitRight.setXY(
        i,
        this.originalUVsRightDigit[2 * i] + this.incrementU * num,
        this.originalUVsRightDigit[2 * i + 1]
      );
    }
    this.digitRight.needsUpdate = true;
  }
}
