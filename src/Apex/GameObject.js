
class GameObject extends Apex
{
    modelObject;
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

    constructor(name, type, sprite) {
        super(name);
        this.modelObject = new ModelObject(type, sprite);
        for (let i = 0; i < this.modelObject.mesh.groupCount; i++)
        {
            this.jointMatrices.push(mat4.create());
        }
    }

    doRender(renderCommandEncoder)
    {
        this.modelObject.viewMatrix = this.viewMatrix;
        this.modelObject.projectionMatrix = this.projectionMatrix;
        this.modelObject.modelMatrix =  this.modelMatrix;
        this.modelObject.jointMatrices = this.flattenedJointMatrices;
        this.modelObject.doRender(renderCommandEncoder);
    }
}