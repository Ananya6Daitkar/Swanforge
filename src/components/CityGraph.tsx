"use client";
import { Background, Controls, Edge, Handle, MarkerType, Node, Position, ReactFlow } from "@xyflow/react";
import { CityNode, Dependency } from "@/simulation/types";

const positions:Record<string,{x:number,y:number}>={
 "grid-control":{x:100,y:20},"substation-n":{x:-80,y:140},"substation-s":{x:280,y:140},"data-center":{x:460,y:20},"telecom-auth":{x:680,y:20},"tower-n":{x:620,y:150},"tower-s":{x:800,y:150},
 "treatment":{x:100,y:280},"pump-n":{x:-80,y:390},"pump-s":{x:280,y:390},"payments":{x:650,y:280},"fuel-depot":{x:470,y:390},"fuel-n":{x:610,y:500},"fuel-s":{x:790,y:500},
 "bridge":{x:980,y:280},"ring-road":{x:980,y:410},"transit":{x:980,y:540},"dispatch":{x:450,y:620},"ambulance":{x:300,y:740},"fire":{x:560,y:740},
 "hospital-n":{x:50,y:610},"hospital-s":{x:120,y:760},"command":{x:720,y:700},"res-n":{x:-160,y:620},"res-s":{x:-80,y:800},"industry":{x:860,y:700},"school":{x:890,y:820},"warehouse":{x:350,y:880}
};
function InfraNode({data}:{data:{node:CityNode}}){const n=data.node;return <div className={`infra-node ${n.domain} ${n.status}`}><Handle type="target" position={Position.Top}/><span className="node-domain">{n.domain}</span><strong>{n.label}</strong><div className="capacity"><i style={{width:`${n.capacity}%`}}/></div><small>{n.status.toUpperCase()} · {Math.round(n.capacity)}%</small><Handle type="source" position={Position.Bottom}/></div>}
const nodeTypes={infra:InfraNode};
export function CityGraph({nodes,dependencies,activeNodeIds=[]}:{nodes:CityNode[];dependencies:Dependency[];activeNodeIds?:string[]}){
 const graphNodes:Node[]=nodes.map((node,i)=>({id:node.id,type:"infra",position:positions[node.id]||{x:1100+(i%3)*170,y:80+Math.floor(i/3)*120},data:{node}}));
 const graphEdges:Edge[]=dependencies.map(d=>({id:d.id,source:d.source,target:d.target,animated:activeNodeIds.includes(d.target),style:{stroke:activeNodeIds.includes(d.target)?"#ff5b45":"#314055",strokeWidth:activeNodeIds.includes(d.target)?2.4:1},markerEnd:{type:MarkerType.ArrowClosed,color:activeNodeIds.includes(d.target)?"#ff5b45":"#516176"}}));
 return <ReactFlow nodes={graphNodes} edges={graphEdges} nodeTypes={nodeTypes} fitView minZoom={.25} maxZoom={1.3} nodesDraggable={false} proOptions={{hideAttribution:true}}><Background color="#263548" gap={24}/><Controls showInteractive={false}/></ReactFlow>
}
