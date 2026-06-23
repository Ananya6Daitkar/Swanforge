import { CityMetrics, CityNode, SimulationEvent } from "./types";

const avg = (xs: number[]) => xs.length ? xs.reduce((a,b) => a+b,0)/xs.length : 0;
export function calculateMetrics(nodes: CityNode[], tick: number, events: SimulationEvent[]): CityMetrics {
  const byDomain = (domain: string) => nodes.filter(n => n.domain === domain).map(n => n.capacity);
  const essential = nodes.filter(n => n.criticality >= .8);
  const failed = nodes.filter(n => n.status === "failed").length;
  const hospitalCapacity = avg(nodes.filter(n=>n.id.startsWith("hospital-")).map(n=>n.capacity));
  const waterAvailability = avg(byDomain("water"));
  const emergencyResponse = avg(byDomain("emergency"));
  const criticalServicesAvailable = essential.filter(n => n.capacity >= n.minimumThreshold).length / essential.length * 100;
  const populationAffected = Math.round(nodes.filter(n => n.domain === "demand").reduce((s,n) => s + (100-n.capacity)*3000, 0));
  const economicDisruption = Math.min(100, (100-avg([...byDomain("payment"),...byDomain("transport"),...byDomain("demand")]))*1.1);
  const parent = new Map(events.map(e => [e.id,e.causalParentIds]));
  const depth = (id:string, seen=new Set<string>()):number => seen.has(id) ? 0 : 1 + Math.max(0,...(parent.get(id)||[]).map(p=>depth(p,new Set([...seen,id]))));
  const cascadeDepth = Math.max(0,...events.map(e=>depth(e.id)));
  const severity = Math.min(100, Math.round((100-criticalServicesAvailable)*.25 + (100-hospitalCapacity)*.22 + (100-waterAvailability)*.16 + (100-emergencyResponse)*.2 + economicDisruption*.1 + failed*1.4));
  return { tick, criticalServicesAvailable, populationAffected, hospitalCapacity, waterAvailability, emergencyResponse, economicDisruption, failedNodes:failed, cascadeDepth, recoveryTime: failed ? tick : 0, severity };
}
