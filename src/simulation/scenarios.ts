import { z } from "zod";
import { Scenario } from "./types";

const schema=z.object({id:z.string(),name:z.string(),description:z.string(),seed:z.number().int(),duration:z.number().int().positive(),shocks:z.array(z.object({id:z.string(),nodeId:z.string(),start:z.number().int().nonnegative(),duration:z.number().int().positive(),intensity:z.number().positive().max(100),label:z.string()})).min(1)});
export const SCENARIOS:Scenario[]=[
 {id:"telecom-cascade",name:"Silent Authentication Failure",description:"A quiet identity outage becomes a delayed fuel and hospital emergency.",seed:41,duration:16,shocks:[{id:"auth-1",nodeId:"telecom-auth",start:0,duration:2,intensity:62,label:"Authentication certificate service unavailable"}]},
 {id:"power-water",name:"Power → Water → Public Health",description:"A substation fault exhausts treatment and pumping redundancy.",seed:72,duration:14,shocks:[{id:"power-1",nodeId:"substation-s",start:0,duration:4,intensity:55,label:"Transformer protection trip"},{id:"power-2",nodeId:"grid-control",start:1,duration:2,intensity:35,label:"Control telemetry degradation"}]},
 {id:"road-response",name:"Blocked Lifeline",description:"A bridge closure fragments emergency access despite healthy vehicles.",seed:12,duration:12,shocks:[{id:"road-1",nodeId:"bridge",start:0,duration:6,intensity:78,label:"Bridge closed after structural sensor alarm"}]},
 {id:"data-grid",name:"Control Without Data",description:"Data-center failure destabilizes grid control and downstream power.",seed:99,duration:15,shocks:[{id:"data-1",nodeId:"data-center",start:0,duration:3,intensity:68,label:"Storage quorum failure"}]}
];
export function validateScenario(input:unknown):Scenario { return schema.parse(input) as Scenario; }
export function seededRandom(seed:number){let x=seed>>>0;return()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296}}
export function randomScenario(seed:number):Scenario{const r=seededRandom(seed), ids=["grid-control","substation-n","treatment","telecom-auth","bridge","data-center","fuel-depot"];const nodeId=ids[Math.floor(r()*ids.length)];return validateScenario({id:`random-${seed}`,name:"Seeded Random Shock",description:`Generated deterministically from seed ${seed}.`,seed,duration:14,shocks:[{id:`random-shock-${seed}`,nodeId,start:Math.floor(r()*3),duration:2+Math.floor(r()*3),intensity:45+Math.floor(r()*35),label:"Seeded synthetic disruption"}]})}
