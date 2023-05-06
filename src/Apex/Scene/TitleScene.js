
class TitleScene extends Scene
{
    floor;
    tank;

    constructor() {
        super();
        this.floor = new GameObject("Floor", ModelTypes.plane, SpriteTypes.woodenFloor);
        this.tank = new GameObject("Tank", ModelTypes.tank, SpriteTypes.blueTank);

        mat4.perspective(this.projectionMatrix, 0.25, Main.canvas.width / Main.canvas.height, 0.1, 1000.0);



    }
}