let i = 0
const SceneTypes =
{
    titleScene: i++,
    mainGame: i++
}

class SceneManager
{
    #currentScene;

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
            case SceneTypes.mainGame:
                this.#currentScene = new TankScene();
        }
    }

    doUpdate = ()=> {
        this.#currentScene.update()

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
        this.#currentScene.render(passEncoder);
        passEncoder.end();
        Main.device.queue.submit([commandEncoder.finish()]); }

}