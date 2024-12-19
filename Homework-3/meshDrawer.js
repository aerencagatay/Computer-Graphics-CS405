/**
 * @class Meshdrawer
 * @description Helper class for drawing meshes.
 * 
 */
class MeshDrawer {
	constructor(isLightSource = false) {
		// comile shader program
		this.prog = InitShaderProgram(meshVS, meshFS);

		// get attribute locations
		this.positionLoc = gl.getAttribLocation(this.prog, 'position');
		this.normalLoc = gl.getAttribLocation(this.prog, 'normal');
		this.texCoordLoc = gl.getAttribLocation(this.prog, 'texCoord');

		// get uniform locations
		//vertex
		this.mvpLoc = gl.getUniformLocation(this.prog, 'mvp');
		this.mvLoc = gl.getUniformLocation(this.prog, 'mv');
		this.mvNormalLoc = gl.getUniformLocation(this.prog, 'normalMV');
		this.modelMatrixLoc = gl.getUniformLocation(this.prog, 'modelMatrix');

		// fragment
		this.isLightSourceLoc = gl.getUniformLocation(this.prog, 'isLightSource');
		this.samplerLoc = gl.getUniformLocation(this.prog, 'tex');

		// create array buffers
		this.positionBuffer = gl.createBuffer();
		this.normalBuffer = gl.createBuffer();
		this.texcoordBuffer = gl.createBuffer();

		this.texture = gl.createTexture();

		this.numTriangles = 0;
		this.isLightSource = isLightSource;

	}

	setMesh(vertPos, texCoords, normals) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		this.numTriangles = vertPos.length / 3;
	}


	draw(matrixMVP, matrixMV, matrixNormal, modelMatrix) {
		gl.useProgram(this.prog)

		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		// Set uniform parameters
		gl.uniformMatrix4fv(this.mvpLoc, false, matrixMVP);
		gl.uniformMatrix4fv(this.mvLoc, false, matrixMV);
		gl.uniformMatrix4fv(this.mvNormalLoc, false, matrixNormal);
		gl.uniformMatrix4fv(this.modelMatrixLoc, false, modelMatrix);
		gl.uniform1i(this.isLightSourceLoc, this.isLightSource);


		// vertex positions
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.vertexAttribPointer(this.positionLoc, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.positionLoc);
		// // vertex normals
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.vertexAttribPointer(this.normalLoc, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.normalLoc);
		// // vertex texture coordinates
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
		gl.vertexAttribPointer(this.texCoordLoc, 2, gl.FLOAT,false, 0, 0);
		gl.enableVertexAttribArray(this.texCoordLoc);

		gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);

		
	}

	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture(img) {
		// const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		// You can set the texture image data using the following command.
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGB,
			gl.RGB,
			gl.UNSIGNED_BYTE,
			img);

		// Set texture parameters
		if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		}


		gl.useProgram(this.prog);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.uniform1i(this.samplerLoc, 0);

	}

}

const meshVS = `
precision mediump float;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 texCoord;

uniform mat4 mvp;
uniform mat4 mv;
uniform mat4 normalMV;
uniform mat4 modelMatrix;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vTexCoord;
varying vec3 fragPos;

void main()
{
    vNormal = vec3(normalMV * vec4(normal, 0.0));
    vPosition = vec3(mv * vec4(position, 1.0));
	fragPos = vec3(modelMatrix * vec4(position, 1.0));
    vTexCoord = texCoord;
    gl_Position = mvp * vec4(position, 1.0);
}
`;


/**
 * @Task2 : Update the fragment shader for diffuse and specular lighting.
 * 
 */
const meshFS = `
precision mediump float;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vTexCoord;
varying vec3 fragPos;

uniform sampler2D tex;
uniform bool isLightSource;

void main()
{
	vec3 normal = normalize(vNormal); // Normalize the normal
	vec3 lightPos = vec3(0.0, 0.0, 5.0); // Position of the light source
	vec3 lightdir = normalize(lightPos - fragPos); // Normalize the light direction
	
	float ambient = 0.35;
	float diff = 0.0;
	float spec = 0.0;
	float phongExp = 8.0;

	/////////////////////////////////////////////////////////////////////////////
	// PLEASE DO NOT CHANGE ANYTHING ABOVE !!!

	//diffuse lighting
	diff = max(dot(normal, lightdir), 0.0);

	//specular lighting
	vec3 viewDir = normalize(-vPosition);  // View direction
	vec3 reflectDir = reflect(-lightdir, normal);  // Reflection direction
	spec = pow(max(dot(viewDir, reflectDir), 0.0), phongExp);

	// PLEASE DO NOT CHANGE ANYTHING BELOW !!!
	/////////////////////////////////////////////////////////////////////////////
	
	if (isLightSource) {
		gl_FragColor = texture2D(tex, vTexCoord) * vec4(1.0, 1.0, 1.0, 1.0);
	} else {
    	gl_FragColor =  texture2D(tex, vTexCoord) * ( ambient + diff + spec ); // Set the fragment color
	}
}
`;

