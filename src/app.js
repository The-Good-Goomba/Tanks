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
        SceneManager.Initialise(SceneTypes.mainGame);
        this.RunApp();
 
    };
    
    static RunApp()  
    {

        
        var loop = () => 
        {
            SceneManager.doUpdate();
            setTimeout( () =>{
                requestAnimationFrame(loop);
            }, 1000 / this.frameRate)
        }
        requestAnimationFrame(loop);


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

class SceneManager
{
    static _currentScene;

    static Initialise(type)
    {
        SceneManager.setScene(type)
    }

    static get currentScene()
    {
        return SceneManager._currentScene
    }

    static setScene(type)
    {
        switch (type)
        {
            case SceneTypes.mainGame:
                SceneManager._currentScene = new TankScene()
        }
    }

    static doUpdate()
    {
        SceneManager._currentScene.update()

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
        SceneManager._currentScene.render(passEncoder);
        passEncoder.end();
        Main.device.queue.submit([commandEncoder.finish()]);
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

class Apex 
{

    #rotation = [0,0,0];
    #position = [0,0,0];
    #scale = [1,1,1];
    #quaternion = quat.create();

    #name;

    toRender = true;
    parentModelMatrix = mat4.create();

    viewMatrix = mat4.create();
    projectionMatrix = mat4.create();

    #modelMatrix = mat4.create();

    #children = []; // Array of Apex 's

    get modelMatrix()
    {
        let ret = mat4.create();
        mat4.mul(ret, this.parentModelMatrix, this.#modelMatrix );
        return ret
    }

    get normalMatrix()
    {
        var ret = mat4.create();
        mat4.invert(ret,this.#modelMatrix);
        mat4.transpose(ret,ret);
        return ret;
    }

    updateModelMatrix()
    {   
        mat4.fromRotationTranslationScale(this.#modelMatrix, this.#quaternion, this.#position, this.#scale);
    }

    constructor(name = "Apex")
    {
        this.#name = name;
        quat.fromEuler(this.#quaternion, this.#rotation[0], this.#rotation[1], this.#rotation[2]);
        this.updateModelMatrix();
    }

    getName()
    {
        return this.#name
    }

    get children()
    {
        return this.#children;
    }

    addChild(child)
    {
        this.#children.push(child);
    }

    killChild(index)
    {
        this.#children.splice(index, 1);
    }

    doUpdate() { }

    update()
    {
        this.doUpdate()
        for (let child of this.#children)
        {
            child.parentModelMatrix = this.#modelMatrix
            child.viewMatrix = this.viewMatrix
            child.projectionMatrix = this.projectionMatrix

            child.update()
        }
    }

    doRender(renderCommandEncoder) { }

    render(renderCommandEncoder)
    {
        if (this.toRender) { this.doRender(renderCommandEncoder) }

        for (let child of this.#children)
        {
            child.render(renderCommandEncoder)
        }
    }

    

    //    Override if you want to do something after transformations
    afterScale() { }
    afterTranslation() { }
    afterRotation() { }

    // I would like to move this outside of the main block

    setPosition( x , y , z )
    {
        this.#position = [x,y,z]
        this.updateModelMatrix()
        this.afterTranslation()
    }
   
    setPositionX( x ) { this.setPosition(x, this.getPositionY(), this.getPositionZ())}
    setPositionY( y ) { this.setPosition(this.getPositionX(), y, this.getPositionZ())}
    setPositionZ( z ) { this.setPosition(this.getPositionX(), this.getPositionY(), z)}
    
    move(x , y ,z ) { this.setPosition(this.getPositionX() + x, this.getPositionY() + y, this.getPositionZ() + z)}
    
    getPosition() { return this.#position }
    getPositionX()   { return this.#position[0] }
    getPositionY()   { return this.#position[1] }
    getPositionZ()   { return this.#position[2] }
    
    setRotation( x , y , z )
    {
        this.#rotation = [x,y,z]
        
        quat.fromEuler(this.#quaternion, Meth.toDegrees(x), Meth.toDegrees(y), Meth.toDegrees(z));
        
        this.updateModelMatrix()
        this.afterRotation()
    }
    
    setRotationX( x ) { this.setRotation(x, this.getRotationY(), this.getRotationZ())}
    setRotationY( y ) { this.setRotation(this.getRotationX(), y, this.getRotationZ())}
    setRotationZ( z ) { this.setRotation(this.getRotationX(), this.getRotationY(), z)}
    
    rotate(x , y ,z ) { this.setRotation(this.getRotationX() + x, this.getRotationY() + y, this.getRotationZ() + z)}
    
    getRotation()   { return this.#rotation }
    getRotationX()   { return this.#rotation[0] }
    getRotationY()   { return this.#rotation[1] }
    getRotationZ()   { return this.#rotation[2] }
    
    setScale( x , y , z )
    {
        this.#scale = [x,y,z]
        this.updateModelMatrix()
        this.afterScale()
    }
    
    setUniformScale(s) { this.setScale(s, s, s) }
    
    setScaleX( x ) { this.setScale(x, this.getScaleY(), this.getScaleZ())}
    setScaleY( y ) { this.setScale(this.getScaleX(), y, this.getScaleZ())}
    setScaleZ( z ) { this.setScale(this.getScaleX(), this.getScaleY(), z)}
    
    scaleF(x , y ,z ) { this.setScale(this.getScaleX() + x, this.getScaleY() + y, this.getScaleZ() + z)}
    
    getScale()   { return this.#scale }
    getScaleX()   { return this.#scale[0] }
    getScaleY()   { return this.#scale[1] }
    getScaleZ()   { return this.#scale[2] }
    


}

class Scene extends Apex
{
    constructor()
    {
        super("Scene");
        this.toRender = false;
        mat4.identity(this.viewMatrix);
        mat4.identity(this.projectionMatrix);

    }


}

class GameObject extends Apex
{
    #renderPipeline;

    get modifiedBounds()
    {
        return this.mesh.boundingBox.getModifiedBounds(this.modelMatrix);
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
        super(name);

        this.#sprite = Engine.textureLibrary.getSprite(sprite);
        this.#renderPipeline = Engine.shaderLibrary.createProgram(VertexShaderTypes.default,
             FragmentShaderTypes.default, VertexDescriptorTypes.Basic);

        this.mesh = Engine.modelLibrary.get(type);
        this.toRender = true;

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

    rebuildUniformBuffers()
    {
        this.vertexUniformValues.set(this.modelMatrix, 0); // mModel
        this.vertexUniformValues.set(this.normalMatrix, 16); // mModel
        this.vertexUniformValues.set(this.viewMatrix, 32); // mView
        this.vertexUniformValues.set(this.projectionMatrix, 48); // mProjection
        this.vertexUniformValues.set(this.flattenedJointMatrices, 68); // jointMatrices Array

        Main.device.queue.writeBuffer(this.vertexUniformBuffer, 0,this.vertexUniformValues);
    }

    update()
    {
        this.rebuildUniformBuffers();
        super.update();
    }

    doRender(renderCommandEncoder) {
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
        if (type == SpriteTypes.none) { 
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


        var boundingBox = new BoundingBox (
            [Infinity, Infinity, Infinity],
            [-Infinity, -Infinity, -Infinity]
        )

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
                boundingBox.updateDefaultBounds(pos);
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
            vertexCount: finalPositions.length / 3,
            boundingBox: boundingBox };
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

class BoundingBox {
    maxBounds;
    minBounds;
    baseVertices;

    getModifiedBounds(matrix)
    {
        let bruh = [0,0,0];
        let out = { minBounds: [Infinity,Infinity,Infinity], maxBounds: [-Infinity,-Infinity,-Infinity]};
        for (let vertex of this.baseVertices)
        {
            vec3.transformMat4(bruh,vertex,matrix);
            BoundingBox.updateBounds(out.minBounds,out.maxBounds,bruh);
        }
        return out;
    }

    updateBaseVertices()
    {
        // Some delicious combinatorics
        this.baseVertices = [
            this.maxBounds,
            [this.maxBounds[0],this.maxBounds[1],this.minBounds[2]],
            [this.maxBounds[0],this.minBounds[1],this.maxBounds[2]],
            [this.maxBounds[0],this.minBounds[1],this.minBounds[2]],
            [this.minBounds[0],this.maxBounds[1],this.maxBounds[2]],
            [this.minBounds[0],this.maxBounds[1],this.minBounds[2]],
            [this.minBounds[0],this.minBounds[1],this.maxBounds[2]],
            this.minBounds
        ]
    }

    constructor(min = [0,0,0], max = [0,0,0])
    {
        this.minBounds = min;
        this.maxBounds = max;
    }

    get width() { return this.maxBounds[0] - this.minBounds[0]; }
    get height() { return this.maxBounds[1] - this.minBounds[1]; }
    get depth() { return this.maxBounds[2] - this.minBounds[2]; }

    scaleWidthTo(wide) { return wide / this.width }
    scaleHeightTo(high) { return high / this.height }
    scaleDepthTo(deep) { return deep / this.depth }

    updateDefaultBounds(vertex)
    {
        BoundingBox.updateBounds(this.minBounds, this.maxBounds, vertex);
        this.updateBaseVertices();
    }

    static updateBounds(minBound, maxBound, vertex)
    {
        // Max bounds
        if (vertex[1] > maxBound[1]) { maxBound[1] = vertex[1] }
        if (vertex[0] > maxBound[0]) { maxBound[0] = vertex[0] }
        if (vertex[2] > maxBound[2]) { maxBound[2] = vertex[2] }

        // Min Bounds
        if (vertex[1] < minBound[1]) { minBound[1] = vertex[1] }
        if (vertex[0] < minBound[0]) { minBound[0] = vertex[0] }
        if (vertex[2] < minBound[2]) { minBound[2] = vertex[2] }
    }

}

class TankScene extends Scene
{
    collidables;
    tank1;
    floor;
    constructor() {
        super();

        this.collidables = [];

        this.tank1 = new ControllableTank(SpriteTypes.blueTank);
        this.floor = new GameObject("Floor", ModelTypes.plane, SpriteTypes.woodenFloor);

        mat4.lookAt(this.viewMatrix, [0, 45, 45], [0, 0, 0], Meth.normalise3([0,1,-1]));
        // mat4.perspective(this.projectionMatrix, 0.25, Main.canvas.width / Main.canvas.height, 0.1, 1000.0);
        mat4.ortho(this.projectionMatrix, -16 * 0.82, 16 * 0.82, -9 * 0.82, 9 * 0.82, 0.1, 100.0);

        this.tank1.tankBody.setUniformScale(5);
        this.floor.setUniformScale(10);
        this.floor.scaleF(5,0,1);
        this.floor.setPosition(0,0,0);

        // Build the borders 23 x 17
        let layout = StaticBlocks.getLayout("/src/stages.json");
        layout.then((bruh) => {
            for (let element of bruh)
            {
                let obj;
                switch (element.type){
                    case "spruceBlock": obj = StaticBlocks.spruceBlock(element.pos); break;
                    case "oakBlock": obj = StaticBlocks.oakBlock(element.pos); break;
                    case "balsaBlock": obj = StaticBlocks.balsaBlock(element.pos); break;
                    case "oakTriangleBlock": obj = StaticBlocks.oakTriangleBlock(element.pos); break;
                    case "balsaTriangleBlock": obj = StaticBlocks.balsaTriangleBlock(element.pos); break;
                    case "oakHalfCylinder": obj = StaticBlocks.oakHalfCylinder(element.pos); break;
                    case "balsaHalfCylinder": obj = StaticBlocks.balsaHalfCylinder(element.pos); break;
                    case "shortBlock": obj = StaticBlocks.shortBlock(element.pos); break;
                    case "bigShortBalsa": obj = StaticBlocks.bigShortBalsa(element.pos); break;
                    case "bigOakBlock": obj = StaticBlocks.bigOakBlock(element.pos); break;
                    case "bigBalsaBlock": obj = StaticBlocks.bigBalsaBlock(element.pos); break;
                    case "tallBalsaBlock": obj = StaticBlocks.tallBalsaBlock(element.pos); break;
                    case "longBigBlock": obj = StaticBlocks.longBigBlock(element.pos); break;
                }
                obj.rotate(element.rotation[0],element.rotation[1],element.rotation[2]);
                this.addChild(obj);
                this.collidables.push(obj);
            }
        });

        this.addChild(this.tank1);
        this.addChild(this.floor);
        this.tank1.setCollidables(this.collidables);
    }

}

class Tank extends Apex
{
    speed = 0.1;
    rotationSpeed = 0.5;
    baseRotation = 0;

    bulletInterval = 0.1;
    bulletTimer = 0;

    velocity = [0,0];

    tankBody;
    collidables;

    get bulletCount() 
    {
        return this.children.length - 1;
    }

    constructor(spriteType)
    {
        super("Tank");

        this.tankBody = new TankBody(spriteType);
        this.addChild(this.tankBody);
    }

    setCollidables(collidable)
    {
        this.collidables = collidable;
        this.collidables.push(this.tankBody);
    }

    doUpdate() {
        this.updateBullets();
        this.bulletTimer -= Main.deltaTime;

        if (this.tankBody.dead) {
            this.tankBody = new Cross(this.tankBody.getPosition());
            this.children[0] = this.tankBody;
        } else if (Meth.magnitude(this.velocity) !== 0) {
            const vel = Meth.multiply2x1(Meth.normalise2(this.velocity), this.speed);
            this.tankBody.move(vel[0],0,vel[1]);
            let rot = Math.atan2(this.velocity[0],this.velocity[1]);
            mat4.fromRotation(this.tankBody.jointMatrices[0], rot, [0,1,0]);
            this.velocity = [0,0];
        }


    }

    updateBullets()
    {
        let i = 1;
        let o = 0;
        while (i < this.children.length)
        {
            let bullet = this.children[i];
            let vel = Meth.multiply2x1(bullet.direction, bullet.speed);
            o = 0;
            while (o < this.collidables.length)
            {
                let collidable = this.collidables[o];
                if ((collidable !== this.tankBody || bullet.bouncesLeft !== bullet.initialBounces) && (bullet !== collidable))
                {
                    if (bullet.collideWithBlock(collidable,vel)) {
                        if (collidable instanceof Bullet) { collidable.toDestroy = true; bullet.toDestroy = true; }
                        else if (collidable instanceof TankBody) { collidable.dead = true; bullet.toDestroy = true; }
                    }
                }
                if (collidable.dead) {
                    this.collidables.splice( this.collidables.indexOf(collidable), 1);
                } else { o++; }

            }
            bullet.move(vel[0],0,vel[1]);
            bullet.direction = Meth.normalise2(vel);
            if (bullet.toDestroy) {
                this.killChild(i);
                this.collidables.splice( this.collidables.indexOf(bullet), 1);
            } else { i++; }

        }
    }

    shoot(dir = [0,1])
    {
        const cannonLength = this.tankBody.getScaleX() * 0.16;
        var bullet = new Bullet(dir,
                    [this.tankBody.getPositionX() + cannonLength * dir[0],
                    this.tankBody.getPositionY() + this.tankBody.getScaleX() * 0.1, 
                    this.tankBody.getPositionZ() + cannonLength * dir[1]]);
        bullet.setUniformScale(this.tankBody.getScale()[0] * 0.007);
        this.addChild(bullet);
        this.collidables.push(bullet);
    }

    moveUp() {
        this.velocity[1] = -1.0;
    };
    moveDown() {
        this.velocity[1] = 1;
    };
    moveLeft() {
        this.velocity[0] = -1;
    };
    moveRight() {
        this.velocity[0] = 1;
    };

}

class TankBody extends GameObject
{
    dead = false;
    constructor(spriteType) {
        super("TankBody", ModelTypes.tank, spriteType);
        mat4.fromRotation(this.jointMatrices[0], Math.PI/2, [0,1,0]);
    }

    collideWithOther(other)
    {

    }

}

class ControllableTank extends Tank
{
    screenCoords = [0,0];

    constructor(spriteType)
    {
        super(spriteType);
        this.tankBody.afterTranslation = () => {
            var bruh1 = mat4.create();
            mat4.mul(bruh1, this.projectionMatrix, this.viewMatrix);

            vec3.transformMat4(this.screenCoords, this.tankBody.getPosition(), bruh1);
            this.screenCoords[0] = ((this.screenCoords[0] + 1) / 2) * Main.canvas.width;
            this.screenCoords[1] = -1 * ((this.screenCoords[1] - 1) / 2) * Main.canvas.height;
        }

        this.tankBody.afterTranslation();
    }

    doUpdate() {
        super.doUpdate();

        if (this.tankBody instanceof TankBody) {
            this.updateTurretRotation();
            if (Mouse.isMouseButtonDown(0) && this.bulletTimer <= 0) {
                this.bulletTimer = this.bulletInterval;
                this.shoot();
            }

            if (Keyboard.isKeyDown('w')) { this.moveUp(); }
            if (Keyboard.isKeyDown('s')) { this.moveDown(); }
            if (Keyboard.isKeyDown('a')) { this.moveLeft(); }
            if (Keyboard.isKeyDown('d')) { this.moveRight(); }
        }
    }

    shoot() {
        let dir = Meth.normalise2([(Mouse.mousePos[0] - this.screenCoords[0]), (Mouse.mousePos[1] - this.screenCoords[1])]);
        super.shoot(dir);
    }

    updateTurretRotation()
    {
        let rot = Math.atan2((Mouse.mousePos[1] - this.screenCoords[1]), (Mouse.mousePos[0] - this.screenCoords[0]));
        rot -= Math.PI / 2;
        rot *= -1;
        mat4.fromRotation(this.tankBody.jointMatrices[1], rot, [0,1,0]);
    }
}

class Bullet extends GameObject
{
    speed = 0.1;
    initialBounces = 5;
    bouncesLeft;
    direction;

    screenCoords = [0,0];
    toDestroy = false;
    constructor(dir, pos)
    {
        super("bullet", ModelTypes.shell, SpriteTypes.shell);
        this.bouncesLeft = this.initialBounces;
        this.setPosition(pos[0], pos[1], pos[2]);
        this.useBaseColourTexture(SpriteTypes.shell);
        this.direction = dir;
        let bruh = Math.atan2(dir[1], dir[0]);
        this.setRotationY(-(bruh - Math.PI / 2));
    }

    collideWithBlock(other, velocity)
    {
        if (velocity === [0,0]) { return velocity}


        // Collide moving in the x direction
        let dist = [0,0];

        let before = [
            this.modifiedBounds.maxBounds[0] > other.modifiedBounds.minBounds[0],
            this.modifiedBounds.minBounds[0] < other.modifiedBounds.maxBounds[0],
            this.modifiedBounds.minBounds[2] < other.modifiedBounds.maxBounds[2],
            this.modifiedBounds.maxBounds[2] > other.modifiedBounds.minBounds[2],
        ]

        let after = [
            this.modifiedBounds.maxBounds[0] + velocity[0] > other.modifiedBounds.minBounds[0],
            this.modifiedBounds.minBounds[0] + velocity[0] < other.modifiedBounds.maxBounds[0],
            this.modifiedBounds.minBounds[2] + velocity[1] < other.modifiedBounds.maxBounds[2],
            this.modifiedBounds.maxBounds[2] + velocity[1] > other.modifiedBounds.minBounds[2],
        ]

        let changed = [
            (!before[0] && after[0]), // Left
            (!before[1] && after[1]), // Right
            (!before[2] && after[2]), // Top
            (!before[3] && after[3]), // Bottom
        ]



        if (after[0] && after[1] && after[2] && after[3])
        {
            this.bouncesLeft -= 1;
            if (this.bouncesLeft < 0) { this.toDestroy = true; }

            if ((changed[0] || changed[1]) && (changed[2] || changed[3]))
            {
                let bruh = [0,0]
                if (changed[0]) { bruh[0] = other.modifiedBounds.minBounds[0]; }
                else { bruh[0] = other.modifiedBounds.maxBounds[0]; }
                if (changed[2]) { bruh[1] = other.modifiedBounds.maxBounds[2]; }
                else { bruh[1] = other.modifiedBounds.minBounds[2]}
                bruh[0] = bruh[0] - this.getPositionX();
                bruh[1] = bruh[1] - this.getPositionZ();

                if (Math.abs(bruh[1] / bruh[0]) >= Math.abs(velocity[1] / velocity[0]))
                {
                    velocity[0] *= -1;
                } else { velocity[1] *= -1; }

            }
            else if (changed[0] || changed[1]) { velocity[0] *= -1; }
            else if (changed[2] || changed[3]) { velocity[1] *= -1; }
            return true;
        }

        return false;
    }

    doUpdate() {
        let angle = Math.atan2(this.direction[1], this.direction[0]);
        this.setRotationY(-(angle - Math.PI / 2));

        let bruh1 = mat4.create();
        mat4.mul(bruh1, this.projectionMatrix, this.viewMatrix);
        vec3.transformMat4(this.screenCoords, this.getPosition(), bruh1);
        this.screenCoords[0] = ((this.screenCoords[0] + 1) / 2) * Main.canvas.width;
        this.screenCoords[1] = -1 * ((this.screenCoords[1] - 1) / 2) * Main.canvas.height;

        if (this.screenCoords[0] > Main.canvas.width ||  this.screenCoords[0] < 0 ||
            this.screenCoords[1] > Main.canvas.height || this.screenCoords[1] < 0)
        {
            this.toDestroy = true;
        }
    }

}

class Cork extends GameObject
{
    #hp = 3;
    #toBreak = false;

    get health() { return this.#hp; }
    set health(val) {
        this.#hp = val;
        if (this.#hp <= 0) { this.#toBreak = true; }
    }

    constructor() {
        super("Cork", ModelTypes.block2x2, SpriteTypes.cork);
    }
}

class Hole extends GameObject
{
    constructor(pos) {
        super("Hole", ModelTypes.plane, SpriteTypes.hole);
        this.setPosition(pos[0],0.01, pos[1]);
    }
}

class Cross extends GameObject
{
    constructor(pos) {
        super("Cross", ModelTypes.plane, SpriteTypes.whiteCross);
        this.setPosition(pos[0],0.01, pos[2]);
        this.setUniformScale(0.7);
    }
}

class StaticBlocks
{
    static spruceBlock(pos)
    {
        let block = new GameObject("Spruce Block", ModelTypes.block2x2, SpriteTypes.spruce)
        block.setPosition(...pos);
        block.setUniformScale(0.5);
        return block
    }

    static oakBlock(pos)
    {
        let block = new GameObject("Oak Block", ModelTypes.block2x2, SpriteTypes.oak)
        block.setPosition(...pos);
        block.setUniformScale(0.5);

        return block
    }

    static balsaBlock(pos)
    {
        let block = new GameObject("Balsa Block", ModelTypes.block2x2, SpriteTypes.balsa)
        block.setPosition(...pos);
        block.setUniformScale(0.5);
        return block
    }

    static oakTriangleBlock(pos)
    {
        let block = new GameObject("Oak Triangle Block", ModelTypes.triangle, SpriteTypes.oak)
        block.setPosition(...pos);
        return block
    }

    static balsaTriangleBlock(pos)
    {
        let block = new GameObject("Triangle Block", ModelTypes.triangle, SpriteTypes.balsa)
        block.setPosition(...pos);
        return block
    }

    static oakHalfCylinder(pos)
    {
        let block = new GameObject("Cylinder", ModelTypes.halfCylinder, SpriteTypes.oak)
        block.setPosition(...pos);
        return block
    }

    static balsaHalfCylinder(pos)
    {
        let block = new GameObject("Cylinder", ModelTypes.halfCylinder, SpriteTypes.balsa)
        block.setPosition(...pos);
        return block
    }

    static shortBlock(pos)
    {
        let block = new GameObject("Short Block", ModelTypes.block2x1, SpriteTypes.oak)
        block.setPosition(...pos);
        block.setUniformScale(0.5);
        return block
    }

    static bigShortBalsa(pos)
    {
        let block = new GameObject("Short Block", ModelTypes.block2x1, SpriteTypes.balsa)
        block.setPosition(...pos);
        return block
    }

    static bigOakBlock(pos)
    {
        let block = new GameObject("Big Oak Block", ModelTypes.block2x2, SpriteTypes.oak)
        block.setPosition(...pos);
        return block
    }

    static bigBalsaBlock(pos)
    {
        let block = new GameObject("Big Balsa Block", ModelTypes.block2x2, SpriteTypes.balsa)
        block.setPosition(...pos);
        return block
    }

    static tallBalsaBlock(pos)
    {
        let block = new GameObject("Tall Balsa Block", ModelTypes.block2x1, SpriteTypes.balsa)
        block.setPosition(...pos);
        block.rotate(Math.PI * 0.5,0,0);
        return block
    }

    static longBigBlock(pos)
    {
        let block = new GameObject("Long Big Block", ModelTypes.block2x4, SpriteTypes.oak)
        block.setPosition(...pos);
        return block
    }

    static async getLayout(filename)
    {
        const file = await fetch(filename);
        const body = await file.text();
        return JSON.parse(body);
    }

}



