import { createCityNodes } from "./city-model";
import { seededRandom } from "./scenarios";
import { simulate } from "./propagation-engine";
import { Scenario, SearchProgress, SimulationResult } from "./types";
import { validateCandidate } from "./candidate-constraints";

const TARGETS=createCityNodes().filter(n=>!["demand"].includes(n.domain)).map(n=>n.id);
export function cascadeSignature(r:SimulationResult){return r.events.filter(e=>e.kind==="dependency"&&e.capacity<75).map(e=>`${e.nodeId}@${e.tick}`).join(">");}
export function scenarioFitness(s:Scenario,known=new Set<string>()){const validity=validateCandidate(s);if(!validity.valid)return-100-validity.reasons.length*10;const r=simulate(s), signature=cascadeSignature(r), domains=new Set(r.events.filter(e=>e.kind==="dependency"&&e.capacity<75).map(e=>e.domain)).size, consequential=r.events.filter(e=>e.kind==="dependency"&&e.capacity<75), delayed=Math.max(0,...consequential.map(e=>e.tick))-s.shocks[0].start;return r.finalMetrics.severity+domains*4+r.finalMetrics.cascadeDepth*2+delayed*.8+(known.has(signature)?0:6)-s.shocks.length*8}
export function evolutionarySearchRun(seed=2025,generations=8,populationSize=18):{progress:SearchProgress[];evaluations:{scenario:Scenario;result:SimulationResult;fitness:number}[]}{
 const rnd=seededRandom(seed); let pop:Scenario[]=Array.from({length:populationSize},(_,i)=>make(i)); const known=new Set<string>(), progress:SearchProgress[]=[];
 const evaluations:{scenario:Scenario;result:SimulationResult;fitness:number}[]=[];
 let bestEver:{s:Scenario;f:number}|null=null;
 function make(i:number,parent?:Scenario):Scenario{const base=parent?.shocks[0];return{id:`candidate-${i}`,name:"Adversarial candidate",description:"Population-search candidate",seed:seed+i,duration:16,shocks:[{id:`g-${i}`,nodeId:rnd()<.65&&base?base.nodeId:TARGETS[Math.floor(rnd()*TARGETS.length)],start:Math.floor(rnd()*3),duration:1+Math.floor(rnd()*4),intensity:Math.max(35,Math.min(90,(base?.intensity||45)+Math.floor(rnd()*31)-10)),label:"Adversarially generated disruption"}]}}
 for(let g=0;g<generations;g++){const scored=pop.map(s=>{const r=simulate(s);return{s,f:scenarioFitness(s,known),r}}).sort((a,b)=>b.f-a.f);scored.forEach(x=>{known.add(cascadeSignature(x.r));evaluations.push({scenario:x.s,result:x.r,fitness:x.f})});if(!bestEver||scored[0].f>bestEver.f)bestEver={s:scored[0].s,f:scored[0].f};progress.push({generation:g+1,bestFitness:bestEver.f,averageFitness:scored.reduce((a,x)=>a+x.f,0)/scored.length,uniqueCascades:known.size,bestScenario:bestEver.s});const elite=scored.slice(0,Math.max(3,Math.floor(populationSize/4))).map(x=>x.s);pop=[...elite,...Array.from({length:populationSize-elite.length},(_,i)=>make(g*100+i,elite[Math.floor(rnd()*elite.length)]))]}
 return {progress,evaluations};
}
export function evolutionarySearch(seed=2025,generations=8,populationSize=18):SearchProgress[]{return evolutionarySearchRun(seed,generations,populationSize).progress}
