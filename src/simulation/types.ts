export const DOMAINS = ["power", "water", "telecom", "health", "transport", "fuel", "payment", "emergency", "data", "civic", "demand"] as const;
export type Domain = (typeof DOMAINS)[number];
export type NodeStatus = "healthy" | "degraded" | "critical" | "failed";
export type DependencyType = "POWER" | "WATER" | "TELECOM" | "TRANSPORT" | "FUEL" | "PAYMENT" | "STAFF" | "DATA" | "PHYSICAL_ACCESS";

export interface CityNode {
  id: string; label: string; domain: Domain; capacity: number; minimumThreshold: number;
  recoveryRate: number; criticality: number; zone: string; backupCapacity?: number;
  backupDuration?: number; status: NodeStatus; failureReason?: string; timeOfFailure?: number;
}
export interface Dependency {
  id: string; source: string; target: string; type: DependencyType; requiredSourceCapacity: number;
  impactStrength: number; propagationDelay: number; recoveryCondition: string; explanation: string;
}
export interface Shock {
  id: string; nodeId: string; start: number; duration: number; intensity: number; label: string;
}
export interface Scenario {
  id: string; name: string; description: string; seed: number; duration: number; shocks: Shock[];
  dependencyDegradations?: Record<string, number>; backupDegradations?: Record<string, number>;
}
export interface SimulationEvent {
  id: string; tick: number; nodeId: string; nodeLabel: string; domain: Domain; kind: "shock" | "dependency" | "backup" | "recovery" | "failure";
  delta: number; capacity: number; message: string; causalParentIds: string[];
}
export interface CityMetrics {
  tick: number; criticalServicesAvailable: number; populationAffected: number; hospitalCapacity: number;
  waterAvailability: number; emergencyResponse: number; economicDisruption: number; failedNodes: number;
  cascadeDepth: number; recoveryTime: number; severity: number;
}
export interface TickSnapshot { tick: number; nodes: CityNode[]; metrics: CityMetrics; events: SimulationEvent[]; }
export interface SimulationResult { scenario: Scenario; timeline: TickSnapshot[]; events: SimulationEvent[]; finalMetrics: CityMetrics; signature: string; }
export interface Intervention { id: string; label: string; description: string; type: "backup" | "offline-payment" | "reserve" | "redundancy" | "harden" | "recovery" | "access" | "tolerance"; nodeId?: string; edgeId?: string; value: number; cost: number; }
export interface SearchProgress { generation: number; bestFitness: number; averageFitness: number; uniqueCascades: number; bestScenario: Scenario; }
export interface SimulationOptions {
  interventions?: Intervention[];
  disabledEdgeIds?: string[];
  dependencyMultipliers?: Record<string, number>;
  recoveryMultiplier?: number;
}
export interface BenchmarkMethodResult {
  method: "Evolutionary" | "Uniform random" | "Criticality ranked" | "Graph centrality";
  simulations: number; severeCascades: number; uniqueCascades: number; bestSeverity: number;
  medianDepth: number; timeToFirstSevere: number | null;
}
export interface RobustnessResult {
  trials: number; collapseProbability: number; medianSeverity: number; severityP10: number;
  severityP90: number; classification: "ROBUST" | "SENSITIVE" | "FRAGILE";
  samples: { trial:number; intensityFactor:number; dependencyFactor:number; recoveryFactor:number; severity:number; collapsed:boolean }[];
}
