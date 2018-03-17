#version 300 es

precision mediump float;

struct MaterialInfo
{
    vec3 Ka; //коэффициент отражения окружающего света
    vec3 Kd; //коэффициент отражения диффузного света
    vec3 Ks; //коэффициент отражения бликового света
    float shininess;
};

uniform MaterialInfo materials[5];

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalToCameraMatrix;

struct LightInfo
{
    vec3 pos; //положение источника света в мировой системе координат (для точечного источника)
    vec3 La; //цвет и интенсивность окружающего света
    vec3 Ld; //цвет и интенсивность диффузного света
    vec3 Ls; //цвет и интенсивность бликового света
};
uniform LightInfo light;

in vec3 vertexPosition;
in vec3 vertexNormal;
in uint vertexMeterialIndex;

out vec3 normalCamSpace;
out vec4 posCamSpace;
out vec4 lightPosCamSpace;

out vec3 materialKa;
out vec3 materialKd;
out vec3 materialKs;
out float materialShininess;

void main()
{
    normalCamSpace = normalize(normalToCameraMatrix * vertexNormal);
    posCamSpace = viewMatrix * modelMatrix * vec4(vertexPosition, 1.0);
    lightPosCamSpace = viewMatrix * vec4(light.pos, 1.0);

    materialKa = materials[vertexMeterialIndex].Ka;
    materialKd = materials[vertexMeterialIndex].Kd;
    materialKs = materials[vertexMeterialIndex].Ks;
    materialShininess = materials[vertexMeterialIndex].shininess;

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(vertexPosition, 1.0);
}