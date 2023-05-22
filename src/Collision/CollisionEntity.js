
class CollisionEntity
{

    velocity;
    maxBounds;
    minBounds;

    elastic = false;
    didCollide = false; // Used outside the code loop
    
    constructor(velocity)
    {
        this.velocity = velocity;
    }

}


