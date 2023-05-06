
class Object2D
{
    position = [0,0];
    size = [0.5,0.5];
    zIndex = 0.0;
    sprite;
    // tileAmount = [1,1];

    constructor(type)
    {
        this.sprite = Engine.textureLibrary.getSprite(type);
    }

    get instanceData()
    {
        return new Float32Array([...this.position,this.zIndex,...this.size,...this.sprite.pos,...this.sprite.size]);
    }

    move(amount)
    {
        this.position[0] += amount[0];
        this.position[1] += amount[1];
    }

}