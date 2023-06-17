
class JoinRoomScene extends Scene
{
    roomCode = "";
    roomCodeText;
    joinButton;


    constructor()
    {
        super();
        this.joinButton = new Button2D(SpriteTypes.oak,"Join Room");
        this.joinButton.pressHandler = this.goToScene
        this.joinButton.position = [-0.25,-0.5];

        this.roomCodeText = new TextSprite();
        this.roomCodeText.text = this.roomCode;
        this.roomCodeText.position = [-0.25,0];

        this.addText(this.roomCodeText);
        this.addButton(this.joinButton);

        document.addEventListener("keydown", (event) => {
            if (!isNaN(Number(event.key))) {
                this.roomCode += event.key;
            } else if (event.key === 'Backspace') {
                this.roomCode = this.roomCode.slice(0, -1);
            }
        });
    }

    doUpdate() {
        super.doUpdate();
        this.roomCodeText.text = this.roomCode;
    }

    goToScene = async () =>
    {
        let scn = new TankScene();
        if(await scn.Initialise("bruh",false, Number(this.roomCode))) {
            Main.sceneManager.createScene(scn);
        }
        else { alert("Not a valid room ID"); }
    }


}