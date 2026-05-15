window.JeopardyData = {
  title: "Safe Food Everywhere Jeopardy",
  subtitle: "World Food Safety Day 2026",
  theme: "From Burden to Solutions - Safe Food Everywhere",
  closeout: "Safe Food Everywhere: Every Function Plays a Part.",
  hashtag: "#WorldFoodSafetyDay",
  brands: "Coca-Cola • Coca-Cola Zero Sugar • Sprite • Fanta • DASANI • Minute Maid • fairlife • CORE POWER",
  rules: [
    "Build 2-5 cross-functional teams and choose one active team before each clue.",
    "Pick a category and point value. Teams get about 30 seconds to answer.",
    "Reveal the response, connect it to the burden-to-solution teaching point, then score the team.",
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
          clue: "The primary reason we manage food safety at every step of the business.",
          response: "Protect consumers.",
          why: "Every standard, record, escalation, and business decision should connect back to consumer protection and brand trust.",
          tag: "Trust",
          bridge: "Burden becomes solution when every team can connect routine work to consumer protection.",
          riskCard: { signal: "Routine business decision", risk: "Consumer trust gap", action: "Connect the decision to consumer protection" }
        },
        {
          value: 200,
          clue: "This written proof shows that a required check, review, or control actually happened.",
          response: "Documentation or records.",
          why: "Records create evidence that controls were completed, reviewed, and traceable when teams need to act fast.",
          tag: "Traceability",
          bridge: "Reliable records turn uncertainty into evidence-based decisions.",
          riskCard: { signal: "Missing or weak record", risk: "Unclear control status", action: "Document, review, and keep traceable evidence" }
        },
        {
          value: 300,
          clue: "These are the three broad hazard families that can make food or beverages unsafe.",
          response: "Biological, chemical, and physical hazards.",
          why: "Examples include microorganisms, cleaning chemicals, allergens, glass, plastic, or metal.",
          tag: "Training",
          bridge: "Clear hazard language helps teams spot risk before it reaches consumers.",
          riskCard: { signal: "Hazard observed", risk: "Unsafe product exposure", action: "Classify the hazard and apply the right control" }
        },
        {
          value: 400,
          clue: "This practice helps us know where a product, ingredient, or package came from - and where it went.",
          response: "Traceability.",
          why: "Traceability supports fast, accurate decisions during investigations, holds, withdrawals, or recalls.",
          tag: "Traceability",
          bridge: "Traceability moves a potential burden into a focused, controlled response.",
          riskCard: { signal: "Product or material question", risk: "Slow investigation or hold", action: "Trace source, movement, and disposition quickly" }
        },
        {
          value: 500,
          clue: "A CAPA is not truly complete until this is reduced and the preventive action is checked for effectiveness.",
          response: "The risk or chance of recurrence.",
          why: "The goal is not only to close an action; it is to prevent the issue from happening again.",
          tag: "Prevention",
          bridge: "Prevention is the solution: fix the system, then verify the risk stayed down.",
          riskCard: { signal: "Recurring issue", risk: "Repeat failure", action: "Reduce recurrence and verify effectiveness" }
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
          clue: "A handwashing station near a shared food or beverage area is out of soap. What is the concern?",
          response: "Poor hand hygiene and contamination risk.",
          why: "The simple action is to report it, restock it, and verify hand hygiene resources are available.",
          tag: "Prevention",
          bridge: "A small observation becomes a practical solution when it is reported and corrected immediately.",
          riskCard: { signal: "Soap missing", risk: "Hand hygiene breakdown", action: "Report, restock, and verify availability" }
        },
        {
          value: 200,
          clue: "A dock door is left open during receiving. Name two risks this could create.",
          response: "Pests, debris, environmental contamination, unauthorized access, or loss of temperature/environmental control.",
          why: "Open doors can turn a routine receiving area into a preventable risk point.",
          tag: "Risk Ranking",
          bridge: "Risk awareness helps teams focus attention where exposure can enter the system.",
          riskCard: { signal: "Dock door open", risk: "Pests, debris, or environmental exposure", action: "Close, secure, and monitor receiving controls" }
        },
        {
          value: 300,
          clue: "An ingredient or packaging certificate is expired, but the shipment is urgently needed. What should happen before use?",
          response: "Hold or block use, verify requirements, obtain current approval/documentation, and escalate as needed.",
          why: "Speed should not override supplier approval, quality release, or risk-based decision making.",
          tag: "Targeted Action",
          bridge: "Targeted holds protect consumers while the team gets the evidence needed to decide.",
          riskCard: { signal: "Expired certificate", risk: "Unverified material status", action: "Block use, verify requirements, and escalate" }
        },
        {
          value: 400,
          clue: "A cleaner bottle is stored with beverage-contact tools, and the label is missing. Name the risk and one control.",
          response: "Chemical contamination risk. Control it through proper labeling, segregation, storage, and verification.",
          why: "Chemicals must be identifiable and stored away from ingredients, packaging, and product-contact tools.",
          tag: "HACCP",
          bridge: "A clear control turns a hazard from a burden into a managed risk.",
          riskCard: { signal: "Unlabeled cleaner", risk: "Chemical contamination", action: "Label, segregate, store, and verify" }
        },
        {
          value: 500,
          clue: "A procedure in an email conflicts with the procedure in the approved document system. Which should you trust, and why?",
          response: "Use the approved, controlled document system.",
          why: "Document control helps prevent outdated or unofficial instructions from driving decisions.",
          tag: "Training",
          bridge: "Controlled instructions help teams solve from one trusted source of truth.",
          riskCard: { signal: "Conflicting procedure", risk: "Wrong or outdated action", action: "Use the controlled document system" }
        }
      ]
    },
    {
      id: "data",
      name: "Data to Action",
      shortName: "Data to Action",
      accent: "Evidence points the work.",
      clues: [
        {
          value: 100,
          clue: "Complaint trends can help identify this before it becomes a larger issue.",
          response: "An emerging food safety or quality risk.",
          why: "Consumer and customer signals can reveal patterns that deserve investigation before they grow.",
          tag: "Data",
          bridge: "Data turns scattered signals into early action.",
          riskCard: { signal: "Complaint trend", risk: "Emerging quality or safety issue", action: "Investigate the pattern before it grows" }
        },
        {
          value: 200,
          clue: "This kind of data helps prioritize suppliers, ingredients, packages, or markets for extra attention.",
          response: "Risk-ranking data / risk assessment data.",
          why: "Risk ranking helps Coca-Cola teams focus limited time and resources where controls matter most.",
          tag: "Risk Ranking",
          bridge: "Ranking risk helps move from broad burden to focused solution.",
          riskCard: { signal: "Risk-ranking data", risk: "Misfocused resources", action: "Prioritize higher-risk suppliers, materials, or markets" }
        },
        {
          value: 300,
          clue: "These systems help teams trace product, holds, investigations, training, and supplier documentation.",
          response: "Digital quality / traceability / record systems.",
          why: "Reliable systems help teams find facts quickly, protect decisions, and coordinate across functions.",
          tag: "Traceability",
          bridge: "Digital records make solutions faster, more consistent, and easier to verify.",
          riskCard: { signal: "System record needed", risk: "Fragmented facts", action: "Use digital quality and traceability systems" }
        },
        {
          value: 400,
          clue: "Turning repeated expired supplier documents into automated reminders is an example of this.",
          response: "A targeted preventive action.",
          why: "The solution should reduce recurrence, not just fix one expired document.",
          tag: "Targeted Action",
          bridge: "A repeated burden becomes a solution when ownership, alerts, escalation, and follow-up are built in.",
          riskCard: { signal: "Repeated expired documents", risk: "Recurring supplier readiness gap", action: "Automate reminders and assign ownership" }
        },
        {
          value: 500,
          clue: "Explain how Coca-Cola can move from burden to solution using business data.",
          response: "Analyze patterns, rank risk, target controls, assign ownership, and verify effectiveness.",
          why: "Data and science help teams choose the highest-impact actions instead of guessing where to focus.",
          tag: "Data",
          bridge: "The WHO 2026 theme comes to life when evidence guides practical, verified action.",
          riskCard: { signal: "Business data pattern", risk: "Unranked food safety burden", action: "Analyze, rank, target controls, and verify" }
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
          clue: "Myth or Fact: Food safety belongs only to plants and QA.",
          response: "Myth.",
          why: "Many decisions outside the plant influence design, sourcing, systems, training, funding, labels, and escalation.",
          tag: "Trust",
          bridge: "Safe food everywhere requires every function to understand its part in the solution.",
          riskCard: { signal: "Function assumes QA owns it", risk: "Missed cross-functional control", action: "Clarify each team's food safety role" }
        },
        {
          value: 200,
          clue: "Myth or Fact: A supplier decision can become a consumer protection decision.",
          response: "Fact.",
          why: "Supplier qualification, performance, ingredients, and documents can all affect risk.",
          tag: "Risk Ranking",
          bridge: "Supplier data helps teams prioritize risk before it becomes consumer impact.",
          riskCard: { signal: "Supplier decision", risk: "Ingredient or package exposure", action: "Use supplier qualification and performance data" }
        },
        {
          value: 300,
          clue: "Myth or Fact: If there are no consumer complaints, there is no food safety risk.",
          response: "Myth.",
          why: "Absence of complaints does not prove absence of risk; proactive controls and data matter.",
          tag: "Data",
          bridge: "Evidence-based prevention looks for weak signals before complaints appear.",
          riskCard: { signal: "No complaints", risk: "False confidence", action: "Review proactive controls and leading indicators" }
        },
        {
          value: 400,
          clue: "Myth or Fact: A clear label or consumer instruction can help protect consumers.",
          response: "Fact.",
          why: "Accurate claims, instructions, storage guidance, and warnings can support safe use and trust.",
          tag: "Trust",
          bridge: "Clear communication is a consumer-facing control.",
          riskCard: { signal: "Label or instruction change", risk: "Consumer misuse or confusion", action: "Verify accurate, clear consumer communication" }
        },
        {
          value: 500,
          clue: "Myth or Fact: Small data gaps or late escalations can slow a food safety investigation.",
          response: "Fact.",
          why: "Missing information can delay traceability, product disposition, and consumer protection actions.",
          tag: "Data",
          bridge: "Complete data and timely escalation make solutions faster.",
          riskCard: { signal: "Data gap or late escalation", risk: "Delayed investigation", action: "Escalate early with complete facts" }
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
          clue: "Fill in the blank: From burden to solutions - safe food ________.",
          response: "Everywhere.",
          why: "The 2026 theme connects food safety risk reduction with practical solutions across the food chain.",
          tag: "Prevention",
          bridge: "The promise is not one site or one team; it is safe food everywhere.",
          riskCard: { signal: "Theme prompt", risk: "Narrow ownership", action: "Apply safe food thinking across the chain" }
        },
        {
          value: 200,
          clue: "The campaign emphasizes using these two things to guide targeted food safety action.",
          response: "Data and science / evidence.",
          why: "Data helps teams prioritize the highest risks instead of guessing where to focus.",
          tag: "Data",
          bridge: "Evidence helps transform burden into focused action.",
          riskCard: { signal: "Risk data available", risk: "Guessing priorities", action: "Use data and science to target action" }
        },
        {
          value: 300,
          clue: "Before choosing a solution for a recurring issue, teams should first do this.",
          response: "Analyze the data, identify the highest-risk pattern, and understand the root cause.",
          why: "Better understanding creates more focused and cost-effective solutions.",
          tag: "Targeted Action",
          bridge: "Good solutions start with understanding the pattern.",
          riskCard: { signal: "Recurring issue", risk: "Treating symptoms", action: "Analyze pattern and root cause first" }
        },
        {
          value: 400,
          clue: "Turn this burden into a solution: Repeated expired supplier documents are found during checks.",
          response: "Examples: assign ownership, automate reminders, improve supplier monitoring, add escalation rules, and track supplier document status.",
          why: "A solution should reduce recurrence, not just fix one expired document.",
          tag: "Prevention",
          bridge: "Recurring burden calls for system design, not one-time cleanup.",
          riskCard: { signal: "Expired supplier documents", risk: "Recurring documentation failure", action: "Build ownership, reminders, and escalation" }
        },
        {
          value: 500,
          clue: "Explain why safe food everywhere depends on multiple functions, not only manufacturing.",
          response: "Because product safety is influenced by design, sourcing, labels, systems, training, funding, logistics, data, and issue response.",
          why: "Every function can either reduce risk or accidentally add risk.",
          tag: "Trust",
          bridge: "Cross-functional ownership turns a shared burden into a shared solution.",
          riskCard: { signal: "Multiple functions involved", risk: "Uncoordinated decisions", action: "Align design, sourcing, systems, labels, logistics, and response" }
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
