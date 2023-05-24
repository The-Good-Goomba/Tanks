
class TitleScene extends Scene
{
    floor;
    tank;
    title;

    constructor() {
        super();
        this.floor = new GameObject("Floor", ModelTypes.plane, SpriteTypes.woodenFloor);
        this.tank = new GameObject("Tank", ModelTypes.tank, SpriteTypes.blueTank);

        mat4.lookAt(this.viewMatrix, [0, 10, 10], [0, 0, 0], [0,1,-1]);
        mat4.perspective(this.projectionMatrix, 0.25, Main.canvas.width / Main.canvas.height, 0.1, 1000.0);

        this.floor.setUniformScale(10);
        this.floor.setPosition(0,-7,-4);

        this.tank.setUniformScale(7);
        this.tank.setRotationZ(-0.01);
        this.tank.setPosition(0,-5,-5);

        this.title = new TextSprite();
        this.title.zIndex = 1;
        this.title.text = "BRUH";

        this.addText(this.title);

        this.addChild(this.floor);
        this.addChild(this.tank);
    }

    doUpdate() {
        super.doUpdate();
        this.tank.rotate(0,0.01,0);
        this.tank.setPositionY(Math.sin(Main.totalGameTime) * 0.5 - 5);
    }
}