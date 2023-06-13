class Main
{
    static context;
    static canvas;
    static adapter;
    static device;

    static clearColour = { r: 0.0, g: 0.0, b: 0.0, a: 1.0 };
    static wiggleRoom = 0.001;
    static #frameRate = 40;
    static #totalGameTime = 0;

    static colourFormat;

    static sceneManager;

    static get frameRate()
    {
        return Main.#frameRate;
    }

    static get deltaTime()
    {
        return 1/Main.#frameRate;
    }

    static  get totalGameTime()
    {
        return Main.#totalGameTime;
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

        Main.sceneManager = new SceneManager(SceneTypes.titleScene, Main.RunApp);
    };

    static RunApp()
    {

        let loop = () =>
        {
            Main.#totalGameTime += Main.deltaTime;
            let begin = new Date()
            Main.sceneManager.doUpdate()
            let timeTaken = (new Date()) - begin;

            setTimeout( () =>{
                requestAnimationFrame(loop);
            }, (1000 / Main.frameRate) - timeTaken)
        }
        requestAnimationFrame(loop);

    }

}
