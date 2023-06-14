
class JoinRoomScene extends Scene
{
    roomCode = "";
    joinButton;


    constructor()
    {
        super();
        this.joinButton = new Button2D(SpriteTypes.oak,"Join Room");
        this.joinButton.pressHandler = this.goToScene

        this.addButton(this.joinButton)

        document.addEventListener("keydown", (event) => {
            if (!isNaN(Number(event.key))) {
                this.roomCode += event.key;
            } else if (event.key === 'Backspace') {
                this.roomCode = this.roomCode.slice(0, -1);
            }
        });


    }

    goToScene = async () =>
    {
        let scn = new TankScene();
        if(await scn.Initialise("bruh",false, Number(this.roomCode))) {
            Main.sceneManager.createScene(scn);
        }
        else { console.alert("Not a valid room ID"); }
    }


}