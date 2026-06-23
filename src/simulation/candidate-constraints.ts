import { createCityNodes } from "./city-model";
import { Scenario } from "./types";
const validNodes=new Set(createCityNodes().filter(n=>n.domain!=="demand").map(n=>n.id));
export type RejectionReason="UNKNOWN_COMPONENT"|"DEMAND_IS_NOT_A_FAILURE_SOURCE"|"EXCESSIVE_INTENSITY"|"EXCESSIVE_DURATION"|"DUPLICATE_INITIAL_FAILURE"|"ARBITRARY_DESTRUCTION";
export function validateCandidate(scenario:Scenario):{valid:boolean;reasons:RejectionReason[]}{const reasons:RejectionReason[]=[];if(scenario.shocks.length>3)reasons.push("ARBITRARY_DESTRUCTION");const seen=new Set<string>();for(const s of scenario.shocks){if(!createCityNodes().some(n=>n.id===s.nodeId))reasons.push("UNKNOWN_COMPONENT");else if(!validNodes.has(s.nodeId))reasons.push("DEMAND_IS_NOT_A_FAILURE_SOURCE");if(s.intensity>95)reasons.push("EXCESSIVE_INTENSITY");if(s.duration>6)reasons.push("EXCESSIVE_DURATION");if(seen.has(s.nodeId))reasons.push("DUPLICATE_INITIAL_FAILURE");seen.add(s.nodeId)}return{valid:reasons.length===0,reasons:[...new Set(reasons)]}}
export function constraintAudit():{label:string;valid:boolean;reasons:RejectionReason[]}[]{const base={id:"audit",name:"Audit",description:"Constraint audit",seed:1,duration:10};return[
 {label:"Residential demand injected as a cause",...validateCandidate({...base,shocks:[{id:"a",nodeId:"res-n",start:0,duration:1,intensity:60,label:"invalid"}]})},
 {label:"Unbounded destructive shock",...validateCandidate({...base,shocks:[{id:"b",nodeId:"grid-control",start:0,duration:9,intensity:100,label:"invalid"}]})},
 {label:"Duplicate component mutation",...validateCandidate({...base,shocks:[{id:"c",nodeId:"telecom-auth",start:0,duration:1,intensity:60,label:"invalid"},{id:"d",nodeId:"telecom-auth",start:1,duration:1,intensity:60,label:"invalid"}]})},
 {label:"Bounded infrastructure shock",...validateCandidate({...base,shocks:[{id:"e",nodeId:"telecom-auth",start:0,duration:2,intensity:62,label:"valid"}]})}
 ]}
