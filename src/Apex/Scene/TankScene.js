
class TankScene extends ExternalScene
{

    playerID;
    roomID;
    async Initialise(codeBlock, createNew = true, serverID = undefined)
    {
        let data = await ResourceLoader.loadJSONResource('/start');
        this.playerID = data.id;
        if (createNew) {
            data = await ResourceLoader.loadJSONResource(`/initServer/${this.playerID}`);
            this.roomID = data.serverID;
            return false;
        } else {
            this.roomID = serverID;
            await ResourceLoader.loadJSONResource(`/joinServer/${this.roomID}/${this.playerID}`);
            data = await ResourceLoader.loadJSONResource(`/getGameData/${this.playerID}`);
        }
        super.Initialise(data);

        if (typeof codeBlock === 'function') { codeBlock(); }
        return true;
    }

    async update() {
        if (this.playerID === undefined) { return; }
        let data = await ResourceLoader.loadJSONResource(`/getGameData/${this.playerID}`);
        this.viewMatrix = ExternalScene.decodeFloat32Array(data.viewMatrix);
        this.projectionMatrix = ExternalScene.decodeFloat32Array(data.projectionMatrix);
        super.update(data.children);

        if (Keyboard.isKeyDown(' ')) console.log(this.roomID);

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