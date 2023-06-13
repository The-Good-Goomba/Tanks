const glMatrix = require("./src/gl-matrix");
const { mat4 , vec3, quat } = glMatrix;
const fs = require('fs/promises');
const serverJS = require('./server');

class Meth
{
    static normalise3 = ( v ) =>
    {
        const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        if (length === 0) {return [0,0]}
        return [v[0] / length, v[1] / length, v[2] / length];
    }

    static normalise2 = ( v ) =>
    {
        const length = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
        if (length === 0) {return [0,0,0]}
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

i = 0
const SceneTypes =
{
    titleScene: i++,
    mainGame: i++
}

class SceneManager
{
    #currentScene;
    sceneID;

    players = [];

    constructor(type, id)
    {
        this.setScene(type)
        this.sceneID = id;
        this.#currentScene.sceneID = id;
    }

    currentScene = () =>
    {
        return this.#currentScene
    }

   addPlayer(id)
   {
       this.players.push(id);
       this.#currentScene.addPlayer(id);
   }

    setScene = (type) =>
    {
        switch (type)
        {
            case SceneTypes.mainGame:
                this.#currentScene = new TankScene(this.sceneID)
        }
    }

    doUpdate = ()=> { this.#currentScene.update() }

}

class ModelLibrary
{
    #library = [];

    async Initialise()
    {
        this.#library[ModelTypes.tank] = await ModelLoader.getDataFromObj("/src/Assets/tankP.obj");
        this.#library[ModelTypes.plane] = await ModelLoader.getDataFromObj("/src/Assets/plane.obj");
        this.#library[ModelTypes.shell] = await ModelLoader.getDataFromObj("/src/Assets/shell.obj");
        this.#library[ModelTypes.block2x2] = await ModelLoader.getDataFromObj("/src/Assets/block.obj");
        this.#library[ModelTypes.block2x1] = await ModelLoader.getDataFromObj("/src/Assets/shortBlock.obj");
        this.#library[ModelTypes.triangle] = await ModelLoader.getDataFromObj("/src/Assets/triangularPrism.obj");
        this.#library[ModelTypes.halfCylinder] = await ModelLoader.getDataFromObj("/src/Assets/halfCylinder.obj");
        this.#library[ModelTypes.block2x4] = await ModelLoader.getDataFromObj("/src/Assets/longBigBlock.obj");
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
        const fileContents = await ModelLoader.#getFileContents(__dirname + url);
        return ModelLoader.#parseFile(fileContents);
    }

    static #getFileContents = async (filename) =>
    {
        return await fs.readFile(filename, {encoding: 'utf8'});
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

        let boundingBox = new BoundingBox (
            [Infinity, Infinity, Infinity],
            [-Infinity, -Infinity, -Infinity]
        )

        const lines = fileContents.split('\n');
        let pos = [0,0,0];

        let meshMember = [];
        let currentMember = 0;
        let groupCount = 0;

        for(const line of lines)
        {
            const [ command, ...values] = line.split(' ', 4);

            if (command === 'g')
            {
                var bruh = true;
                for (let i = 0;i < meshMember.length; i++)
                {
                    if ( values[0] === meshMember[i]) { currentMember = i; bruh = false }
                }
                if (bruh) { currentMember = meshMember.length; meshMember.push(values[0]);}
                if (currentMember > groupCount) { groupCount = currentMember }
            }

            if (command === 'v')
            {
                pos = ModelLoader.#stringsToNumbers(values);
                boundingBox.updateDefaultBounds(pos);
            }
        }
        return { groupCount: (groupCount + 1),
                boundingBox: boundingBox };
    }
}

class Apex
{
    viewMatrix = mat4.create();
    projectionMatrix = mat4.create();
    serverID;
    name;

    #rotation = [0,0,0];
    #position = [0,0,0];
    #scale = [1,1,1];
    #quaternion = quat.create();

    parentModelMatrix = mat4.create();

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
        this.name = name;
        quat.fromEuler(this.#quaternion, this.#rotation[0], this.#rotation[1], this.#rotation[2]);
        this.updateModelMatrix();
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
            if (child instanceof Apex) {
                child.parentModelMatrix = this.#modelMatrix;
                child.viewMatrix = this.viewMatrix;
                child.projectionMatrix = this.projectionMatrix;
                child.serverID = this.serverID;
                child.update()
            }
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
    players = []
    get dataToSend()
    {
        let data = {}
        data.viewMatrix = JSON.stringify(this.viewMatrix);
        data.projectionMatrix = JSON.stringify(this.projectionMatrix);
        data.children = [];

        let sus = (adult) => {
            for (let child of adult.children) {
                if (child instanceof GameObject) {
                    data.children.push(child.getSendData);
                }
                sus(child);
            }
        };
        sus(this);
        return data;
    }

    addPlayer(player) { this.players.push(player); }
}

class GameObject extends Apex
{
    id;
    name;
    spriteType;
    modelType;
    toDestroy = false;
    firstSend = true;

    boundingBox;
    get modifiedBounds()
    {
        return this.boundingBox.getModifiedBounds(this.modelMatrix);
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

    constructor(name, type, sprite)
    {
        super(name);
        this.id = Math.trunc(Math.random() * 10000);
        this.spriteType = sprite
        this.modelType = type;

        let mesh = Engine().modelLibrary.get(type);
        this.boundingBox = mesh.boundingBox;
        for(let i = 0; i < mesh.groupCount; i++)
        {
            this.jointMatrices[i] = mat4.create();
        }

    }

    get getSendData()
    {
        let data = {};
        data.id = this.id;
        if (this.firstSend) {
            data.model = this.modelType;
            data.sprite = this.spriteType;
        }
        data.jointMatrices = JSON.stringify(this.flattenedJointMatrices);
        data.modelMatrix = JSON.stringify(this.modelMatrix);
        data.dimensions = 1;

        return data;
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
    tanks = [];
    floor;
    constructor() {
        super();
        this.collidables = [];

        this.floor = new GameObject("Floor", ModelTypes.plane, SpriteTypes.woodenFloor);

        mat4.lookAt(this.viewMatrix, [0, 45, 45], [0, 0, 0], Meth.normalise3([0,1,-1]));
        mat4.ortho(this.projectionMatrix, -16 * 0.82, 16 * 0.82, -9 * 0.82, 9 * 0.82, 0.1, 100.0);

        this.floor.setUniformScale(10);
        this.floor.scaleF(5,0,1);
        this.floor.setPosition(0,0,0);
        this.addChild(this.floor);

        // Build the borders 23 x 17

    }

    async build()
    {
        let layout = await StaticBlocks.getLayout("/src/stages.json");
        for (let element of layout)
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
    }

    addPlayer(player) {
        super.addPlayer(player);
        let tank = new ControllableTank(SpriteTypes.blueTank, player)
        tank.tankBody.setUniformScale(5);
        tank.setCollidables(this.collidables);
        this.addChild(tank);
        this.tanks.push(tank);
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
        this.bulletTimer -= serverJS.Main().deltaTime();

        if (this.tankBody.dead) {
            this.tankBody = new Cross(this.tankBody.getPosition());
            this.children[0] = this.tankBody;
        } else {
            this.velocity = Meth.multiply2x1(Meth.normalise2(this.velocity), this.speed);
            for (let block of this.collidables)
            {
                if (block !== this.tankBody && !(block instanceof Bullet)) { this.collideWithOther(block); }
            }

            if (Meth.magnitude(this.velocity) !== 0) {
                this.tankBody.move(this.velocity[0], 0, this.velocity[1]);
                let rot = Math.atan2(this.velocity[0], this.velocity[1]);
                mat4.fromRotation(this.tankBody.jointMatrices[0], rot, [0, 1, 0]);
                this.velocity = [0, 0];
            }
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

    collideWithOther(other)
    {
        let across = (
            this.tankBody.modifiedBounds.maxBounds[0] + this.velocity[0]  > other.modifiedBounds.minBounds[0] &&
            this.tankBody.modifiedBounds.minBounds[0] + this.velocity[0] < other.modifiedBounds.maxBounds[0] &&
            this.tankBody.modifiedBounds.minBounds[2] < other.modifiedBounds.maxBounds[2] &&
            this.tankBody.modifiedBounds.maxBounds[2] > other.modifiedBounds.minBounds[2]
        )

        let up = (
            this.tankBody.modifiedBounds.maxBounds[0] > other.modifiedBounds.minBounds[0] &&
            this.tankBody.modifiedBounds.minBounds[0] < other.modifiedBounds.maxBounds[0] &&
            this.tankBody.modifiedBounds.minBounds[2] + this.velocity[1] < other.modifiedBounds.maxBounds[2] &&
            this.tankBody.modifiedBounds.maxBounds[2] + this.velocity[1] > other.modifiedBounds.minBounds[2]
        )

        if (across) { this.velocity[0] = 0.0 }
        if (up) { this.velocity[1] = 0.0 }

    }


}

class TankBody extends GameObject
{
    dead = false;
    constructor(spriteType) {
        super("TankBody", ModelTypes.tank, spriteType);
        mat4.fromRotation(this.jointMatrices[0], Math.PI/2, [0,1,0]);
    }


}

class ControllableTank extends Tank
{
    screenCoords = [0,0,0];
    linkedPlayer;

    constructor(spriteType, playerID)
    {
        super(spriteType);
        this.linkedPlayer = playerID;
        this.tankBody.afterTranslation = () => {
            let bruh1 = mat4.create();
            mat4.mul(bruh1, this.projectionMatrix, this.viewMatrix);
            vec3.transformMat4(this.screenCoords, this.tankBody.getPosition(), bruh1);
            this.screenCoords[0] = ((this.screenCoords[0] + 1) / 2);
            this.screenCoords[1] = -1 * ((this.screenCoords[1] - 1) / 2);
        }

        this.tankBody.afterTranslation();
    }

    doUpdate() {
        super.doUpdate();

        if (this.tankBody instanceof TankBody) {
            this.updateTurretRotation();
            if (serverJS.Main().players[this.linkedPlayer].input.leftMouse && this.bulletTimer <= 0) {
                this.bulletTimer = this.bulletInterval;
                this.shoot();
            }
            if (serverJS.Main().players[this.linkedPlayer].input.w) { this.moveUp(); }
            if (serverJS.Main().players[this.linkedPlayer].input.s) { this.moveDown(); }
            if (serverJS.Main().players[this.linkedPlayer].input.a) { this.moveLeft(); }
            if (serverJS.Main().players[this.linkedPlayer].input.d) { this.moveRight(); }
        }
    }

    shoot() {
        let mousePos = serverJS.Main().players[this.linkedPlayer].input.mousePos
        if (!mousePos) mousePos = [this.screenCoords[0] + 0.1,this.screenCoords[1] + 0.1];

        let dir = Meth.normalise2([(mousePos[0] - this.screenCoords[0]), (mousePos[1] - this.screenCoords[1])]);
        super.shoot(dir);
    }

    updateTurretRotation()
    {
        let mousePos = serverJS.Main().players[this.linkedPlayer].input.mousePos
        if (!mousePos) mousePos = [this.screenCoords[0] + 0.1,this.screenCoords[1] + 0.1];
        let rot = Math.atan2((mousePos[1] - this.screenCoords[1]), (mousePos[0] - this.screenCoords[0]));
        rot -= Math.PI / 2;
        rot *= -1;
        if (isNaN(rot)) { console.log("Not ok"); return; }
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

    constructor(dir, pos)
    {
        super("bullet", ModelTypes.shell, SpriteTypes.shell);
        this.bouncesLeft = this.initialBounces;
        this.setPosition(pos[0], pos[1], pos[2]);
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
        this.screenCoords[0] = ((this.screenCoords[0] + 1) / 2);
        this.screenCoords[1] = -1 * ((this.screenCoords[1] - 1) / 2);

        if (this.screenCoords[0] > 1 ||  this.screenCoords[0] < 0 ||
            this.screenCoords[1] > 1 || this.screenCoords[1] < 0)
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
        const body = await fs.readFile(__dirname + filename, {encoding: 'utf8'});
        return JSON.parse(body);
    }

}

var Engine =  function () {
    "use strict";
    if (Engine._instance) {
        // Allows the constructor to be called multiple times
        return Engine._instance
    }
    Engine._instance = this;
//     Engine initialisation code
    this.modelLibrary = new ModelLibrary();
    this.modelLibrary.Initialise();
}
new Engine();


module.exports = {SceneManager, SceneTypes};