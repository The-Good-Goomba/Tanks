
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