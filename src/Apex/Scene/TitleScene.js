
class TitleScene extends Scene
{
    floor;
    sus;

    constructor() {
        super();
        this.floor = new Object2D(SpriteTypes.woodenFloor);
        this.sus = new Object2D(SpriteTypes.ashTank);

        this.sus.position = [-1,-1];

        this.projectionMatrix =

        this.addSprite(this.floor);
        this.addSprite(this.sus);
    }
}