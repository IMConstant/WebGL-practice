let canvas = document.getElementById('my_Canvas');
let gl = canvas.getContext('experimental-webgl');

class VertexBuffer {
    constructor(vertices, attributePerVertex = 1) {
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.length = vertices.length / attributePerVertex;
    }

    connectToShaderAttributes(shaderProgram, layout) {
        this.bind();

        for (let attribute in layout) {
            let attributeLocation = gl.getAttribLocation(shaderProgram.get(), attribute);
            gl.vertexAttribPointer(attributeLocation, layout[attribute].size, layout[attribute].type, false, layout[attribute].stride, layout[attribute].offset);
            gl.enableVertexAttribArray(attributeLocation);
        }
    }

    bind() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    }

    unbind() {
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
}

export {VertexBuffer};