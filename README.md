# BLACK SWAN FORGE

An adversarial world model that discovers previously unseen cascading failures in an interconnected synthetic city and searches for the smallest intervention that prevents collapse.

This is not conventional monitoring. Monitoring observes a deployed system and alerts on known conditions; Black Swan Forge executes a conditional city model, actively searches its failure space, minimizes causal counterexamples, and validates repairs by counterfactual replay.

> **Scientific boundary:** This is a synthetic research prototype. It does not predict real cities. Dependencies and parameters are demonstrative. Its purpose is discovering failure hypotheses and testing methods. Real deployment would require validated infrastructure data and domain experts. Every result is **plausible under the assumptions of this model.**

## Architecture

The independent TypeScript simulation core models 28 nodes and 46 directed dependencies across power, water, telecom, hospitals, transport, fuel, payments, emergency services, data, civic systems, and demand zones. The Next.js client renders engine snapshots with React Flow and Recharts. No paid API or LLM is used.

Core algorithms:

- Discrete-time propagation with delayed effects, finite backups, recovery, causal parents, and city metrics.
- Seeded population search over shock target, intensity, duration, and timing.
- Delta-debugging minimization that replays after every removed or reduced condition.
- Cost-ranked intervention optimization constrained by hospital, water, and emergency safety predicates.
- Equal-budget evaluation against uniform-random, criticality-ranked, and graph-centrality baselines.
- Seeded uncertainty analysis, causal-edge ablation, and combinatorial Pareto optimization.
- A validated topology adapter for the public [MATPOWER IEEE 14-bus case](https://matpower.org/docs/ref/matpower6.0b1/case14.html).

See [Architecture](docs/ARCHITECTURE.md) and [Research story](docs/RESEARCH_STORY.md).

## Install and run

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verification

```bash
npm test
npm run build
npm run study
npx playwright install chromium
npm run test:e2e
```

## Demo

Click **Run 90-Second Demo**. The accelerated scripted flow takes about 11 seconds in automated testing and retains eight concise presenter stages. It reveals authentication → payment → fuel → hospital propagation, minimizes the causal conditions, selects offline fuel authorization, and counterfactually verifies survival. See [Demo script](docs/DEMO_SCRIPT.md).

## Scenarios

- Silent telecom-authentication → payment → fuel → hospital cascade
- Power → water → public-health cascade
- Road blockage → emergency-response cascade
- Data-center → grid-control cascade
- Deterministic random shock and manual node failure
- Evolutionary adversarial discovery

## Scientific limitations

The graph topology, thresholds, loss functions, timing, recovery, cost units, and population mapping are synthetic. Results establish algorithm behavior, not empirical likelihood. Correlated hazards, operator adaptation, continuous physics, strategic human behavior, and uncertainty calibration are out of scope. See [Limitations](docs/LIMITATIONS.md).

## Future research

Fit dependency distributions from validated operational data; add probabilistic and hybrid physical models; support multi-intervention Pareto search; quantify epistemic uncertainty; compare against formal verification and Monte Carlo baselines; and conduct expert-blinded evaluation of discovered hypotheses.

## Reproducible evaluation

`npm run study` executes the fixed-seed baseline, robustness, Pareto, and causal-ablation study and prints machine-readable JSON. Current deterministic results and interpretation are documented in [Evaluation](docs/EVALUATION.md); formal objectives are in [Formal model](docs/FORMAL_MODEL.md), and the route to real deployment is in [Deployment path](docs/DEPLOYMENT_PATH.md).

The extended study also runs a 20-seed confidence interval, uncertainty sensitivity attribution, uncertainty-aware repair search, explicit candidate rejection audit, and an IEEE-14 DC overload cascade. Independent human validation must follow the non-fabrication requirements in [Expert review protocol](docs/EXPERT_REVIEW_PROTOCOL.md).
