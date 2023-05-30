
class Scene extends Apex
{
    spriteRenderer;
    textRenderer;
    buttonHandler;

    constructor()
    {
        super("Scene");
        this.toRender = false;
        mat4.identity(this.viewMatrix);
        mat4.identity(this.projectionMatrix);
        this.spriteRenderer = new SpriteRenderer();
        this.textRenderer = new TextRenderer();
        this.buttonHandler = new ButtonHandler();
    }

    render(renderCommandEncoder) {
        super.render(renderCommandEncoder);
        this.spriteRenderer.doRender(renderCommandEncoder);
        this.textRenderer.doRender(renderCommandEncoder);
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

}