
struct Instance
{
    @location(0) pos: vec3f,
    @location(1) size: vec2f,
    @location(2) ssPos: vec2f,
    @location(3) ssSize: vec2f
};

struct RasteriserData {
    @builtin(position) position : vec4f,
    @location(0) texCoords : vec2f
};

const QUAD = array(
    vec2f(0.,0.),
    vec2f(1.,0.),
    vec2f(0.,1.),

    vec2f(0.,1.),
    vec2f(1.,0.),
    vec2f(1.,1.)
);


@vertex
fn spriteVertex_main(instance: Instance,
                     @builtin(vertex_index) vID: u32) -> RasteriserData
{
    var rd: RasteriserData;
    rd.position = vec4f((QUAD[vID] * instance.size + instance.pos.xy), 0.9 * sign(instance.pos.z) + instance.pos.z * 0.1, 1.0);
    rd.texCoords = vec2f(QUAD[vID].x,1 - QUAD[vID].y) * instance.ssSize + instance.ssPos;
    return rd;
}

@group(0) @binding(0) var textureSampler: sampler;
@group(0) @binding(1) var texture: texture_2d<f32>;

@fragment
fn spriteFragment_main(rd: RasteriserData) -> @location(0) vec4f
{
    let sus = textureSample(texture, textureSampler, rd.texCoords);
    if (sus.w <= 0.1) { discard; }
    return sus;
}