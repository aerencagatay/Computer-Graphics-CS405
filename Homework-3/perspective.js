/**
 * @class Perspective
 * @desc Helper class to calculate the Perspective Matrix
 */

class Perspective {
    constructor(fieldOfViewInRadians, aspect, near, far) {
        this.fieldOfViewInRadians = fieldOfViewInRadians;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
    }

    getPerspectiveMatrix() {
        var f = Math.tan(Math.PI * 0.5 - 0.5 * this.fieldOfViewInRadians);
        var rangeInv = 1.0 / (this.near - this.far);

        return [f / this.aspect, 0, 0, 0,
                0, f, 0, 0,
                0, 0, (this.near + this.far) * rangeInv, -1,
                0, 0, this.near * this.far * rangeInv * 2, 0];
    }
}