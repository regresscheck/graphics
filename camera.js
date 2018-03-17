const moveSpeed = 0.01;

function Camera(viewMatrix, angle) {
    this.viewMatrix = viewMatrix;
    this.angle = angle;
    this.updateProjectionMatrix();
}

Camera.prototype.updateProjectionMatrix = function() {
    this.projectionMatrix = glm.perspective(glm.radians(this.angle), canvas.width / canvas.height, 0.1, 100.0);
};

Camera.prototype.handleKeys = function(keys) {
    console.log(keys);
    const viewVector = glm.normalize(
        glm.vec3(this.viewMatrix.elements[2], this.viewMatrix.elements[6], this.viewMatrix.elements[10])
    )['*='](moveSpeed);
    console.log(viewVector.toString());
    if (keys[87]) {         // w
        this.viewMatrix = glm.translate(this.viewMatrix, glm.rotateZ(viewVector, glm.radians(90)));
    } else if (keys[65]) {  // a
        this.viewMatrix = glm.translate(this.viewMatrix, glm.vec3(-moveSpeed, 0.0, 0.0));
    } else if (keys[68]) {  // d
        this.viewMatrix = glm.translate(this.viewMatrix, glm.vec3(moveSpeed, 0.0, 0.0));
    } else if (keys[83]) {  // s
        this.viewMatrix = glm.translate(this.viewMatrix, glm.rotateZ(viewVector, glm.radians(-90)));
    }
};