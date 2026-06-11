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
    title: "Title — Taxi Dispatch Optimization for LINEGO",
    image: "/slides/slide-01.jpg",
    keywords: ["linego", "taxi", "dispatch", "optimization", "adaptive", "two-step", "framework", "overview", "introduction", "project", "authors", "pawat", "chen"],
    summary: "This project proposes an adaptive two-step dispatch framework for LINEGO ride-hailing. It tackles three simultaneous goals: passenger efficiency (matching riders and saving vehicles), future supply readiness (routing trips toward shortage areas), and driver-benefit fairness (distributing profitable trips equitably). The system can switch between Balanced, Supply, and Fairness modes by tuning scalar weights — no retraining needed. Authors: Pawat Chunhachatrachai, Chen Chun-Jung, Wubetu Barud Demilie, Yohannes Agegnehu Bezabh."
  },
  {
    id: 2,
    title: "Problem Context — LINEGO Dispatch Challenges",
    image: "/slides/slide-02.jpg",
    keywords: ["problem", "context", "challenge", "ride-hailing", "platform", "hidden", "trip details", "acceptance", "blind", "system", "marketplace", "dispatch"],
    summary: "In LINEGO's model, drivers accept trips without seeing destination or fare — they are blind. This creates a systemic fairness problem: drivers cannot protect themselves from low-value trips. At the same time, simple dispatch logic wastes vehicles and fails to rebalance the fleet for future demand. These three problems — efficiency, supply, fairness — must be solved at the dispatch level, not by individual drivers."
  },
  {
    id: 3,
    title: "Motivation — Why Dispatch Must Change",
    image: "/slides/slide-03.jpg",
    keywords: ["motivation", "nearest car", "nearest-car", "fairness", "supply", "rebalance", "tunable", "modes", "why", "change", "problem", "driver", "hidden", "trip details", "before acceptance"],
    summary: "Three reasons nearest-car dispatch is insufficient: (1) Trip details are hidden from drivers before acceptance, so dispatch must protect system-level fairness. (2) Nearest-car logic only minimizes immediate pickup time — it does not prepare future supply or rebalance the fleet across zones. (3) A single fixed policy cannot adapt as marketplace conditions shift. Tunable modes keep the pipeline flexible as demand patterns change."
  },
  {
    id: 4,
    title: "Key Insight — Why Carpool?",
    image: "/slides/slide-04.jpg",
    keywords: ["carpool", "why carpool", "group", "shared trip", "compatible riders", "vehicles", "supply capacity", "lower fare", "price-sensitive", "order conversion", "optimization flexibility", "over demand", "insight"],
    summary: "Carpool provides three benefits: (1) Dispatch efficiency — grouping compatible riders into one shared trip reduces required vehicles and releases supply capacity. In experiments, ~9,050 solo taxis were saved from ~15,692 matched rides. (2) Rider-side business value — carpool offers a lower fare option for price-sensitive riders who would otherwise cancel, improving order conversion. (3) More optimization flexibility — carpool groups can be selected using supply-readiness and driver-fairness objectives, giving the system extra levers that solo dispatch does not have."
  },
  {
    id: 5,
    title: "Method Overview — Tunable Two-Step Framework",
    image: "/slides/slide-05.jpg",
    keywords: ["method", "overview", "two-step", "alpha", "beta", "gamma", "knobs", "objective", "weights", "step 1", "step 2", "grouping", "assignment", "guardrail", "formula", "tunable"],
    summary: "The framework has two steps and three tunable knobs (α, β, γ). α controls passenger efficiency weight. β activates Proactive Supply mode — raises weight on future shortage coverage. γ activates Driver Support mode — raises driver-benefit fairness. Step 1 scores candidate groups; Step 2 scores group-driver assignments. Guardrails enforce hard constraints: a mode is only kept when matched count, saved vehicles, ETA, and Gini inequality all stay within acceptable bounds."
  },
  {
    id: 6,
    title: "Step 1 — Passenger Grouping Formula",
    image: "/slides/slide-06.jpg",
    keywords: ["passenger grouping", "grouping formula", "score", "alpha", "beta", "gamma", "P", "S", "D", "wait", "detour", "penalty", "lambda", "efficiency", "shortage", "driver benefit", "how to group", "step 1", "formula"],
    summary: "Group scoring formula: Score_g = α·P_g + β·S_g + γ·D_g − λ_w·W_g − λ_δ·Δ_g. P_g = passenger efficiency (matched riders, cars saved). S_g = future supply shortage covered by the group's destination. D_g = driver benefit for the assigned driver. W_g = wait time penalty. Δ_g = detour penalty. Raising β turns on Proactive Supply grouping. Raising γ turns on Driver Support grouping. Guardrails reject groups that push ETA or Gini beyond thresholds."
  },
  {
    id: 7,
    title: "Step 2 — Driver Assignment Formula",
    image: "/slides/slide-07.jpg",
    keywords: ["driver assignment", "assignment formula", "assign", "eta", "pickup", "fairness", "fair", "bottom-20", "gini", "driver support", "phi", "value", "how to assign", "step 2", "formula", "inequality"],
    summary: "Driver assignment formula: Assign_g,d = η·V_g − κ·ETA_g,d − ρ·Pickup_g,d + φ·Fair_d. V_g = trip value. ETA_g,d = estimated pickup time. Pickup_g,d = pickup cost. Fair_d = fairness score for driver d (bonus for lower-earning drivers). φ controls fairness influence. Fairness is measured by Bottom-20 (income share of lowest-earning 20% of drivers — higher is better) and Gini coefficient (lower is more equal). Raising φ/γ activates Driver Support mode."
  },
  {
    id: 8,
    title: "Experiments — Six Operating Modes",
    image: "/slides/slide-08.jpg",
    keywords: ["experiments", "operating modes", "balanced", "reward focus", "supply focus", "driver support", "high driver support", "extreme driver support", "modes", "configuration", "holdout", "29358", "trips", "six modes", "retrain", "runtime"],
    summary: "Six modes were evaluated on the same 29,358-trip holdout split: (1) Balanced default — preserves grouping, chooses low-inequality assignment. (2) Reward focus — maximizes passenger efficiency. (3) Supply focus — raises β for future supply readiness. (4) Supply + driver support — combines supply readiness with moderate fairness weight. (5) High driver support — raises γ to push Bottom-20 to 38.56%. (6) Extreme driver support — maximum fairness, Bottom-20 reaches 39.64% at higher ETA cost. Switching modes only requires changing scalar weights at runtime — no retraining."
  },
  {
    id: 9,
    title: "Results — Mode Comparison Table",
    image: "/slides/slide-09.jpg",
    keywords: ["results", "table", "matched", "saved", "h2 ready", "bottom-20", "gini", "eta", "balanced", "supply", "driver", "15692", "9050", "104", "comparison", "metric", "performance", "tradeoff"],
    summary: "Results across all modes on 29,358-trip holdout: Balanced default — 15,692 matched, 9,050 saved, H2 Ready 1,731.61, Bottom-20 34.96%, Gini 0.3889, ETA 104.75s. Supply focus — H2 Ready improves to 1,734.63. Extreme driver support — Bottom-20 rises to 39.64% but ETA increases to 107.37s and Gini rises to 0.4325. Matched and Saved stay nearly constant across all modes because grouping efficiency is driven by demand patterns, not mode weights. The tradeoff between driver fairness and ETA is gradual and controllable."
  },
  {
    id: 10,
    title: "Conclusion — Key Takeaways",
    image: "/slides/slide-10.jpg",
    keywords: ["conclusion", "takeaway", "driver-aware", "supply-readiness", "tunable", "deploy", "production", "future work", "online tuning", "a/b test", "limitation", "rebalance", "fairness", "efficiency", "summary"],
    summary: "Three main conclusions: (1) Driver-aware assignment spreads profitable trips across equally close drivers, improving income fairness without a large ETA penalty. (2) Supply-readiness grouping routes accepted trips toward future shortage areas, passively rebalancing the fleet as a side-effect of normal dispatch. (3) Tunable modes let LINEGO choose efficiency, supply readiness, driver fairness, or a balanced mix — without retraining. Future work: online α/β/γ auto-tuning, live A/B testing, and extending to larger carpool groups."
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
