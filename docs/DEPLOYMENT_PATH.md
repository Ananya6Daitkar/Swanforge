# Deployment Path

## Stage 1 — Open benchmarks

Validate search behavior on public networks. The repository includes a Zod-validated adapter and topology fixture derived from the official [MATPOWER case14 source](https://github.com/MATPOWER/matpower/blob/master/data/case14.m): 14 buses, five generator buses, and 20 branches. The adapter deliberately imports topology only; it does not claim that the city simulation performs AC power flow.

## Stage 2 — Secure topology ingestion

Operators provide versioned component inventories, dependencies, operating thresholds, backups, and recovery distributions inside their security boundary. Schema validation, provenance, and assumption review become mandatory.

## Stage 3 — Hybrid domain models

Replace scalar power, water, traffic, inventory, and queue approximations with validated domain solvers. Couple them through typed boundary variables and calibrated uncertainty distributions.

## Stage 4 — Expert-blinded validation

Domain experts review generated counterexamples without knowing which method produced them. Evaluate physical plausibility, novelty, actionability, and false-confidence risk against random and centrality baselines.

## Stage 5 — Shadow resilience exercises

Run against historical and tabletop scenarios without operational control. Compare predicted causal mechanisms to exercise outcomes and recalibrate.

## Stage 6 — Federated systemic-risk network

Cross-operator simulations exchange only privacy-preserving dependency contracts and aggregate state. Sensitive topology remains local. Human authorities approve all policy or operational changes.

The system should never autonomously control critical infrastructure. Its role is hypothesis generation, falsification, and decision support under expert governance.
