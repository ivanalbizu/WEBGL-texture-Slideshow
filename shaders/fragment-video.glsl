precision mediump float;

varying vec3 vVertexPosition;
varying vec2 vTextureCoord;
varying vec2 vActiveTextureCoord;
varying vec2 vNextTextureCoord;
// custom uniforms
uniform float uTransitionTimer;
// our textures samplers
// notice how it matches our data-sampler attributes
uniform sampler2D activeTexture;
uniform sampler2D nextTexture;
uniform sampler2D displacement;
void main() {
    // our displacement texture
    // i'll be using the fragment shader seen here : https://tympanus.net/codrops/2018/04/10/webgl-distortion-hover-effects/
    vec4 displacementTexture = texture2D(displacement, vTextureCoord);
    float displacementFactor = (cos(uTransitionTimer / (60.0 / 3.141592)) + 1.0) / 2.0;
    float effectFactor = 1.0;
    
    vec2 firstDisplacementCoords = vec2(vActiveTextureCoord.x - (1.0 - displacementFactor) * (displacementTexture.r * effectFactor), vActiveTextureCoord.y);
    vec2 secondDisplacementCoords = vec2(vNextTextureCoord.x + displacementFactor * (displacementTexture.r * effectFactor), vNextTextureCoord.y);
    vec4 firstDistortedColor = texture2D(activeTexture, firstDisplacementCoords);
    vec4 secondDistortedColor = texture2D(nextTexture, secondDisplacementCoords);
    vec4 finalColor = mix(secondDistortedColor, firstDistortedColor, displacementFactor);
    // handling premultiplied alpha
    finalColor = vec4(finalColor.rgb * finalColor.a, finalColor.a);
    gl_FragColor = finalColor;
}