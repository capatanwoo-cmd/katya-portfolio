/* An original particle ocean, drawn in one WebGL pass behind the page. */
(()=>{
 'use strict';
 const canvas=document.getElementById('ambient-canvas'),glow=document.getElementById('cursor-glow');
 if(!canvas)return;
 const gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power',depth:false,stencil:false});
 if(!gl)return;
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 const vertex=`
 precision highp float;
 attribute vec3 aGrid;
 uniform float uTime,uAspect,uDpr,uActive;
 uniform vec2 uPointer;
 varying float vAlpha,vRed;
 void main(){
  float x=aGrid.x,z=aGrid.y,t=uTime;
  float wave=sin(x*.82+z*.74-t*.52)*.28+sin(x*1.53-z*.58+t*.28)*.14+sin(x*.24+z*.31-t*.19)*.34;
  float crest=sin(x*.82+z*.74-t*.52)*.58+sin(x*1.53-z*.58+t*.28)*.16;
  vec2 p=vec2(x/(z+2.)*3.05/uAspect,.64+(wave-2.1)/(z+2.)*3.7);
  float dist=distance(p,uPointer);
  float swell=exp(-dist*dist*9.)*uActive;
  p.y+=swell*.1*sin(dist*17.-t*1.7)+swell*.035;
  p.x+=uPointer.x*.025*(1.-z/42.)*uActive;
  p.y+=uPointer.y*.012*uActive;
  float fog=1.-smoothstep(22.,38.,z);
  float ridge=pow(max(0.,crest+.22),2.);
  vAlpha=(.10+ridge*.65)*fog*(.65+aGrid.z*.35);
  vRed=swell;
  gl_Position=vec4(p,0.,1.);
  gl_PointSize=clamp((1.9-z*.033)*( .7+aGrid.z*.55),.65,2.3)*uDpr;
 }`;
 const fragment=`
 precision mediump float;
 varying float vAlpha,vRed;
 void main(){
  float d=length(gl_PointCoord-.5)*2.;
  float soft=1.-smoothstep(.18,1.,d);
  vec3 gray=vec3(.52,.53,.54);
  vec3 color=mix(gray,vec3(.92,.13,.10),vRed*.88);
  gl_FragColor=vec4(color,vAlpha*soft);
 }`;
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);return gl.getShaderParameter(s,gl.COMPILE_STATUS)?s:null;}
 const vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment);if(!vs||!fs)return;
 const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;gl.useProgram(program);
 const small=innerWidth<700,cols=small?172:292,rows=small?124:190,data=new Float32Array(cols*rows*3);
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
  const k=(j*cols+i)*3,rand=((i*73+j*151)%997)/997;
  data[k]=(i/(cols-1)-.5)*54+(rand-.5)*.095;data[k+1]=1+j/(rows-1)*36+(rand-.5)*.08;data[k+2]=rand;
 }
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
 const attr=gl.getAttribLocation(program,'aGrid');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,3,gl.FLOAT,false,0,0);
 const uniforms={};for(const key of ['uTime','uAspect','uDpr','uActive','uPointer'])uniforms[key]=gl.getUniformLocation(program,key);
 gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.clearColor(8/255,8/255,8/255,1);
 let width=1,height=1,dpr=1,raf=0,last=0,lastDraw=0,time=0,active=0,targetActive=0,mx=0,my=0,tx=0,ty=0;
 const off=()=>reducedMotion.matches||document.documentElement.dataset.motion==='off';
 function resize(){width=document.documentElement.clientWidth;height=innerHeight;dpr=Math.min(devicePixelRatio||1,1.35);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);gl.viewport(0,0,canvas.width,canvas.height);draw();}
 function draw(){
  gl.uniform1f(uniforms.uTime,time);gl.uniform1f(uniforms.uAspect,width/height);gl.uniform1f(uniforms.uDpr,dpr);gl.uniform1f(uniforms.uActive,active);gl.uniform2f(uniforms.uPointer,mx,my);
  gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.POINTS,0,cols*rows);
 }
 function frame(now){
  raf=0;if(document.hidden||off()){last=0;return;}
  if(now-lastDraw>32){
   const dt=last?Math.min(.06,(now-last)/1000):0;last=now;lastDraw=now;time+=dt;
   const ease=1-Math.exp(-dt*7);mx+=(tx-mx)*ease;my+=(ty-my)*ease;active+=(targetActive-active)*ease;
   glow.style.setProperty('--pointer-x',`${(mx+1)*50}%`);glow.style.setProperty('--pointer-y',`${(1-my)*50}%`);glow.style.opacity=String(active);
   draw();
  }
  raf=requestAnimationFrame(frame);
 }
 function sync(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;if(off()){active=0;targetActive=0;glow.style.opacity='0';draw();}else if(!document.hidden)raf=requestAnimationFrame(frame);}
 window.addEventListener('pointermove',event=>{if(event.pointerType==='touch'||off())return;tx=event.clientX/width*2-1;ty=1-event.clientY/height*2;targetActive=1;},{passive:true});
 document.addEventListener('pointerout',event=>{if(!event.relatedTarget)targetActive=0;},{passive:true});
 window.addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',sync);document.addEventListener('portfolio-motion',sync);reducedMotion.addEventListener('change',sync);
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();if(raf)cancelAnimationFrame(raf);raf=0;glow.style.opacity='0';});
 resize();sync();
})();
