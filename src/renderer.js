const { mat4 , vec3, quat } = glMatrix;
class Meth
{
    static normalise3 = ( v ) =>
    {
        const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        return [v[0] / length, v[1] / length, v[2] / length];
    }

    static normalise2 = ( v ) =>
    {
        const length = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
        return [v[0] / length, v[1] / length];
    }

    static multiply3x1 = ( v, m ) =>
    {
        return [v[0] * m, v[1] * m, v[2] * m];
    }

    static multiply2x1 = ( v, m) =>
    {
        return [v[0] * m, v[1] * m];
    }

    static magnitude = ( v ) =>
    {
        var mag = 0;
        for (var i = 0; i < v.length; i++)
        {
            mag += v[i] * v[i];
        }
        mag = Math.sqrt(mag);
        return mag;
    }

    static toDegrees = (radians) => radians * 180 / Math.PI;
}

let i = -1;
const TextureTypes = {
    none: i++,
    bigSheet: i++
}

i = -1
const SpriteTypes = {
    none: i++,
    // The tank colours
    blueTank: i++,
    redTank: i++,
    ashTank: i++,
    blackTank: i++,
    greenTank: i++,
    oliveTank: i++,
    marinTank: i++,
    pinkTank: i++,
    purpleTank: i++,
    violetTank: i++,
    whiteTank: i++,
    yellowTank: i++,

    // Objects
    woodenFloor: i++,
    shell: i++,
    cork: i++,
    oak: i++,
    spruce: i++,
    balsa: i++,

    // Crosses
    blueCross: i++,
    whiteCross: i++,
    redCross: i++,

    hole: i++,

}

i = 0;
const ModelTypes =
    {
        tank: i++,
        plane: i++,
        shell: i++,
        block2x2: i++,
        block2x1: i++,
        triangle: i++,
        halfCylinder: i++,
        block2x4: i++,
    }

const VertexShaderTypes = {
    default: 'vertex_main'
}

const VertexDescriptorTypes = {
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
        }]

}

const FragmentShaderTypes = {
    default: 'fragment_main'
}

i = 0
const SceneTypes =
    {
        titleScene: i++,
        mainGame: i++
    }

const start = () =>
{
    Main.InitApp();
}

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
        console.log(data)
        Main.playerID = data.id;
        data = await ResourceLoader.loadJSONResource(`/initServer/${Main.playerID}`);

        Scene.Initialise(data.projectionMatrix, data.viewMatrix, data.children);
        this.RunApp();

    };

    static RunApp()
    {

        let loop = () =>
        {
            Main.DoUpdate();
            setTimeout( () =>{
                requestAnimationFrame(loop);
            }, 1000 / this.frameRate)
        }
        requestAnimationFrame(loop);

    }

    static DoUpdate()
    {
        Scene.update()

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

class Keyboard
{
    static keys = {};

    static Initialise() {
        window.addEventListener('keydown', function(event) {
            Keyboard.keys[event.key] = true;
        });
        window.addEventListener('keyup', function(event) {
            Keyboard.keys[event.key] = false;
        });
    }

    static isKeyDown(key) {
        return Keyboard.keys[key];
    }
}

class Mouse
{
    static _mousePos = [0, 0];

    static _mouseButtons = {};

    static get mousePos() {
        return Mouse._mousePos;
    }

    static isMouseButtonDown(button) {
        return Mouse._mouseButtons[button];
    }

    static Initialise() {

        window.onmousedown = function(event) { Mouse._mouseButtons[event.button] = true; }
        window.onmouseup = function(event) { Mouse._mouseButtons[event.button] = false; }

        Main.canvas.onmousemove = Mouse.updateMousePos;
    };

    static updateMousePos(event) {
        Mouse._mousePos[0] = event.offsetX;
        Mouse._mousePos[1] = event.offsetY;
    }
}

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
        return new Promise(async (resolve, reject) => {
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

class Scene
{
    static gameObjects = {};
    static projectionMatrix;
    static viewMatrix;
    Initialise(proj, view, children)
    {
        Scene.projectionMatrix = proj;
        Scene.viewMatrix = view;
        for (let child of children)
        {
            Scene.addChild(child)
        }
    }

    static update( children )
    {
        for (let child of children)
        {
            if (Scene.gameObjects[child.id] === undefined) {
                Scene.addChild(child)
            } else { Scene.updateChild(child); }

        }
    }
    static render(renderEncoder) {
        for (let child in Scene.gameObjects)
        {
            child.doRender(renderEncoder,Scene.viewMatrix, Scene.projectionMatrix);
        }
    }
    static updateChild(child)
    {
        if (child.toDestroy) {
            delete Scene.gameObjects[child.id];
        } else if (child.dimensions === 1) {
                Scene.gameObjects[child.id].modelMatrix = child.modelMatrix;
                Scene.gameObjects[child.id].jointMatrices = child.jointMatrices ?? [mat4.create()];
        }
    }
    static addChild(child)
    {
        if (child.dimensions === 1) {
            Scene.gameObjects[child.id] = new GameObject(child.id,child.model,child.sprite);
            Scene.gameObjects[child.id].modelMatrix = child.modelMatrix;
            Scene.gameObjects[child.id].jointMatrices = child.jointMatrices ?? [mat4.create()];
        }
    }

}

class GameObject
{
    modelMatrix = mat4.create();
    get normalMatrix()
    {
        let ret = mat4.create();
        mat4.invert(ret,this.modelMatrix);
        mat4.transpose(ret,ret);
        return ret;
    }

    jointMatrices = []
    get flattenedJointMatrices()
    {
        let flattenedArray = new Float32Array(this.jointMatrices.length * 16);
        let offset = 0;

        for (let arr of this.jointMatrices) {
            flattenedArray.set(arr, offset);
            offset += arr.length;
        }
        return (flattenedArray);
    }

    #renderPipeline;
    #sprite;
    mesh;
    bindGroup;
    sampler;

    vertexUniformValues;
    vertexUniformBuffer;

    fragmentUniformValues;
    fragmentUniformBuffer;

    constructor(name, type, sprite)
    {
        this.#sprite = Engine.textureLibrary.getSprite(sprite);
        this.#renderPipeline = Engine.shaderLibrary.createProgram(VertexShaderTypes.default,
            FragmentShaderTypes.default, VertexDescriptorTypes.Basic);

        this.mesh = Engine.modelLibrary.get(type);

        for(var i = 0; i < this.mesh.groupCount; i++)
        {
            this.jointMatrices[i] = mat4.create();
        }

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
        this.vertexUniformValues.set(this.modelMatrix, 0); // mModel
        this.vertexUniformValues.set(this.normalMatrix, 16); // mModel
        this.vertexUniformValues.set(this.viewMatrix, 32); // mView
        this.vertexUniformValues.set(this.projectionMatrix, 48); // mProjection
        this.vertexUniformValues.set(this.#sprite.pos, 64); // spritePos
        this.vertexUniformValues.set(this.#sprite.size, 66); // spriteSize
        this.vertexUniformValues.set(this.flattenedJointMatrices, 68); // jointMatrices Array

        this.fragmentUniformBuffer = Main.device.createBuffer({
            size: 32,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        this.fragmentUniformValues = [];
        this.fragmentUniformValues.push(...[0.0,10.0,0.0,0.0]); // LightPos
        this.fragmentUniformValues.push(...[0.0,0.0,0.0]); // lightColour

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

    rebuildUniformBuffers(viewMatrix, projectionMatrix)
    {
        this.vertexUniformValues.set(this.modelMatrix, 0); // mModel
        this.vertexUniformValues.set(this.normalMatrix, 16); // mModel
        this.vertexUniformValues.set(viewMatrix, 32); // mView
        this.vertexUniformValues.set(projectionMatrix, 48); // mProjection
        this.vertexUniformValues.set(this.flattenedJointMatrices, 68); // jointMatrices Array

        Main.device.queue.writeBuffer(this.vertexUniformBuffer, 0,this.vertexUniformValues);
    }


    doRender(renderCommandEncoder, viewMatrix, projectionMatrix) {
        this.rebuildUniformBuffers(viewMatrix, projectionMatrix);

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

    }
}

class ModelLibrary
{
    #library = [];

    Initialise()
    {
        return new Promise(async (resolve, reject) => {
            this.#library[ModelTypes.tank] = await ModelLoader.getDataFromObj("/src/Assets/tankP.obj");
            this.#library[ModelTypes.plane] = await ModelLoader.getDataFromObj("/src/Assets/plane.obj");
            this.#library[ModelTypes.shell] = await ModelLoader.getDataFromObj("/src/Assets/shell.obj");
            this.#library[ModelTypes.block2x2] = await ModelLoader.getDataFromObj("/src/Assets/block.obj");
            this.#library[ModelTypes.block2x1] = await ModelLoader.getDataFromObj("/src/Assets/shortBlock.obj");
            this.#library[ModelTypes.triangle] = await ModelLoader.getDataFromObj("/src/Assets/triangularPrism.obj");
            this.#library[ModelTypes.halfCylinder] = await ModelLoader.getDataFromObj("/src/Assets/halfCylinder.obj");
            this.#library[ModelTypes.block2x4] = await ModelLoader.getDataFromObj("/src/Assets/longBigBlock.obj");
            resolve();
        });
    }

    get(type)
    {
        return this.#library[type]
    }

}

class ModelLoader
{
    static async getDataFromObj(url)
    {
        const fileContents = await ModelLoader.#getFileContents(url);
        const mesh = ModelLoader.#parseFile(fileContents);
        return mesh;
    }

    static #getFileContents = async (filename) =>
    {
        const file = await fetch(filename);
        const body = await file.text();
        return body;
    };

    static #stringsToNumbers = (strings) =>
    {
        const numbers = [];
        for (const str of strings)
        {
            numbers.push(parseFloat(str));
        }
        return numbers;
    }

    static #parseFile = (fileContents) =>
    {
        const positions = [];
        const texCoords = [];
        const normals = [];

        const finalPositions = [];
        const finalTexCoords = [];
        const finalNormals = [];
        const finalMembers = [];


        const lines = fileContents.split('\n');
        var pos = [0,0,0];
        var meshMember = [];
        var currentMember = 0;
        var groupCount = 0;
        for(const line of lines)
        {
            const [ command, ...values] = line.split(' ', 4);

            if (command === 'g')
            {
                var bruh = true;
                for (let i = 0;i < meshMember.length; i++)
                {
                    if ( values[0] == meshMember[i]) { currentMember = i; bruh = false }
                }
                if (bruh) { currentMember = meshMember.length; meshMember.push(values[0]);}
                if (currentMember > groupCount) { groupCount = currentMember }
            }

            if (command === 'v')
            {
                pos = ModelLoader.#stringsToNumbers(values);
                positions.push(pos);
            }
            else if (command === 'vt')
            {
                texCoords.push(ModelLoader.#stringsToNumbers(values));
            }
            else if (command === 'vn')
            {
                normals.push(ModelLoader.#stringsToNumbers(values));
            }

            else if (command === 'f')
            {

                for (const group of values)
                {
                    const [ positionIndex, texCoordIndex, normalIndex] = ModelLoader.#stringsToNumbers(group.split('/'));

                    finalPositions.push(...positions[positionIndex - 1]);
                    finalNormals.push(...normals[normalIndex - 1]);
                    finalTexCoords.push(...texCoords[texCoordIndex - 1]);
                    finalMembers.push(currentMember);
                }
            }

        }

        return { positions: Engine.makeBuffer(new Float32Array(finalPositions)),
            normals: Engine.makeBuffer(new Float32Array(finalNormals)),
            texCoords: Engine.makeBuffer(new Float32Array(finalTexCoords)),
            groups: Engine.makeBuffer(new Uint32Array(finalMembers)),
            groupCount: (groupCount + 1),
            vertexCount: finalPositions.length / 3};
    }

}

class TextureLibrary
{
    #texLibrary  = [];
    #spriteLib = [];

    Initialise()
    {
        return new Promise(async (resolve, reject) => {

            this.#texLibrary[TextureTypes.bigSheet] = await ResourceLoader.loadImageResource("/src/Assets/Textures.png");

            // Tanks
            this.#spriteLib[SpriteTypes.blueTank] = { textureType: TextureTypes.bigSheet, pos: [877,1241], size: [32,32] };
            this.#spriteLib[SpriteTypes.redTank] = { textureType: TextureTypes.bigSheet, pos: [914,1241], size: [32,32] };
            this.#spriteLib[SpriteTypes.ashTank] = { textureType: TextureTypes.bigSheet, pos: [185,1241], size: [32,32]};
            this.#spriteLib[SpriteTypes.blackTank] = { textureType: TextureTypes.bigSheet, pos: [259,1241], size: [32,32]};
            this.#spriteLib[SpriteTypes.greenTank] = { textureType: TextureTypes.bigSheet, pos: [148,1241], size: [32,32]};
            this.#spriteLib[SpriteTypes.oliveTank] = { textureType: TextureTypes.bigSheet, pos: [790,1241], size: [32,32]};
            this.#spriteLib[SpriteTypes.marinTank] = { textureType: TextureTypes.bigSheet, pos: [221,1241], size: [32,32]};
            this.#spriteLib[SpriteTypes.pinkTank] = { textureType: TextureTypes.bigSheet, pos: [4,1241], size: [32,32]};
            this.#spriteLib[SpriteTypes.purpleTank] = { textureType: TextureTypes.bigSheet, pos: [927,1172], size: [32,32]};
            this.#spriteLib[SpriteTypes.violetTank] = { textureType: TextureTypes.bigSheet, pos: [444,1241], size: [32,32]};
            this.#spriteLib[SpriteTypes.whiteTank] = { textureType: TextureTypes.bigSheet, pos: [110,1241], size: [32,32]};
            this.#spriteLib[SpriteTypes.yellowTank] = { textureType: TextureTypes.bigSheet, pos: [816,1241], size: [32,32]};

            // Objects
            this.#spriteLib[SpriteTypes.woodenFloor] = { textureType: TextureTypes.bigSheet, pos: [5,522], size: [1024,512]};
            this.#spriteLib[SpriteTypes.shell] = { textureType: TextureTypes.bigSheet, pos: [753,1241], size: [32,16]};
            this.#spriteLib[SpriteTypes.cork] = { textureType: TextureTypes.bigSheet, pos: [5,1039], size: [64,64]};
            this.#spriteLib[SpriteTypes.oak] = { textureType: TextureTypes.bigSheet, pos: [143,1103], size: [64,64]};
            this.#spriteLib[SpriteTypes.spruce] = { textureType: TextureTypes.bigSheet, pos: [5,1172], size: [64,64]};
            this.#spriteLib[SpriteTypes.balsa] = { textureType: TextureTypes.bigSheet, pos: [143,1039], size: [64,64]};

            // Crosses
            this.#spriteLib[SpriteTypes.blueCross] = { textureType: TextureTypes.bigSheet, pos: [964,1172], size: [64,64]};
            this.#spriteLib[SpriteTypes.whiteCross] = { textureType: TextureTypes.bigSheet, pos: [281,1172], size: [64,64]};
            this.#spriteLib[SpriteTypes.redCross] = { textureType: TextureTypes.bigSheet, pos: [42,1241], size: [64,64]};

            this.#spriteLib[SpriteTypes.hole] = { textureType: TextureTypes.bigSheet, pos: [143,1172], size: [64,64]};

            for (var i = 0; i < this.#spriteLib.length; i++)
            {
                this.#spriteLib[i].pos[0] /= this.getTexture(this.#spriteLib[i].textureType).width;
                this.#spriteLib[i].pos[1] /= this.getTexture(this.#spriteLib[i].textureType).height;
                this.#spriteLib[i].size[0] /= this.getTexture(this.#spriteLib[i].textureType).width;
                this.#spriteLib[i].size[1] /= this.getTexture(this.#spriteLib[i].textureType).height;
            }

            resolve();
        });
    }

    getTexture(type)
    {
        return this.#texLibrary[type];
    }

    getSprite(type)
    {
        return this.#spriteLib[type];
    }


}

class ShaderLibrary
{
    #module;

    Initialise()
    {
        return new Promise(async (resolve, reject) => {
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

class ResourceLoader
{
    static loadTextResource(url) {
        return new Promise(async (resolve, reject) => {
            var request = await fetch(url);
            if (request.status < 200 || request.status > 299) {
                reject('Error: HTTP Status ' + request.status + ' on resource ' + url);
            } else {
                resolve(request.text());
            }
        });
    }

    // Load a JSON resource from a file over the network
    static async loadJSONResource(url) {
        var json = await this.loadTextResource(url);
        return JSON.parse(json);
    }

    // Load an image resource from a file over the network
    static loadImageResource(url) {
        return new Promise((resolve) => {
            var image = new Image();
            image.onload = async function() {

                let img = await createImageBitmap(image)

                let tex = Main.device.createTexture({
                    size: [ image.width,  image.height, 1 ],
                    format: Main.colourFormat,
                    usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT
                });

                Main.device.queue.copyExternalImageToTexture(
                    { source: img },
                    { texture: tex },
                    [image.width, image.height]
                );

                resolve(tex);
            };
            image.src = url;
        });

    }
}



