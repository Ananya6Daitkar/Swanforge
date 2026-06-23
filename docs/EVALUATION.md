# Reproducible Evaluation

Run:

```bash
npm run study
```

The study uses seed 8801 and exactly 120 simulations per search method. It reports synthetic-model behavior, not real-world likelihood.

| Method | Collapse-producing cases | Unique severe signatures | Best severity | Median depth | First severe case |
|---|---:|---:|---:|---:|---:|
| Evolutionary | 61 | 14 | 22 | 3 | 0 |
| Uniform random | 43 | 21 | 22 | 2 | 1 |
| Criticality ranked | 49 | 18 | 22 | 2 | 3 |
| Graph centrality | 54 | 16 | 23 | 2 | 0 |

Under this fixed benchmark, evolutionary search produces **1.42×** as many collapse cases as uniform random search and finds deeper median cascades. Random sampling produces more unique signatures, indicating an exploration–exploitation tradeoff rather than universal evolutionary dominance. This is the scientifically honest interpretation.

## Multi-seed result

Across 20 independent deterministic seeds at 60 simulations per method per seed, evolutionary search averages 31.2 collapse cases versus 17.1 for random search. The mean discovery ratio is **1.90×**, with a normal-approximation 95% confidence interval of **[1.65, 2.15]**; evolutionary search wins 19/20 seeds. This substantially reduces the single-seed risk, but a publication should add more seeds, preregister hyperparameters, and use bootstrap intervals.

The 64-trial uncertainty study independently perturbs shock intensity by ±20%, dependency strength by ±25%, and recovery rate by ±25%. The telecom cascade persists in 44/64 trials (68.75%), with severity P10/median/P90 of 0/21/24. It is therefore classified **SENSITIVE**, not robust.

Spearman attribution assigns 82.7% of normalized absolute sensitivity to dependency strength (ρ=0.91), 17.1% to shock intensity (ρ=-0.19), and 0.2% to recovery rate. The negative shock-intensity association is a threshold/recovery interaction in this small synthetic sample and must not be interpreted as a general physical claim.

## Physical-grid bridge

The IEEE-14 DC solver uses MATPOWER bus demand, active generation, and branch reactance. Under derived experimental thermal limits, the worst N−1 case begins with line 1–2, triggers three additional overload outages, and islands 259 MW of load over two iterations. MATPOWER’s case does not provide branch MVA ratings, so the overload limits are assumptions and are labeled accordingly in the interface.

The current intervention frontier contains offline fuel authorization at cost 2 with residual severity 0. Edge-deletion replay identifies authentication → payments as necessary to the collapse. Deleting individual downstream branches prevents one hospital failure but not the symmetric city-level collapse, so those links are correctly marked non-necessary for the global predicate.

## Threats to validity

- Results depend on the synthetic topology and parameter ranges.
- The benchmark budget is small and uses one fixed seed for demo reproducibility.
- Search hyperparameters were not tuned on an independent scenario set.
- Cascade signatures are event-sequence abstractions, not physical equivalence classes.
- Statistical claims require repeated seeds and confidence intervals before publication.
- The confidence interval is a normal approximation over seed-level ratios, not a preregistered inferential analysis.
- DC power flow omits reactive power, voltage magnitude, losses, and transient stability.
