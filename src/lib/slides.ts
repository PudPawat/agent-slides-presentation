export interface Slide {
  id: number
  title: string
  keywords: string[]
  summary: string
  image: string
}

export const SLIDES: Slide[] = [
  {
    id: 1,
    title: "Motivation — What is LINEGO and What Problem Does This Project Solve?",
    image: "/slides/slide-01.jpg",
    keywords: [
      "linego", "what is", "problem", "motivation", "dispatch", "framework", "nearest-car",
      "inefficient", "unfair", "rebalance", "supply", "fairness", "hidden", "trip details",
      "drivers", "acceptance", "tunable", "modes", "authors", "pawat", "chen", "overview",
      "introduction", "project", "solve", "adaptive", "two-step"
    ],
    summary: `Q1: What is LINEGO and what problem does this project solve?
A1: LINEGO is a ride-hailing platform. This project solves the problem of inefficient and unfair taxi dispatch — existing nearest-car logic wastes vehicles, fails to rebalance future supply, and ignores driver income fairness. Carpool is a key part of the solution: grouping compatible riders reduces required vehicles, releases supply capacity, and unlocks supply-readiness and driver-fairness optimization that solo dispatch cannot achieve.

Q2: What is the name of the dispatch framework proposed?
A2: The framework is called an adaptive two-step dispatch system for LINEGO. It separates dispatch into two steps: passenger grouping (which uses carpool to group compatible riders) and driver assignment, each with tunable objective weights.

Q3: Who are the authors of this project?
A3: Pawat Chunhachatrachai, Chen Chun-Jung, Wubetu Barud Demilie, and Yohannes Agegnehu Bezabh.

Motivation context: Trip details are hidden from drivers before acceptance, so dispatch must protect system-level fairness. Nearest-car logic is not enough. Carpool is central to the motivation — it reduces required vehicles, offers riders a lower fare option, and gives the system extra levers for supply-readiness and driver-fairness optimization. Tunable modes (Balanced, Supply, Fairness) keep the pipeline adaptable as marketplace behavior changes.`
  },
  {
    id: 2,
    title: "Key Insight — Why Carpool?",
    image: "/slides/slide-02.jpg",
    keywords: [
      "carpool", "why carpool", "group", "shared trip", "compatible riders", "vehicles",
      "supply capacity", "lower fare", "price-sensitive", "order conversion",
      "optimization flexibility", "over demand", "insight", "dispatch efficiency",
      "rider-side", "business value"
    ],
    summary: `Key Insight: Why Carpool?

Dispatch efficiency: Groups compatible riders into one shared trip. This reduces required vehicles and releases supply capacity.

Rider-side business value: Offers a lower-fare option when solo taxis are expensive or hard to find. This can attract price-sensitive riders and improve order conversion.

More optimization flexibility: Carpool groups can be selected with supply-readiness and driver-fairness objectives — something impossible with solo dispatch.

Q8: How does carpool improve efficiency?
A8: Grouping compatible riders into one shared trip reduces the number of vehicles needed. In experiments, ~9,050 solo taxi trips were saved out of ~15,692 matched rides. Fewer dispatched cars release supply capacity for future demand.

Q9: Why would a rider choose carpool over a solo taxi?
A9: Carpool offers a lower fare option. It targets price-sensitive riders who might cancel or not book when solo taxis are expensive or scarce, improving order conversion for the platform.

Q10: How does carpool give more optimization flexibility?
A10: Carpool groups can be scored and selected using supply-readiness and driver-fairness objectives — levers that barely apply to single-rider trips. Step 1 (grouping) becomes a lever for supply and fairness goals, not just efficiency.

Q11: What makes two riders compatible for carpool grouping?
A11: Compatible riders are those whose combined trip keeps ETA and detour within guardrail thresholds. The grouping score formula penalizes wait time and detour, which implicitly filters out incompatible pairs.`
  },
  {
    id: 3,
    title: "Motivation — Why Dispatch Must Change",
    image: "/slides/slide-03.jpg",
    keywords: [
      "nearest car", "nearest-car", "why dispatch", "change", "fairness", "supply",
      "rebalance", "tunable", "hidden", "trip details", "before acceptance", "protect",
      "system-level", "fixed policy", "balanced", "marketplace"
    ],
    summary: `Q4: Why can't you just use nearest-car dispatch?
A4: Nearest-car dispatch only minimizes immediate pickup time. It ignores supply rebalancing — drivers cluster in busy areas while other zones go underserved — and it ignores driver fairness, always rewarding the closest driver regardless of their income history.

Q5: Why is it a problem that trip details are hidden from drivers before acceptance?
A5: Drivers cannot selectively reject low-value trips because they don't know the destination or fare upfront. This means the dispatch system must protect fairness at a system level — individual drivers have no mechanism to do so themselves.

Q6: What are the three things the dispatch system needs to balance?
A6: (1) Passenger efficiency — serving as many riders as possible while saving vehicles. (2) Future supply readiness — routing trips so the fleet is positioned well for upcoming demand. (3) Driver-benefit fairness — distributing profitable trips more equitably across drivers.

Q7: Why do you need tunable modes instead of one fixed dispatch policy?
A7: Marketplace priorities change — peak hours need supply readiness, slow periods might prioritize driver fairness or rider conversion. Tunable modes (Balanced, Supply, Fairness) let LINEGO adapt behavior by adjusting weights without rewriting or retraining any model.`
  },
  {
    id: 4,
    title: "Step 1 — How to Group Passengers (Grouping Formula)",
    image: "/slides/slide-04.jpg",
    keywords: [
      "passenger grouping", "grouping formula", "score", "alpha", "beta", "gamma",
      "P", "S", "D", "wait", "detour", "penalty", "lambda", "efficiency", "shortage",
      "driver benefit", "how to group", "step 1", "formula", "guardrail", "proactive supply",
      "driver support", "weight", "parameter"
    ],
    summary: `Q12: What is the passenger grouping formula?
A12: Score_g = α·P_g + β·S_g + γ·D_g − λ_w·W_g − λ_δ·Δ_g. P = passenger efficiency, S = future supply shortage coverage, D = driver benefit, W = wait time penalty, Δ = detour penalty. α, β, γ are tunable weights.

Q13: What does the α parameter control?
A13: α controls the weight on passenger efficiency — how much the score favors groups that match more riders and save more solo vehicles. A high α means the system prioritizes serving as many passengers as possible.

Q14: What does the β parameter control and what is Proactive Supply mode?
A14: β controls the weight on future supply shortage. When β is raised, groups whose destination falls in grids projected to be short on supply in ~2 hours score higher. This activates Proactive Supply mode — the fleet is rebalanced passively through accepted trip destinations.

Q15: What does the γ parameter control?
A15: γ controls the driver-benefit fairness weight in Step 1 grouping. Raising γ activates Driver Support mode, biasing group selection toward trips that benefit lower-earning drivers.

Q16: What are the guardrails and why are they needed?
A16: Guardrails are hard constraints that reject a group if matched count, saved vehicles, ETA, or Gini inequality fall outside acceptable bounds. They prevent the optimizer from chasing a high score at the cost of unacceptable service quality or fairness degradation.

Q17: What do the penalty terms W and Δ represent?
A17: W is the wait time penalty — groups that make riders wait longer are scored lower. Δ is the detour penalty — groups that require a longer shared route relative to solo trips are scored lower. Both ensure carpool grouping does not hurt rider experience too much.`
  },
  {
    id: 5,
    title: "Step 2 — How to Assign a Trip to a Driver (Assignment Formula)",
    image: "/slides/slide-05.jpg",
    keywords: [
      "driver assignment", "assignment formula", "assign", "eta", "pickup", "fairness",
      "fair", "bottom-20", "gini", "driver support", "phi", "value", "how to assign",
      "step 2", "formula", "inequality", "income", "lower-earning", "spreading"
    ],
    summary: `Q18: What is the driver assignment formula?
A18: Assign_g,d = η·V_g − κ·ETA_g,d − ρ·Pickup_g,d + φ·Fair_d. V = trip value, ETA = estimated arrival time, Pickup = pickup cost, Fair_d = fairness score for driver d (bonus for lower-earning drivers). φ controls how much fairness influences assignment.

Q19: How is driver fairness measured in the assignment step?
A19: Fairness is tracked using Bottom-20 (share of total income going to the lowest-earning 20% of drivers — higher means more equitable) and Gini coefficient (lower means more equal). The Fair_d term raises the score for drivers who have received less income so far.

Q20: What is the Bottom-20 metric?
A20: Bottom-20 is the percentage of total driver income earned by the lowest-earning 20% of drivers. In Balanced mode it is ~34.96%. Driver Support modes push it up to ~39.64%, meaning lower-earning drivers get a larger share.

Q21: Does favoring lower-earning drivers hurt passengers with longer wait times?
A21: Slightly. Extreme driver support raises average ETA from 104.75s (Balanced) to 107.37s — about 2.6 seconds longer. The system is transparent about this tradeoff via the ETA and Gini columns in the results table.

Q22: How is Step 2 different from Step 1?
A22: Step 1 decides which riders to group together. Step 2 decides which driver to assign a formed group to. Step 1 optimizes passenger efficiency and supply; Step 2 optimizes service cost and driver fairness. Separating them keeps each formula simpler and concerns clean.`
  },
  {
    id: 6,
    title: "Experiments — Six Operating Modes",
    image: "/slides/slide-06.jpg",
    keywords: [
      "experiments", "operating modes", "balanced", "reward focus", "supply focus",
      "driver support", "high driver support", "extreme driver support", "modes",
      "configuration", "holdout", "29358", "trips", "six modes", "retrain", "runtime",
      "alpha beta gamma", "switching", "weights"
    ],
    summary: `Q23: How was the experiment set up?
A23: All six mode configurations were evaluated on the same 29,358-trip holdout split from real LINEGO trip data. All rows are directly comparable because they use identical data.

Q24: What are the six operating modes tested?
A24: (1) Balanced default — preserves grouping, chooses low-inequality assignment. (2) Reward focus — maximizes passenger efficiency. (3) Supply focus — raises β for future supply readiness. (4) Supply + driver support — combines supply readiness with moderate fairness. (5) High driver support — raises γ pushing Bottom-20 to 38.56%. (6) Extreme driver support — maximum fairness, Bottom-20 reaches 39.64% at higher ETA cost.

Q25: Do you need to retrain the model to switch between modes?
A25: No. Switching modes only requires changing the scalar weight values (α, β, γ, φ) at runtime. The dispatch formulas remain unchanged. This makes the system very practical for production deployment.

Q26: What metrics are reported and what does each measure?
A26: Matched = riders served. Saved = solo taxis avoided. H2 Ready = future supply shortage covered. Bottom-20 = income share for lowest-earning 20% of drivers. Gini = income inequality (lower is better). ETA = average pickup time in seconds (lower is better).

Q27: How does Supply focus mode improve H2 Ready?
A27: By raising β, groups whose drop-off destination falls in grids predicted to face supply shortage 2 hours ahead score higher. Accepted trips passively reposition the fleet, raising H2 Ready from 1,731.61 to 1,734.63 without explicit repositioning commands.`
  },
  {
    id: 7,
    title: "Results — Mode Comparison Table",
    image: "/slides/slide-07.jpg",
    keywords: [
      "results", "table", "matched", "saved", "h2 ready", "bottom-20", "gini", "eta",
      "balanced", "supply", "driver", "15692", "9050", "104", "comparison", "metric",
      "performance", "tradeoff", "best mode", "which mode", "scores"
    ],
    summary: `Q28: Which mode has the best overall results?
A28: No single mode dominates all metrics — that is by design. Balanced Default is the strongest all-rounder (15,692 matched, 9,050 saved, Gini 0.3889, ETA 104.75s). Supply Focus leads on H2 Ready (1,734.63). Extreme Driver Support leads on Bottom-20 (39.64%) but at the highest ETA (107.37s).

Q29: Why do Matched and Saved counts stay nearly the same across all modes?
A29: Matched and Saved are driven by Step 1 (grouping), which depends on demand and compatibility constraints — not mode weights. Modes primarily affect Step 2 (assignment), which changes who gets a trip, not whether a group is formed.

Q30: What is the tradeoff between driver fairness and ETA?
A30: As driver support increases (Bottom-20 rises from 34.96% to 39.64%), average ETA increases from 104.75s to 107.37s — about 2.6 seconds. Gini also worsens (0.3889 to 0.4325). The tradeoff is gradual and controllable via φ.

Q31: Is there a baseline comparison to existing dispatch?
A31: The paper compares modes against each other on the same holdout split. The key evidence is that tunable knobs move metrics predictably in the intended direction. A direct A/B test against production nearest-car dispatch is a natural future direction.

Q32: What does a Gini value of 0.3889 mean in practice?
A32: A Gini of 0.3889 means moderate income inequality among drivers. Lower is more equal. Driver Support modes push Gini higher (up to 0.4325) because aggressively routing trips to low earners can create new clustering at the top of the income distribution.`
  },
  {
    id: 8,
    title: "Conclusion — Key Takeaways and Future Work",
    image: "/slides/slide-08.jpg",
    keywords: [
      "conclusion", "takeaway", "driver-aware", "supply-readiness", "tunable",
      "deploy", "production", "future work", "online tuning", "a/b test", "limitation",
      "rebalance", "fairness", "efficiency", "summary", "spread", "profitable",
      "shortage areas", "balanced mix"
    ],
    summary: `Q33: What is the main conclusion of this work?
A33: A two-step dispatch framework can simultaneously serve passenger efficiency, supply rebalancing, and driver fairness — these goals do not have to conflict. Tunable α/β/γ weights make the system adaptive to changing marketplace priorities without retraining.

Q34: How does driver-aware assignment spread profitable trips more fairly?
A34: The Fair_d term gives a score bonus to drivers who have received less income so far. When multiple equally-close drivers are available, the system prefers the lower-earning one, distributing high-value trips more evenly over time.

Q35: How does supply-readiness grouping work at a high level?
A35: The system predicts which grid zones will face driver shortages ~2 hours ahead. Groups whose destination falls in those zones receive a higher β·S_g score in Step 1. This biases accepted trips toward shortage areas, passively rebalancing the fleet.

Q36: What are the limitations of this framework?
A36: The evaluation uses a static holdout and does not capture dynamic fleet rebalancing effects over time or real-time feedback loops. The shortage forecast horizon (2 hours) is fixed. The framework also requires accurate driver income tracking.

Q37: What are the next steps or future directions?
A37: Future work includes online α/β/γ auto-tuning based on live marketplace signals, simulation or live A/B testing to measure supply recovery and driver retention, and extending grouping beyond two-rider carpool to larger shared trips.

Q38: How would this be deployed in production?
A38: Mode switching only requires changing scalar weights at runtime — no redeployment needed. The shortage forecast runs as a lightweight background job. Guardrail checks act as safety valves. Main integration work is wiring the shortage forecast and driver income tracker into the existing dispatch pipeline.

Key conclusions: Driver-aware assignment spreads profitable trips across equally close drivers. Supply-readiness grouping routes accepted trips toward future shortage areas. Tunable modes let LINEGO choose efficiency, supply readiness, driver fairness, or a balanced mix.`
  }
]

export function retrieveSlides(query: string, topK = 3): (Slide & { relevance: number })[] {
  const q = query.toLowerCase()
  const scored = SLIDES.map(s => {
    let score = 0
    s.keywords.forEach(kw => { if (q.includes(kw)) score += 3 })
    s.title.toLowerCase().split(/\s+/).forEach(w => { if (w.length > 3 && q.includes(w)) score += 1 })
    s.summary.toLowerCase().split(/\s+/).forEach(w => { if (w.length > 4 && q.includes(w)) score += 0.4 })
    return { ...s, score }
  })
  const hits = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, topK)
  const maxScore = hits[0]?.score || 1
  return hits.map(s => ({ ...s, relevance: Math.min(s.score / maxScore, 1) }))
}
