import { createDependencies } from "./city-model";
import { causalTrace,criticalCollapse } from "./causal-minimizer";
import { simulate } from "./propagation-engine";
import { Scenario } from "./types";

export interface AblationResult{edgeId:string;edgeLabel:string;necessary:boolean;beforeSeverity:number;afterSeverity:number;preventedCollapse:boolean;}
export function ablateCausalLinks(scenario:Scenario):AblationResult[]{
 const before=simulate(scenario),trace=causalTrace(before),edges=createDependencies();const tracePairs=new Set(trace.slice(1).map((e,i)=>`${trace[i].nodeId}>${e.nodeId}`));
 return edges.filter(e=>tracePairs.has(`${e.source}>${e.target}`)).map(edge=>{const after=simulate(scenario,undefined,{disabledEdgeIds:[edge.id]});return{edgeId:edge.id,edgeLabel:`${edge.source} → ${edge.target}`,necessary:!criticalCollapse(after),beforeSeverity:before.finalMetrics.severity,afterSeverity:after.finalMetrics.severity,preventedCollapse:criticalCollapse(before)&&!criticalCollapse(after)}});
}
