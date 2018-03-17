#version 300 es

precision mediump float;

struct LightInfo
{
    vec3 pos; //положение источника света в системе координат ВИРТУАЛЬНОЙ КАМЕРЫ!
    vec3 La; //цвет и интенсивность окружающего света
    vec3 Ld; //цвет и интенсивность диффузного света
    vec3 Ls; //цвет и интенсивность бликового света
};

uniform LightInfo light;

in vec3 materialKa;
in vec3 materialKd;
in vec3 materialKs;
in float materialShininess;
in vec4 lightPosCamSpace;

in vec3 normalCamSpace;
in vec4 posCamSpace;

out vec4 fragColor;

void main()
{
    vec3 lightDirCamSpace = normalize(lightPosCamSpace.xyz - posCamSpace.xyz); //направление на источник света
    vec3 normal = normalize(normalCamSpace); //нормализуем нормаль после интерполяции
    float NdotL = max(dot(normal, lightDirCamSpace.xyz), 0.0); //скалярное произведение (косинус)
    vec3 color = light.La * materialKa + light.Ld * materialKd * NdotL; //цвет вершины
    if (NdotL > 0.0)
    {
        vec3 viewDirection = normalize(-posCamSpace.xyz); //направление на виртуальную камеру (она находится в точке (0.0, 0.0, 0.0))
        vec3 halfVector = normalize(lightDirCamSpace.xyz + viewDirection); //биссектриса между направлениями на камеру и на источник света

        float blinnTerm = max(dot(normal, halfVector), 0.0); //интенсивность бликового освещения по Блинну
        blinnTerm = pow(blinnTerm, materialShininess); //регулируем размер блика

        color += light.Ls * materialKs * blinnTerm;
    }
    if (light.Ld.x < 0.1) {
        color = vec3(1.0, 0.0, 0.0);
    }

    fragColor = vec4(color, 1.0); //просто копируем
}