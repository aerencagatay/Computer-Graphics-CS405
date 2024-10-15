function multiplyMatrices(matrixA, matrixB) {
    var result = [];

    for (var i = 0; i < 4; i++) {
        result[i] = [];
        for (var j = 0; j < 4; j++) {
            var sum = 0;
            for (var k = 0; k < 4; k++) {
                sum += matrixA[i * 4 + k] * matrixB[k * 4 + j];
            }
            result[i][j] = sum;
        }
    }

    // Flatten the result array
    return result.reduce((a, b) => a.concat(b), []);
}
function createIdentityMatrix() {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}
function createScaleMatrix(scale_x, scale_y, scale_z) {
    return new Float32Array([
        scale_x, 0, 0, 0,
        0, scale_y, 0, 0,
        0, 0, scale_z, 0,
        0, 0, 0, 1
    ]);
}

function createTranslationMatrix(x_amount, y_amount, z_amount) {
    return new Float32Array([
        1, 0, 0, x_amount,
        0, 1, 0, y_amount,
        0, 0, 1, z_amount,
        0, 0, 0, 1
    ]);
}

function createRotationMatrix_Z(radian) {
    return new Float32Array([
        Math.cos(radian), -Math.sin(radian), 0, 0,
        Math.sin(radian), Math.cos(radian), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ])
}

function createRotationMatrix_X(radian) {
    return new Float32Array([
        1, 0, 0, 0,
        0, Math.cos(radian), -Math.sin(radian), 0,
        0, Math.sin(radian), Math.cos(radian), 0,
        0, 0, 0, 1
    ])
}

function createRotationMatrix_Y(radian) {
    return new Float32Array([
        Math.cos(radian), 0, Math.sin(radian), 0,
        0, 1, 0, 0,
        -Math.sin(radian), 0, Math.cos(radian), 0,
        0, 0, 0, 1
    ])
}

function getTransposeMatrix(matrix) {
    return new Float32Array([
        matrix[0], matrix[4], matrix[8], matrix[12],
        matrix[1], matrix[5], matrix[9], matrix[13],
        matrix[2], matrix[6], matrix[10], matrix[14],
        matrix[3], matrix[7], matrix[11], matrix[15]
    ]);
}

const vertexShaderSource = `
attribute vec3 position;
attribute vec3 normal; // Normal vector for lighting

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;

uniform vec3 lightDirection;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vNormal = vec3(normalMatrix * vec4(normal, 0.0));
    vLightDirection = lightDirection;

    gl_Position = vec4(position, 1.0) * projectionMatrix * modelViewMatrix; 
}

`

const fragmentShaderSource = `
precision mediump float;

uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform float shininess;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(vLightDirection);
    
    // Ambient component
    vec3 ambient = ambientColor;

    // Diffuse component
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * diffuseColor;

    // Specular component (view-dependent)
    vec3 viewDir = vec3(0.0, 0.0, 1.0); // Assuming the view direction is along the z-axis
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = spec * specularColor;

    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}

`

/**
 * @WARNING DO NOT CHANGE ANYTHING ABOVE THIS LINE
 */



/**
 * 
 * @TASK1 Calculate the model view matrix by using the chatGPT
 */

function getChatGPTModelViewMatrix() {
    const transformationMatrix = new Float32Array([
        0.1767767,  0.3061862, -0.3535534, 0,
       -0.2866116,  0.3695995,  0.1767767, 0,
        0.7391989,  0.2803301,  0.6123724, 0,
        0.3,       -0.25,       0,        1
    ]);
    
    return getTransposeMatrix(transformationMatrix);
}


/**
 * @TASK2 Calculate the model view matrix by using the given 
 * transformation methods and required transformation parameters
 * stated in transformation-prompt.txt
 */
function getModelViewMatrix() {
    // Step 1: Create the scaling matrix (0.5 on x and y axes, 1 on z-axis)
    const scalingMatrix = createScaleMatrix(0.5, 0.5, 1);

    // Step 2: Create rotation matrices (angles in radians)
    const rotationMatrixX = createRotationMatrix_X(Math.PI / 6);  // 30 degrees
    const rotationMatrixY = createRotationMatrix_Y(Math.PI / 4);  // 45 degrees
    const rotationMatrixZ = createRotationMatrix_Z(Math.PI / 3);  // 60 degrees

    // Step 3: Create the translation matrix
    const translationMatrix = createTranslationMatrix(0.3, -0.25, 0);

    // Step 4: Multiply matrices in the correct order
    // Transformation order: Scaling -> RotationX -> RotationY -> RotationZ -> Translation
    // Due to matrix multiplication order (column-major), we reverse the multiplication order

    // Start with the identity matrix
    let modelViewMatrix = createIdentityMatrix();

    // Apply scaling
    modelViewMatrix = multiplyMatrices(scalingMatrix, modelViewMatrix);

    // Apply rotations
    modelViewMatrix = multiplyMatrices(rotationMatrixX, modelViewMatrix);
    modelViewMatrix = multiplyMatrices(rotationMatrixY, modelViewMatrix);
    modelViewMatrix = multiplyMatrices(rotationMatrixZ, modelViewMatrix);

    // Apply translation
    modelViewMatrix = multiplyMatrices(translationMatrix, modelViewMatrix);

    return modelViewMatrix;
}





/**
 * 
 * @TASK3 Ask CHAT-GPT to animate the transformation calculated in 
 * task2 infinitely with a period of 10 seconds. 
 * First 5 seconds, the cube should transform from its initial 
 * position to the target position.
 * The next 5 seconds, the cube should return to its initial position.
 */
function getPeriodicMovement(startTime) {
    // Get the current time in seconds
    const currentTime = (Date.now() - startTime) / 1000;

    // Calculate the time within the 10-second cycle
    const timeInCycle = currentTime % 10;

    // Calculate the time parameter t (0 to 1 and back to 0 over 10 seconds)
    let t;
    if (timeInCycle < 5) {
        // First 5 seconds: t goes from 0 to 1
        t = timeInCycle / 5;
    } else {
        // Next 5 seconds: t goes from 1 to 0
        t = (10 - timeInCycle) / 5;
    }

    // Interpolate transformation parameters
    // Initial parameters
    const initialTranslation = { x: 0, y: 0, z: 0 };
    const initialScaling = { x: 1, y: 1, z: 1 };
    const initialRotation = { x: 0, y: 0, z: 0 }; // in radians

    // Target parameters
    const targetTranslation = { x: 0.3, y: -0.25, z: 0 };
    const targetScaling = { x: 0.5, y: 0.5, z: 1 };
    const targetRotation = {
        x: Math.PI / 6,  // 30 degrees in radians
        y: Math.PI / 4,  // 45 degrees in radians
        z: Math.PI / 3   // 60 degrees in radians
    };

    // Interpolate between initial and target parameters
    const translation = {
        x: initialTranslation.x + (targetTranslation.x - initialTranslation.x) * t,
        y: initialTranslation.y + (targetTranslation.y - initialTranslation.y) * t,
        z: initialTranslation.z + (targetTranslation.z - initialTranslation.z) * t
    };

    const scaling = {
        x: initialScaling.x + (targetScaling.x - initialScaling.x) * t,
        y: initialScaling.y + (targetScaling.y - initialScaling.y) * t,
        z: initialScaling.z + (targetScaling.z - initialScaling.z) * t
    };

    const rotation = {
        x: initialRotation.x + (targetRotation.x - initialRotation.x) * t,
        y: initialRotation.y + (targetRotation.y - initialRotation.y) * t,
        z: initialRotation.z + (targetRotation.z - initialRotation.z) * t
    };

    // Create transformation matrices using the interpolated parameters
    const scalingMatrix = createScaleMatrix(scaling.x, scaling.y, scaling.z);
    const rotationMatrixX = createRotationMatrix_X(rotation.x);
    const rotationMatrixY = createRotationMatrix_Y(rotation.y);
    const rotationMatrixZ = createRotationMatrix_Z(rotation.z);
    const translationMatrix = createTranslationMatrix(translation.x, translation.y, translation.z);

    // Multiply matrices in the correct order
    let modelViewMatrix = createIdentityMatrix();

    // Apply scaling
    modelViewMatrix = multiplyMatrices(scalingMatrix, modelViewMatrix);

    // Apply rotations
    modelViewMatrix = multiplyMatrices(rotationMatrixX, modelViewMatrix);
    modelViewMatrix = multiplyMatrices(rotationMatrixY, modelViewMatrix);
    modelViewMatrix = multiplyMatrices(rotationMatrixZ, modelViewMatrix);

    // Apply translation
    modelViewMatrix = multiplyMatrices(translationMatrix, modelViewMatrix);

    return modelViewMatrix;
}



