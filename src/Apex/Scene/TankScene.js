
class TankScene extends ExternalScene
{
    constructor() {
        super();
        (async () => {
            let data = await ResourceLoader.loadJSONResource('/start');
            Main.playerID = data.id;
            data = await ResourceLoader.loadJSONResource(`/initServer/${Main.playerID}`);
            this.Initialise(data.projectionMatrix, data.viewMatrix, data.children);
        })()
    }

    async update(children) {

        let data = await ResourceLoader.loadJSONResource(`/getGameData/${Main.playerID}`);
        this.viewMatrix = ExternalScene.decodeFloat32Array(data.viewMatrix);
        this.projectionMatrix = ExternalScene.decodeFloat32Array(data.projectionMatrix);
        super.update(children);

        data = {
            a: Keyboard.isKeyDown('a') || false,
            s: Keyboard.isKeyDown('s') || false,
            w: Keyboard.isKeyDown('w') || false,
            d: Keyboard.isKeyDown('d') || false,
            mousePos: Mouse.mousePos ?? [0.5,0.5],
            leftMouse: Mouse.isMouseButtonDown(0) || false,
            rightMouse: Mouse.isMouseButtonDown(1) || false,
            playerID: Main.playerID,
        }
        fetch('/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

    }

}