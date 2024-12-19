
/**
 * @class TRS
 * @classdesc Helper class for affine transformations
 * @property {Array} translation - The translation vector
 * @property {Array} rotation - The rotation vector
 * @property {Array} scale - The scale vector
 * @method getTransformationMatrix - Returns the combined transformation matrix
 * 
 */
class TRS {
    constructor() {
        this.translation = [0,0,0];
        this.rotation = [0,0,0];
        this.scale = [1,1,1];
    }
    
    setTranslation(transX, transY, transZ) {
        this.translation = [transX, transY, transZ];
    }

    setRotation(rotX, rotY, rotZ) {
        this.rotation = [rotX, rotY, rotZ];
    }

    setScale(scaleX, scaleY, scaleZ) {
        this.scale = [scaleX, scaleY, scaleZ];
    }

    getTranslationMatrix() {
        return [1,0,0,0,
                0,1,0,0,
                0,0,1,0,
                this.translation[0],this.translation[1],this.translation[2],1];
    }

    getRotationMatrix() {
        var rotX = this.rotation[0];
        var rotY = this.rotation[1];
        var rotZ = this.rotation[2];
        var rotXMatrix = [1,0,0,0,
                          0,Math.cos(rotX),Math.sin(rotX),0,
                          0,-Math.sin(rotX),Math.cos(rotX),0,
                          0,0,0,1];
        var rotYMatrix = [Math.cos(rotY),0,-Math.sin(rotY),0,
                          0,1,0,0,
                          Math.sin(rotY),0,Math.cos(rotY),0,
                          0,0,0,1];
        var rotZMatrix = [Math.cos(rotZ),Math.sin(rotZ),0,0,
                          -Math.sin(rotZ),Math.cos(rotZ),0,0,
                          0,0,1,0,
                          0,0,0,1];
        var rotationMatrix = MatrixMult(rotXMatrix, rotYMatrix);
        rotationMatrix = MatrixMult(rotationMatrix, rotZMatrix);
        return rotationMatrix;
    }

    getScaleMatrix() {
        return [this.scale[0],0,0,0,
                0,this.scale[1],0,0,
                0,0,this.scale[2],0,
                0,0,0,1];
    }

    getTransformationMatrix() {
        var translationMatrix = this.getTranslationMatrix();
        var rotationMatrix = this.getRotationMatrix();
        var scaleMatrix = this.getScaleMatrix();
        var transformationMatrix = MatrixMult(translationMatrix, rotationMatrix);
        transformationMatrix = MatrixMult(transformationMatrix, scaleMatrix);
        return transformationMatrix;
    }
}