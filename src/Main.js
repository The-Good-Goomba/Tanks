class Main
{
    static context;
    static canvas;
    static adapter;
    static device;

    static clearColour = { r: 0.0, g: 0.0, b: 0.0, a: 1.0 };
    static wiggleRoom = 0.001;
    static #frameRate = 60;
    static colourFormat;

    static sceneManager;

    static get frameRate()
    {
        return Main.#frameRate;
    }

    static get deltaTime()
    {
        return 1/Main.frameRate;
    }

    static async InitApp() {

        if(!navigator.gpu) {
            throw Error('WebGPU not supported.');
        }
        Main.adapter = await navigator.gpu.requestAdapter();
        if (!Main.adapter) {
            throw Error('No adapter found.');
        }

        Main.device = await Main.adapter.requestDevice();

        Main.canvas = document.getElementById('game-surface');
        Main.context = Main.canvas.getContext('webgpu');

        Main.context.configure({
            device: Main.device,
            format: navigator.gpu.getPreferredCanvasFormat(),
            alphaMode: 'premultiplied'
        });

        Main.colourFormat = navigator.gpu.getPreferredCanvasFormat();

        Keyboard.Initialise();
        Mouse.Initialise();

        await Engine.Initialise();

        this.sceneManager = new SceneManager(SceneTypes.titleScene, Main.RunApp());
    };

    static RunApp()
    {

        let loop = () =>
        {
            let begin = new Date()
            this.sceneManager.doUpdate()
            let timeTaken = (new Date()) - begin;

            setTimeout( () =>{
                requestAnimationFrame(loop);
            }, (1000 / this.frameRate) - timeTaken)
        }
        requestAnimationFrame(loop);

    }

}
