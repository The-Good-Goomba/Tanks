class Engine
{
    static #modelLibrary;
    static get modelLibrary(){ return this.#modelLibrary }

    static #textureLibrary;
    static get textureLibrary(){ return this.#textureLibrary }

    static #shaderLibrary;
    static get shaderLibrary(){ return this.#shaderLibrary }

    static async Initialise()
    {
        return new Promise(async (resolve) => {
            Engine.#textureLibrary = new TextureLibrary();
            await Engine.#textureLibrary.Initialise();
            Engine.#modelLibrary = new ModelLibrary();
            await Engine.#modelLibrary.Initialise();
            Engine.#shaderLibrary = new ShaderLibrary();
            await Engine.#shaderLibrary.Initialise();
            resolve();
        });

    }

    static makeBuffer = (data) =>
    {
        const buffer = Main.device.createBuffer({
            size: data.byteLength, // make it big enough to store vertices in
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        Main.device.queue.writeBuffer(buffer, 0, data, 0, data.length);
        return buffer;
    }

}