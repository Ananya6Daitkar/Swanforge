# BLACK SWAN FORGE — Vision Presentation Script

## Slide 1 — Opening

Cities usually discover their hidden dependencies during disasters. BLACK SWAN FORGE exists so we can discover them computationally first.

## Slide 2 — The misunderstood problem

We treat resilience as an observation problem: more telemetry, better dashboards, faster reaction. But monitoring cannot warn us about a failure mechanism nobody has imagined. A city can be locally resilient and globally brittle.

## Slide 3 — The zero-to-one category

Monitoring observes known deviations. Digital twins replay known scenarios. Chaos engineering tests human-selected faults. BLACK SWAN FORGE asks a different question: what failure nobody rehearsed can collapse the system?

## Slide 4 — The method

The output is not a story. It is an executable counterexample. We discover it, remove unnecessary conditions, delete causal links to test necessity, search repairs, and replay the future to verify survival.

## Slide 5 — Prototype transition

Now I will show the working system. The simulation contains 28 city components and 46 delayed dependencies across eleven domains. Every explanation comes from recorded events.

## Slide 6 — Demo narration

At T+0, telecom authentication fails. The city initially looks stable. At T+3, payments cannot authenticate. At T+5, fuel transactions stop. Hospital reserves hide the damage until T+9, when emergency capacity crosses its threshold. The optimizer finds offline emergency fuel authorization. Replay: the hospital survives.

## Slide 7 — Evidence

We compared evolutionary search with random, criticality-ranked, and graph-centrality baselines under equal budgets. Across twenty seeds, evolutionary search achieved a 1.90-times mean collapse-discovery ratio over random, with a 95-percent confidence interval from 1.65 to 2.15. It won nineteen of twenty seeds. Random found more unique signatures, which we disclose as an exploration-exploitation tradeoff.

## Slide 8 — Technical depth

The city model is synthetic, so we added a public IEEE 14-bus bridge. It solves DC power flow after line outages and iteratively trips overloaded branches. Under explicitly derived experimental limits, the worst N-minus-one replay islands approximately 259 megawatts. The limits are assumptions because MATPOWER does not provide ratings for this fixture.

## Slide 9 — Feasibility

The path is staged: public benchmarks, secure topology ingestion, hybrid physical solvers, expert-blinded review, shadow exercises, and eventually a federated resilience network where operators exchange dependency contracts without exposing sensitive topology.

## Slide 10 — Close

The ambition is not an autonomous city controller. It is a crash-testing layer for civilization—a machine that generates hypotheses humans can falsify before real people become the experiment. Civilization should learn its hidden dependencies in simulation, not in disaster.

## Live-demo fallback

If the live app fails, use Slide 5 and continue the narration. Do not improvise unsupported claims. State: “The deterministic demo and browser-level flow are covered by automated tests; this screenshot is from the verified run.”
