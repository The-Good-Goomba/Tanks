
class JoinRoomScene extends Scene
{
    roomCode = "";
    joinButton;


    constructor()
    {
        super();
        this.joinButton = new Button2D(SpriteTypes.oak,"Join Room");
        this.joinButton.pressHandler = () => {
            Main.sceneManager.setScene()
        }

    }


}