
class CollisionEntity
{
    position;
    velocity;
    newVelocity;

    type;
    elastic = false;
    didCollide = false;
    
    constructor(position, velocity, type)
    {
        this.position = position;
        this.velocity = velocity;
        this.type = type;
    }

}