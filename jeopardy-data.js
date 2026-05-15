window.JeopardyData = {
  title: "Safe Food Everywhere Jeopardy",
  subtitle: "World Food Safety Day 2026",
  theme: "From Burden to Solutions - Safe Food Everywhere",
  hashtag: "#WorldFoodSafetyDay",
  brands: "Coca-Cola • Coca-Cola Zero Sugar • Sprite • Fanta • DASANI • Minute Maid • fairlife • CORE POWER",
  rules: [
    "Use 3-5 teams when possible. Flexible team sizes are fine; mix departments for more fun.",
    "Teams choose a category and point value from the board. Click the tile to open the clue.",
    "Give each team about 30 seconds. Correct answers earn points; incorrect answers lose points unless the host chooses no score.",
    "The host reveals the response, records the score, and returns to the board.",
    "Use Final Jeopardy if time allows. Teams choose a wager and submit written answers."
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
          why: "Every standard, record, and escalation should connect back to consumer protection."
        },
        {
          value: 200,
          clue: "This written proof shows that a required check, review, or control actually happened.",
          response: "Documentation or records.",
          why: "Records create evidence that controls were completed, reviewed, and traceable."
        },
        {
          value: 300,
          clue: "These are the three broad hazard families that can make food or beverages unsafe.",
          response: "Biological, chemical, and physical hazards.",
          why: "Examples include microorganisms, cleaning chemicals, allergens, glass, plastic, or metal."
        },
        {
          value: 400,
          clue: "This practice helps us know where a product, ingredient, or package came from - and where it went.",
          response: "Traceability.",
          why: "Traceability supports fast, accurate decisions during investigations, holds, withdrawals, or recalls."
        },
        {
          value: 500,
          clue: "A CAPA is not truly complete until this is reduced and the preventive action is checked for effectiveness.",
          response: "The risk or chance of recurrence.",
          why: "The goal is not only to close an action; it is to prevent the issue from happening again."
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
          why: "The simple action is to report it, restock it, and verify hand hygiene resources are available."
        },
        {
          value: 200,
          clue: "A dock door is left open during receiving. Name two risks this could create.",
          response: "Pests, debris, environmental contamination, unauthorized access, or loss of temperature/environmental control.",
          why: "Open doors can turn a routine receiving area into a preventable risk point."
        },
        {
          value: 300,
          clue: "An ingredient or packaging certificate is expired, but the shipment is urgently needed. What should happen before use?",
          response: "Hold or block use, verify requirements, obtain current approval/documentation, and escalate as needed.",
          why: "Speed should not override supplier approval, quality release, or risk-based decision making."
        },
        {
          value: 400,
          clue: "A cleaner bottle is stored with beverage-contact tools, and the label is missing. Name the risk and one control.",
          response: "Chemical contamination risk. Control it through proper labeling, segregation, storage, and verification.",
          why: "Chemicals must be identifiable and stored away from ingredients, packaging, and product-contact tools."
        },
        {
          value: 500,
          clue: "A procedure in an email conflicts with the procedure in the approved document system. Which should you trust, and why?",
          response: "Use the approved, controlled document system.",
          why: "Document control helps prevent outdated or unofficial instructions from driving decisions."
        }
      ]
    },
    {
      id: "connections",
      name: "Corporate Connections",
      shortName: "Corporate Connections",
      accent: "Many teams. One promise.",
      clues: [
        {
          value: 100,
          clue: "This function helps qualify and monitor suppliers before ingredients or packages are purchased.",
          response: "Procurement and/or Supplier Quality.",
          why: "Supplier decisions can become consumer protection decisions."
        },
        {
          value: 200,
          clue: "These functions help confirm product labels, claims, and consumer-facing instructions are accurate.",
          response: "Marketing, Legal, Regulatory, and Quality.",
          why: "Labels and claims are not only communication; they can influence consumer safety and trust."
        },
        {
          value: 300,
          clue: "This function keeps quality records, traceability tools, supplier portals, and training platforms reliable.",
          response: "IT / Digital / Data teams.",
          why: "Food safety depends on systems people can trust and records that remain available and accurate."
        },
        {
          value: 400,
          clue: "This team can help turn complaint trends into business action by listening to consumer feedback.",
          response: "Consumer Affairs, Customer Care, and Quality working together.",
          why: "Complaint data can reveal patterns that deserve investigation before they become larger issues."
        },
        {
          value: 500,
          clue: "Name four corporate functions that may need to join a product hold, withdrawal, or recall decision.",
          response: "Quality, Legal, Regulatory, Supply Chain, Communications, Customer Teams, Consumer Affairs, IT/Data, Finance, Procurement, or Leadership.",
          why: "Fast consumer protection requires coordinated decisions, accurate information, and clear communication."
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
          why: "Many decisions outside the plant influence design, sourcing, systems, training, funding, labels, and escalation."
        },
        {
          value: 200,
          clue: "Myth or Fact: A supplier decision can become a consumer protection decision.",
          response: "Fact.",
          why: "Supplier qualification, performance, ingredients, and documents can all affect risk."
        },
        {
          value: 300,
          clue: "Myth or Fact: If there are no consumer complaints, there is no food safety risk.",
          response: "Myth.",
          why: "Absence of complaints does not prove absence of risk; proactive controls and data matter."
        },
        {
          value: 400,
          clue: "Myth or Fact: A clear label or consumer instruction can help protect consumers.",
          response: "Fact.",
          why: "Accurate claims, instructions, storage guidance, and warnings can support safe use and trust."
        },
        {
          value: 500,
          clue: "Myth or Fact: Small data gaps or late escalations can slow a food safety investigation.",
          response: "Fact.",
          why: "Missing information can delay traceability, product disposition, and consumer protection actions."
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
          why: "The 2026 theme connects food safety risk reduction with practical solutions across the food chain."
        },
        {
          value: 200,
          clue: "The campaign emphasizes using these two things to guide targeted food safety action.",
          response: "Data and science / evidence.",
          why: "Data helps teams prioritize the highest risks instead of guessing where to focus."
        },
        {
          value: 300,
          clue: "Before choosing a solution for a recurring issue, teams should first do this.",
          response: "Analyze the data, identify the highest-risk pattern, and understand the root cause.",
          why: "Better understanding creates more focused and cost-effective solutions."
        },
        {
          value: 400,
          clue: "Turn this burden into a solution: Repeated expired supplier documents are found during checks.",
          response: "Examples: assign ownership, automate reminders, improve supplier monitoring, add escalation rules, and track supplier document status.",
          why: "A solution should reduce recurrence, not just fix one expired document."
        },
        {
          value: 500,
          clue: "Explain why safe food everywhere depends on multiple functions, not only manufacturing.",
          response: "Because product safety is influenced by design, sourcing, labels, systems, training, funding, logistics, data, and issue response.",
          why: "Every function can either reduce risk or accidentally add risk."
        }
      ]
    }
  ],
  finalJeopardy: {
    category: "One Team, One Promise",
    clue: "A potential product safety issue has been identified. Name five functions that may need to work together and explain what each contributes to protecting consumers.",
    response: "Strong responses may include Quality / Food Safety for risk assessment and product disposition; Legal / Regulatory for compliance, reporting expectations, and documentation review; Supply Chain for traceability, holds, inventory, and customer-channel flow; Communications / Customer Teams for clear stakeholder communication; and Consumer Affairs / IT / Data / Finance / Leadership for trend data, system access, resources, decisions, and accountability.",
    why: "Cross-functional action supports fast decisions, traceability, accurate records, customer/consumer communication, and clear accountability."
  }
};
