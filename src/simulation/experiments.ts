import { createCityNodes,createDependencies } from "./city-model";
import { criticalCollapse } from "./causal-minimizer";
import { cascadeSignature,evolutionarySearchRun } from "./evolutionary-search";
import { simulate } from "./propagation-engine";
import { seededRandom } from "./scenarios";
import { BenchmarkMethodResult,Intervention,RobustnessResult,Scenario,SimulationResult } from "./types";

const nodes=createCityNodes();
const mean=(x:number[])=>x.reduce((a,b)=>a+b,0)/x.length;
function spearman(xs:number[],ys:number[]){const rank=(v:number[])=>v.map((x,i)=>({x,i})).sort((a,b)=>a.x-b.x).reduce((out,p,r)=>(out[p.i]=r,out),Array(v.length).fill(0) as number[]),a=rank(xs),b=rank(ys),ma=mean(a),mb=mean(b),num=a.reduce((s,x,i)=>s+(x-ma)*(b[i]-mb),0),den=Math.sqrt(a.reduce((s,x)=>s+(x-ma)**2,0)*b.reduce((s,x)=>s+(x-mb)**2,0));return den?num/den:0}
const targets=nodes.filter(n=>n.domain!=="demand");
const degree=new Map(nodes.map(n=>[n.id,0]));createDependencies().forEach(e=>{degree.set(e.source,(degree.get(e.source)||0)+1);degree.set(e.target,(degree.get(e.target)||0)+1)});
function candidate(seed:number,index:number,nodeId:string,intensity:number,duration:number,start:number):Scenario{return{id:`experiment-${seed}-${index}`,name:"Experiment candidate",description:"Deterministic equal-budget benchmark candidate",seed:seed+index,duration:16,shocks:[{id:`shock-${seed}-${index}`,nodeId,start,duration,intensity,label:"Benchmark-generated disruption"}]}}
function summarize(method:BenchmarkMethodResult["method"],evaluations:SimulationResult[]):BenchmarkMethodResult{
 const severe=evaluations.map((r,i)=>({r,i})).filter(x=>criticalCollapse(x.r)||x.r.finalMetrics.severity>=25);const signatures=new Set(severe.map(x=>cascadeSignature(x.r)).filter(Boolean));const depths=evaluations.map(r=>r.finalMetrics.cascadeDepth).sort((a,b)=>a-b);
 return{method,simulations:evaluations.length,severeCascades:severe.length,uniqueCascades:signatures.size,bestSeverity:Math.max(...evaluations.map(r=>r.finalMetrics.severity)),medianDepth:depths[Math.floor(depths.length/2)]||0,timeToFirstSevere:severe[0]?.i??null};
}
export function runBaselineBenchmark(seed=8801,budget=120):BenchmarkMethodResult[]{
 const rnd=seededRandom(seed), random:Array<SimulationResult>=[], critical:Array<SimulationResult>=[], central:Array<SimulationResult>=[];
 const byCritical=[...targets].sort((a,b)=>b.criticality-a.criticality),byDegree=[...targets].sort((a,b)=>(degree.get(b.id)||0)-(degree.get(a.id)||0));
 for(let i=0;i<budget;i++){const intensity=35+Math.floor(rnd()*56),duration=1+Math.floor(rnd()*4),start=Math.floor(rnd()*3);random.push(simulate(candidate(seed,i,targets[Math.floor(rnd()*targets.length)].id,intensity,duration,start)));critical.push(simulate(candidate(seed+1000,i,byCritical[i%Math.min(8,byCritical.length)].id,intensity,duration,start)));central.push(simulate(candidate(seed+2000,i,byDegree[i%Math.min(8,byDegree.length)].id,intensity,duration,start)));}
 const pop=20,generations=Math.ceil(budget/pop),evo=evolutionarySearchRun(seed,generations,pop).evaluations.slice(0,budget).map(x=>x.result);
 return[summarize("Evolutionary",evo),summarize("Uniform random",random),summarize("Criticality ranked",critical),summarize("Graph centrality",central)];
}

function percentile(values:number[],p:number){const sorted=[...values].sort((a,b)=>a-b);return sorted[Math.min(sorted.length-1,Math.floor((sorted.length-1)*p))]}
export function analyzeRobustness(scenario:Scenario,seed=7319,trials=64,interventions:Intervention[]=[]):RobustnessResult{
 const rnd=seededRandom(seed),edges=createDependencies(),samples:RobustnessResult["samples"]=[];
 for(let trial=0;trial<trials;trial++){const intensityFactor=.8+rnd()*.4,dependencyFactor=.75+rnd()*.5,recoveryFactor=.75+rnd()*.5;const perturbed={...scenario,shocks:scenario.shocks.map(s=>({...s,intensity:Math.min(100,s.intensity*intensityFactor)}))};const dependencyMultipliers=Object.fromEntries(edges.map(e=>[e.id,dependencyFactor*(.9+rnd()*.2)]));const result=simulate(perturbed,undefined,{dependencyMultipliers,recoveryMultiplier:recoveryFactor,interventions});samples.push({trial,intensityFactor,dependencyFactor,recoveryFactor,severity:result.finalMetrics.severity,collapsed:criticalCollapse(result)})}
 const probability=samples.filter(s=>s.collapsed).length/trials,severities=samples.map(s=>s.severity);return{trials,collapseProbability:probability,medianSeverity:percentile(severities,.5),severityP10:percentile(severities,.1),severityP90:percentile(severities,.9),classification:probability>=.75?"ROBUST":probability>=.35?"SENSITIVE":"FRAGILE",samples};
}
export function sensitivityAttribution(result:RobustnessResult){const severity=result.samples.map(s=>s.severity),raw=[{parameter:"Shock intensity",correlation:spearman(result.samples.map(s=>s.intensityFactor),severity)},{parameter:"Dependency strength",correlation:spearman(result.samples.map(s=>s.dependencyFactor),severity)},{parameter:"Recovery rate",correlation:spearman(result.samples.map(s=>s.recoveryFactor),severity)}],total=raw.reduce((s,x)=>s+Math.abs(x.correlation),0)||1;return raw.map(x=>({...x,share:Math.abs(x.correlation)/total})).sort((a,b)=>b.share-a.share)}
