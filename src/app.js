const { mat4, quat } = glMatrix;

const start = async () =>
{
    await importCode('/src/Utility/Meth.js');
    await importCode('/src/Main.js');
    await importCode('/src/Engine.js');
    await importCode('/src/Collision/CollisionEntity.js');
    await importCode('/src/Collision/CollisionEngine.js')
    await importCode('/src/Libraries/Types.js');
    await importCode('/src/Libraries/ResourceLoader.js');
    await importCode('/src/Libraries/ModelLibrary.js');
    await importCode('/src/Libraries/TextureLibrary.js');
    await importCode('/src/Libraries/ShaderLibrary.js');
    await importCode('/src/Libraries/AudioManager.js');
    await importCode('/src/Apex/Apex.js');
    await importCode('/src/Apex/ModelObject.js');
    await importCode('/src/Apex/GameObject.js');
    await importCode('/src/Sprites/Object2D.js');
    await importCode('/src/Apex/Scene/Scene.js');
    await importCode('/src/Sprites/SpriteRenderer.js');
    await importCode('/src/Sprites/TextRenderer.js');
    await importCode('/src/Sprites/TextSprite.js');
    await importCode('/src/Buttons/Button.js');
    await importCode('/src/Buttons/ButtonHandler.js');
    await importCode('/src/Apex/Scene/JoinRoomScene.js');
    await importCode('/src/Apex/Scene/ExternalScene.js');
    await importCode('/src/Apex/Scene/TankScene.js');
    await importCode('/src/Apex/Scene/TitleScene.js');
    await importCode('/src/Apex/Scene/SceneManager.js');

    // Waits for the code to load
    Main.InitApp();
}

const importCode = (url) =>
{
    return new Promise((resolve) => {
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.async = false;
        script.addEventListener('load', () => {
            resolve();
        });
        document.head.appendChild(script);
    })

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






