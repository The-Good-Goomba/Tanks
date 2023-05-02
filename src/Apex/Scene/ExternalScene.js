
class ExternalScene
{
    gameObjects = {};
    projectionMatrix;
    viewMatrix;
    Initialise(proj, view, children)
    {
        this.projectionMatrix = proj;
        this.viewMatrix = view;
        for (let child of children)
        {
            this.addChild(child)
        }
    }

    update( children )
    {
        let includedID = []
        for (let child of children)
        {
            if (this.gameObjects[child.id] === undefined) {
                this.addChild(child)
            } else { this.updateChild(child); }
            includedID.push(child.id.toString());
            this.gameObjects[child.id].viewMatrix = this.viewMatrix;
            this.gameObjects[child.id].projectionMatrix = this.projectionMatrix;
        }

        for (let sus in this.gameObjects)
        {
            if (!includedID.includes(sus)) {
                delete this.gameObjects[sus]
            }
        }

        let data = {
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
    render(renderEncoder) {
        for (let childName in this.gameObjects)
        {
            this.gameObjects[childName].doRender(renderEncoder);
        }
    }
    updateChild(child)
    {
        if (child.toDestroy) {
            delete this.gameObjects[child.id];
        } else if (child.dimensions === 1) {
            this.gameObjects[child.id].modelMatrix = ExternalScene.decodeFloat32Array(child.modelMatrix);
            this.gameObjects[child.id].jointMatrices = ExternalScene.decodeFloat32Array(child.jointMatrices) ?? mat4.create();
        }
    }
    addChild(child)
    {
        if (child.dimensions === 1) {
            this.gameObjects[child.id] = new GameObject(child.id,child.model,child.sprite);
            this.gameObjects[child.id].modelMatrix = ExternalScene.decodeFloat32Array(child.modelMatrix);
            this.gameObjects[child.id].jointMatrices = ExternalScene.decodeFloat32Array(child.jointMatrices) ?? mat4.create();
        }
    }

    static decodeFloat32Array(arr)
    {
        return new Float32Array(Object.values(JSON.parse(arr)));
    }

}
