
class TankScene extends ExternalScene
{

    playerID;
    roomID;
    displayRoomID
    async Initialise(codeBlock, createNew = true, serverID = undefined, colour = SpriteTypes.blueTank)
    {
        let data = await ResourceLoader.loadJSONResource('/start');
        this.playerID = data.id;
        if (createNew) {
            try {
                data = await ResourceLoader.loadJSONResource(`/initServer/${this.playerID}/${colour}`);
            } catch (error) { return `Couldn't create server!`; }
            this.roomID = data.serverID;
        } else {
            this.roomID = serverID;
            data = await ResourceLoader.loadTextResource(`/joinServer/${this.roomID}/${this.playerID}/${colour}`);
            if (data !== 'Successfully connected') { return data; }
            data = await ResourceLoader.loadJSONResource(`/getGameData/${this.playerID}`);
        }
        console.log(data);
        super.Initialise(data);

        if (typeof codeBlock === 'function') { codeBlock(); }
        return 'Successfully connected';
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
            command: "postPlayerData"
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