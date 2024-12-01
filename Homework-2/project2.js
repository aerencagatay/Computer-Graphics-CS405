/**
 * @Instructions
 * 		@task1 : Complete the setTexture function to handle non power of 2 sized textures
 * 		@task2 : Implement the lighting by modifying the fragment shader, constructor,
 *      @task3: 
 *      @task4: 
 * 		setMesh, draw, setAmbientLight, setSpecularLight and enableLighting functions 
 */

// Global variables for transformation
var transZ = -5.0;  // Initial camera distance
var rotX = 0;       // Rotation around X axis
var rotY = 0;       // Rotation around Y axis
var autorot = 0;    // Auto rotation angle

// Global variables for lighting
var lightX = 1.0;   // Light position X
var lightY = 1.0;   // Light position Y

function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY) {
	
	var trans1 = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];
	var rotatXCos = Math.cos(rotationX);
	var rotatXSin = Math.sin(rotationX);

	var rotatYCos = Math.cos(rotationY);
	var rotatYSin = Math.sin(rotationY);

	var rotatx = [
		1, 0, 0, 0,
		0, rotatXCos, -rotatXSin, 0,
		0, rotatXSin, rotatXCos, 0,
		0, 0, 0, 1
	]

	var rotaty = [
		rotatYCos, 0, -rotatYSin, 0,
		0, 1, 0, 0,
		rotatYSin, 0, rotatYCos, 0,
		0, 0, 0, 1
	]

	var test1 = MatrixMult(rotaty, rotatx);
	var test2 = MatrixMult(trans1, test1);
	var mvp = MatrixMult(projectionMatrix, test2);

	return mvp;
}


class MeshDrawer {
	// The constructor is a good place for taking care of the necessary initializations.
    constructor() {
        this.prog = InitShaderProgram(meshVS, meshFS);
        
        // Attribute locations
        this.vertPosLoc = gl.getAttribLocation(this.prog, 'pos');
        this.texCoordLoc = gl.getAttribLocation(this.prog, 'texCoord');
        this.normalLoc = gl.getAttribLocation(this.prog, 'normal');

        // Uniform locations
        this.mvpLoc = gl.getUniformLocation(this.prog, 'mvp');
        this.mvLoc = gl.getUniformLocation(this.prog, 'mv');
        this.showTexLoc = gl.getUniformLocation(this.prog, 'showTex');
        this.colorLoc = gl.getUniformLocation(this.prog, 'color');
        this.lightPosLoc = gl.getUniformLocation(this.prog, 'lightPos');
        this.ambientLoc = gl.getUniformLocation(this.prog, 'ambientIntensity');
        this.enableLightingLoc = gl.getUniformLocation(this.prog, 'enableLighting');
        this.specularIntensityLoc = gl.getUniformLocation(this.prog, 'specularIntensity');
        this.shininessLoc = gl.getUniformLocation(this.prog, 'shininess');

        // Create buffers
        this.vertbuffer = gl.createBuffer();
        this.texbuffer = gl.createBuffer();
        this.normalbuffer = gl.createBuffer();
        
        // Initialize properties
        this.numTriangles = 0;
        this.isLightingEnabled = false;
        this.ambientIntensity = 0.5;
        this.specularIntensity = 0.5;
        this.shininess = 64.0;
    }

    setMesh(vertPos, texCoords, normalCoords) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalCoords), gl.STATIC_DRAW);

        this.numTriangles = vertPos.length / 3;
    }

	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	// Update the draw method
    draw(mvp) {
        gl.useProgram(this.prog);

        // Set matrices
        gl.uniformMatrix4fv(this.mvpLoc, false, new Float32Array(mvp));
        var mv = GetModelViewMatrix();
        var lightPosWorld = [lightX, lightY, 2.0, 1.0]; // Changed Z to 2.0 to move light more in front
        var lightPosEye = MatrixMult(mv, lightPosWorld);
        gl.uniform3f(this.lightPosLoc, lightPosEye[0], lightPosEye[1], lightPosEye[2]);
        gl.uniformMatrix4fv(this.mvLoc, false, new Float32Array(mv));

        // Set lighting uniforms
        gl.uniform1i(this.enableLightingLoc, this.isLightingEnabled);
        gl.uniform1f(this.ambientLoc, this.ambientIntensity);
        gl.uniform1f(this.specularIntensityLoc, this.specularIntensity);
        gl.uniform1f(this.shininessLoc, this.shininess);
        gl.uniform3f(this.lightPosLoc, lightX, lightY, 1.0);
        gl.uniform1i(this.showTexLoc, true);

        // Set vertex attributes
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
        gl.enableVertexAttribArray(this.vertPosLoc);
        gl.vertexAttribPointer(this.vertPosLoc, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
        gl.enableVertexAttribArray(this.texCoordLoc);
        gl.vertexAttribPointer(this.texCoordLoc, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalbuffer);
        gl.enableVertexAttribArray(this.normalLoc);
        gl.vertexAttribPointer(this.normalLoc, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);
    }

    enableLighting(enable) {
        this.isLightingEnabled = enable;
    }

    setAmbientLight(intensity) {
        this.ambientIntensity = intensity;
    }

	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	// Modified setTexture method for Task 1
	setTexture(img) {
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
		
		// Handle any image size
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		
		gl.useProgram(this.prog);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.uniform1i(gl.getUniformLocation(this.prog, 'tex'), 0);
	}

    setSpecularLight(intensity) {
        this.specularIntensity = intensity;
        this.shininess = 32.0 + intensity * 64.0; // Adjust shininess based on intensity
    }

	showTexture(show) {
		gl.useProgram(this.prog);
		gl.uniform1i(this.showTexLoc, show);
	}

	// Update the enableLighting method
	enableLighting(enable) {
		this.isLightingEnabled = enable;
	}

	// Update the setAmbientLight method
	setAmbientLight(intensity) {
		this.ambientIntensity = intensity;
	}
}


function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}

function normalize(v, dst) {
	dst = dst || new Float32Array(3);
	var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
	// make sure we don't divide by 0.
	if (length > 0.00001) {
		dst[0] = v[0] / length;
		dst[1] = v[1] / length;
		dst[2] = v[2] / length;
	}
	return dst;
}


// Fragment shader
const meshFS = `
precision mediump float;

uniform bool showTex;
uniform bool enableLighting;
uniform sampler2D tex;
uniform vec3 color;
uniform vec3 lightPos;
uniform float ambientIntensity;
uniform float specularIntensity;
uniform float shininess;

varying vec2 v_texCoord;
varying vec3 v_normal;
varying vec3 v_position;

void main() {
    vec4 texColor;
    if (showTex) {
        texColor = texture2D(tex, v_texCoord);
    } else {
        texColor = vec4(color, 1.0);
    }

    if (enableLighting) {
        vec3 normal = normalize(v_normal);
        vec3 lightDir = normalize(lightPos - v_position);
        vec3 viewDir = normalize(-v_position);
        
        // Ambient
        vec3 ambient = ambientIntensity * texColor.rgb;
        
        // Diffuse
        float diff = max(dot(normal, lightDir), 0.0);
        vec3 diffuse = diff * texColor.rgb;
        
        // Specular
        vec3 reflectDir = reflect(-lightDir, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
        vec3 specular = specularIntensity * spec * vec3(1.0, 1.0, 1.0);
        
        vec3 finalColor = ambient + diffuse + specular;
        gl_FragColor = vec4(finalColor, texColor.a);
    } else {	
        gl_FragColor = texColor;
    }
}`;

// Vertex shader
const meshVS = `
attribute vec3 pos;
attribute vec2 texCoord;
attribute vec3 normal;

uniform mat4 mvp;
uniform mat4 mv;

varying vec2 v_texCoord;
varying vec3 v_normal;
varying vec3 v_position;

void main() {
    v_texCoord = texCoord;
    v_normal = normalize((mv * vec4(normal, 0.0)).xyz);
    vec4 posEye = mv * vec4(pos, 1.0);
    v_position = posEye.xyz;
    gl_Position = mvp * vec4(pos, 1.0);
}`;

// Helper function to get model-view matrix
function GetModelViewMatrix() {
    var trans = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, transZ, 1
    ];

    var rotatXCos = Math.cos(rotX);
    var rotatXSin = Math.sin(rotX);
    var rotatYCos = Math.cos(autorot + rotY);
    var rotatYSin = Math.sin(autorot + rotY);

    var rotatx = [
        1, 0, 0, 0,
        0, rotatXCos, -rotatXSin, 0,
        0, rotatXSin, rotatXCos, 0,
        0, 0, 0, 1
    ];

    var rotaty = [
        rotatYCos, 0, -rotatYSin, 0,
        0, 1, 0, 0,
        rotatYSin, 0, rotatYCos, 0,
        0, 0, 0, 1
    ];

    return MatrixMult(trans, MatrixMult(rotaty, rotatx));
}


// Add the window event listener for the specular slider
window.SetSpecularLight = function(param) {
    if (typeof meshDrawer !== "undefined") {
        meshDrawer.setSpecularLight(param.value / 100);
        DrawScene();
    }
};

// Define the keys object at the top of project2.js
const keys = {};

// Keyboard event handlers
window.addEventListener('keydown', function(event) {
    keys[event.key] = true;
    updateLightPos();
    event.preventDefault();
});

window.addEventListener('keyup', function(event) {
    keys[event.key] = false;
    event.preventDefault();
});

function updateLightPos() {
    const translationSpeed = 0.1;
    if (keys['ArrowUp']) {
        lightY += translationSpeed;
        DrawScene();
    }
    if (keys['ArrowDown']) {
        lightY -= translationSpeed;
        DrawScene();
    }
    if (keys['ArrowRight']) {
        lightX += translationSpeed;
        DrawScene();
    }
    if (keys['ArrowLeft']) {
        lightX -= translationSpeed;
        DrawScene();
    }
}
///////////////////////////////////////////////////////////////////////////////