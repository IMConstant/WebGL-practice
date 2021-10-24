import {vsCode, fsCode, Shader, ShaderProgram} from './shaders.js';
import {VertexBuffer} from './buffer.js'

let canvas = document.getElementById('my_Canvas');
let gl = canvas.getContext('experimental-webgl');


function convertObjectToArray(object, array = []) {
    for (let key in object) {
        if (typeof object[key] === 'object') {
            convertObjectToArray(object[key], array);
        }
        else {
            array.push(object[key]);
        }
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


let timerStart = performance.now();


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
    cyan: Vector(0.0, 1.0, 1.0, 1.0)
}

function randomColor() {
    return Vector(
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random()
    );
}


function createRandomShape() {
    let vertices = [];

    let numVertices = 3 + Math.floor(20 * Math.random());
    console.log(numVertices);

    for (let i = 0; i < numVertices; i++) {
        vertices.push(Vector(
            2 * Math.random() - 1,
            2 * Math.random() - 1,
            2 * Math.random() - 1
        ));
        vertices.push(randomColor());
    }

    return vertices;
}

function createCircleShape(radius) {
    let vertices = [];

    let numVertices = 3 + Math.floor(20 * Math.random());

    vertices.push(Vector(
        2 * Math.random() - 1,
        2 * Math.random() - 1,
        2 * Math.random() - 1
    ));
    vertices.push(randomColor());

    let d = 2 * Math.PI / numVertices;

    for (let i = 0; i < numVertices; i++) {
        vertices.push(Vector(
            vertices[0].x + (radius + Math.random() * 0.1) * Math.cos(i * d + 2 * Math.random() - 1),
            vertices[0].y + (radius + Math.random() * 0.1) * Math.sin(i * d + 2 * Math.random() - 1),
            1.0
        ));
        vertices.push(randomColor());
    }

    return vertices;
}



let vertices = createCircleShape(0.3 + 0.9 * Math.random());


function init() {
    let vertexBuffer = new VertexBuffer(convertObjectToArray(vertices));

    let vertexShader = new Shader(gl.VERTEX_SHADER, vsCode);
    let fragmentShader = new Shader(gl.FRAGMENT_SHADER, fsCode);

    Context.shaderProgram = new ShaderProgram(vertexShader, fragmentShader);
    Context.shaderProgram.bind();

    let layout = shaderLayout();
    layout['coordinates'] = shaderAttribute(3, gl.FLOAT, 28, 0);
    layout['color'] = shaderAttribute(4, gl.FLOAT, 28, 12);
    vertexBuffer.connectToShaderAttributes(Context.shaderProgram, layout);
}


function update() {
    let timerLocation = gl.getUniformLocation(Context.shaderProgram.id, 'iTime');

    timerStart = performance.now();
    gl.uniform1f(timerLocation, timerStart / 1000.0);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);          // Очистить холст
    //gl.enable(gl.DEPTH_TEST);             // Включить тест глубины
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // Очистить бит буфера цвета
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Установите порт просмотра
    gl.viewport(0, 0, canvas.width, canvas.height);
    // Нарисуй треугольник
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length / 2);
}


let run = function() {
    window.requestAnimationFrame(run);
    update();
}

init();
run();