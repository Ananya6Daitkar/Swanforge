# Formal Model

Let infrastructure component (i) have normalized capacity (x_i(t)\in[0,100]). Its transition is:

\[
x_i(t+1)=\Pi_{[0,100]}\left[x_i(t)-s_i(t)-\sum_{j\in Pa(i)}I_{ji}(t-d_{ji})+b_i(t)+r_i(t)\right]
\]

where (s_i) is direct shock loss, (I_{ji}) is a conditional delayed dependency effect, (b_i) is finite backup capacity, (r_i) is recovery, and (\Pi) clips capacity to its valid range.

A dependency fires when (x_j(t)<\theta_{ji}). Every effect records causal-parent event identifiers. The collapse predicate is:

\[
C(\tau)=\exists t:\left[\min_{h\in Hospitals}x_h(t)<\theta_h\right]\lor W(t)<35\lor E(t)<40
\]

Adversarial search maximizes:

\[
F(g)=S(g)+4D(g)+2L(g)+0.8T(g)+N(g)-8|g|-P_{invalid}(g)
\]

where (S) is severity, (D) domains crossed, (L) causal depth, (T) delayed impact, and (N) novelty.

Counterexample minimization seeks the smallest condition set (g'\subseteq g) such that (C(Sim(g'))=true). Intervention search seeks:

\[
\min_{U\subseteq \mathcal U}\ Cost(U)\quad\text{subject to}\quad C(Sim(g',U))=false
\]

The Pareto frontier retains solutions not dominated in total cost, residual severity, and collapse status. Causal ablation removes edge (e) and replays; (e) is necessary for the selected global outcome when (C(Sim(g',E\setminus e))=false).

## DC power-flow bridge

For the imported IEEE-14 topology, the physical bridge solves the lossless DC approximation:

\[
B'\theta=P,\qquad F_{ij}=\frac{\theta_i-\theta_j}{x_{ij}}S_{base}
\]

The slack-bus angle is fixed at zero. An N−1 outage removes one branch, resolves the linear system, trips branches whose derived loading exceeds one, and repeats until stable or islanded. This is a real network-flow calculation but not AC power flow or transient simulation.
