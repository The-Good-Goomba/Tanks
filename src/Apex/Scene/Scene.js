
class Scene extends Apex
{
    spriteRenderer;

    constructor()
    {
        super("Scene");
        this.toRender = false;
        mat4.identity(this.viewMatrix);
        mat4.identity(this.projectionMatrix);
        this.spriteRenderer = new SpriteRenderer();

    }

    render(renderCommandEncoder) {
        super.render(renderCommandEncoder);
        this.spriteRenderer.doRender(renderCommandEncoder);
    }

    addSprite(sprite)
    {
        this.spriteRenderer.sprites.push(sprite);
    }

}