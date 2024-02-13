import * as THREE from "three";

export class Transition3D {
  constructor(object, duration = 500) {
    this.object = object;
    this.duration = duration;
    this.startPosition = new THREE.Vector3();
    this.endPosition = new THREE.Vector3();
    this.startRotation = new THREE.Euler();
    this.endRotation = new THREE.Euler();
    this.active = false;
    this.startTime = null;
  }

  StartTransition(startPos, endPos, startRot, endRot) {
    this.startPosition.copy(startPos);
    this.endPosition.copy(endPos);
    this.startRotation.copy(startRot);
    this.endRotation.copy(endRot);

    this.active = true;
    this.startTime = null;
  }

  Update() {
    if (!this.active) return;

    if (!this.startTime) this.startTime = Date.now();

    let elapsedTime = Date.now() - this.startTime;
    let alpha = elapsedTime / this.duration;
    let easedAlpha = this.cubicEaseInOut(alpha);

    if (alpha >= 1) {
      alpha = 1;
      easedAlpha = 1;
      this.active = false;
      //TODO: here we can use a callback or additional code for triggering after transition using the new 'currentView'
    }

    this.object.position.lerpVectors(
      this.startPosition,
      this.endPosition,
      easedAlpha
    );

    this.object.rotation.set(
      this.interpolate(this.startRotation.x, this.endRotation.x, easedAlpha),
      this.interpolate(this.startRotation.y, this.endRotation.y, easedAlpha),
      this.interpolate(this.startRotation.z, this.endRotation.z, easedAlpha)
    );
  }

  cubicEaseInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  interpolate(start, end, alpha) {
    return start + (end - start) * alpha;
  }
}
