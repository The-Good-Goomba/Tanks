
class JoinRoomScene extends Scene
{
    roomCode = "";
    roomCodeText;
    joinButton;

    background;

    rightButton;
    leftButton;
    selectedSprite;
    selectedTank;
    rightTank;
    leftTank;

    constructor()
    {
        super();

        mat4.lookAt(this.viewMatrix, [0, 10, 10], [0, 0, 0], [0,1,-1]);
        mat4.perspective(this.projectionMatrix, 0.25, Main.canvas.width / Main.canvas.height, 0.1, 1000.0);

        this.joinButton = new Button2D(SpriteTypes.balsa,"Join Room");
        this.joinButton.pressHandler = this.goToScene
        this.joinButton.position = [-0.25,-0.5];

        this.roomCodeText = new TextSprite();
        this.roomCodeText.text = this.roomCode;
        this.roomCodeText.position = [-0.25,-0.95];

        this.selectedSprite = SpriteTypes.blueTank;
        this.selectedTank = new GameObject("Tank Selector",ModelTypes.tank,SpriteTypes.blueTank);
        this.selectedTank.setScale(5,5,5);
        this.selectedTank.setPosition(0,0.5,0);

        this.rightTank = new GameObject("Right Tank", ModelTypes.tank, SpriteTypes.redTank);
        this.rightTank.setScale(4,4,4);
        this.rightTank.setPosition(1.8,0.7,0);

        this.leftTank = new GameObject("Left Tank", ModelTypes.tank, SpriteTypes.whiteTank);
        this.leftTank.setScale(4,4,4);
        this.leftTank.setPosition(-1.8,0.7,0);

        this.leftButton = new Button2D(SpriteTypes.cork,"<");
        this.leftButton.size = [0.2,0.2];
        this.leftButton.position = [-0.75,-0.375];
        this.leftButton.pressHandler = () => { this.changeColour(10); }

        this.rightButton = new Button2D(SpriteTypes.cork,">");
        this.rightButton.size = [0.2,0.2];
        this.rightButton.position = [0.5,-0.375];
        this.rightButton.pressHandler = () => { this.changeColour(1); }

        this.background = new GameObject("Floor", ModelTypes.plane, SpriteTypes.woodenFloor);
        this.background.setUniformScale(10);
        this.background.setPosition(0,-7,-4);

        this.addButton(this.leftButton);
        this.addButton(this.rightButton);
        this.addChild(this.selectedTank);
        this.addChild(this.rightTank);
        this.addChild(this.leftTank);
        this.addChild(this.background);
        this.addText(this.roomCodeText);
        this.addButton(this.joinButton);

        document.addEventListener("keydown", (event) => {
            if (!isNaN(Number(event.key))) {
                if (this.roomCode.length < 3) { this.roomCode += event.key; }
            } else if (event.key === 'Backspace') {
                this.roomCode = this.roomCode.slice(0, -1);
            }
        });
    }

    doUpdate() {
        super.doUpdate();
        this.roomCodeText.text = this.roomCode;

        // Spin the tanks
        this.selectedTank.setPositionY(0.9 + 0.1 * Math.cos(2 * Main.totalGameTime))
        this.selectedTank.setRotationY(0.2 * Main.totalGameTime);

        this.rightTank.setPositionY(0.7 + 0.1 * Math.cos(2 * Main.totalGameTime))
        this.rightTank.setRotationY(0.3 + 0.2 * Main.totalGameTime);

        this.leftTank.setPositionY(0.7 + 0.1 * Math.cos(2 * Main.totalGameTime))
        this.leftTank.setRotationY(-0.3 + 0.2 * Main.totalGameTime);

    }

    goToScene = async () =>
    {
        let scn = new TankScene();
        let sus = await scn.Initialise("bruh",false, Number(this.roomCode),this.selectedSprite);
        if(sus === 'Successfully connected') {
            Main.canvas.removeEventListener('mousedown', this.buttonHandler.mouseDownEvent);
            Main.canvas.removeEventListener('mouseup', this.buttonHandler.mouseUpEvent);
            Main.sceneManager.createScene(scn);
        } else {
            alert(sus);
        }

    }

    changeColour = (increment) =>
    {
        this.selectedSprite += increment;
        this.selectedSprite %= 11;

        let tex = (this.selectedSprite + 1) % 11;
        this.rightTank.modelObject.useBaseColourTexture(tex);

        tex = (this.selectedSprite + 10) % 11;
        this.leftTank.modelObject.useBaseColourTexture(tex);

        this.selectedTank.modelObject.useBaseColourTexture(this.selectedSprite);
    }

}