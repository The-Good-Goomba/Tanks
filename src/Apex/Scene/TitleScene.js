
class TitleScene extends Scene
{
    floor;

    constructor() {
        super();
        this.floor = new Object2D(SpriteTypes.woodenFloor);
        this.addSprite(this.floor);
    }
}