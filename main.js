const canvas = document.querySelector('#gl-canvas');
const gl = canvas.getContext('webgl');
const app = {}

function initShaders() {
    const vertexShaderSource = loadFile('./shaders/shader.vert');
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShaderSource = loadFile('./shaders/shader.frag');
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    app.shader = {};

    app.shader.modelMatrix = gl.getUniformLocation(shaderProgram, 'modelMatrix');
    app.shader.viewMatrix = gl.getUniformLocation(shaderProgram, 'viewMatrix');
    app.shader.projectionMatrix = gl.getUniformLocation(shaderProgram, 'projectionMatrix');
    app.shader.vertexColor = gl.getUniformLocation(shaderProgram, 'vertexColor');

    app.shader.vertexPosition = gl.getAttribLocation(shaderProgram, 'vertexPosition');

    gl.useProgram(shaderProgram);
}

function initMeshes() {
    const bunny = app.meshes.bunny;

    OBJ.initMeshBuffers(gl, bunny);
    //console.log(bunny);

    gl.bindBuffer(gl.ARRAY_BUFFER, bunny.vertexBuffer);
    gl.vertexAttribPointer(app.shader.vertexPosition, bunny.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(app.shader.vertexPosition)
}

function drawScene() {
    const bunny = app.meshes.bunny;

    resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0.0, 0.0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(app.shader.projectionMatrix, false,
        glm.perspective(glm.radians(45.0), canvas.width / canvas.height, 0.1, 100.0).elements);
    gl.uniformMatrix4fv(app.shader.viewMatrix, false,
        glm.lookAt(glm.vec3(-3.0, -3.0, -3.0), glm.vec3(1.0, 1.0, 1.0), glm.vec3(0.0, 0.0, 1.0)).elements);
    gl.uniformMatrix4fv(app.shader.modelMatrix, false,
        glm.translate(glm.mat4(1.0), glm.vec3(1.0, 1.0, 1.0)).elements);
    gl.uniform4fv(app.vertexColor, [1.0, 0.0, 0.0, 1.0]);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bunny.indexBuffer);
    gl.drawElements(gl.TRIANGLES, bunny.indexBuffer.itemSize, gl.UNSIGNED_SHORT, 0);
}

function tick() {
    window.requestAnimationFrame(tick);
    drawScene();
}

function start(meshes) {
    app.meshes = meshes;

    if (!gl) {
        throw new Error('No webgl today');
    }

    initShaders();
    initMeshes();

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