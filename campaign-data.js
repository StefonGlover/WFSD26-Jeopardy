window.CampaignData = {
  formats: {
    poster: { label: "Landscape poster", width: 1920, height: 1080 },
    station: { label: "Portrait station sign", width: 1080, height: 1350 },
    screen: { label: "Digital screen", width: 1920, height: 1080 },
    passport: { label: "Passport/card sheet", width: 1650, height: 1275 }
  },
  assets: [
    {
      id: "hero",
      type: "Campaign",
      station: "",
      image: "assets/generated/hero-campaign.png",
      kicker: "World Food Safety Day 2026",
      headline: "Food Safety Is How We Keep the Promise",
      body: "Every ingredient, package, process check, and report helps deliver a perfect product, trusted everywhere.",
      cta: "Pick up your passport. Visit 5 stations. Earn your completion stamp.",
      qr: "Event Details",
      prompt: "Premium Coca-Cola hero background for a food safety passport fair at a bottling plant; bottles, cans, bubbles, red ribbon motion, and clean negative space; no embedded text."
    },
    {
      id: "spot-risk",
      type: "Station 1",
      station: "1",
      image: "assets/generated/station-spot-risk.png",
      kicker: "Station 1",
      headline: "Can You Spot the Risk?",
      body: "Look closely at the bottling-site scene. Find five food safety risks before they reach the next step.",
      cta: "Find 5 risks. Tell the host. Earn your stamp.",
      qr: "Risk Card",
      markers: [
        { x: 0.62, y: 0.31, label: "1" },
        { x: 0.77, y: 0.46, label: "2" },
        { x: 0.45, y: 0.58, label: "3" },
        { x: 0.84, y: 0.69, label: "4" },
        { x: 0.55, y: 0.78, label: "5" }
      ],
      prompt: "Rich Coca-Cola bottling-site spot-the-risk game scene with packaging, syrup samples, caps, handwash station, visible unlabeled/damaged/storage risks, no embedded text."
    },
    {
      id: "perfect-product",
      type: "Station 2",
      station: "2",
      image: "assets/generated/station-perfect-product.png",
      kicker: "Station 2",
      headline: "From Ingredient to Consumer: Every Step Matters",
      body: "Match each production step to the control that protects product quality, safety, and trust.",
      cta: "Complete the match. Earn your stamp.",
      qr: "Matching Game",
      chips: ["Supplier", "Receiving", "Water", "Batching", "Package", "Marketplace"],
      prompt: "Coca-Cola ingredient-to-consumer journey with red ribbon path, supplier, receiving, treated water, syrup batching, packaging, warehouse, marketplace; no embedded text."
    },
    {
      id: "myth-fact",
      type: "Station 3",
      station: "3",
      image: "assets/generated/station-myth-fact.png",
      kicker: "Station 3",
      headline: "Myth or Fact: Beverage Edition",
      body: "Test what you know about equipment, ingredients, packaging, allergens, foreign material, and near misses.",
      cta: "Answer 4 of 6 correctly. Earn your stamp.",
      qr: "Digital Quiz",
      chips: ["Myth", "Fact", "Verify", "Report"],
      prompt: "Premium Coke split-screen fizz quiz background, red bubbles, verification energy, cans and bottles, no embedded text."
    },
    {
      id: "allergen-label",
      type: "Station 4",
      station: "4",
      image: "assets/generated/station-allergen-label.png",
      kicker: "Station 4",
      headline: "Allergen & Label Alert",
      body: "Review sample cards and labels. Find the missing allergen, ingredient, or cross-contact risk.",
      cta: "Find the missing label risk. Earn your stamp.",
      qr: "Allergen Card",
      chips: ["Minute Maid", "Sprite", "Dairy Sample", "Label Review"],
      prompt: "Premium Coca-Cola allergen and label inspection tabletop with beverage samples, ingredient cards, separate utensils, no embedded text."
    },
    {
      id: "red-flag",
      type: "Station 5",
      station: "5",
      image: "assets/generated/station-red-flag.png",
      kicker: "Station 5",
      headline: "When in Doubt, Raise the Red Flag",
      body: "Food safety culture grows when associates stop, report, escalate, and help fix concerns early.",
      cta: "Choose the right action for 3 scenarios. Earn your final stamp.",
      qr: "Scenarios",
      chips: ["Stop", "Hold", "Report", "Escalate"],
      prompt: "Dramatic Coca-Cola bottling line escalation visual with red hold tag shape, inspection light, stopped line, no embedded text."
    },
    {
      id: "passport",
      type: "Passport",
      station: "",
      image: "assets/generated/passport-completion.png",
      kicker: "Passport Challenge",
      headline: "Coca-Cola Food Safety Passport",
      body: "Visit every station, collect each stamp, and share one idea that helps protect consumers and our brands.",
      cta: "Completed passport = raffle entry.",
      qr: "Feedback Form",
      prompt: "Celebratory Coca-Cola passport completion art with card silhouette, stamp shapes, bubbles, red ribbon, no embedded text."
    },
    {
      id: "screen",
      type: "Digital Screen",
      station: "",
      image: "assets/generated/digital-screen.png",
      kicker: "World Food Safety Day",
      headline: "Pick Up Your Passport",
      body: "Visit 5 stations. Play fast games. Help keep the promise of a perfect product, trusted everywhere.",
      cta: "Starts at [time] in [location].",
      qr: "Event Details",
      prompt: "Premium Coca-Cola lobby screen background with red ribbon, bubbles, cans, bottles, bottling-line glow, no embedded text."
    }
  ]
};
