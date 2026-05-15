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
  challengeClue: {
    label: "Challenge Clue",
    description: "Hidden on one 300-500 point tile. Correct or incorrect answers count double."
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
  shortcuts: [
    { key: "R", action: "Reveal response" },
    { key: "C", action: "Mark clue correct" },
    { key: "I", action: "Mark clue incorrect" },
    { key: "N", action: "Move to next team" }
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
    "If Challenge Clue is enabled, one hidden 300-500 point tile is worth double.",
    "After a miss, the host may select another team and allow one steal.",
    "Use Final Jeopardy to close with one shared promise: protect consumers through coordinated action."
  ],
  categories: [
    {
      id: "basics",
      name: "Food Safety Basics",
      shortName: "Food Safety Basics",
      accent: "Every check protects someone.",
      clues: [
        {
          value: 100,
          clue: "The first person protected by every food safety decision, record, hold, or escalation.",
          response: "The consumer.",
          why: "Consumer protection is the reason food safety work matters, from routine checks to urgent decisions.",
          tag: "Trust",
          bridge: "Burden becomes solution when every team connects daily decisions to consumer protection.",
          riskCard: { signal: "Business decision or check", risk: "Consumer protection gap", action: "Connect the decision to consumer safety" }
        },
        {
          value: 200,
          clue: "This is the difference between 'we did the check' and 'we can prove the check happened.'",
          response: "Documentation or records.",
          why: "Records give teams evidence that a control was completed, reviewed, and traceable when decisions need to move quickly.",
          tag: "Traceability",
          bridge: "Reliable records turn uncertainty into evidence-based action.",
          riskCard: { signal: "Completed check", risk: "Unprovable control status", action: "Document, review, and keep traceable evidence" }
        },
        {
          value: 300,
          clue: "Name the three major hazard types teams should be able to recognize in food and beverage operations.",
          response: "Biological, chemical, and physical hazards.",
          why: "Clear hazard language helps teams identify risk consistently and choose the right control.",
          tag: "Training",
          bridge: "Shared hazard awareness helps prevent issues before they reach consumers.",
          riskCard: { signal: "Hazard observed", risk: "Unsafe product exposure", action: "Classify the hazard and apply the right control" }
        },
        {
          value: 400,
          clue: "A product question comes in and the team needs to know where materials came from and where product went. What capability is this?",
          response: "Traceability.",
          why: "Traceability supports faster holds, investigations, withdrawals, and product disposition decisions.",
          tag: "Traceability",
          bridge: "Traceability moves potential burden into a focused, controlled response.",
          riskCard: { signal: "Product or material question", risk: "Slow investigation or disposition", action: "Trace source, movement, and status quickly" }
        },
        {
          value: 500,
          clue: "A corrective action fixes today's issue, but this must be reduced and verified before the problem is truly solved.",
          response: "The risk or chance of recurrence.",
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
      clues: [
        {
          value: 100,
          clue: "A shared beverage area is out of soap and towels. What is the food safety concern?",
          response: "Poor hand hygiene and contamination risk.",
          why: "Basic hygiene resources help prevent people from carrying contamination into shared food or beverage spaces.",
          tag: "Prevention",
          bridge: "A small observation becomes a solution when it is reported and corrected immediately.",
          riskCard: { signal: "Soap or towels missing", risk: "Hand hygiene breakdown", action: "Report, restock, and verify availability" }
        },
        {
          value: 200,
          clue: "A receiving door is left open during unloading. Name two risks this can create.",
          response: "Pests, debris, unauthorized access, or environmental exposure.",
          why: "Open doors can create preventable exposure during an otherwise routine receiving activity.",
          tag: "Prevention",
          bridge: "Risk awareness helps teams focus attention where exposure can enter the system.",
          riskCard: { signal: "Receiving door open", risk: "Pest, debris, or environmental exposure", action: "Close, secure, and monitor receiving controls" }
        },
        {
          value: 300,
          clue: "An urgent shipment arrives with an expired supplier document. What should happen before use?",
          response: "Hold or block use, verify requirements, obtain current approval/documentation, and escalate.",
          why: "Urgency should not override evidence that a supplier, material, or package is approved for use.",
          tag: "Targeted Action",
          bridge: "A targeted hold protects consumers while the team gets the facts needed to decide.",
          riskCard: { signal: "Expired supplier document", risk: "Unverified material or package status", action: "Block use, verify requirements, and escalate" }
        },
        {
          value: 400,
          clue: "A chemical container is unlabeled near product-contact tools. Name the hazard type and one control.",
          response: "Chemical hazard; label, segregate, store correctly, and verify.",
          why: "Unidentified chemicals near product-contact items create a preventable contamination risk.",
          tag: "HACCP",
          bridge: "A clear control turns a hazard from burden into managed risk.",
          riskCard: { signal: "Unlabeled chemical container", risk: "Chemical contamination", action: "Label, segregate, store, and verify" }
        },
        {
          value: 500,
          clue: "Two instructions conflict: an email says one thing, the controlled document says another. What should the team do and why?",
          response: "Follow the controlled document and escalate the conflict because uncontrolled instructions can create inconsistent risk decisions.",
          why: "Controlled instructions protect teams from outdated, informal, or conflicting direction.",
          tag: "Training",
          bridge: "One trusted source of truth helps teams solve consistently across locations and functions.",
          riskCard: { signal: "Conflicting instruction", risk: "Wrong or inconsistent action", action: "Use controlled documents and escalate conflicts" }
        }
      ]
    },
    {
      id: "signals",
      name: "Signals to Solutions",
      shortName: "Signals to Solutions",
      accent: "Notice the clue. Solve the pattern.",
      clues: [
        {
          value: 100,
          clue: "A repeated complaint, hold, expired document, or unusual record trend is this: an early clue that something may need attention.",
          response: "A food safety signal or risk signal.",
          why: "Signals help teams notice risk before it becomes a larger consumer, customer, or business burden.",
          tag: "Data",
          bridge: "Weak signals become solutions when teams notice them early and act on evidence.",
          riskCard: { signal: "Repeated complaint, hold, or record trend", risk: "Emerging risk goes unnoticed", action: "Recognize and report the signal" }
        },
        {
          value: 200,
          clue: "When several signals point to the same supplier, material, package, or process, teams should do this before jumping to a fix.",
          response: "Look for the pattern and assess or rank the risk.",
          why: "Pattern recognition helps teams avoid isolated fixes and focus on the highest-impact action.",
          tag: "Risk Ranking",
          bridge: "Signals become solutions when the pattern and risk level are understood first.",
          riskCard: { signal: "Multiple related signals", risk: "Misfocused corrective action", action: "Find the pattern and assess risk" }
        },
        {
          value: 300,
          clue: "A trend shows the same documentation gap keeps returning. A one-time cleanup is not enough; the team needs this kind of action.",
          response: "A targeted preventive action.",
          why: "A recurring gap needs a system change that reduces recurrence, not another temporary cleanup.",
          tag: "Prevention",
          bridge: "Repeated burden becomes solution when the fix is designed to prevent the next repeat.",
          riskCard: { signal: "Recurring documentation gap", risk: "Repeat readiness failure", action: "Create targeted prevention with ownership" }
        },
        {
          value: 400,
          clue: "Two markets report similar quality signals, but one involves a higher-risk ingredient. What should guide where the team acts first?",
          response: "Risk ranking or risk-based prioritization.",
          why: "Risk-based prioritization helps teams use time and resources where consumer protection needs them most.",
          tag: "Risk Ranking",
          bridge: "Data and science move teams from scattered signals to focused, cost-effective solutions.",
          riskCard: { signal: "Similar signals across markets", risk: "Higher-risk exposure not prioritized", action: "Rank risk and act where impact is greatest" }
        },
        {
          value: 500,
          clue: "Explain how a team turns weak signals into a solution that protects consumers.",
          response: "Collect evidence, find patterns, rank risk, assign owners, target controls, and verify effectiveness.",
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
      clues: [
        {
          value: 100,
          clue: "Myth or Fact: Food safety is only the responsibility of QA or manufacturing.",
          response: "Myth.",
          why: "Many functions influence the decisions, systems, suppliers, labels, resources, and escalations that protect consumers.",
          tag: "Trust",
          bridge: "Safe food everywhere requires every function to understand its role in the solution.",
          riskCard: { signal: "Food safety seen as one team's job", risk: "Missed cross-functional control", action: "Clarify each function's food safety role" }
        },
        {
          value: 200,
          clue: "Myth or Fact: Supplier choices can become consumer protection decisions.",
          response: "Fact.",
          why: "Supplier qualification, performance, ingredients, packages, and documentation can all affect risk.",
          tag: "Risk Ranking",
          bridge: "Supplier signals help teams prevent burden before it reaches consumers.",
          riskCard: { signal: "Supplier decision", risk: "Ingredient or package exposure", action: "Use supplier qualification and performance data" }
        },
        {
          value: 300,
          clue: "Myth or Fact: No complaints means no food safety risk exists.",
          response: "Myth.",
          why: "Absence of complaints is not proof of safety; proactive controls and leading indicators still matter.",
          tag: "Data",
          bridge: "Evidence-based prevention looks for weak signals before complaints appear.",
          riskCard: { signal: "No complaints reported", risk: "False confidence", action: "Review proactive controls and leading indicators" }
        },
        {
          value: 400,
          clue: "Myth or Fact: A label, storage instruction, or consumer-use statement can be a food safety control.",
          response: "Fact.",
          why: "Clear consumer-facing information can support safe storage, preparation, use, and trust.",
          tag: "Trust",
          bridge: "Clear communication can turn potential misuse into safer decisions.",
          riskCard: { signal: "Label or instruction change", risk: "Consumer misuse or confusion", action: "Verify accurate, clear consumer communication" }
        },
        {
          value: 500,
          clue: "Myth or Fact: A small data gap is harmless if the team eventually escalates. Defend your answer with two possible impacts.",
          response: "Myth. Late or incomplete data can delay traceability, product disposition, customer communication, holds, or consumer protection.",
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
      clues: [
        {
          value: 100,
          clue: "Fill in the official 2026 theme: 'From burden to solutions – safe food ________.'",
          response: "Everywhere.",
          why: "The theme reminds teams that safe food depends on practical prevention across the food chain.",
          tag: "Prevention",
          bridge: "The promise is not one site or one team; it is safe food everywhere.",
          riskCard: { signal: "Theme prompt", risk: "Narrow ownership", action: "Apply safe food thinking across the chain" }
        },
        {
          value: 200,
          clue: "WHO's 2026 campaign emphasizes using these to guide targeted food safety solutions.",
          response: "Data and science, or evidence.",
          why: "Data and science help teams focus on the highest risks instead of guessing where to act.",
          tag: "Data",
          bridge: "Evidence helps transform burden into focused, cost-effective action.",
          riskCard: { signal: "Risk data available", risk: "Guessing priorities", action: "Use data and science to target action" }
        },
        {
          value: 300,
          clue: "Before choosing a fix for a recurring issue, teams should first understand this.",
          response: "The pattern, root cause, and risk level.",
          why: "A better understanding of recurrence helps teams choose a solution that fits the real problem.",
          tag: "Targeted Action",
          bridge: "Good solutions start with understanding the pattern behind the burden.",
          riskCard: { signal: "Recurring issue", risk: "Treating symptoms", action: "Analyze pattern, root cause, and risk" }
        },
        {
          value: 400,
          clue: "Turn this burden into a solution: repeated expired supplier documents keep appearing during checks.",
          response: "Assign ownership, automate reminders, escalate overdue items, monitor trends, and verify recurrence is reduced.",
          why: "A solution should reduce recurrence, not just correct one expired document.",
          tag: "Prevention",
          bridge: "Recurring burden calls for system design, ownership, and verification.",
          riskCard: { signal: "Repeated expired supplier documents", risk: "Recurring documentation failure", action: "Build ownership, reminders, escalation, and trend review" }
        },
        {
          value: 500,
          clue: "Why does 'safe food everywhere' require more than manufacturing and QA?",
          response: "Because design, sourcing, labels, systems, training, logistics, data, communication, resources, and leadership decisions can all reduce or add risk.",
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
    response: "Strong responses may include Quality / Food Safety for risk assessment and product disposition; Legal / Regulatory for compliance, reporting expectations, and documentation review; Supply Chain for traceability, holds, inventory, and customer-channel flow; Communications / Customer Teams for clear stakeholder communication; and Consumer Affairs / IT / Data / Finance / Leadership for trend data, system access, resources, decisions, and accountability.",
    why: "Cross-functional action supports fast decisions, traceability, accurate records, customer/consumer communication, and clear accountability.",
    tag: "Trust",
    bridge: "One team turns burden into solution when each function brings facts, speed, and accountability.",
    riskCard: { signal: "Potential product safety issue", risk: "Delayed or fragmented decision-making", action: "Coordinate facts, traceability, disposition, and communication" }
  }
};
