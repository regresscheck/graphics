#version 300 es

precision mediump float;

in vec3 materialKa;
in vec3 materialKd;
in vec3 materialKs;
in float materialShininess;

in vec3 normalCamSpace;
in vec4 posCamSpace;

out vec4 fragColor;

void main()
{
    fragColor = vec4(1.0, 1.0, 0.0, 1.0);
}