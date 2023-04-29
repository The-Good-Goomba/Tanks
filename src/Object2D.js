
class Object2D
{
    position = [0,0];
    size = [0.5,0.5];
    zIndex = 0.0;
    sprite;

    constructor(type)
    {
        this.sprite = Engine.textureLibrary.getSprite(type);
    }
    move(amount)
    {
        this.position[0] += amount[0];
        this.position[1] += amount[1];
    }

    doRender()
    {
        Main.canvas.drawImage(Engine.textureLibrary.getImage(this.sprite.textureType),
            ...this.sprite.position,
            ...this.sprite.size,
            ...this.position,
            ...this.size);
    }
}