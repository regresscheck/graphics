const canvas = document.querySelector('#gl-canvas');
const gl = canvas.getContext('webgl2');
const app = {}

app.currentlyPressedKeys = {};

function verifyCompilation(shader) {
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        throw new Error('Could not compile shader:' + gl.getShaderInfoLog(shader));
    }
}

function initShaders() {
    const vertexShaderSource = loadFile('./shaders/shader.vert');
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    verifyCompilation(vertexShader);

    const fragmentShaderSource = loadFile('./shaders/shader.frag');
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    verifyCompilation(fragmentShader);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    app.shader = {};

    app.shader.modelMatrix = gl.getUniformLocation(shaderProgram, 'modelMatrix');
    app.shader.viewMatrix = gl.getUniformLocation(shaderProgram, 'viewMatrix');
    app.shader.projectionMatrix = gl.getUniformLocation(shaderProgram, 'projectionMatrix');
    app.shader.normalToCameraMatrix = gl.getUniformLocation(shaderProgram, 'normalToCameraMatrix');

    app.shader.vertexPosition = gl.getAttribLocation(shaderProgram, 'vertexPosition');
    app.shader.vertexNormal = gl.getAttribLocation(shaderProgram, 'vertexNormal');
    app.shader.vertexMeterialIndex = gl.getAttribLocation(shaderProgram, 'vertexMeterialIndex');

    app.shader.materials = [];
    for (var i = 0; i < 5; i++) {
        app.shader.materials[i] = {};
        const materialPrefix = 'materials[' + i + ']';
        app.shader.materials[i].Ka = gl.getUniformLocation(shaderProgram, materialPrefix + '.Ka');
        app.shader.materials[i].Kd = gl.getUniformLocation(shaderProgram, materialPrefix + '.Kd');
        app.shader.materials[i].Ks = gl.getUniformLocation(shaderProgram, materialPrefix + '.Ks');
        app.shader.materials[i].shininess = gl.getUniformLocation(shaderProgram, materialPrefix +  '.shininess');
        if (app.shader.materials[i].Ka < 0) {
            throw new Error('Material array is not found');
        }
    }

    app.shader.light = {};
    app.shader.light.pos = gl.getUniformLocation(shaderProgram, 'light.pos');
    app.shader.light.La = gl.getUniformLocation(shaderProgram, 'light.La');
    app.shader.light.Ld = gl.getUniformLocation(shaderProgram, 'light.Ld');
    app.shader.light.Ls = gl.getUniformLocation(shaderProgram, 'light.Ls');

    gl.useProgram(shaderProgram);
}

function buildBuffer(gl, type, data, itemSize, arrayView) {
    var buffer = gl.createBuffer();
    var arrayView = arrayView || ((type === gl.ARRAY_BUFFER) ? Float32Array : Uint16Array);
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, new arrayView(data), gl.STATIC_DRAW);
    buffer.itemSize = itemSize;
    buffer.numItems = data.length / itemSize;
    return buffer;
};

function initMaterialBuffers(gl, mesh) {
    mesh.materialIndexBuffer = buildBuffer(gl, gl.ARRAY_BUFFER, mesh.vertexMaterialIndices, 1, Uint16Array);
}

function initMeshes() {
    const bunny = app.meshes.bunny;

    OBJ.initMeshBuffers(gl, bunny);
    initMaterialBuffers(gl, bunny);
    console.log(bunny);

    gl.bindBuffer(gl.ARRAY_BUFFER, bunny.vertexBuffer);
    gl.vertexAttribPointer(app.shader.vertexPosition, bunny.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(app.shader.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, bunny.normalBuffer);
    gl.vertexAttribPointer(app.shader.vertexNormal, bunny.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(app.shader.vertexNormal);

    gl.bindBuffer(gl.ARRAY_BUFFER, bunny.materialIndexBuffer);
    gl.vertexAttribIPointer(app.shader.vertexMeterialIndex, bunny.materialIndexBuffer.itemSize, gl.UNSIGNED_SHORT, false, 0, 0);
    gl.enableVertexAttribArray(app.shader.vertexMeterialIndex);

}

function putMaterials(mesh) {
    for (var i = 0; i < mesh.materialNames.length; i++) {
        gl.uniform3fv(app.shader.materials[i].Ka, mesh.materialsByIndex[i].ambient);
        gl.uniform3fv(app.shader.materials[i].Kd, mesh.materialsByIndex[i].diffuse);
        gl.uniform3fv(app.shader.materials[i].Ks, mesh.materialsByIndex[i].specular);
        gl.uniform1f(app.shader.materials[i].shininess, 128.0);
    }
}

function drawScene() {
    resizeCanvasToDisplaySize(gl.canvas);
    app.camera.updateProjectionMatrix();

    const bunny = app.meshes.bunny;

    gl.viewport(0.0, 0.0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const modelMatrix = glm.translate(glm.mat4(1.0), glm.vec3(1.0, 1.0, 1.0));
    const normalToCameraMatrix = glm.mat3(glm.transpose(glm.inverse(glm.mat4(glm.mat3(
        app.camera.viewMatrix['*'](modelMatrix))))));

    putMaterials(bunny);

    gl.uniform3fv(app.shader.light.pos, [4.0, 5.0, 3.0]);
    gl.uniform3fv(app.shader.light.La, [0.0, 0.0, 0.0]);
    gl.uniform3fv(app.shader.light.Ld, [1.0, 1.0, 1.0]);
    gl.uniform3fv(app.shader.light.Ls, [0.5, 0.5, 0.5]);

    gl.uniformMatrix4fv(app.shader.projectionMatrix, false, app.camera.projectionMatrix.elements);
    gl.uniformMatrix4fv(app.shader.viewMatrix, false, app.camera.viewMatrix.elements);
    gl.uniformMatrix4fv(app.shader.modelMatrix, false, modelMatrix.elements);
    gl.uniformMatrix3fv(app.shader.normalToCameraMatrix, false, normalToCameraMatrix.elements);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bunny.indexBuffer);
    gl.drawElements(gl.TRIANGLES, bunny.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function tick() {
    window.requestAnimationFrame(tick);
    drawScene();
    app.camera.handleKeys(app.currentlyPressedKeys);
}

function initCamera() {
    const viewMatrix = glm.lookAt(glm.vec3(4.0, 4.0, 4.0), glm.vec3(1.0, 1.0, 1.0), glm.vec3(0.0, 0.0, 1.0));
    app.camera = new Camera(viewMatrix, 45.0);
}

function start(meshes) {
    app.meshes = meshes;

    if (!gl) {
        throw new Error('No webgl today');
    }

    initShaders();
    initMeshes();
    initCamera();

    gl.clearColor(0.0, 0.0, 0.0, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearDepth(1.0);

    tick();
}

window.onload = function () {
    OBJ.downloadModels([{
        name: 'bunny',
        obj: 'models/bunny.obj',
        mtl: 'models/bunny.mtl'
    }])
        .then(start)
};

function handleKeyDown(event) {
    app.currentlyPressedKeys[event.keyCode] = true;
}

function handleKeyUp(event) {
    app.currentlyPressedKeys[event.keyCode] = false;
}

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);