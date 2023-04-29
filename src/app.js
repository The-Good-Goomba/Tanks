const { mat4 } = glMatrix;

let i = -1;
const TextureTypes = {
    none: i++,
    bigSheet: i++
}

i = -1
const SpriteTypes = {
    none: i++,
    // The tank colours
    blueTank: i++,
    redTank: i++,
    ashTank: i++,
    blackTank: i++,
    greenTank: i++,
    oliveTank: i++,
    marinTank: i++,
    pinkTank: i++,
    purpleTank: i++,
    violetTank: i++,
    whiteTank: i++,
    yellowTank: i++,

    // Objects
    woodenFloor: i++,
    shell: i++,
    cork: i++,
    oak: i++,
    spruce: i++,
    balsa: i++,

    // Crosses
    blueCross: i++,
    whiteCross: i++,
    redCross: i++,

    hole: i++,

}

i = 0;
const ModelTypes =
    {
        tank: i++,
        plane: i++,
        shell: i++,
        block2x2: i++,
        block2x1: i++,
        triangle: i++,
        halfCylinder: i++,
        block2x4: i++,
    }

const VertexShaderTypes = {
    default: 'vertex_main'
}

const VertexDescriptorTypes = {
    Basic: [{
        attributes: [{
            shaderLocation: 0, // position
            offset: 0,
            format: 'float32x3'
        }],
        arrayStride: 12,
        stepMode: 'vertex'
    },
        {
            attributes: [{
                shaderLocation: 1, // texCoords
                offset: 0,
                format: 'float32x2'
            }],
            arrayStride: 8,
            stepMode: 'vertex'
        },
        {
            attributes: [{
                shaderLocation: 2, // normal
                offset: 0,
                format: 'float32x3'
            }],
            arrayStride: 12,
            stepMode: 'vertex'
        },
        {
            attributes: [{
                shaderLocation: 3, // meshMemeber
                offset: 0,
                format: 'uint32'
            }],
            arrayStride: 4,
            stepMode: 'vertex'
        }]

}

const FragmentShaderTypes = {
    default: 'fragment_main'
}


const start = () =>
{
    importCode('/src/Main.js');
    importCode('/src/Engine.js');
    importCode('/src/Libraries/ResourceLoader.js');
    importCode('/src/Libraries/ModelLibrary.js');
    importCode('/src/Libraries/TextureLibrary.js');
    importCode('/src/Libraries/ShaderLibrary.js');
    importCode('/src/Apex/GameObject.js');
    importCode('/src/Apex/Scene.js');

    setTimeout(() => {
        Main.InitApp();
    },1000)

}

const importCode = (url) =>
{
    let head = document.getElementsByTagName('head')[0];
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    head.appendChild(script);
}


class Keyboard
{
    static keys = {};

    static Initialise() {
        window.addEventListener('keydown', function(event) {
            Keyboard.keys[event.key] = true;
        });
        window.addEventListener('keyup', function(event) {
            Keyboard.keys[event.key] = false;
        });
    }

    static isKeyDown(key) {
        return Keyboard.keys[key];
    }
}

class Mouse
{
    static _mousePos = [0, 0];

    static _mouseButtons = {};

    static get mousePos() {
        return [Mouse._mousePos[0] / Main.canvas.width, Mouse._mousePos[1] / Main.canvas.height];
    }

    static isMouseButtonDown(button) {
        return Mouse._mouseButtons[button];
    }

    static Initialise() {

        window.onmousedown = function(event) { Mouse._mouseButtons[event.button] = true; }
        window.onmouseup = function(event) { Mouse._mouseButtons[event.button] = false; }

        Main.canvas.onmousemove = Mouse.updateMousePos;
    };

    static updateMousePos(event) {
        Mouse._mousePos[0] = event.offsetX;
        Mouse._mousePos[1] = event.offsetY;
    }
}






