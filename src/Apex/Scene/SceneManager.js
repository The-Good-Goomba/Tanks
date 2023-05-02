let i = 0
const SceneTypes =
{
    titleScene: i++,
    mainGame: i++
}

class SceneManager
{
    #currentScene;

    players = [];

    constructor(type)
    {
        this.setScene(type)
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