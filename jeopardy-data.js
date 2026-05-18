window.JeopardyData = {
  title: "Safe Food, Fast Thinking",
  subtitle: "World Food Safety Day 2026",
  theme: "From burden to solutions – safe food everywhere",
  themeStatement: "Use data, science, and shared ownership to turn food safety signals into targeted preventive action.",
  themeLens: "Theme Lens: after each response, connect the clue to how teams move from a food safety signal to a science-based solution that protects consumers.",
  closeout: "Safe Food Everywhere: Every Function Turns Signals Into Prevention.",
  progressStages: ["Burden Signals", "Risk Ranking", "Prevention", "Verification", "Safe Food Everywhere"],
  pledge: {
    title: "Safe Food Everywhere Pledge",
    text: "One action we will take: Spot signals. Rank risk. Verify prevention."
  },
  debriefTakeaways: [
    { title: "Spot signals", text: "Notice complaints, records, holds, observations, and trends early." },
    { title: "Rank risk", text: "Use science and evidence to focus attention where impact could be greatest." },
    { title: "Verify prevention", text: "Assign owners, complete actions, and confirm the risk is reduced." }
  ],
  hostNotes: [
    { title: "Intro", text: "Welcome teams. Today we are practicing how Coca-Cola teams move from burden signals to practical food safety solutions." },
    { title: "Scoring", text: "Reveal the response before scoring. Correct adds the tile value; incorrect subtracts it." },
    { title: "Steal", text: "After a miss, choose another team for one optional steal or close the clue with no score." },
    { title: "Close", text: "Ask each team to name one signal they will watch for and one prevention action they can strengthen." }
  ],
  hashtag: "#WorldFoodSafetyDay",
  brands: "Coca-Cola • Coca-Cola Zero Sugar • Sprite • Fanta • DASANI • Minute Maid • fairlife • CORE POWER",
  themeGlossary: {
    burden: "Foodborne illness risk and public health impact, with business effects such as disruption, cost, and trust.",
    signal: "Complaints, records, trends, holds, supplier data, observations, and other non-confidential indicators.",
    solution: "Risk ranking, HACCP thinking, targeted preventive action, traceability, training, and verification.",
    everywhere: "Every function has a role in prevention, escalation, evidence, and consumer protection."
  },
  rules: [
    "Build 2-5 cross-functional teams and choose one active team before each clue.",
    "Follow the progress meter from burden signals to safe food everywhere as clues are played.",
    "Pick a category and point value. The first clue in each category gives the host a quick theme stinger.",
    "Reveal the response, connect it to the theme lens and burden-to-solution teaching point, then score the team.",
    "After a miss, the host may select another team and allow one steal.",
    "Use Final Jeopardy to close with one shared promise: protect consumers through coordinated action."
  ],
  categories: [
    {
      id: "basics",
      name: "Food Safety Basics",
      shortName: "Food Safety Basics",
      accent: "Every check protects someone.",
      visual: { color: "#d70000", image: "assets/generated/hero-campaign.png" },
      clues: [
        {
          value: 100,
          clue: "The first person protected by every food safety decision, record, hold, or escalation.",
          response: "The consumer.",
          hostAccepts: "Accept consumer, end user, guest, or person drinking/using the product. If they say customer, prompt: 'Do you mean the end consumer?' Prompt if the answer names only an internal team.",
          why: "Consumer protection is the reason food safety work matters, from routine checks to urgent decisions.",
          tag: "Trust",
          bridge: "Burden becomes solution when every team connects daily decisions to consumer protection.",
          riskCard: { signal: "Business decision or check", risk: "Consumer protection gap", action: "Connect the decision to consumer safety" }
        },
        {
          value: 200,
          clue: "This is the difference between 'we did the check' and 'we can prove the check happened.'",
          response: "Documentation or records.",
          hostAccepts: "Accept records, documentation, evidence, signoff, verification record, completed log, or traceable proof.",
          why: "Records give teams evidence that a control was completed, reviewed, and traceable when decisions need to move quickly.",
          tag: "Traceability",
          bridge: "Reliable records turn uncertainty into evidence-based action.",
          riskCard: { signal: "Completed check", risk: "Unprovable control status", action: "Document, review, and keep traceable evidence" }
        },
        {
          value: 300,
          clue: "Name three commonly taught hazard categories, and one additional category some local programs track separately.",
          response: "Biological, chemical, physical, and sometimes allergen hazards.",
          hostAccepts: "Accept biological, chemical, and physical for the core three. Accept allergen as the additional local-program category, or as a fourth major category where local taxonomy treats it separately.",
          why: "Clear hazard language helps teams identify risk consistently and choose the right control.",
          tag: "Training",
          bridge: "Shared hazard awareness helps prevent issues before they reach consumers.",
          riskCard: { signal: "Hazard observed", risk: "Unsafe product exposure", action: "Classify the hazard and apply the right control" }
        },
        {
          value: 400,
          clue: "A product question comes in and the team needs to know where materials came from and where product went. What capability is this?",
          response: "Traceability.",
          hostAccepts: "Accept traceability, track and trace, one-up/one-down trace, or the ability to trace source, movement, and destination.",
          why: "Traceability supports faster holds, investigations, withdrawals, and product disposition decisions.",
          tag: "Traceability",
          bridge: "Traceability moves potential burden into a focused, controlled response.",
          riskCard: { signal: "Product or material question", risk: "Slow investigation or disposition", action: "Trace source, movement, and status quickly" }
        },
        {
          value: 500,
          clue: "A corrective action fixes today's issue, but what future risk must be reduced and verified before the problem is truly solved?",
          response: "The risk or chance of recurrence.",
          hostAccepts: "Accept recurrence risk, repeat failure risk, likelihood the problem happens again, or effectiveness of the corrective action.",
          why: "Closing an action is not enough; teams need evidence that the issue is less likely to happen again.",
          tag: "Prevention",
          bridge: "Prevention turns a one-time fix into a verified reduction in future risk.",
          riskCard: { signal: "Corrective action closed", risk: "Repeat failure", action: "Reduce recurrence and verify effectiveness" }
        }
      ]
    },
    {
      id: "risk",
      name: "Spot the Risk",
      shortName: "Spot the Risk",
      accent: "Small observations can prevent bigger issues.",
      visual: { color: "#ff6b35", image: "assets/generated/station-spot-risk.png" },
      clues: [
        {
          value: 100,
          clue: "A handwash station near a production, lab, or sample area is out of soap and towels. What is the food safety concern?",
          response: "Poor hand hygiene and contamination risk.",
          hostAccepts: "Accept hand hygiene breakdown, people contamination risk, cross-contamination, or failure to support hygienic practices.",
          why: "Basic hygiene resources help prevent people from carrying contamination into shared food or beverage spaces.",
          tag: "Prevention",
          bridge: "A small observation becomes a solution when it is reported and corrected immediately.",
          riskCard: { signal: "Soap or towels missing", risk: "Hand hygiene breakdown", action: "Report, restock, and verify availability" }
        },
        {
          value: 200,
          clue: "A receiving door is left open during unloading. Name two risks this can create.",
          response: "Pests, debris, unauthorized access, or environmental exposure.",
          hostAccepts: "Accept any two relevant risks: pests, debris, dust, temperature exposure, weather, unauthorized access, or environmental contamination.",
          why: "Open doors can create preventable exposure during an otherwise routine receiving activity.",
          tag: "Prevention",
          bridge: "Risk awareness helps teams focus attention where exposure can enter the system.",
          riskCard: { signal: "Receiving door open", risk: "Pest, debris, or environmental exposure", action: "Close, secure, and monitor receiving controls" }
        },
        {
          value: 300,
          clue: "An urgent shipment arrives with an expired supplier approval, COA, specification, or required food-safety document. What should happen before use?",
          response: "Hold or block use, verify requirements, obtain current approval/documentation, and escalate.",
          hostAccepts: "Correct answers should include blocking/holding use plus verification or escalation. Prompt if the answer skips the hold/block step.",
          why: "Urgency should not override evidence that a supplier, material, or package is approved for use.",
          tag: "Targeted Action",
          bridge: "A targeted hold protects consumers while the team gets the facts needed to decide.",
          riskCard: { signal: "Expired supplier document", risk: "Unverified material or package status", action: "Block use, verify requirements, and escalate" }
        },
        {
          value: 400,
          clue: "A chemical container is unlabeled near product-contact tools. Name the hazard type and one control.",
          response: "Chemical hazard; label, segregate, store correctly, and verify.",
          hostAccepts: "Accept chemical hazard plus one strong control: identify/label, segregate, remove from area, store correctly, escalate, or verify disposition.",
          why: "Unidentified chemicals near product-contact items create a preventable contamination risk.",
          tag: "HACCP",
          bridge: "A clear control turns a hazard from burden into managed risk.",
          riskCard: { signal: "Unlabeled chemical container", risk: "Chemical contamination", action: "Label, segregate, store, and verify" }
        },
        {
          value: 500,
          clue: "Two instructions conflict: an email says one thing, the controlled document says another. What should the team do and why?",
          response: "Stop, verify the current approved instruction with the process owner or QA, follow the controlled process, and escalate/document the conflict.",
          hostAccepts: "Accept answers that avoid improvising and include verification with QA/process owner plus escalation. Also accept urgent approved hold/deviation instructions when documented through the proper channel.",
          why: "Controlled instructions protect teams from outdated, informal, or conflicting direction, while urgent safety decisions still need approved documentation.",
          tag: "Training",
          bridge: "One trusted source of truth helps teams solve consistently across locations and functions.",
          riskCard: { signal: "Conflicting instruction", risk: "Wrong or inconsistent action", action: "Verify the approved path and escalate conflicts" }
        }
      ]
    },
    {
      id: "signals",
      name: "Signals to Solutions",
      shortName: "Signals to Solutions",
      accent: "Notice the clue. Solve the pattern.",
      visual: { color: "#0c7a4d", image: "assets/generated/station-red-flag.png" },
      clues: [
        {
          value: 100,
          clue: "A repeated complaint, hold, expired document, or unusual record trend is an early signal that this may need attention.",
          response: "A food safety signal or risk signal.",
          hostAccepts: "Accept signal, warning sign, trend, leading indicator, risk signal, or early indicator.",
          why: "Signals help teams notice risk before it becomes a larger consumer, customer, or business burden.",
          tag: "Data",
          bridge: "Weak signals become solutions when teams notice them early and act on evidence.",
          riskCard: { signal: "Repeated complaint, hold, or record trend", risk: "Emerging risk goes unnoticed", action: "Recognize and report the signal" }
        },
        {
          value: 200,
          clue: "When several signals point to the same supplier, material, package, or process, teams should do this before jumping to a fix.",
          response: "Look for the pattern and assess or rank the risk.",
          hostAccepts: "Accept pattern analysis, trend review, risk assessment, risk ranking, or prioritizing based on evidence before choosing the fix.",
          why: "Pattern recognition helps teams avoid isolated fixes and focus on the highest-impact action.",
          tag: "Risk Ranking",
          bridge: "Signals become solutions when the pattern and risk level are understood first.",
          riskCard: { signal: "Multiple related signals", risk: "Misfocused corrective action", action: "Find the pattern and assess risk" }
        },
        {
          value: 300,
          clue: "A sanitation or CIP verification trend keeps drifting toward the limit. A one-time adjustment is not enough; the team needs this kind of action.",
          response: "A targeted preventive action with ownership and effectiveness verification.",
          hostAccepts: "Accept preventive action, system fix, CAPA with ownership, recurrence prevention, parameter review, maintenance/training action, or effectiveness check.",
          why: "A recurring sanitation or CIP signal needs a system fix that reduces recurrence, not another temporary adjustment.",
          tag: "Prevention",
          bridge: "Repeated burden becomes solution when the fix is designed to prevent the next drift.",
          riskCard: { signal: "Recurring sanitation/CIP drift", risk: "Control weakness repeats", action: "Create targeted prevention with ownership" }
        },
        {
          value: 400,
          clue: "Two markets report similar quality signals, but one involves a higher-risk ingredient. What should guide where the team acts first?",
          response: "Risk ranking or risk-based prioritization.",
          hostAccepts: "Accept risk ranking, risk-based prioritization, severity/likelihood assessment, or focusing first where consumer impact could be greatest.",
          why: "Risk-based prioritization helps teams use time and resources where consumer protection needs them most.",
          tag: "Risk Ranking",
          bridge: "Data and science move teams from scattered signals to focused, cost-effective solutions.",
          riskCard: { signal: "Similar signals across markets", risk: "Higher-risk exposure not prioritized", action: "Rank risk and act where impact is greatest" }
        },
        {
          value: 500,
          clue: "Explain how a team turns weak signals into a solution that protects consumers.",
          response: "Collect evidence, find patterns, rank risk, assign owners, target controls, and verify effectiveness.",
          hostAccepts: "Correct answers should include at least four of these: collect evidence, identify patterns, rank risk, assign owners, apply targeted controls, verify effectiveness, and escalate when needed.",
          why: "The solution is strongest when evidence guides action and the team confirms the risk actually went down.",
          tag: "Targeted Action",
          bridge: "This is the WHO 2026 theme in practice: burden signals become targeted, verified solutions.",
          riskCard: { signal: "Weak signals across data sources", risk: "Unranked burden grows", action: "Analyze, prioritize, assign, control, and verify" }
        }
      ]
    },
    {
      id: "myth",
      name: "Myth vs Fact",
      shortName: "Myth vs Fact",
      accent: "Challenge assumptions. Build better habits.",
      visual: { color: "#7c3aed", image: "assets/generated/station-myth-fact.png" },
      clues: [
        {
          value: 100,
          clue: "Myth or Fact: Food safety is only the responsibility of QA or manufacturing.",
          response: "Myth.",
          hostAccepts: "Accept Myth or False. Strong answers name at least one other function that can affect consumer protection.",
          why: "Many functions influence the decisions, systems, suppliers, labels, resources, and escalations that protect consumers.",
          tag: "Trust",
          bridge: "Safe food everywhere requires every function to understand its role in the solution.",
          riskCard: { signal: "Food safety seen as one team's job", risk: "Missed cross-functional control", action: "Clarify each function's food safety role" }
        },
        {
          value: 200,
          clue: "Myth or Fact: Supplier choices can become consumer protection decisions.",
          response: "Fact.",
          hostAccepts: "Accept Fact or True. Prompt for a supplier link such as ingredients, packages, approval status, performance, or documentation.",
          why: "Supplier qualification, performance, ingredients, packages, and documentation can all affect risk.",
          tag: "Risk Ranking",
          bridge: "Supplier signals help teams prevent burden before it reaches consumers.",
          riskCard: { signal: "Supplier decision", risk: "Ingredient or package exposure", action: "Use supplier qualification and performance data" }
        },
        {
          value: 300,
          clue: "Myth or Fact: No complaints means no food safety risk exists.",
          response: "Myth.",
          hostAccepts: "Accept Myth plus an explanation that absence of complaints is not proof of control; leading indicators, verification, and preventive controls still matter.",
          why: "Absence of complaints is not proof of safety; proactive controls and leading indicators still matter.",
          tag: "Data",
          bridge: "Evidence-based prevention looks for weak signals before complaints appear.",
          riskCard: { signal: "No complaints reported", risk: "False confidence", action: "Review proactive controls and leading indicators" }
        },
        {
          value: 400,
          clue: "Myth or Fact: A label, storage instruction, or consumer-use statement can be a food safety control.",
          response: "Fact.",
          hostAccepts: "Accept Fact or True. Strong answers connect the label or instruction to safe storage, preparation, use, allergens, or consumer decision-making.",
          why: "Clear consumer-facing information can support safe storage, preparation, use, and trust.",
          tag: "Trust",
          bridge: "Clear communication can turn potential misuse into safer decisions.",
          riskCard: { signal: "Label or instruction change", risk: "Consumer misuse or confusion", action: "Verify accurate, clear consumer communication" }
        },
        {
          value: 500,
          clue: "Myth or Fact: A small data gap is harmless if the team eventually escalates. Defend your answer with two possible impacts.",
          response: "Myth. Late or incomplete data can delay traceability, product disposition, customer communication, holds, or consumer protection.",
          hostAccepts: "Accept Myth plus any two plausible impacts: delayed traceability, delayed holds, wrong disposition, incomplete investigation, customer/consumer communication delay, or slower consumer protection.",
          why: "The harder lesson is not just that data gaps matter; it is that delay and incompleteness can slow multiple protection actions at once.",
          tag: "Traceability",
          bridge: "Complete facts and timely escalation turn a possible burden into a coordinated solution.",
          riskCard: { signal: "Data gap or late escalation", risk: "Delayed investigation or disposition", action: "Escalate early with complete facts" }
        }
      ]
    },
    {
      id: "solutions",
      name: "From Burden to Solutions",
      shortName: "Burden to Solutions",
      accent: "See the pattern. Solve the risk.",
      visual: { color: "#1d4ed8", image: "assets/generated/station-perfect-product.png" },
      clues: [
        {
          value: 100,
          clue: "Fill in the official 2026 theme: 'From burden to solutions – safe food ________.'",
          response: "Everywhere.",
          hostAccepts: "Accept everywhere, across the chain, across all locations, or equivalent wording that conveys safe food beyond one site or one team.",
          why: "The theme reminds teams that safe food depends on practical prevention across the food chain.",
          tag: "Prevention",
          bridge: "The promise is not one site or one team; it is safe food everywhere.",
          riskCard: { signal: "Theme prompt", risk: "Narrow ownership", action: "Apply safe food thinking across the chain" }
        },
        {
          value: 200,
          clue: "WHO's 2026 campaign emphasizes using these to guide targeted food safety solutions.",
          response: "Data and science, or evidence.",
          hostAccepts: "Accept data, science, evidence, burden data, risk data, surveillance data, or evidence-based insight.",
          why: "Data and science help teams focus on the highest risks instead of guessing where to act.",
          tag: "Data",
          bridge: "Evidence helps transform burden into focused, cost-effective action.",
          riskCard: { signal: "Risk data available", risk: "Guessing priorities", action: "Use data and science to target action" }
        },
        {
          value: 300,
          clue: "Before choosing a fix for a recurring issue, teams should first understand this.",
          response: "The pattern, root cause, and risk level.",
          hostAccepts: "Accept root cause, pattern/trend, risk level, why it keeps happening, or evidence needed to choose the right fix.",
          why: "A better understanding of recurrence helps teams choose a solution that fits the real problem.",
          tag: "Targeted Action",
          bridge: "Good solutions start with understanding the pattern behind the burden.",
          riskCard: { signal: "Recurring issue", risk: "Treating symptoms", action: "Analyze pattern, root cause, and risk" }
        },
        {
          value: 400,
          clue: "Turn this burden into a solution: allergen or milk-containing product change information is not consistently reaching label and change-control reviewers.",
          response: "Build clear ownership, change-control triggers, label review, cross-functional approval, and effectiveness checks.",
          hostAccepts: "Correct answers should include ownership plus a prevention mechanism such as label review, change-control trigger, cross-functional approval, allergen assessment, training, or effectiveness verification.",
          why: "A solution should prevent label and allergen communication gaps, not only correct one missed review.",
          tag: "Prevention",
          bridge: "Recurring burden calls for system design, ownership, and verification.",
          riskCard: { signal: "Ingredient or label change gap", risk: "Allergen or consumer-use information missed", action: "Build change triggers, review, approval, and verification" }
        },
        {
          value: 500,
          clue: "Why does 'safe food everywhere' require more than manufacturing and QA?",
          response: "Because design, sourcing, labels, systems, training, logistics, data, communication, resources, and leadership decisions can all reduce or add risk.",
          hostAccepts: "Accept answers naming at least three non-QA/manufacturing functions or decisions and explaining how they influence consumer protection.",
          why: "Food safety is shaped by decisions across the business, not only by final product checks.",
          tag: "Trust",
          bridge: "Cross-functional ownership turns a shared burden into a shared solution.",
          riskCard: { signal: "Multiple functions influence risk", risk: "Uncoordinated decisions", action: "Align design, sourcing, systems, labels, logistics, data, and response" }
        }
      ]
    }
  ],
  finalJeopardy: {
    category: "One Team, One Promise",
    clue: "A potential product safety issue has been identified. Name five functions that may need to work together and explain what each contributes to protecting consumers.",
    response: "Strong responses may include Quality / Food Safety: assess risk, guide holds, and decide product disposition. Supply Chain: trace product, manage inventory, and execute holds or withdrawals. Legal / Regulatory: confirm obligations, reporting expectations, and documentation. Communications / Customer Teams: align clear customer and stakeholder messaging. Consumer Affairs / Data / IT: provide complaint trends, records, and system access. Finance / Leadership: resource urgent action, make timely decisions, and assign accountability.",
    hostAccepts: "Score as correct when the team names at least five relevant functions and gives a consumer-protection contribution for each. Prompt once if they name functions but do not explain contributions.",
    rubric: [
      { label: "Full wager", text: "Five or more relevant functions plus a clear consumer-protection contribution for each." },
      { label: "Half wager", text: "Three or four relevant functions with mostly clear contributions, or five functions with thin contribution detail." },
      { label: "Miss", text: "Fewer than three functions, generic teamwork only, or no clear connection to consumer protection." }
    ],
    why: "Cross-functional action supports fast decisions, traceability, accurate records, customer/consumer communication, and clear accountability.",
    tag: "Trust",
    bridge: "One team turns burden into solution when each function brings facts, speed, and accountability.",
    riskCard: { signal: "Potential product safety issue", risk: "Delayed or fragmented decision-making", action: "Coordinate facts, traceability, disposition, and communication" }
  }
};
