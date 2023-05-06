
class TitleScene extends Scene
{
    floor;
    tank;

    constructor() {
        super();
        this.floor = new GameObject("Floor", ModelTypes.plane, SpriteTypes.woodenFloor);
        this.tank = new GameObject("Tank", ModelTypes.tank, SpriteTypes.blueTank);

        mat4.lookAt(this.viewMatrix, [0, 10, 10], [0, 0, 0], [0,1,-1]);
        mat4.perspective(this.projectionMatrix, 0.25, Main.canvas.width / Main.canvas.height, 0.1, 1000.0);

        this.floor.setUniformScale(4);
        this.tank.setUniformScale(7);
        this.tank.setRotationX(Math.PI * 0.25);

        this.addChild(this.floor);
        this.addChild(this.tank);
    }
}