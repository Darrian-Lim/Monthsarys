import * as THREE from 'three';
import { createIsland, createSeven, createBalloon, createString, setString, createGift, createCat, createClouds, createDust, blobShadow } from './objects.js';

export function buildStage(world, cfg) {
  const C = cfg.colors;
  const main = createIsland({ r: 5.2, seed: 3, flowers: 85, keep: [[-.9,-1.4,1.8],[1.5,1.2,1.3],[3.1,-.1,1],[-2.2,1.6,.9]] });
  const g = main.group; world.add(g);
  const seven = createSeven(C.seven); seven.position.set(-.9, seven.userData.h + .12, -1.4); seven.rotation.y=.3;
  g.add(seven, blobShadow(3.6,2.2,-.9,-1.4));
  const big = createGift(1.5,C.gifts[0]); big.group.position.set(1.5,0,1.2); big.group.rotation.y=-.3;
  // A tiny glossy heart sits inside the main gift and rises into view when the lid opens.
  const heartShape = new THREE.Shape(); heartShape.moveTo(0, -.22); heartShape.bezierCurveTo(-.58, .12, -.48, .62, 0, .42); heartShape.bezierCurveTo(.48, .62, .58, .12, 0, -.22);
  const heartGeo = new THREE.ExtrudeGeometry(heartShape, { depth: .12, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: .035, bevelThickness: .035 });
  const heartMesh = new THREE.Mesh(heartGeo, new THREE.MeshPhysicalMaterial({ color: C.heart, roughness: .18, clearcoat: 1, clearcoatRoughness: .08 }));
  heartMesh.rotation.x = 0;
  // Keep the heart tucked inside the box at first; the gift animation raises it
  // fully above the rim so its lower point and both lobes are visible.
  heartMesh.position.set(0, .68, .04);
  heartMesh.userData.hiddenY = .68;
  heartMesh.userData.revealY = 1.48;
  heartMesh.scale.setScalar(.001);
  big.group.add(heartMesh);
  big.contents = heartMesh;
  const littleGift=createGift(.75,C.gifts[1]); littleGift.group.position.set(-2.2,0,1.6); littleGift.group.rotation.y=.5;
  g.add(big.group,littleGift.group,blobShadow(2.2,2.2,1.5,1.2),blobShadow(1.1,1.1,-2.2,1.6));
  const cat=createCat(); cat.group.position.set(3.1,0,-.1); cat.group.rotation.y=.15; g.add(cat.group,blobShadow(1.5,1.2,3.1,-.1));
  const heart=createBalloon(C.heart), heartStr=createString(); g.add(heart,heartStr);
  const anchor=new THREE.Vector3(0,3,-1.68), floats=[[-.5,1.9,.2],[.55,2.3,-.1],[.05,2.7,.3]].map(([x,y,z],i)=>{const b=createBalloon(C.balloons[i]),s=createString();g.add(b,s);return {b,s,base:anchor.clone().add(new THREE.Vector3(x,y,z)),ph:i*2.1};});
  // Three discoverable islands, positioned as a loose triangle around the central island.
  const islandDefs=[
    {id:'memory',pos:[-10,1,-8],r:2.35,seed:21,color:C.gifts[1],title:'Memories',kind:'memory'},
    {id:'awards',pos:[10,2,-10],r:2.55,seed:32,color:C.gifts[2],title:'The Little Awards',kind:'awards',keep:[[0,0,2.05]],bare:true},
    {id:'wishes',pos:[0,6,-20],r:2.8,seed:43,color:C.gifts[3],title:'Wish Upon a Cloud',kind:'wishes',keep:[[0,.4,1.1],[1.8,1,.8]],bare:true}
  ];
  const islands=islandDefs.map((d,i)=>{
    const island=createIsland({r:d.r,seed:d.seed,flowers:24,keep:d.keep||[[0,0,1.2]]}); island.group.position.set(...d.pos); world.add(island.group);
    const gift=createGift(.8,d.color); gift.group.position.set(d.pos[0],d.pos[1],d.pos[2]); gift.group.position.y+=.05; world.add(gift.group);
    const balloon=createBalloon(C.balloons[i]); balloon.position.set(d.pos[0]+.95,d.pos[1]+1.6,d.pos[2]); world.add(balloon);
    if(d.bare){gift.group.visible=false;balloon.visible=false;}
    return {...d,group:island.group,gift,balloon,baseY:d.pos[1],phase:i*1.8,visited:false};
  });
  const far=[[3.2,7,[-15,2.5,-17]],[2.6,11,[13,5,-20]],[3.6,17,[-30,8,-42]],[2.8,19,[24,10,-38]]].map(([r,seed,p],i)=>{const o=createIsland({r,seed,flowers:16});o.group.position.set(...p);world.add(o.group);return {g:o.group,y:p[1],ph:i*1.3};});
  const layers=[[1,[[-40,-14,-30,3],[-10,-16,-40,3.5],[30,-13,-25,3],[55,-12,-45,3.5],[-60,-12,-50,4],[10,-15,-10,3],[-30,-14,0,3],[40,-14,5,3]],.3],[2,[[-18,-7,-10,2],[16,-8,-14,2],[0,-9,-22,2.4],[-26,-4,-30,2.4],[26,-3,-28,2.4],[-6,-8,6,2],[0,-7.5,0,1.8]],.5],[3,[[-9,-6.5,14,1.6],[8,-7,16,1.8],[0,-8.5,20,2],[16,-6,8,1.4],[-16,-6,8,1.4]],.7]].map(([seed,list,amp])=>{const c=createClouds(seed,list);world.add(c);return {c,amp};});
  const dust=createDust(100);world.add(dust); const P=new THREE.Vector3(),Q=new THREE.Vector3();let nextTug=7;
  world.onUpdate((t,dt)=>{
    const m=world.reduced?0:1;g.position.y=Math.sin(t*.6)*.1*m;g.rotation.y=Math.sin(t*.25)*.02*m;g.updateMatrixWorld();
    far.forEach(f=>f.g.position.y=f.y+Math.sin(t*.5+f.ph)*.25*m);
    layers.forEach((l,i)=>l.c.position.x=Math.sin(t*.04*(i+1)+i)*l.amp*6*m);
    floats.forEach(f=>{f.b.position.copy(f.base);f.b.position.y+=Math.sin(t*.9+f.ph)*.12*m;f.b.position.x+=Math.sin(t*.6+f.ph)*.1*m;Q.copy(f.b.position);Q.y-=.6;setString(f.s,anchor,Q);});
    islands.forEach((is,i)=>{is.group.position.y=is.baseY+Math.sin(t*.55+is.phase)*.22*m;is.gift.group.position.y=is.baseY+.1+Math.sin(t*1.2+is.phase)*.09*m;is.balloon.position.y=is.baseY+1.6+Math.sin(t*.9+is.phase)*.22*m;is.balloon.position.x=is.pos[0]+.95+Math.sin(t*.7+is.phase)*.12*m;});
    if(t>nextTug&&!world.reduced){cat.tug();nextTug=t+14+Math.random()*8;}
    cat.update(t,dt,world.camera.position,world.reduced);cat.hand.getWorldPosition(P);g.worldToLocal(P);
    heart.position.set(P.x+.1,P.y+1.7+Math.sin(t*1.1)*.08*m,P.z);heart.rotation.z=Math.sin(t*.8)*.06*m;Q.copy(heart.position);Q.y-=.6;setString(heartStr,P,Q);
    const a=dust.userData.a;if(!world.reduced){for(let i=1;i<a.length;i+=3){a[i]+=dt*.15;if(a[i]>12)a[i]=-2;}dust.geometry.attributes.position.needsUpdate=true;}
  });
  return {main,cat,big,littleGift,seven,islands};
}
