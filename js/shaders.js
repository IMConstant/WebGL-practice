
let canvas = document.getElementById('my_Canvas');
let gl = canvas.getContext('experimental-webgl');

class Shader {
    constructor(type, sourceCode) {
        this.shader = null

        switch (type) {
            case gl.VERTEX_SHADER:
            case gl.FRAGMENT_SHADER:
                this.shader = gl.createShader(type);
                gl.shaderSource(this.shader, sourceCode);
                gl.compileShader(this.shader);
                let log = gl.getShaderInfoLog(this.shader);
                console.log('log = ', log);
                break;
            default:
                throw "Undefined shader type!";
        }
    }

    get() {
        return this.shader;
    }
}


class ShaderProgram{
    constructor(vertexShader, fragmentShader) {
        this.id = gl.createProgram()

        gl.attachShader(this.id, vertexShader.get());
        gl.attachShader(this.id, fragmentShader.get());
        gl.linkProgram(this.id);
    }

    get() {
        return this.id;
    }

    bind() {
        gl.useProgram(this.id);
    }
}


const vsCode =
    'attribute vec3 coordinates;' +
    'attribute vec4 color;' +
    'varying vec4 vColor;' +
    'uniform float resolution;' +
    'void main(void) {' +
    ' gl_Position = vec4(coordinates / 1.0, 1.0);' +
    'gl_Position.x *= resolution;' +
    'gl_PointSize = 1.4;'+
    'vColor = color;' +
    '}'
const fsCode =
    `
    precision highp float;
    varying vec4 vColor;
    uniform float iTime;
    
    void main() {
    vec4 color = vColor;
    //if (color.a != 0.0) {
    color.a *= 0.2;
    //}
    //color.r *= 3.0;
    color.rgb = 0.5 * cos(iTime + 1.0 * gl_FragCoord.xyx / vec3(1280, 720, 1280) + vec3(0, 2, 7)) + 0.5;
    gl_FragColor = color;
    }
`

export { vsCode, fsCode, Shader, ShaderProgram }