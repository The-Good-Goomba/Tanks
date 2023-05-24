
class Scene extends Apex
{
    spriteRenderer;
    textRenderer;

    constructor()
    {
        super("Scene");
        this.toRender = false;
        mat4.identity(this.viewMatrix);
        mat4.identity(this.projectionMatrix);
        this.spriteRenderer = new SpriteRenderer();
        this.textRenderer = new TextRenderer();
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

}