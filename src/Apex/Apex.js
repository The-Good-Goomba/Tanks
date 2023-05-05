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
