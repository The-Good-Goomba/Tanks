
class ExternalScene
{
    gameObjects = {};
    projectionMatrix;
    viewMatrix;

    spriteRenderer;
    textRenderer;
    buttonHandler;

    Initialise(data)
    {
        this.spriteRenderer = new SpriteRenderer();
        this.textRenderer = new TextRenderer();
        this.buttonHandler = new ButtonHandler();

        this.projectionMatrix = data.projectionMatrix;
        this.viewMatrix = data.viewMatrix;

        for (let child of data.children)
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

            if (child.objectType === 0) {
                // 3D object
                this.gameObjects[child.id].viewMatrix = this.viewMatrix;
                this.gameObjects[child.id].projectionMatrix = this.projectionMatrix;
            }
     
        }

        for (let sus in this.gameObjects)
        {
            if (!includedID.includes(sus)) {
                delete this.gameObjects[sus]
            }
        }
    }
    render(renderEncoder) {
        for (let childName in this.gameObjects)
        {
            if (!(this.gameObjects[childName] instanceof ModelObject)) { continue; }
            this.gameObjects[childName].doRender(renderEncoder);
        }
        this.spriteRenderer.doRender(renderEncoder);
        this.textRenderer.doRender(renderEncoder);
    }
    updateChild(child)
    {
        if (child.toDestroy) {
            delete this.gameObjects[child.id];
        } else if (child.objectType === 0) {
            // 3D object
            this.gameObjects[child.id].modelMatrix = ExternalScene.decodeFloat32Array(child.modelMatrix);
            this.gameObjects[child.id].jointMatrices = ExternalScene.decodeFloat32Array(child.jointMatrices) ?? mat4.create();
        } else if (child.objectType === 1) {
            // 2D sprite
            this.gameObjects[child.id].position = child.position
            this.gameObjects[child.id].zIndex = child.zIndex;
            this.gameObjects[child.id].size = child.size;
        } else if (child.objectType === 2) {
            // text
            this.gameObjects[child.id].zIndex = child.zIndex;
            this.gameObjects[child.id].position = child.position;
            this.gameObjects[child.id].size = child.size;
            this.gameObjects[child.id].text = child.text
            this.gameObjects[child.id].font = child.font
            this.gameObjects[child.id].fontSize = child.fontSize
            this.gameObjects[child.id].colour = child.colour
            this.gameObjects[child.id].stroke = child.stroke
            this.gameObjects[child.id].strokeColour = child.strokeColour
        }
    }
    addChild(child)
    {
        if (child.objectType === 0) {
            // 3D object
            this.gameObjects[child.id] = new ModelObject(child.model,child.sprite);
            this.gameObjects[child.id].modelMatrix = ExternalScene.decodeFloat32Array(child.modelMatrix);
            this.gameObjects[child.id].jointMatrices = ExternalScene.decodeFloat32Array(child.jointMatrices) ?? mat4.create();
        } else if (child.objectType === 1) {
            // 2D sprite
            this.gameObjects[child.id] = new Object2D(child.sprite);
            this.gameObjects[child.id].position = child.position
            this.gameObjects[child.id].zIndex = child.zIndex;
            this.gameObjects[child.id].size = child.size;
            this.addSprite(this.gameObjects[child.id]);
        } else if (child.objectType === 2) {
            // text
            this.gameObjects[child.id] = new TextSprite();
            this.gameObjects[child.id].zIndex = child.zIndex;
            this.gameObjects[child.id].position = child.position;
            this.gameObjects[child.id].size = child.size;
            this.gameObjects[child.id].text = child.text
            this.gameObjects[child.id].font = child.font
            this.gameObjects[child.id].fontSize = child.fontSize
            this.gameObjects[child.id].colour = child.colour
            this.gameObjects[child.id].stroke = child.stroke
            this.gameObjects[child.id].strokeColour = child.strokeColour
            this.addText(this.gameObjects[child.id]);
        } else if (child.objectType === 3) {
            this.gameObjects[child.id] = new Button2D(child.sprite, child.text);
            this.gameObjects[child.id].position = child.position;
            this.gameObjects[child.id].pressHandler = this.buttonFunctions(child.command);
        }
    }

    static decodeFloat32Array(arr)
    {
        return new Float32Array(Object.values(JSON.parse(arr)));
    }

    addSprite(sprite)
    {
        this.spriteRenderer.addSprite(sprite);
    }
    addText(text)
    {
        this.textRenderer.addSprite(text);
    }
    addButton(button)
    {
        if (button instanceof Button2D) {
            this.addSprite(button.sprite);
            if (button.text) this.addText(button.text);
            this.buttonHandler.addButton(button);

        }
    }

    buttonFunctions(command)
    {
        return () => {
            data = {
                playerID: this.playerID,
                command: command
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

}
