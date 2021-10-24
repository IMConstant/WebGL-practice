let canvas = document.getElementById('my_Canvas');
let gl = canvas.getContext('experimental-webgl');

class VertexBuffer {
    constructor(vertices) {
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.layout = null;
        this.attributes = [];
    }

    connectToShaderAttributes(shaderProgram, layout) {
        this.layout = layout;

        this.bind();

        console.log(layout);

        for (let attribute in layout) {
            console.log(attribute);
            let attributeLocation = gl.getAttribLocation(shaderProgram.get(), attribute);
            gl.vertexAttribPointer(attributeLocation, layout[attribute].size, layout[attribute].type, false, layout[attribute].stride, layout[attribute].offset);
            gl.enableVertexAttribArray(attributeLocation);

            this.attributes.push(attributeLocation);
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