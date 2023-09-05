

const VertexShaderTypes = {
    default: {func: 'vertex_main', code: 0},
    sprite: {func: 'spriteVertex_main', code:1}
}
const FragmentShaderTypes = {
    default: {func:'fragment_main', code:0},
    sprite: {func: 'spriteFragment_main', code:1}
}


const VertexDescriptorTypes = {
    None: [],
    Basic: [{
            attributes: [{
                shaderLocation: 0, // position
                offset: 0,
                format: 'float32x3'
            }],
            arrayStride: 12,
            stepMode: 'vertex'
        },
        {
            attributes: [{
                shaderLocation: 1, // texCoords
                offset: 0,
                format: 'float32x2'
            }],
            arrayStride: 8,
            stepMode: 'vertex'
        },
        {
            attributes: [{
                shaderLocation: 2, // normal
                offset: 0,
                format: 'float32x3'
            }],
            arrayStride: 12,
            stepMode: 'vertex'
        },
        {
            attributes: [{
                shaderLocation: 3, // meshMemeber
                offset: 0,
                format: 'uint32'
            }],
            arrayStride: 4,
            stepMode: 'vertex'
        }],
    Sprite: [
        {
            attributes: [{
                shaderLocation: 0, // Pos + zCoord
                offset: 0,
                format: 'float32x3'
            },{
                shaderLocation: 1, // Size
                offset: 12,
                format: 'float32x2'
            }, {
                shaderLocation: 2, // Sprite Pos
                offset: 20,
                format: 'float32x2'
            }, {
                shaderLocation: 3, // Sprite Pos
                offset: 28,
                format: 'float32x2'
            }],
            arrayStride: 36,
            stepMode: 'instance'
        }
    ]

}



class ShaderLibrary
{
    #module = [];

    Initialise()
    {
        return new Promise(async (resolve) => {
            // Amound of shaders
            let shaderText = await ResourceLoader.loadTextResource("/src/Shaders/shader.wgsl");
            this.#module[0] = Main.device.createShaderModule({ code: shaderText });

            shaderText = await ResourceLoader.loadTextResource("/src/Shaders/spriteShader.wgsl");
            this.#module[1] = Main.device.createShaderModule({ code: shaderText });

            resolve();

        });
    }

    createProgram(vert, frag, vertexDescriptor)
    {

        // Maybe add depth stencil?
        const pipelineDescriptor = {
            vertex: {
                module: this.#module[vert.code],
                entryPoint: vert.func,
                buffers: vertexDescriptor
            },
            fragment: {
                module: this.#module[frag.code],
                entryPoint: frag.func,
                targets: [{
                    format: navigator.gpu.getPreferredCanvasFormat(),
                    blend: {
                        color: {
                            operation: 'add',
                            srcFactor: 'one',
                            dstFactor: 'one-minus-src-alpha'
                        },
                        alpha: {
                            operation: 'add',
                            srcFactor: 'one',
                            dstFactor: 'one-minus-src-alpha'
                        }
                    }
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