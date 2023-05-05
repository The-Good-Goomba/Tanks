
class GameObject extends Apex
{
    modelObject;

    constructor(name, type, sprite) {
        super(name);
        this.modelObject = new ModelObject(type, sprite);
    }

    doRender(renderCommandEncoder)
    {
        this.modelObject.doRender(renderCommandEncoder);
    }
}