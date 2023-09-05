class ModelObject
{
    modelMatrix = mat4.create();
    get normalMatrix()
    {
        let ret = mat4.create();
        mat4.invert(ret,this.modelMatrix);
        mat4.transpose(ret,ret);
        return ret;
    }

    viewMatrix;
    projectionMatrix;
    opacity = 1.0;

    jointMatrices;
    #renderPipeline;
    #sprite;
    mesh;
    bindGroup;
    sampler;

    vertexUniformValues;
    vertexUniformBuffer;

    fragmentUniformValues;
    fragmentUniformBuffer;

    constructor(type, sprite)
    {
        this.#sprite = Engine.textureLibrary.getSprite(sprite);
        this.#renderPipeline = Engine.shaderLibrary.createProgram(VertexShaderTypes.default,
            FragmentShaderTypes.default, VertexDescriptorTypes.Basic);

        this.mesh = Engine.modelLibrary.get(type);

        this.sampler = Main.device.createSampler({
            magFilter: 'nearest',
            minFilter: 'nearest',
        });

        const bufferSize = (16 * 4 + 2 * 2 + 16 * this.mesh.groupCount)
        this.vertexUniformBuffer = Main.device.createBuffer({
            size: (bufferSize * 4 ),
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });
        this.vertexUniformValues = new Float32Array(bufferSize);
        // this.vertexUniformValues.set(this.modelMatrix, 0); // mModel
        // this.vertexUniformValues.set(this.normalMatrix, 16); // mModel
        // this.vertexUniformValues.set(this.viewMatrix, 32); // mView
        // this.vertexUniformValues.set(this.projectionMatrix, 48); // mProjection
        this.vertexUniformValues.set(this.#sprite.pos, 64); // spritePos
        this.vertexUniformValues.set(this.#sprite.size, 66); // spriteSize
        // this.vertexUniformValues.set(this.flattenedJointMatrices, 68); // jointMatrices Array

        this.fragmentUniformBuffer = Main.device.createBuffer({
            size: 32,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        this.fragmentUniformValues = [];
        this.fragmentUniformValues.push(...[0.0,10.0,0.0,0.0]); // LightPos
        this.fragmentUniformValues.push(...[0.0,0.0,0.0]); // lightColour
        this.fragmentUniformValues.push(this.opacity);

        Main.device.queue.writeBuffer(this.vertexUniformBuffer, 0, this.vertexUniformValues);
        Main.device.queue.writeBuffer(this.fragmentUniformBuffer, 0, new Float32Array(this.fragmentUniformValues));
        this.initBindGroups();
    }

    async initBindGroups()
    {
        let tex = await Engine.textureLibrary.getTexture(0);

        this.bindGroup = Main.device.createBindGroup({
            layout: this.#renderPipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.vertexUniformBuffer} },
                { binding: 1, resource: { buffer: this.fragmentUniformBuffer} },
                { binding: 2, resource: this.sampler },
                { binding: 3, resource: tex.createView()},
            ]
        });
    }

    rebuildUniformBuffers()
    {
        this.vertexUniformValues.set(this.modelMatrix, 0); // mModel
        this.vertexUniformValues.set(this.normalMatrix, 16); // mModel
        this.vertexUniformValues.set(this.viewMatrix, 32); // mView
        this.vertexUniformValues.set(this.projectionMatrix, 48); // mProjection
        this.vertexUniformValues.set(this.jointMatrices, 68); // jointMatrices Array
        Main.device.queue.writeBuffer(this.vertexUniformBuffer, 0,this.vertexUniformValues);
        if (this.opacity != 1) {console.log(this.opacity);}
        this.fragmentUniformValues.pop();
        this.fragmentUniformValues.push(this.opacity);
        Main.device.queue.writeBuffer(this.fragmentUniformBuffer, 0, new Float32Array(this.fragmentUniformValues));
    }


    doRender(renderCommandEncoder) {
        this.rebuildUniformBuffers();

        if (this.bindGroup == null) { return; }
        renderCommandEncoder.setPipeline(this.#renderPipeline);

        renderCommandEncoder.setVertexBuffer(0, this.mesh.positions);
        renderCommandEncoder.setVertexBuffer(1, this.mesh.texCoords);
        renderCommandEncoder.setVertexBuffer(2, this.mesh.normals);
        renderCommandEncoder.setVertexBuffer(3, this.mesh.groups);

        renderCommandEncoder.setBindGroup(0, this.bindGroup);

        renderCommandEncoder.draw(this.mesh.vertexCount);
    }

    useBaseColourTexture(type)
    {
        if (type === SpriteTypes.none) {
            return;
        }
        this.#sprite = Engine.textureLibrary.getSprite(type);
        this.vertexUniformValues.set(this.#sprite.pos, 64); // spritePos
        this.vertexUniformValues.set(this.#sprite.size, 66); // spriteSize
    }
}

