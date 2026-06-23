import { runBaselineBenchmark,analyzeRobustness,sensitivityAttribution } from "../src/simulation/experiments";
import { SCENARIOS } from "../src/simulation/scenarios";
import { paretoInterventions } from "../src/simulation/intervention-optimizer";
import { ablateCausalLinks } from "../src/simulation/causal-ablation";
import { runMultiSeedBenchmark } from "../src/simulation/statistics";
import { uncertaintyPareto } from "../src/simulation/robust-pareto";
import { findWorstNMinusOne } from "../src/simulation/dc-power-flow";
import { constraintAudit } from "../src/simulation/candidate-constraints";
import powerCase from "../data/ieee14-powerflow.json";

const robustness=analyzeRobustness(SCENARIOS[0],7319,64);
const report={
  generatedAt:"deterministic-seed-8801",
  scientificBoundary:"Synthetic model results; not real-world likelihood estimates.",
  benchmark:runBaselineBenchmark(8801,120),
  multiSeed:runMultiSeedBenchmark(20,60),
  robustness:{trials:robustness.trials,collapseProbability:robustness.collapseProbability,medianSeverity:robustness.medianSeverity,severityP10:robustness.severityP10,severityP90:robustness.severityP90,classification:robustness.classification},
  sensitivity:sensitivityAttribution(robustness),
  pareto:paretoInterventions(SCENARIOS[0]).map(p=>({cost:p.cost,severity:p.severity,collapsed:p.collapsed,interventions:p.interventions.map(i=>i.id)})),
  ablations:ablateCausalLinks(SCENARIOS[0]),
  uncertaintyPareto:uncertaintyPareto(SCENARIOS[0],441,24,3).map(p=>({cost:p.cost,collapseProbability:p.collapseProbability,medianSeverity:p.medianSeverity,interventions:p.interventions.map(i=>i.id)})),
  ieee14WorstNMinusOne:findWorstNMinusOne(powerCase),
  constraintAudit:constraintAudit()
};
console.log(JSON.stringify(report,null,2));
