precision mediump float;

attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

uniform mat4 activeTextureMatrix;
uniform mat4 nextTextureMatrix;

varying vec3 vVertexPosition;
varying vec2 vTextureCoord;
varying vec2 vActiveTextureCoord;
varying vec2 vNextTextureCoord;

uniform float uTransitionTimer;
void main() {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);

    vTextureCoord = aTextureCoord;
    vActiveTextureCoord = (activeTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy;
    vNextTextureCoord = (nextTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy;
    
    vVertexPosition = aVertexPosition;
}