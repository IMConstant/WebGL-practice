import {vsCode, fsCode, Shader, ShaderProgram} from './shaders.js';
import {VertexBuffer} from './buffer.js'
import {getType} from "./handlerSelect";

import {gl, canvas} from "./context";


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
}


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
    })
    
    return values;
}

function Vertex(position, color) {
    return { position, color }
}




const Colors = {
    red: Vector(1.0, 0.0, 0.0, 1.0),
    green: Vector(0.0, 1.0, 0.0, 1.0),
    blue: Vector(0.0, 0.0, 1.0, 1.0),
    cyan: Vector(0.0, 1.0, 1.0, 1.0),
    magenta: Vector(1.0, 0.0, 1.0, 1.0)
}

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
}

init();
run();
