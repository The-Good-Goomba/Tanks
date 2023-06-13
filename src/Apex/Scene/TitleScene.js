
class TitleScene extends Scene
{
    floor;
    tank;
    title;
    joinRoom;
    createRoom;


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

        this.title = new Title("TANKS");
        this.createRoom = new Button2D(SpriteTypes.cork,"Create Room");
        this.joinRoom = new Button2D(SpriteTypes.cork,"Join Room");

        this.joinRoom.position = [0.2,-0.5]
        this.joinRoom.size = [0.3,0.3]

        this.createRoom.position = [-0.5,-0.5]
        this.createRoom.size = [0.3,0.3]

        this.createRoom.pressHandler = () =>
        {
            Main.sceneManager.setScene(SceneTypes.mainGame);
        }


        this.addButton(this.createRoom);
        this.addButton(this.joinRoom);
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

class Title extends TextSprite
{
    constructor(word) {
        super();
        this.zIndex = 0.9;
        this.text = word;
        this.size = [0.7,1]
        this.position = [-0.35,-0.3]
        this.colour = "#5ac4f1"
        this.stroke = 2;
    }
}