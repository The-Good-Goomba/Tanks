
class ShaderLibrary
{
    #module;

    Initialise()
    {
        return new Promise(async (resolve) => {
            // Amound of shaders
            let shaderText = await ResourceLoader.loadTextResource("/src/Shaders/shader.wgsl");
            this.#module = Main.device.createShaderModule({
                code: shaderText
            });
            resolve();

        });
    }

    createProgram(vert, frag, vertexDescriptor)
    {

        // Maybe add depth stencil?
        const pipelineDescriptor = {
            vertex: {
                module: this.#module,
                entryPoint: vert,
                buffers: vertexDescriptor
            },
            fragment: {
                module: this.#module,
                entryPoint: frag,
                targets: [{
                    format: navigator.gpu.getPreferredCanvasFormat()
                }]
            },
            primitive: {
                topology: 'triangle-list',
                cullMode: 'back',
            },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus',
            },
            layout: 'auto'
        };


        return Main.device.createRenderPipeline( pipelineDescriptor );
    }

}