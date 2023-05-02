let i = 0
const SceneTypes =
{
    titleScene: i++,
    mainGame: i++
}

class SceneManager
{
    #currentScene;
    sceneID;

    players = [];

    constructor(type, id)
    {
        this.setScene(type)
        this.sceneID = id;
        this.#currentScene.sceneID = id;
    }

    currentScene = () =>
    {
        return this.#currentScene
    }

    setScene = (type) =>
    {
        switch (type)
        {
            case SceneTypes.titleScene:

        }
    }

    doUpdate = ()=> { this.#currentScene.update() }

}