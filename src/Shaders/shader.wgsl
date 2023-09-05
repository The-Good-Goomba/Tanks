struct RasterizerData
{
    @builtin(position) position : vec4f,
    @location(0) texCoords : vec2f,
    @location(1) normal : vec3f,
    @location(2) worldPos: vec3f
}

struct SpriteSheetInfo
{
    pos: vec2f,
    size: vec2f
};

struct Vertex
{
    @location(0) position: vec3f,
    @location(1) texCoords: vec2f,
    @location(2) normal: vec3f,
    @location(3) group: u32
};

struct VertexUniforms
{
    // Vertex
    mModel: mat4x4f,
    mNormal: mat4x4f,
    mView: mat4x4f,
    mProjection: mat4x4f,
    spriteInfo: SpriteSheetInfo,
    jointMatrices: array<mat4x4f>,
};

@group(0) @binding(0) var<storage, read> vertexUniforms: VertexUniforms;

@vertex
fn vertex_main(vIn: Vertex) -> RasterizerData
{
    var output : RasterizerData;
     
    output.position = vertexUniforms.mProjection * vertexUniforms.mView * vertexUniforms.mModel
                    * vertexUniforms.jointMatrices[vIn.group] * vec4f(vIn.position, 1.0);
    output.position.z *= 0.9;
    output.position.z += 0.05;
    var norm = vertexUniforms.jointMatrices[vIn.group] * vec4f(vIn.normal, 1.0);
    var normalMat = mat3x3f(vertexUniforms.mNormal[0].xyz, vertexUniforms.mNormal[1].xyz, vertexUniforms.mNormal[2].xyz);
    output.normal = normalMat * norm.xyz;
    output.texCoords = vec2f(vIn.texCoords.x,1 - vIn.texCoords.y) * vertexUniforms.spriteInfo.size + vertexUniforms.spriteInfo.pos;
    output.worldPos = (vertexUniforms.mModel * vertexUniforms.jointMatrices[vIn.group] * vec4f(vIn.position, 1.0)).xyz;
    return output;
}

struct FragmentUniforms
{
    // Fragment
    lightPos: vec3f,
    lightColour: vec3f,
    opacity: f32
}

@group(0) @binding(1) var<uniform> fragUniforms: FragmentUniforms;
@group(0) @binding(2) var textureSampler: sampler;
@group(0) @binding(3) var texture: texture_2d<f32>;

@fragment
fn fragment_main(fragData: RasterizerData) -> @location(0) vec4f
{
    var baseColour: vec4f = textureSample(texture, textureSampler, fragData.texCoords).xyzw;
    var diffuseColour = vec3f(0.0, 0.0, 0.0);

    var normalDir = normalize(fragData.normal);
    var lightDir = normalize(fragUniforms.lightPos - fragData.worldPos);

    var diffuse = max(dot(normalDir, lightDir), 0.65);
    diffuseColour += baseColour.xyz * diffuse;
    return vec4f(diffuseColour,baseColour.w * fragUniforms.opacity);
}