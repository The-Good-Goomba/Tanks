
class Scene
{
    static gameObjects = {};
    static projectionMatrix;
    static viewMatrix;
    static Initialise(proj, view, children)
    {
        Scene.projectionMatrix = proj;
        Scene.viewMatrix = view;
        for (let child of children)
        {
            Scene.addChild(child)
        }
    }

    static update( children )
    {
        let includedID = []
        for (let child of children)
        {
            if (Scene.gameObjects[child.id] === undefined) {
                Scene.addChild(child)
            } else { Scene.updateChild(child); }
            includedID.push(child.id.toString());
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
    static render(renderEncoder) {
        for (let childName in Scene.gameObjects)
        {
            Scene.gameObjects[childName].doRender(renderEncoder);
        }
    }
    static updateChild(child)
    {
        if (child.toDestroy) {
            delete Scene.gameObjects[child.id];
        } else if (child.dimensions === 1) {
            Scene.gameObjects[child.id].modelMatrix = Scene.decodeFloat32Array(child.modelMatrix);
            Scene.gameObjects[child.id].jointMatrices = Scene.decodeFloat32Array(child.jointMatrices) ?? mat4.create();
        }
    }
    static addChild(child)
    {
        if (child.dimensions === 1) {
            Scene.gameObjects[child.id] = new GameObject(child.id,child.model,child.sprite);
            Scene.gameObjects[child.id].modelMatrix = Scene.decodeFloat32Array(child.modelMatrix);
            Scene.gameObjects[child.id].jointMatrices = Scene.decodeFloat32Array(child.jointMatrices) ?? mat4.create();
        }
    }

    static decodeFloat32Array(arr)
    {
        return new Float32Array(Object.values(JSON.parse(arr)));
    }

}
