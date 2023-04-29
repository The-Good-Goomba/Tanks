
class SpriteRenderer
{
    sprites = [];

    #renderPipeline;

    #instanceValues;
    #instanceBuffer;

    constructor()
    {
        // Draw doesn't map the vertices to the triangles, while drawIndexed does
        // This is already done in the parser, and probably is worse, because we transform more vertices

        this.#renderPipeline = Engine.shaderLibrary.createProgram(VertexShaderTypes.sprite,
            FragmentShaderTypes.sprite, VertexDescriptorTypes.Sprite);

    }

    updateInstances()
    {
        this.#instanceValues = new ArrayBuffer(4 * 9 * this.sprites.length)
        let floatArray =   new Float32Array(this.#instanceBuffer);
        let uintArray =   new Uint32Array(this.#instanceBuffer);
        let i = 0
        for (let sprite in this.sprites)
        {
            floatArray.set(sprite.instanceData, i);
            uintArray.set(sprite.sprite.textureType, i + 8);
            i += 9;
        }
        Main.device.queue.writeBuffer(this.#instanceBuffer, 0, this.#instanceValues);
    }

    doRender(renderEncoder)
    {

        renderEncoder.setVertexbuffer(0,this.#instanceBuffer);
        renderEncoder.draw(6,this.sprites.length);
    }

}