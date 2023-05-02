
class TankScene extends ExternalScene
{

    playerID;
    async Initialise(codeBlock)
    {
        let data = await ResourceLoader.loadJSONResource('/start');
        this.playerID = data.id;
        data = await ResourceLoader.loadJSONResource(`/initServer/${this.playerID}`);
        super.Initialise(data.projectionMatrix, data.viewMatrix, data.children);
        if (typeof codeBlock === 'function') { codeBlock(); }
    }

    async update() {
        if (this.playerID === undefined) { return; }
        let data = await ResourceLoader.loadJSONResource(`/getGameData/${this.playerID}`);
        this.viewMatrix = ExternalScene.decodeFloat32Array(data.viewMatrix);
        this.projectionMatrix = ExternalScene.decodeFloat32Array(data.projectionMatrix);
        super.update(data.children);

        data = {
            a: Keyboard.isKeyDown('a') || false,
            s: Keyboard.isKeyDown('s') || false,
            w: Keyboard.isKeyDown('w') || false,
            d: Keyboard.isKeyDown('d') || false,
            mousePos: Mouse.mousePos ?? [0.5,0.5],
            leftMouse: Mouse.isMouseButtonDown(0) || false,
            rightMouse: Mouse.isMouseButtonDown(1) || false,
            playerID: this.playerID,
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