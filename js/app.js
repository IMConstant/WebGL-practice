import {vsCode, fsCode, Shader, ShaderProgram} from './shaders.js';
import {VertexBuffer} from './buffer.js'
import {getType} from "./handlerSelect";

import {gl, canvas} from "./context";


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

    let numVertices = 1000 + Math.floor(2000 * Math.random());
    
    let center = Vector(
        2 * Math.random() - 1,
        2 * Math.random() - 1,
        2 * Math.random() - 1
    );
    let centerColor = randomColor();
    centerColor.w = 0.01;

    let d = 2 * Math.PI / numVertices;
    
    let startColor = Colors.magenta;
    let endColor = Colors.cyan;

    for (let i = 0; i < numVertices - 1; i++) {
        vertices.push(center);
        vertices.push(centerColor);
        
        for (let j = 0; j < 2; j++) {
            vertices.push(Vector(
                vertices[0].x + (radius) * Math.random() * Math.cos((i + j) * d + 1.2 * (2 * Math.random() - 1)),
                vertices[0].y + (radius) * Math.random() * Math.sin((i + j) * d + 1.2 * (2 * Math.random() - 1)),
                1.0
            ));
            
            let t = 0.5 * Math.cos(1.0 * (i + j) * d) + 0.5;
            
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



let vertices = createCircleShape(0.5 + 0.3 * Math.random());

let stars = [];


function init() {
    for (let i = 0; i < 40; i++) {
        let verts = createCircleShape(0.5 + 0.3 * Math.random());
        
        stars.push({
            buffer: new VertexBuffer(convertObjectToArray(verts)),
            size: verts / 2
        });
    }
    
    let vertexBuffer = new VertexBuffer(convertObjectToArray(vertices));

    let vertexShader = new Shader(gl.VERTEX_SHADER, vsCode);
    let fragmentShader = new Shader(gl.FRAGMENT_SHADER, fsCode);

    Context.shaderProgram = new ShaderProgram(vertexShader, fragmentShader);
    Context.shaderProgram.bind();

    let layout = shaderLayout();
    layout['coordinates'] = shaderAttribute(3, gl.FLOAT, 28, 0);
    layout['color'] = shaderAttribute(4, gl.FLOAT, 28, 12);
    vertexBuffer.connectToShaderAttributes(Context.shaderProgram, layout);
    
    for (let i = 0; i < 40; i++) {
        stars[i].buffer.connectToShaderAttributes(Context.shaderProgram, layout);
    }
}


function update() {
    let timerLocation = gl.getUniformLocation(Context.shaderProgram.id, 'iTime');
    let resolutionLocation = gl.getUniformLocation(Context.shaderProgram.id, 'resolution');

    timerStart = performance.now();
    gl.uniform1f(timerLocation, timerStart / 1000.0);
    gl.uniform1f(resolutionLocation, canvas.height / canvas.width);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);          // Очистить холст
    //gl.enable(gl.DEPTH_TEST);             // Включить тест глубины
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // Очистить бит буфера цвета
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Установите порт просмотра
    gl.viewport(0, 0, canvas.width, canvas.height);
    // Нарисуй треугольник
    gl.lineWidth(7);
    
    for (let i = 0; i < 40; i++) {
        stars[i].buffer.bind();
        
        gl.drawArrays(getType(), 0, stars[i].size);
    }
}


let run = function() {
    window.requestAnimationFrame(run);
    update();
}

init();
run();
