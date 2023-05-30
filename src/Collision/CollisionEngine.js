
class CollisionEngine
{

    collideObjects(array)
    {
        for (const [i, obj1] of array.entries())
        {
            for (const [o, obj2] of array.entries())
            {
                if (i <= o) { continue;}
                this.collideRectangleRectangle(obj1,obj2);
            }
        }
    }

    collideRectangleRectangle(rect1, rect2)
    {
        if (rect1.velocity === [0,0] && rect2.velocity === [0,0]) { return; }


        let before = [
            rect1.maxBounds[0] > rect2.minBounds[0],
            rect1.minBounds[0] < rect2.maxBounds[0],
            rect1.minBounds[1] < rect2.maxBounds[1],
            rect1.maxBounds[1] > rect2.minBounds[1],
        ]

        // let after = [
        //     rect1.maxBounds[0] + rect1.velocity[0] > rect2.minBounds[0] + rect2.velocity[0],
        //     rect1.minBounds[0] + rect1.velocity[0] < rect2.maxBounds[0] + rect2.velocity[0],
        //     rect1.minBounds[1] + rect1.velocity[1] < rect2.maxBounds[1] + rect2.velocity[1],
        //     rect1.maxBounds[1] + rect1.velocity[1] > rect2.minBounds[1] + rect2.velocity[1],
        // ]

        let delta = [
            rect1.maxBounds[0] + rect1.velocity[0] - (rect2.minBounds[0] + rect2.velocity[0]),
            rect1.minBounds[0] + rect1.velocity[0] - (rect2.maxBounds[0] + rect2.velocity[0]),
            rect1.minBounds[1] + rect1.velocity[1] - (rect2.maxBounds[1] + rect2.velocity[1]),
            rect1.maxBounds[1] + rect1.velocity[1] - (rect2.minBounds[1] + rect2.velocity[1]),
        ]
        let after = [
            delta[0] > 0,
            delta[1] < 0,
            delta[2] < 0,
            delta[3] > 0,
        ]

        let changed = [
            (!before[0] && after[0]), // Left
            (!before[1] && after[1]), // Right
            (!before[2] && after[2]), // Top
            (!before[3] && after[3]), // Bottom
        ]

        if (after[0] && after[1] && after[2] && after[3])
        {
            if ((changed[0] || changed[1]) && (changed[2] || changed[3]))
            {
                let bruh = [0,0]
                if (changed[0]) { bruh[0] = delta[0]; }
                else { bruh[0] = delta[1]; }
                if (changed[2]) { bruh[1] = delta[2]; }
                else { bruh[1] = delta[3];}

                if (bruh[0] > bruh[1]) { rect1.velocity[0] *= -1; rect2.velocity[0] *= -1; }
                else {rect1.velocity[1] *= -1; rect2.velocity[1] *= -1;}

            }
            else if (changed[0] || changed[1]) { rect1.velocity[0] *= -1; rect2.velocity[0] *= -1; }
            else if (changed[2] || changed[3]) { rect1.velocity[1] *= -1; rect2.velocity[1] *= -1; }
            rect1.didCollide = true;
            rect2.didCollide = true;

            if (rect1.elastic) { rect1.velocity = [0,0] }
            if (rect2.elastic) { rect2.velocity = [0,0] }
        }
    }

    pointInRectangle(point, rect)
    {
        return (point[0] > rect.position[0] &&
            point[0] < rect.position[0] + rect.size[0] &&
            point[1] < rect.position[1] + rect.size[1] &&
            point[1] > rect.position[1]);
    }

}