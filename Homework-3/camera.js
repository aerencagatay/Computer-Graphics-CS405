/**
 * @class Camera
 * @desc Helper class for Camera.
 * 
 */
class Camera {
    constructor(cameraPos, target, up) {
        this.cameraPos = cameraPos;
        this.target = target;
        this.up = up;
    }

    getLookAt() {
        var zAxis = normalize(subtract(this.cameraPos, this.target));
        var xAxis = normalize(cross(this.up, zAxis));
        var yAxis = cross(zAxis, xAxis);

        var lookAt = [xAxis[0], xAxis[1], xAxis[2], 0,
                      yAxis[0], yAxis[1], yAxis[2], 0,
                      zAxis[0], zAxis[1], zAxis[2], 0,
                      0, 0, 0, 1];
        return lookAt;
    }
}