globalThis.window = globalThis;

await import("../state-utils.js");
await import("../jeopardy-data.js");

const data = globalThis.JeopardyData;
const { SAFE_ASSET_PATTERN } = globalThis.JeopardyStateUtils;
const errors = [];
const expectedValues = [100, 200, 300, 400, 500];

function addError(path, message) {
  errors.push(`${path}: ${message}`);
}

function requireString(value, path, { minLength = 1 } = {}) {
  if (typeof value !== "string" || value.trim().length < minLength) {
    addError(path, "must be a non-empty string");
  }
}

function requireArray(value, path, length) {
  if (!Array.isArray(value)) {
    addError(path, "must be an array");
    return false;
  }
  if (length !== undefined && value.length !== length) {
    addError(path, `must contain exactly ${length} items`);
  }
  return true;
}

function validateRiskCard(riskCard, path) {
  if (!riskCard || typeof riskCard !== "object" || Array.isArray(riskCard)) {
    addError(path, "must be an object");
    return;
  }
  requireString(riskCard.signal, `${path}.signal`);
  requireString(riskCard.risk, `${path}.risk`);
  requireString(riskCard.action, `${path}.action`);
}

function validateVisual(visual, path) {
  if (!visual || typeof visual !== "object" || Array.isArray(visual)) {
    addError(path, "must be an object");
    return;
  }
  if (typeof visual.color !== "string" || !/^#[0-9a-fA-F]{6}$/.test(visual.color)) {
    addError(`${path}.color`, "must be a 6-digit hex color");
  }
  if (typeof visual.image !== "string" || !SAFE_ASSET_PATTERN.test(visual.image)) {
    addError(`${path}.image`, "must reference an asset in assets/generated");
  }
}

function validateClue(clue, path, expectedValue) {
  if (!clue || typeof clue !== "object" || Array.isArray(clue)) {
    addError(path, "must be an object");
    return;
  }
  if (clue.value !== expectedValue) {
    addError(`${path}.value`, `must be ${expectedValue}`);
  }
  requireString(clue.clue, `${path}.clue`);
  requireString(clue.response, `${path}.response`);
  requireString(clue.hostAccepts, `${path}.hostAccepts`);
  requireString(clue.why, `${path}.why`);
  requireString(clue.tag, `${path}.tag`);
  requireString(clue.bridge, `${path}.bridge`);
  validateRiskCard(clue.riskCard, `${path}.riskCard`);
}

function validateFinal(finalJeopardy) {
  const path = "finalJeopardy";
  if (!finalJeopardy || typeof finalJeopardy !== "object" || Array.isArray(finalJeopardy)) {
    addError(path, "must be an object");
    return;
  }
  requireString(finalJeopardy.category, `${path}.category`);
  requireString(finalJeopardy.clue, `${path}.clue`);
  requireString(finalJeopardy.response, `${path}.response`);
  requireString(finalJeopardy.hostAccepts, `${path}.hostAccepts`);
  requireString(finalJeopardy.why, `${path}.why`);
  requireString(finalJeopardy.tag, `${path}.tag`);
  requireString(finalJeopardy.bridge, `${path}.bridge`);
  validateRiskCard(finalJeopardy.riskCard, `${path}.riskCard`);
  if (requireArray(finalJeopardy.rubric, `${path}.rubric`, 3)) {
    finalJeopardy.rubric.forEach((item, index) => {
      requireString(item?.label, `${path}.rubric[${index}].label`);
      requireString(item?.text, `${path}.rubric[${index}].text`);
    });
  }
}

if (!data || typeof data !== "object") {
  addError("JeopardyData", "must define a data object");
} else {
  [
    "title",
    "subtitle",
    "theme",
    "themeStatement",
    "themeLens",
    "closeout",
    "hashtag",
    "brands"
  ].forEach((field) => requireString(data[field], field));

  if (requireArray(data.progressStages, "progressStages", 5)) {
    data.progressStages.forEach((stage, index) => requireString(stage, `progressStages[${index}]`));
  }

  if (requireArray(data.hostNotes, "hostNotes", 5)) {
    data.hostNotes.forEach((note, index) => {
      requireString(note?.title, `hostNotes[${index}].title`);
      requireString(note?.text, `hostNotes[${index}].text`);
    });
  }

  if (requireArray(data.categories, "categories", 5)) {
    const categoryIds = new Set();
    data.categories.forEach((category, categoryIndex) => {
      const path = `categories[${categoryIndex}]`;
      requireString(category?.id, `${path}.id`);
      if (category?.id) {
        if (categoryIds.has(category.id)) addError(`${path}.id`, "must be unique");
        categoryIds.add(category.id);
      }
      requireString(category?.name, `${path}.name`);
      requireString(category?.shortName, `${path}.shortName`);
      requireString(category?.accent, `${path}.accent`);
      validateVisual(category?.visual, `${path}.visual`);
      if (requireArray(category?.clues, `${path}.clues`, 5)) {
        category.clues.forEach((clue, clueIndex) => {
          validateClue(clue, `${path}.clues[${clueIndex}]`, expectedValues[clueIndex]);
        });
      }
    });
  }

  validateFinal(data.finalJeopardy);
}

if (errors.length) {
  console.error(`Jeopardy data validation failed with ${errors.length} issue(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Jeopardy data validation passed.");
