const { mat4 } = glMatrix;

const start = () =>
{
    importCode('/src/Main.js');
    importCode('/src/Engine.js');
    importCode('/src/Libraries/ResourceLoader.js');
    importCode('/src/Libraries/ModelLibrary.js');
    importCode('/src/Libraries/TextureLibrary.js');
    importCode('/src/Libraries/ShaderLibrary.js');
    importCode('/src/Apex/GameObject.js');
    importCode('/src/Object2D.js');
    importCode('/src/Apex/Scene/SpriteRenderer.js');
    importCode('/src/Apex/Scene/TankScene.js');
    importCode('/src/Apex/Scene/TitleScene.js');
    importCode('/src/Apex/Scene/SceneManager.js');
    importCode('/src/Apex/Scene/ExternalScene.js');


    // Waits for the code to load
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






