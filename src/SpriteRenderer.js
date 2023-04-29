
class SpriteRenderer
{
    sprites;

    #renderPipeline;

    #instanceValues;
    #instanceBuffer;

    constructor()
    {
        // Draw doesn't map the vertices to the triangles, while drawIndexed does
        // This is already done in the parser, and probably is worse, because we transform more vertices

        this.#renderPipeline = Engine.shaderLibrary.createProgram(VertexShaderTypes.sprite,
            FragmentShaderTypes.sprite, VertexDescriptorTypes.None);



    }

    doRender(renderEncoder)
    {

    }

}