# Architecture

## Execution pipeline

`Scenario → discrete simulation → event ledger + snapshots → severity/collapse predicate → minimizer → intervention replay`

```mermaid
flowchart TD
  A["City dependency model<br/>28 services + 46 dependencies"] --> B["Scenario / shock input<br/>power, fuel, telecom, water, health, transport"]
  B --> C["Deterministic cascade engine<br/>thresholds, delays, backups, recovery"]
  C --> D["Event ledger + snapshots<br/>causal parents recorded each tick"]
  D --> E["Metrics layer<br/>severity, affected population, capacity loss, causal depth"]
  E --> F["Adversarial search<br/>evolutionary discovery of worst-case cascades"]
  F --> G["Causal minimizer<br/>smallest explanation that still collapses"]
  G --> H["Intervention optimizer<br/>replay candidate fixes under budget"]
  H --> I["Research evidence<br/>baselines, robustness, sensitivity, Pareto frontier"]
  I --> J["Next.js command center<br/>live demo, graph, timeline, judge-facing proof"]

  K["IEEE-14 grid bridge<br/>DC power-flow + N-1 overload cascade"] --> I
```

The simulation package has no React imports. `city-model.ts` defines the synthetic topology. `propagation-engine.ts` applies active shocks, due dependency effects, finite backups, recovery, status transitions, and event recording each tick. Dependency effects are queued once when a source crosses its requirement; causal parent event IDs connect downstream evidence to originating events.

`metrics.ts` derives service availability, affected population, hospital/water/emergency capacity, economic disruption, failed nodes, causal depth, recovery time, and severity. `evolutionary-search.ts` evaluates genuine simulation results. `causal-minimizer.ts` preserves a measurable collapse predicate while deleting/reducing conditions. `intervention-optimizer.ts` replays cost-ordered model mutations and accepts only safe outcomes.

The Next.js UI consumes immutable snapshots. React Flow renders dependency topology; Recharts plots time-series metrics. The demo is a deterministic presentation controller over the same simulation result.

## Determinism

Scenario fixtures are fixed. Random and evolutionary modes use a local seeded linear-congruential generator. The engine has no wall-clock, network, or global randomness dependency.

## Simplifications

Capacity is a normalized scalar rather than domain-specific physical state. Effects are thresholded and additive. Interventions are single changes, not combinations. Search runs synchronously in fast mode because the prototype population is small; a production-scale graph should move search to a Web Worker.
