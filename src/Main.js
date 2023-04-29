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
    static playerID;

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

        let data = await ResourceLoader.loadJSONResource('/start');
        Main.playerID = data.id;
        data = await ResourceLoader.loadJSONResource(`/initServer/${Main.playerID}`);

        Scene.Initialise(data.projectionMatrix, data.viewMatrix, data.children);
        this.RunApp();

    };

    static RunApp()
    {

        let loop = () =>
        {
            let begin = new Date()
            Main.DoUpdate();
            let timeTaken = (new Date()) - begin;

            setTimeout( () =>{
                requestAnimationFrame(loop);
            }, (1000 / this.frameRate) - timeTaken)
        }
        requestAnimationFrame(loop);

    }

    static async DoUpdate()
    {
        let data = await ResourceLoader.loadJSONResource(`/getGameData/${Main.playerID}`);
        Scene.viewMatrix = Scene.decodeFloat32Array(data.viewMatrix);
        Scene.projectionMatrix = Scene.decodeFloat32Array(data.projectionMatrix);
        Scene.update(data.children)

        const sampleCount = 1;
        const newDepthTexture = Main.device.createTexture({
            size: [Main.canvas.width, Main.canvas.height],
            format: 'depth24plus',
            sampleCount,
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
        const commandEncoder = Main.device.createCommandEncoder();
        const renderPassDescriptor = {
            colorAttachments: [{
                clearValue: Main.clearColour,
                loadOp: 'clear',
                storeOp: 'store',
                view: Main.context.getCurrentTexture().createView()
            }],
            depthStencilAttachment: {
                view: newDepthTexture.createView(),
                depthClearValue: 1,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
            },

        };
        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

        Scene.render(passEncoder);

        passEncoder.end();
        Main.device.queue.submit([commandEncoder.finish()]);
    }

}
