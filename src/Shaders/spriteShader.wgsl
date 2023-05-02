

struct SpriteSheetInfo
{
    pos: vec2f,
    size: vec2f
};

struct Instance
{
    pos: vec3f,
    size: vec2f,
    spriteInfo: SpriteSheetInfo
}

struct RasteriserData {
    @builtin(position) position : vec4f,
    @location(0) texCoords : vec2f
}

const QUAD = array(
    vec2f(0.,0.),
    vec2f(1.,0.),
    vec2f(0.,1.),

    vec2f(0.,1.),
    vec2f(1.,0.),
    vec2f(1.,1.)
);


@vertex
fn spriteVertex_main(@location(0) instance: Instance,
                     @builtin(vertex_index) vID: u32) -> RasteriserData
{
    var rd: RasteriserData;
    rd.pos = vec4((QUAD[vID] * instance.size + instance.pos.xy), 0.9 * sign(instance.pos.z) + instance.pos.z, 1.0);
    rd.texCoords = (QUAD[vID] * instance.spriteInfo.size + instance.spriteInfo.pos)
    return rd;
}

@group(0) @binding(0) var textureSampler: sampler;
@group(0) @binding(1) var texture: array<texture_2d<f32>,2>;

@fragment
fn spriteFragment_main(rd: RasteriserData) -> @location(0) vec4f
{
    return textureSample(texture, textureSampler, rd.texCoords);
}