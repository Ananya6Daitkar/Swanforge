import { analyzeRobustness } from "./experiments";
import { INTERVENTIONS } from "./intervention-optimizer";
import { Intervention,Scenario } from "./types";
export interface RobustParetoSolution{interventions:Intervention[];cost:number;collapseProbability:number;medianSeverity:number;}
function combinations<T>(items:T[],max:number){const out:T[][]=[];const walk=(start:number,c:T[])=>{if(c.length)out.push(c);if(c.length===max)return;for(let i=start;i<items.length;i++)walk(i+1,[...c,items[i]])};walk(0,[]);return out}
export function uncertaintyPareto(scenario:Scenario,seed=441,trials=24,maxSize=3):RobustParetoSolution[]{const candidates=combinations(INTERVENTIONS,maxSize).map((interventions,i)=>{const r=analyzeRobustness(scenario,seed+i*13,trials,interventions);return{interventions,cost:interventions.reduce((s,x)=>s+x.cost,0),collapseProbability:r.collapseProbability,medianSeverity:r.medianSeverity}});return candidates.filter(a=>!candidates.some(b=>b!==a&&b.cost<=a.cost&&b.collapseProbability<=a.collapseProbability&&b.medianSeverity<=a.medianSeverity&&(b.cost<a.cost||b.collapseProbability<a.collapseProbability||b.medianSeverity<a.medianSeverity))).sort((a,b)=>a.cost-b.cost)}
