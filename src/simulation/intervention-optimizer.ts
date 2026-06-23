import { createDependencies } from "./city-model";
import { criticalCollapse } from "./causal-minimizer";
import { simulate } from "./propagation-engine";
import { Intervention, Scenario, SimulationResult } from "./types";

export const INTERVENTIONS:Intervention[]=[
 {id:"offline-fuel",label:"Offline fuel authorization",description:"Allow emergency fuel transactions to settle after connectivity returns.",type:"offline-payment",value:64,cost:2},
 {id:"hospital-reserve-n",label:"Extend North hospital fuel reserve",description:"Add six ticks of protected generator reserve.",type:"reserve",nodeId:"hospital-n",value:6,cost:4},
 {id:"auth-backup",label:"Authentication edge replica",description:"Add isolated backup capacity at telecom authentication.",type:"backup",nodeId:"telecom-auth",value:55,cost:5},
 {id:"dispatch-radio",label:"Independent dispatch radio",description:"Harden a tower-to-dispatch dependency.",type:"harden",edgeId:createDependencies().find(e=>e.source==="tower-n"&&e.target==="dispatch")!.id,value:45,cost:4},
 {id:"water-generator",label:"Treatment backup generator",description:"Increase protected treatment capacity.",type:"backup",nodeId:"treatment",value:55,cost:5},
 {id:"bridge-access",label:"Emergency bridge bypass",description:"Provide a dedicated emergency access lane.",type:"access",edgeId:createDependencies().find(e=>e.source==="bridge"&&e.target==="ambulance")!.id,value:60,cost:3},
];
export interface OptimizationResult{intervention:Intervention|null;before:SimulationResult;after:SimulationResult;preventedEvent:string;}
export function optimizeIntervention(scenario:Scenario):OptimizationResult{
  const before=simulate(scenario); const ranked=[...INTERVENTIONS].sort((a,b)=>a.cost-b.cost);
  for(const intervention of ranked){const after=simulate(scenario,intervention);if(!criticalCollapse(after))return{intervention,before,after,preventedEvent:before.events.find(e=>e.kind==="failure"&&(e.domain==="health"||e.domain==="water"||e.domain==="emergency"))?.message||"Critical service collapse"};}
  return{intervention:null,before,after:before,preventedEvent:"No feasible single intervention"};
}
export interface ParetoSolution{interventions:Intervention[];cost:number;severity:number;collapsed:boolean;result:SimulationResult;}
function combinations<T>(items:T[],max:number){const out:T[][]=[];const walk=(start:number,chosen:T[])=>{if(chosen.length)out.push(chosen);if(chosen.length===max)return;for(let i=start;i<items.length;i++)walk(i+1,[...chosen,items[i]])};walk(0,[]);return out}
export function paretoInterventions(scenario:Scenario,maxSize=3):ParetoSolution[]{
 const candidates=combinations(INTERVENTIONS,maxSize).map(interventions=>{const result=simulate(scenario,undefined,{interventions});return{interventions,cost:interventions.reduce((s,i)=>s+i.cost,0),severity:result.finalMetrics.severity,collapsed:criticalCollapse(result),result}});
 return candidates.filter(a=>!candidates.some(b=>b!==a&&b.cost<=a.cost&&b.severity<=a.severity&&Number(b.collapsed)<=Number(a.collapsed)&&(b.cost<a.cost||b.severity<a.severity||Number(b.collapsed)<Number(a.collapsed)))).sort((a,b)=>a.cost-b.cost||a.severity-b.severity);
}
