// ===================== PROP: THE KEYSTONE SHARDS =====================
// Four crystal shards of the Keystone (gold core, cyan edges). Each has a position and visibility; when the
// Keystone is assembled the four sit together as one star-shaped key.
uniform vec4 uKey[4];   // position xyz, visible
uniform vec4 uKeyB;     // spin, glow, unused, unused
float keystone(vec3 p, inout int m, float d){
  for(int i=0;i<4;i++){ if(uKey[i].w<.5) continue; vec3 q=p-uKey[i].xyz; float b=length(q)-.5; if(b>.2){ d=min(d,b); continue; }
    float a=uKeyB.x+float(i)*1.57; float c=cos(a), s=sin(a); q=vec3(c*q.x+s*q.z,q.y,-s*q.x+c*q.z);
    float oct=(abs(q.x)*1.6+abs(q.y)*.75+abs(q.z)*1.6-.3)*.5;
    if(oct<d){ d=oct; m=113; } }
  return d;
}
