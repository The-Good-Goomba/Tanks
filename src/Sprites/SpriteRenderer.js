
class SpriteRenderer
{
    _sprites = [];


    addSprite(x) {
         this._sprites.push(x);
         this.updateBufferLength();
    }
    updateBufferLength()
    {
        this.#instanceBuffer = Main.device.createBuffer({
            size: (9 * 4 * this._sprites.length),
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
    }

    renderPipeline;

    #instanceValues;
    #instanceBuffer;

    bindGroup;
    sampler;


    constructor()
    {
        // Draw doesn't map the vertices to the triangles, while drawIndexed does
        // This is already done in the parser, and probably is worse, because we transform more vertices

        this.renderPipeline = Engine.shaderLibrary.createProgram(VertexShaderTypes.sprite,
            FragmentShaderTypes.sprite, VertexDescriptorTypes.Sprite);

        this.sampler = Main.device.createSampler({
            magFilter: 'linear',
            minFilter: 'nearest',
        });


        this.initBindGroups()
    }

    async initBindGroups()
    {
        let tex = await Engine.textureLibrary.getTexture(TextureTypes.bigSheet);

        this.bindGroup = Main.device.createBindGroup({
            layout: this.renderPipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: this.sampler },
                { binding: 1, resource: tex.createView()},
            ]
        });
    }

    updateInstances()
    {
        this.#instanceValues =   new Float32Array(9 * this._sprites.length);
        let i = 0
        for (let sprite of this._sprites)
        {
            this.#instanceValues.set(sprite.instanceData, i);
            i += 9;
        }
        Main.device.queue.writeBuffer(this.#instanceBuffer, 0, this.#instanceValues);
    }



    doRender(renderEncoder)
    {
        if (this._sprites.length === 0) { return; }
        this.updateInstances()
        renderEncoder.setPipeline(this.renderPipeline);
        renderEncoder.setVertexBuffer(0,this.#instanceBuffer);
        renderEncoder.setBindGroup(0, this.bindGroup);

        renderEncoder.draw(6,this._sprites.length);
    }

}