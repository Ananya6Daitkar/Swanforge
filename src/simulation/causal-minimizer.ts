import { Scenario, SimulationResult } from "./types";
import { simulate } from "./propagation-engine";

export interface MinimizedResult { scenario: Scenario; result: SimulationResult; removedConditions: number; }
export function criticalCollapse(result:SimulationResult){
  return result.timeline.some(t=>t.nodes.some(n=>n.id.startsWith("hospital-")&&n.capacity<n.minimumThreshold) || t.metrics.waterAvailability<35 || t.metrics.emergencyResponse<40);
}
export function minimizeScenario(scenario:Scenario, predicate=criticalCollapse):MinimizedResult{
  let shocks=scenario.shocks.map(shock=>({...shock})); let removed=0;
  for(let i=shocks.length-1;i>=0;i--){const candidate=shocks.filter((_,j)=>j!==i);if(!candidate.length)continue;const test={...scenario,shocks:candidate};if(predicate(simulate(test))){shocks=candidate;removed++;}}
  for(let i=0;i<shocks.length;i++){
    const s=shocks[i]; for(const field of ["duration","intensity"] as const){
      let changed=true; while(changed){ const step=field==="duration"?1:5; const floor=field==="duration"?1:10; const value=Math.max(floor,s[field]-step); if(value===s[field])break;
        const candidate=shocks.map((x,j)=>j===i?{...x,[field]:value}:x); if(predicate(simulate({...scenario,shocks:candidate}))){shocks=candidate;Object.assign(s,shocks[i]);removed++;}else changed=false;
      }
    }
  }
  const minimized={...scenario,id:`${scenario.id}-minimal`,name:`Minimal: ${scenario.name}`,shocks};return{scenario:minimized,result:simulate(minimized),removedConditions:removed};
}

export function causalTrace(result:SimulationResult){
  const failures=result.events.filter(e=>e.kind==="failure"); const critical=result.events.filter(e=>(e.domain==="health"||e.domain==="emergency"||e.domain==="water")&&e.capacity<45&&e.kind==="dependency"); const target=[...failures].reverse().find(e=>e.domain==="health"||e.domain==="emergency"||e.domain==="water")||critical.at(-1)||failures.at(-1);
  if(!target)return[]; const byId=new Map(result.events.map(e=>[e.id,e])); const trace=[]; let current=target;
  while(current){trace.unshift(current); const parent=current.causalParentIds.map(id=>byId.get(id)).find(Boolean); if(!parent)break; current=parent;}
  const shock=result.events.find(e=>e.kind==="shock"); if(shock&&!trace.some(e=>e.id===shock.id))trace.unshift(shock); return trace.filter((e,i,a)=>i===0||e.nodeId!==a[i-1].nodeId||e.kind==="failure");
}
