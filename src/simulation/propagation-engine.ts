import { createCityNodes, createDependencies } from "./city-model";
import { calculateMetrics } from "./metrics";
import { CityNode, Dependency, Intervention, Scenario, SimulationEvent, SimulationOptions, SimulationResult } from "./types";

type Pending = { tick:number; edge:Dependency; parentIds:string[] };
const cloneNodes = () => createCityNodes().map(n=>({...n}));
const statusFor = (n:CityNode) => n.capacity <= 0 ? "failed" : n.capacity < n.minimumThreshold ? "critical" : n.capacity < 75 ? "degraded" : "healthy";

export function applyIntervention(nodes: CityNode[], edges: Dependency[], intervention?: Intervention) {
  if (!intervention) return;
  const node = nodes.find(n=>n.id===intervention.nodeId);
  const edge = edges.find(e=>e.id===intervention.edgeId);
  if (intervention.type === "backup" && node) { node.backupCapacity = Math.min(100,(node.backupCapacity||0)+intervention.value); node.backupDuration = (node.backupDuration||0)+4; }
  if (intervention.type === "reserve" && node) node.backupDuration = (node.backupDuration||0)+intervention.value;
  if (intervention.type === "tolerance" && node) node.minimumThreshold = Math.max(10,node.minimumThreshold-intervention.value);
  if (intervention.type === "recovery" && node) node.recoveryRate += intervention.value;
  if ((intervention.type === "harden" || intervention.type === "redundancy" || intervention.type === "access") && edge) edge.impactStrength = Math.max(0,edge.impactStrength-intervention.value);
  if (intervention.type === "offline-payment") edges.filter(e=>e.type==="PAYMENT" && (!intervention.nodeId || e.target===intervention.nodeId)).forEach(e=>e.impactStrength=Math.max(0,e.impactStrength-intervention.value));
}

export function simulate(scenario: Scenario, intervention?: Intervention, options:SimulationOptions={}): SimulationResult {
  const nodes=cloneNodes(), disabled=new Set(options.disabledEdgeIds||[]), edges=createDependencies().filter(e=>!disabled.has(e.id)).map(e=>({...e,impactStrength:e.impactStrength*(options.dependencyMultipliers?.[e.id]??1)}));
  const recoveryMultiplier=options.recoveryMultiplier;
  if(recoveryMultiplier!==undefined)nodes.forEach(n=>n.recoveryRate*=recoveryMultiplier);
  [intervention,...(options.interventions||[])].filter((x):x is Intervention=>Boolean(x)).forEach(x=>applyIntervention(nodes,edges,x));
  const allEvents:SimulationEvent[]=[], timeline:SimulationResult["timeline"]=[], pending:Pending[]=[], fired=new Set<string>();
  let eventNo=0;
  const add=(tick:number,node:CityNode,kind:SimulationEvent["kind"],delta:number,message:string,parents:string[]=[]):SimulationEvent=>{
    node.capacity=Math.max(0,Math.min(100,node.capacity+delta)); const previous=node.status; node.status=statusFor(node);
    const ev={id:`ev-${++eventNo}`,tick,nodeId:node.id,nodeLabel:node.label,domain:node.domain,kind,delta,capacity:node.capacity,message,causalParentIds:parents}; allEvents.push(ev);
    if(node.status==="failed" && previous!=="failed"){node.failureReason=message;node.timeOfFailure=tick; const f={...ev,id:`ev-${++eventNo}`,kind:"failure" as const,delta:0,message:`${node.label} failed: ${message}`,causalParentIds:[ev.id]};allEvents.push(f);return f} return ev;
  };
  for(let tick=0;tick<=scenario.duration;tick++){
    const tickStart=allEvents.length; const touched=new Set<string>();
    for(const shock of scenario.shocks.filter(s=>tick>=s.start && tick<s.start+s.duration)){
      const node=nodes.find(n=>n.id===shock.nodeId); if(!node) throw new Error(`Invalid scenario: unknown node ${shock.nodeId}`);
      touched.add(node.id); add(tick,node,"shock",-shock.intensity,shock.label);
    }
    for(const item of pending.filter(p=>p.tick===tick)){
      const target=nodes.find(n=>n.id===item.edge.target)!; const source=nodes.find(n=>n.id===item.edge.source)!;
      if(source.capacity<item.edge.requiredSourceCapacity){ const mult=scenario.dependencyDegradations?.[item.edge.id]??1; touched.add(target.id); add(tick,target,"dependency",-item.edge.impactStrength*mult,item.edge.explanation,item.parentIds); }
    }
    for(const edge of edges){
      const source=nodes.find(n=>n.id===edge.source)!; const key=`${edge.id}:${source.status==='healthy'?'ok':'down'}`;
      if(source.capacity<edge.requiredSourceCapacity && !fired.has(key)){
        const parents=allEvents.filter(ev=>ev.nodeId===source.id && ev.tick<=tick && ev.kind!=="recovery").slice(-1).map(ev=>ev.id); pending.push({tick:tick+edge.propagationDelay,edge,parentIds:parents}); fired.add(key);
      }
      if(source.capacity>=edge.requiredSourceCapacity) fired.delete(`${edge.id}:down`);
    }
    for(const node of nodes){
      if(touched.has(node.id) && node.capacity<node.minimumThreshold && (node.backupCapacity||0)>0 && tick<(node.backupDuration||0)) add(tick,node,"backup",Math.min(node.backupCapacity||0,100-node.capacity),`${node.label} activated finite backup capacity.`);
      if(!touched.has(node.id) && node.capacity<100){ const before=node.capacity; add(tick,node,"recovery",Math.min(node.recoveryRate,100-node.capacity),`${node.label} recovered ${Math.min(node.recoveryRate,100-before).toFixed(0)} capacity points.`); }
    }
    const tickEvents=allEvents.slice(tickStart); timeline.push({tick,nodes:nodes.map(n=>({...n})),events:tickEvents,metrics:calculateMetrics(nodes,tick,allEvents)});
  }
  const finalMetrics=timeline.at(-1)!.metrics;
  const signature=allEvents.filter(e=>e.kind==="failure").map(e=>e.nodeId).sort().join("|");
  return {scenario,timeline,events:allEvents,finalMetrics,signature};
}
