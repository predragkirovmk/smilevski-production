/* ============================================================
   shader-bg.js — WebGL2 futuristic grid background (hero only)
   Dark neutral / monochrome color scheme
   ============================================================ */

(function () {
  "use strict";

  /* ── Fragment shader ── */
  const SHADER_SRC = `#version 300 es
precision highp float;

out vec4 fragColor;
in vec2 v_uv;

uniform vec3  iResolution;
uniform float iTime;
uniform int   iFrame;
uniform vec4  iMouse;

const float GRID_SCALE   = 18.0;
const float MAJOR_STEP   = 4.0;
const float THIN_WIDTH   = 0.010;
const float MAJOR_WIDTH  = 0.018;
const float SCROLL_SPEED = 0.02;

const float VIGNETTE_AMT = 0.28;
const float MESH_AMT     = 0.85;
const float NOISE_AMT    = 0.030;
const float DITHER_DARK  = 0.010;
const float DITHER_LIGHT = 0.004;

const float ASCII_AMT    = 0.23;
const float ASCII_SCALE  = 26.0;
const float ASCII_EVERY  = 2.0;

mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

float bayer4(vec2 p){
  ivec2 ip = ivec2(int(mod(p.x,4.0)), int(mod(p.y,4.0)));
  int idx = ip.y*4 + ip.x;
  int m[16]; m[0]=0;m[1]=8;m[2]=2;m[3]=10;m[4]=12;m[5]=4;m[6]=14;m[7]=6;
  m[8]=3;m[9]=11;m[10]=1;m[11]=9;m[12]=15;m[13]=7;m[14]=13;m[15]=5;
  return float(m[idx]) / 15.0;
}

float hash21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  float a=hash21(i), b=hash21(i+vec2(1,0)), c=hash21(i+vec2(0,1)), d=hash21(i+vec2(1,1));
  vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}

float gridLineAA(vec2 uv, float scale, float width){
  vec2 g = abs(fract(uv*scale) - 0.5);
  float d = min(g.x, g.y);
  float aa = fwidth(d);
  return 1.0 - smoothstep(width, width + aa, d);
}
float majorGridAA(vec2 uv, float scale, float stepN, float width){
  float sMajor = max(1.0, scale/stepN);
  return gridLineAA(uv, sMajor, width);
}

// mesh gradient — dark neutral grays
vec3 meshGradient(vec2 uv){
  vec2 p0=vec2(-0.70,-0.45), p1=vec2(0.75,-0.35), p2=vec2(-0.65,0.65), p3=vec2(0.80,0.55);
  vec3 c0=vec3(0.02,0.02,0.03);
  vec3 c1=vec3(0.05,0.05,0.06);
  vec3 c2=vec3(0.01,0.01,0.02);
  vec3 c3=vec3(0.07,0.07,0.08);
  float e=2.0;
  float w0=pow(1.0/(0.2+distance(uv,p0)),e);
  float w1=pow(1.0/(0.2+distance(uv,p1)),e);
  float w2=pow(1.0/(0.2+distance(uv,p2)),e);
  float w3=pow(1.0/(0.2+distance(uv,p3)),e);
  float ws=w0+w1+w2+w3;
  return (c0*w0+c1*w1+c2*w2+c3*w3)/ws;
}

float sdLineX(vec2 p, float w){ return 1.0 - smoothstep(w, w+fwidth(p.y), abs(p.y)); }
float sdLineY(vec2 p, float w){ return 1.0 - smoothstep(w, w+fwidth(p.x), abs(p.x)); }
float sdDiag1(vec2 p, float w){ float d=abs(p.x+p.y)/sqrt(2.0); return 1.0 - smoothstep(w, w+fwidth(d), d); }
float sdDiag2(vec2 p, float w){ float d=abs(p.x-p.y)/sqrt(2.0); return 1.0 - smoothstep(w, w+fwidth(d), d); }
float sdDot (vec2 p, float r){ float d=length(p); return 1.0 - smoothstep(r, r+fwidth(d), d); }

float asciiGlyph(vec2 cellUV, float level){
  vec2 p=cellUV; float w=0.11, r=0.10;
  float g0=sdDot(p,r), g1=sdLineX(p,w), g2=sdLineY(p,w),
        g3=max(sdLineX(p,w),sdLineY(p,w)),
        g4=sdDiag1(p,w), g5=sdDiag2(p,w),
        g6=max(sdDiag1(p,w),sdDiag2(p,w)),
        g7=max(sdLineX(p,w), max(sdLineY(p,w), g6));
  float m=0.;
  m=mix(m,g0, smoothstep(0.00,0.12,level)*(1.0-step(level,0.12)));
  m=mix(m,g1, smoothstep(0.12,0.28,level)*(1.0-step(level,0.28)));
  m=mix(m,g2, smoothstep(0.28,0.44,level)*(1.0-step(level,0.44)));
  m=mix(m,g3, smoothstep(0.44,0.60,level)*(1.0-step(level,0.60)));
  m=mix(m,g4, smoothstep(0.60,0.72,level)*(1.0-step(level,0.72)));
  m=mix(m,g5, smoothstep(0.72,0.84,level)*(1.0-step(level,0.84)));
  m=mix(m,g6, smoothstep(0.84,0.94,level)*(1.0-step(level,0.94)));
  m=mix(m,g7, smoothstep(0.94,1.00,level));
  return clamp(m,0.0,1.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
  vec2  R = iResolution.xy;
  float t = iTime;
  vec2 uv = (fragCoord - 0.5*R) / max(R.y, 1.0);

  vec3 baseDeep = vec3(0.01,0.01,0.02);
  vec3 baseTint = vec3(0.04,0.04,0.05);
  float vgrad   = smoothstep(-0.92, 0.55, -uv.y);
  vec3  bg      = mix(baseDeep, baseTint, vgrad);
  bg            = mix(bg, meshGradient(uv), MESH_AMT);
  float rad     = length(uv);
  float vig     = pow(1.0 - VIGNETTE_AMT * rad, 1.0);
  bg           *= clamp(vig, 0.0, 1.0);

  vec2 scrollDir = normalize(vec2(1.0, -0.55));
  vec2 uvAnim    = uv + SCROLL_SPEED * t * scrollDir;

  float thin  = gridLineAA (uvAnim, GRID_SCALE, THIN_WIDTH);
  float major = majorGridAA(uvAnim, GRID_SCALE, MAJOR_STEP, MAJOR_WIDTH);

  vec3 lineThin  = vec3(0.45,0.45,0.50);
  vec3 lineMajor = vec3(0.65,0.65,0.70);

  vec3 col = bg
           + lineThin  * thin  * 0.25
           + lineMajor * major * 0.52;

  vec2 uMajor = uvAnim * (GRID_SCALE / MAJOR_STEP);
  vec2 idx    = floor(uMajor + 0.5);
  float selX = 1.0 - step(0.001, abs(fract(idx.x / ASCII_EVERY)));
  float selY = 1.0 - step(0.001, abs(fract(idx.y / ASCII_EVERY)));
  float asciiLineSel = max(selX, selY);

  if (ASCII_AMT > 0.001) {
    vec2 aUV   = uv * ASCII_SCALE;
    vec2 cellF = fract(aUV) - 0.5;
    float lvl  = clamp(dot(col, vec3(0.2126,0.7152,0.0722)), 0.0, 1.0);
    float glyph = asciiGlyph(cellF, lvl);

    float nearMajor = major;
    float asciiMask = asciiLineSel * nearMajor;
    vec3 asciiColor = mix(vec3(0.55,0.55,0.60), meshGradient(uv), 0.25);

    col = mix(col, col + asciiColor * glyph * 0.30, ASCII_AMT * asciiMask);
  }

  float n = vnoise(fragCoord*0.6 + vec2(t*12.0, -t*9.0));
  col += (n - 0.5) * NOISE_AMT;

  float luma = dot(col, vec3(0.2126,0.7152,0.0722));
  float dAmt = mix(DITHER_DARK, DITHER_LIGHT, luma);
  col += (bayer4(fragCoord) - 0.5) * dAmt;

  col = tanh(col);
  fragColor = vec4(col, 1.0);
}

void main(){ mainImage(fragColor, gl_FragCoord.xy); }
`;

  /* ── Vertex shader: fullscreen triangle ── */
  const VERT_SRC = `#version 300 es
precision highp float;
layout(location=0) in vec2 a_pos;
out vec2 v_uv;
void main(){
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

  /* ── Helpers ── */
  function compileShader(gl, type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error("Shader compile error:", gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  function linkProgram(gl, vs, fs) {
    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(prog));
      gl.deleteProgram(prog);
      return null;
    }
    return prog;
  }

  /* ── Main init ── */
  function initShaderBackground() {
    /* Respect reduced motion */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var canvas = document.getElementById("shader-bg");
    if (!canvas) return;

    var gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: "low-power",
    });

    if (!gl) {
      console.warn("WebGL2 not supported — shader background disabled");
      canvas.style.display = "none";
      return;
    }

    /* Compile & link */
    var vs = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
    var fs = compileShader(gl, gl.FRAGMENT_SHADER, SHADER_SRC);
    if (!vs || !fs) return;
    var program = linkProgram(gl, vs, fs);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!program) return;

    /* Geometry — fullscreen triangle */
    var vao = gl.createVertexArray();
    var vbo = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    /* Uniform locations */
    gl.useProgram(program);
    var uRes = gl.getUniformLocation(program, "iResolution");
    var uTime = gl.getUniformLocation(program, "iTime");
    var uFrame = gl.getUniformLocation(program, "iFrame");
    var uMouse = gl.getUniformLocation(program, "iMouse");

    /* State */
    var frame = 0;
    var startTime = performance.now();
    var mouseX = 0, mouseY = 0;
    var isVisible = true;
    var rafId = null;
    var resizeScheduled = false;

    /* Resize */
    function applySize() {
      resizeScheduled = false;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var cssW = canvas.clientWidth || 1;
      var cssH = canvas.clientHeight || 1;
      var w = Math.max(1, Math.floor(cssW * dpr));
      var h = Math.max(1, Math.floor(cssH * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }
    function scheduleSize() {
      if (!resizeScheduled) {
        resizeScheduled = true;
        requestAnimationFrame(applySize);
      }
    }
    var ro = new ResizeObserver(scheduleSize);
    ro.observe(canvas);
    applySize();

    /* Visibility — pause when hero scrolled away */
    var heroEl = document.querySelector(".hero");
    if (heroEl) {
      var io = new IntersectionObserver(
        function (entries) { isVisible = entries[0].isIntersecting; },
        { threshold: 0 }
      );
      io.observe(heroEl);
    }

    /* Mouse */
    canvas.parentElement.addEventListener("mousemove", function (e) {
      var rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = rect.height - (e.clientY - rect.top);
    });

    /* Context loss */
    canvas.addEventListener("webglcontextlost", function (e) {
      e.preventDefault();
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    });
    canvas.addEventListener("webglcontextrestored", function () {
      startTime = performance.now();
      frame = 0;
      rafId = requestAnimationFrame(tick);
    });

    /* Render loop */
    function tick(now) {
      if (!isVisible) { rafId = requestAnimationFrame(tick); return; }
      if (gl.isContextLost()) { rafId = requestAnimationFrame(tick); return; }

      var t = (now - startTime) / 1000;
      frame++;

      gl.useProgram(program);
      if (resizeScheduled) applySize();

      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (uRes) gl.uniform3f(uRes, canvas.width, canvas.height, dpr);
      if (uTime) gl.uniform1f(uTime, t);
      if (uFrame) gl.uniform1i(uFrame, frame);
      if (uMouse) gl.uniform4f(uMouse, mouseX * dpr, mouseY * dpr, 0, 0);

      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
  }

  /* ── Boot ── */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initShaderBackground);
  } else {
    initShaderBackground();
  }
})();
