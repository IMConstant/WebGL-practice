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
    'attribute vec3 coordinates;' +
    'attribute vec4 color;' +
    'varying vec4 vColor;' +
    'uniform float resolution;' +
    'void main(void) {' +
    ' gl_Position = vec4(coordinates / 2.0, 1.0);' +
    'gl_Position.x *= resolution;' +
    'gl_PointSize = 10.0;'+
    'vColor = color;' +
    '}';
const fsCode =
    'precision highp float;' +
    'varying vec4 vColor;' +
    'uniform float iTime;' +
    'void main() {' +
    'vec4 color = vColor;' +
    //'color.a = 0.01;' +
    //'color.r *= 3.0;' +
    'color.rgb = 0.5 * cos(iTime + color.rgb + vec3(0, 2, 4)) + 0.5;' +
    'gl_FragColor = color;'  +
    '}';

let canvas$1 = document.getElementById('my_Canvas');
let gl$1 = canvas$1.getContext('experimental-webgl');

class VertexBuffer {
    constructor(vertices) {
        this.buffer = gl$1.createBuffer();
        gl$1.bindBuffer(gl$1.ARRAY_BUFFER, this.buffer);
        gl$1.bufferData(gl$1.ARRAY_BUFFER, new Float32Array(vertices), gl$1.DYNAMIC_DRAW);
        gl$1.bindBuffer(gl$1.ARRAY_BUFFER, null);

        this.layout = null;
        this.attributes = [];
    }

    connectToShaderAttributes(shaderProgram, layout) {
        this.layout = layout;

        this.bind();

        console.log(layout);

        for (let attribute in layout) {
            console.log(attribute);
            let attributeLocation = gl$1.getAttribLocation(shaderProgram.get(), attribute);
            gl$1.vertexAttribPointer(attributeLocation, layout[attribute].size, layout[attribute].type, false, layout[attribute].stride, layout[attribute].offset);
            gl$1.enableVertexAttribArray(attributeLocation);

            this.attributes.push(attributeLocation);
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
        triangleStrip: gl.TRIANGLE_STRIP
    };
    
    return config[select.value];
}

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
};


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
    
    new VertexBuffer(convertObjectToArray(vertices));

    let vertexShader = new Shader(gl.VERTEX_SHADER, vsCode);
    let fragmentShader = new Shader(gl.FRAGMENT_SHADER, fsCode);

    Context.shaderProgram = new ShaderProgram(vertexShader, fragmentShader);
    Context.shaderProgram.bind();

    let layout = shaderLayout();
    layout['coordinates'] = shaderAttribute(3, gl.FLOAT, 28, 0);
    layout['color'] = shaderAttribute(4, gl.FLOAT, 28, 12);
    //vertexBuffer.connectToShaderAttributes(Context.shaderProgram, layout);
    
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
};

init();
run();
