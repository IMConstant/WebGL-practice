let canvas$2 = document.getElementById('my_Canvas');
let gl$2 = canvas$2.getContext('experimental-webgl');

class Shader {
    constructor(type, sourceCode) {
        this.shader = null;

        switch (type) {
            case gl$2.VERTEX_SHADER:
            case gl$2.FRAGMENT_SHADER:
                this.shader = gl$2.createShader(type);
                gl$2.shaderSource(this.shader, sourceCode);
                gl$2.compileShader(this.shader);

                let log = gl$2.getShaderInfoLog(this.shader);
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
        this.id = gl$2.createProgram();

        gl$2.attachShader(this.id, vertexShader.get());
        gl$2.attachShader(this.id, fragmentShader.get());
        gl$2.linkProgram(this.id);
    }

    get() {
        return this.id;
    }

    bind() {
        gl$2.useProgram(this.id);
    }
}


const vsCode =
    `
    attribute vec3 coordinates;
    attribute vec4 color;
    varying vec4 vColor;
    uniform float resolution;
    void main(void) {
    gl_Position = vec4(coordinates / 1.0, 1.0);
    gl_Position.x *= resolution;
    gl_PointSize = 1.7;
    vColor = color;
    }
`;
const fsCode =
    `
    precision highp float;
    varying vec4 vColor;
    uniform float iTime;
    
    void main() {
    vec4 color = vColor;
    color.a *= 0.5;
    //color.rgb += 0.5 * cos(iTime + vec3(2, 4, 6)) + 0.5;
    color.rgb *= 0.5 * cos(iTime + 1.0 * gl_FragCoord.xyx / vec3(1280, 720, 1280) + vec3(0, 2, 7)) + 0.5;
    gl_FragColor = color;
    }
`;

let canvas$1 = document.getElementById('my_Canvas');
let gl$1 = canvas$1.getContext('experimental-webgl');

class VertexBuffer {
    constructor(vertices, attributePerVertex = 1) {
        this.buffer = gl$1.createBuffer();
        gl$1.bindBuffer(gl$1.ARRAY_BUFFER, this.buffer);
        gl$1.bufferData(gl$1.ARRAY_BUFFER, new Float32Array(vertices), gl$1.DYNAMIC_DRAW);
        gl$1.bindBuffer(gl$1.ARRAY_BUFFER, null);

        this.length = vertices.length / attributePerVertex;
    }

    connectToShaderAttributes(shaderProgram, layout) {
        this.bind();

        for (let attribute in layout) {
            let attributeLocation = gl$1.getAttribLocation(shaderProgram.get(), attribute);
            gl$1.vertexAttribPointer(attributeLocation, layout[attribute].size, layout[attribute].type, false, layout[attribute].stride, layout[attribute].offset);
            gl$1.enableVertexAttribArray(attributeLocation);
        }
    }

    bind() {
        gl$1.bindBuffer(gl$1.ARRAY_BUFFER, this.buffer);
    }

    unbind() {
        gl$1.bindBuffer(gl$1.ARRAY_BUFFER, null);
    }
}

let canvas = document.getElementById('my_Canvas');
let gl = canvas.getContext('experimental-webgl');

const select = document.querySelector("select");
/*
select.addEventListener("change", e => {
    
    const value = e.target.value; // [triangles, lines]
    
    const config = {
        triangles: a,
        lines: b
    }
    
    config[value]();
    
})*/


function getType(){
    
    const config = {
        triangles: gl.TRIANGLES,
        lines: gl.LINES,
        triangleStrip: gl.TRIANGLE_STRIP,
        triangleFan: gl.TRIANGLE_FAN,
        lineLoop: gl.LINE_LOOP,
        points: gl.POINTS
    };
    
    return config[select.value];
}

function convertObjectToArray(object, array = []) {
    for (let key in object) {
        if (typeof object[key] === 'object') convertObjectToArray(object[key], array);
        else array.push(object[key]);
    }

    return array;
}


function shaderLayout() {
    return {};
}


let Context = {
    shaderProgram: null
};


function shaderAttribute(size, type, stride, offset) {
    return {
        size, type, stride, offset
    };
}


let timer = performance.now();


function Vector(...args) {
    const values = {};
    
    const points = "xyzw".split('');
    
    args.forEach((elem, index) => {
        values[points[index]] = elem;
    });
    
    return values;
}




const Colors = {
    red: Vector(1.0, 0.0, 0.0, 1.0),
    green: Vector(0.0, 1.0, 0.0, 1.0),
    blue: Vector(0.0, 0.0, 1.0, 1.0),
    cyan: Vector(0.0, 1.0, 1.0, 1.0),
    magenta: Vector(1.0, 0.0, 1.0, 1.0)
};

function randomColor() {
    return Vector(
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random()
    );
}


function createRandomShape(numMin, numMax, scale = 1.0) {
    let vertices = [];

    let numVertices = numMin + Math.floor((numMax - numMin) * Math.random());
    console.log(numVertices);

    for (let i = 0; i < numVertices; i++) {
        vertices.push(Vector(
            scale * 2 * (2 * Math.random() - 1),
            scale * (2 * Math.random() - 1),
            scale * (2 * Math.random() - 1)
        ));
        vertices.push(randomColor());
    }

    return vertices;
}

function createCircleShape(radius, center = Vector(0.0, 0.5, 1.0)) {
    let vertices = [];

    let numVertices = 1000 + Math.floor(1000 * Math.random());

    let centerColor = randomColor();
    centerColor.w = 0.03;

    let d = 2 * Math.PI / numVertices;
    
    let startColor = Colors.magenta;
    let endColor = Colors.cyan;

    for (let i = 0; i < numVertices - 1; i++) {
        vertices.push(Vector(center.x, center.y, center.z));
        vertices.push(Vector(centerColor.x, centerColor.y, centerColor.z, centerColor.w));
        //vertices[vertices.length - 1].w = 0.1 * (0.5 * Math.cos(4 * i * d) + 0.5);
        
        for (let j = 1; j >= 0; j--) {
            vertices.push(Vector(
                vertices[0].x + (radius) * Math.random() * Math.cos((i + j) * d),
                vertices[0].y + (radius) * Math.random() * Math.sin((i + j) * d),
                1.0
            ));
            
            let t = 0.5 * Math.cos(2.0 * (i + j) * d) + 0.5;
            
            vertices.push(
                Vector(
                    startColor.x + t * (endColor.x - startColor.x),
                    startColor.y + t * (endColor.y - startColor.y),
                    startColor.z + t * (endColor.z - startColor.z),
                    0.0//0.01 * Math.pow(0.5 * Math.cos(4 * (i + j) * d) + 0.5, 1.0)
                )
            );
        }
    }

    return vertices;
}


function createSimpleShape() {
    let vertices = [];
    let N = 3 + Math.floor(9 * Math.random());
    let deltaAngle = 2 * Math.PI / N;
    let center = Vector(0.0, -0.5);

    for (let i = 0; i < N; i++) {
        let position = Vector(
            center.x + 0.3 * Math.cos(i * deltaAngle),
            center.y + 0.3 * Math.sin(i * deltaAngle),
            1.0
        );

        let t = 0.5 * Math.cos(i * deltaAngle) + 0.5;
        let color = Vector(
            Colors.cyan.x + t * (Colors.magenta.x - Colors.cyan.x),
            Colors.cyan.y + t * (Colors.magenta.y - Colors.cyan.y),
            Colors.cyan.z + t * (Colors.magenta.z - Colors.cyan.z),
            0.5
        );

        vertices.push(position);
        vertices.push(color);
    }

    return vertices;
}


let buffers = [];


function init() {
    buffers.push(new VertexBuffer(convertObjectToArray(createCircleShape(1.2 + 0.3 * Math.random())), 7));
    buffers.push(new VertexBuffer(convertObjectToArray(createRandomShape(1000, 2000)), 7));
    buffers.push(new VertexBuffer(convertObjectToArray(createSimpleShape()), 7));

    let vertexShader = new Shader(gl.VERTEX_SHADER, vsCode);
    let fragmentShader = new Shader(gl.FRAGMENT_SHADER, fsCode);

    Context.shaderProgram = new ShaderProgram(vertexShader, fragmentShader);
    Context.shaderProgram.bind();
}


let layout = shaderLayout();
layout['coordinates'] = shaderAttribute(3, gl.FLOAT, 28, 0);
layout['color'] = shaderAttribute(4, gl.FLOAT, 28, 12);


function drawBackground() {
    for (let i = 0; i < 2; i++) {
        buffers[i].connectToShaderAttributes(Context.shaderProgram, layout);

        gl.drawArrays(i === 1 ? gl.POINTS : (gl.LINES), 0, buffers[i].length);
    }
}


function update() {
    let timerLocation = gl.getUniformLocation(Context.shaderProgram.id, 'iTime');
    let resolutionLocation = gl.getUniformLocation(Context.shaderProgram.id, 'resolution');

    timer = performance.now();
    gl.uniform1f(timerLocation, timer / 1000.0);
    gl.uniform1f(resolutionLocation, canvas.height / canvas.width);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
   
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.viewport(0, 0, canvas.width, canvas.height);

    drawBackground();

    buffers[2].connectToShaderAttributes(Context.shaderProgram, layout);
    gl.drawArrays(getType(), 0, buffers[2].length);
}


let run = function() {
    window.requestAnimationFrame(run);
    update();
};

init();
run();
