import { expect, test } from "@playwright/test";

const GAME_STATE_STORAGE_KEY = "wfsd-jeopardy-game-state-v1";

test("root route opens directly to the gameboard", async ({ page }) => {
  await page.goto("/index.html");
  await expect(page).toHaveURL(/jeopardy-game\.html$/);
  await expect(page.getByRole("heading", { name: "Safe Food, Fast Thinking" })).toBeVisible();
});

test("gameboard exposes host score sheet from footer", async ({ page, context }) => {
  await page.goto("/jeopardy-game.html?test=score-sheet-footer");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  const scoreSheetLink = page.getByRole("link", { name: "Host Score Sheet" });
  await expect(scoreSheetLink).toBeVisible();
  await expect(scoreSheetLink).toHaveAttribute("href", "host-score-sheet.html");
  await expect(scoreSheetLink).toHaveAttribute("target", "_blank");

  const newPagePromise = context.waitForEvent("page");
  await scoreSheetLink.click();
  const scoreSheetPage = await newPagePromise;
  await expect(scoreSheetPage).toHaveURL(/host-score-sheet\.html$/);
  await expect(scoreSheetPage.getByRole("heading", { name: "Host Score Sheet" })).toBeVisible();
  await scoreSheetPage.close();
});

test("jeopardy clue can reveal, no-score, and undo", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=smoke");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Food Safety Basics for 100 points" }).click();
  await page.getByRole("button", { name: "Reveal Response" }).click();
  await expect(page.getByRole("button", { name: "No Score" })).toBeEnabled();
  await page.getByRole("button", { name: "No Score" }).click();
  await expect(page.getByText("1/25")).toBeVisible();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByText("0/25")).toBeVisible();
});

test("incorrect answer opens one-click steal close", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=steal-close");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Food Safety Basics for 200 points" }).click();
  await page.getByRole("button", { name: "Reveal Response" }).click();
  await page.getByRole("button", { name: "Incorrect -200" }).click();
  await expect(page.locator("#modalTeamSelect")).toHaveValue("1");
  await expect(page.getByRole("button", { name: "Close Clue" })).toBeEnabled();
  await page.getByRole("button", { name: "Close Clue" }).click();
  await expect(page.locator("#clueDialog")).not.toBeVisible();
  await expect(page.getByText("1/25")).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Resume Game" }).click();
  await expect(page.locator("#clueDialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.locator("#clueDialog")).not.toBeVisible();
  await expect(page.getByText("0/25")).toBeVisible();
});

test("undo after a steal restores the full clue sequence", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=steal-undo");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Food Safety Basics for 200 points" }).click();
  await page.getByRole("button", { name: "Reveal Response" }).click();
  await page.getByRole("button", { name: "Incorrect -200" }).click();
  await expect(page.getByRole("button", { name: "Correct +200" })).toBeEnabled();
  await page.getByRole("button", { name: "Correct +200" }).click();
  await expect(page.locator("#clueDialog")).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Team 1 -$200" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Team 2 $200" })).toBeVisible();
  await expect(page.getByText("1/25")).toBeVisible();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByRole("button", { name: "Team 1 $0" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Team 2 $0" })).toBeVisible();
  await expect(page.getByText("0/25")).toBeVisible();
});

test("correct auto-close undo returns to board", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=correct-undo");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Food Safety Basics for 100 points" }).click();
  await page.getByRole("button", { name: "Reveal Response" }).click();
  await page.getByRole("button", { name: "Correct +100" }).click();
  await expect(page.locator("#clueDialog")).not.toBeVisible();
  await expect(page.getByText("1/25")).toBeVisible();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.locator("#clueDialog")).not.toBeVisible();
  await expect(page.getByText("0/25")).toBeVisible();
  await expect(page.getByRole("button", { name: "Team 1 $0" })).toBeVisible();
});

test("host note updates after clue reveal", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=host-note");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Food Safety Basics for 100 points" }).click();
  await expect(page.locator("#hostNote")).toContainText("Reveal when ready");
  await page.getByRole("button", { name: "Reveal Response" }).click();
  await expect(page.locator("#hostNote")).toContainText("Score the selected team");
});

test("no-score auto-close resumes without reopening clue dialog", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=no-score-resume");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Food Safety Basics for 100 points" }).click();
  await page.getByRole("button", { name: "Reveal Response" }).click();
  await page.getByRole("button", { name: "No Score / Close" }).click();
  await expect(page.locator("#clueDialog")).not.toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Resume Game" }).click();
  await expect(page.locator("#clueDialog")).not.toBeVisible();
  await expect(page.locator("#progressStatus")).toHaveText("1/25");
});

test("final zero wagers auto-review and require explicit results", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=final-zero");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Final Jeopardy" }).click();
  await page.getByRole("button", { name: "Start Final" }).click();
  await page.getByRole("button", { name: "Lock Wagers & Reveal Clue" }).click();
  await page.getByRole("button", { name: "Reveal Final Response" }).click();
  await expect(page.getByText("Auto-reviewed")).toHaveCount(3);
  await expect(page.getByRole("heading", { name: /Winner/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Show Results" }).click();
  await expect(page.getByRole("heading", { name: /Winner/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Mark Reviewed" })).toHaveCount(0);
});

test("final guided scoring supports half credit and hides early results", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=final-guided");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByRole("button", { name: "Show Winner" })).toHaveCount(0);
  await page.getByRole("button", { name: "Food Safety Basics for 100 points" }).click();
  await page.getByRole("button", { name: "Reveal Response" }).click();
  await page.getByRole("button", { name: "Correct +100" }).click();
  await page.getByRole("button", { name: "Final Jeopardy" }).click();
  await page.getByRole("button", { name: "Start Final" }).click();
  await page.getByLabel("Team 1 wager").fill("100");
  await page.getByRole("button", { name: "Lock Wagers & Reveal Clue" }).click();
  await expect(page.getByRole("button", { name: "Reveal Final Response" })).toBeVisible();
  await page.getByRole("button", { name: "Reveal Final Response" }).click();
  await expect(page.getByRole("button", { name: "Full +100" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Half +50" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Miss -100" })).toBeVisible();
  await page.getByRole("button", { name: "Half +50" }).click();
  await expect(page.getByRole("heading", { name: /Winner/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Show Results" })).toBeVisible();
  await page.getByRole("button", { name: "Show Results" }).click();
  await expect(page.getByRole("heading", { name: /Winner/ })).toBeVisible();
  await expect(page.getByRole("dialog", { name: /Winner/ }).getByText("$150")).toBeVisible();
});

test("revealed clue uses collapsible host details without layout overflow", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/jeopardy-game.html?test=host-details-layout");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Food Safety Basics for 100 points" }).click();
  await page.getByRole("button", { name: "Reveal Response" }).click();
  await expect(page.getByRole("heading", { name: "The consumer." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Hide Host Details" })).toBeVisible();
  await expect(page.locator("#clueHostDetails")).toBeVisible();
  await expect(page.locator("#clueDialog .host-controls")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  await page.getByRole("button", { name: "Hide Host Details" }).click();
  await expect(page.locator("#clueHostDetails")).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Host Details" })).toBeVisible();
  await page.getByRole("button", { name: "Correct +100" }).click();
  await expect(page.locator("#clueDialog")).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Team 1 $100" })).toBeVisible();
});

test("mobile revealed clue starts with host details collapsed", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/jeopardy-game.html?test=host-details-mobile");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Food Safety Basics for 100 points" }).click();
  await page.getByRole("button", { name: "Reveal Response" }).click();
  await expect(page.getByRole("heading", { name: "The consumer." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Host Details" })).toBeVisible();
  await expect(page.locator("#clueHostDetails")).not.toBeVisible();
  await page.getByRole("button", { name: "Host Details" }).click();
  await expect(page.locator("#clueHostDetails")).toBeVisible();
});

test("early Final Jeopardy requires confirmation but complete board opens directly", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=early-final-guard");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Food Safety Basics for 100 points" }).click();
  await page.getByRole("button", { name: "Reveal Response" }).click();
  await page.getByRole("button", { name: "Correct +100" }).click();
  await page.getByRole("button", { name: "Final Jeopardy" }).click();
  await expect(page.getByRole("heading", { name: "Start Final Jeopardy?" })).toBeVisible();
  await expect(page.getByText("Only 1/25 clues have been played. Start Final Jeopardy now?")).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.locator("#finalDialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Final Jeopardy" }).click();
  await page.getByRole("button", { name: "Start Final" }).click();
  await expect(page.getByLabel("Team 1 wager")).toBeVisible();

  await page.goto("/jeopardy-game.html?test=final-complete-board");
  await page.evaluate((storageKey) => {
    localStorage.clear();
    const usedClues = Array.from({ length: 25 }, (_, index) => `${index % 5}-${Math.floor(index / 5)}`);
    localStorage.setItem(storageKey, JSON.stringify({
      version: 1,
      teams: [
        { name: "Team 1", score: 100 },
        { name: "Team 2", score: 200 },
        { name: "Team 3", score: 300 }
      ],
      activeTeam: 0,
      usedClues,
      seenCategoryPrompts: [],
      actionHistory: [],
      finalWagers: [],
      finalWagersLocked: false,
      finalResponseRevealed: false,
      finalScoredTeams: [],
      finalComplete: false,
      mobileCategoryIndex: 0,
      currentClue: null,
      openDialog: null
    }));
  }, GAME_STATE_STORAGE_KEY);
  await page.reload();
  await page.getByRole("button", { name: "Resume Game" }).click();
  await page.getByRole("button", { name: "Final Jeopardy" }).click();
  await expect(page.getByRole("heading", { name: "Start Final Jeopardy?" })).toHaveCount(0);
  await expect(page.getByLabel("Team 1 wager")).toBeVisible();
});

test("streamlined game controls stay removed from live UI", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=streamlined-controls");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByRole("button", { name: "Show Winner" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Start 30s|Stop Timer/ })).toHaveCount(0);
  await expect(page.getByText("Challenge Clue")).toHaveCount(0);
  await page.getByRole("button", { name: "Notes" }).click();
  await expect(page.getByText("Shortcuts")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Print Score Sheet" })).toHaveCount(0);
  await expect(page.getByText("Recent Plays")).toBeVisible();
});

test("legacy saved results cannot bypass final completion", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=legacy-end-restore");
  await page.evaluate((storageKey) => {
    localStorage.clear();
    localStorage.setItem(storageKey, JSON.stringify({
      version: 1,
      teams: [
        { name: "Team 1", score: 100 },
        { name: "Team 2", score: 0 },
        { name: "Team 3", score: 0 }
      ],
      activeTeam: 0,
      usedClues: [],
      seenCategoryPrompts: [],
      actionHistory: [],
      finalWagers: [],
      finalWagersLocked: false,
      finalResponseRevealed: false,
      finalScoredTeams: [],
      finalComplete: false,
      mobileCategoryIndex: 0,
      currentClue: null,
      openDialog: "end"
    }));
  }, GAME_STATE_STORAGE_KEY);
  await page.reload();
  await page.getByRole("button", { name: "Resume Game" }).click();
  await expect(page.getByRole("heading", { name: /Winner/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Final Jeopardy" })).toBeVisible();
});

test("legacy final scoring restore sanitizes stale team indexes", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=legacy-final-restore");
  await page.evaluate((storageKey) => {
    localStorage.clear();
    localStorage.setItem(storageKey, JSON.stringify({
      version: 1,
      teams: [
        { name: "Team 1", score: 200 },
        { name: "Team 2", score: 100 }
      ],
      activeTeam: 0,
      usedClues: [],
      seenCategoryPrompts: [],
      actionHistory: [],
      finalWagers: [100, 100],
      finalWagersLocked: true,
      finalResponseRevealed: true,
      finalScoredTeams: [0, 1, 2],
      finalComplete: false,
      mobileCategoryIndex: 0,
      currentClue: null,
      openDialog: "final"
    }));
  }, GAME_STATE_STORAGE_KEY);
  await page.reload();
  await page.getByRole("button", { name: "Resume Game" }).click();
  await expect(page.getByRole("heading", { name: /Winner/ })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Start Final Jeopardy?" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Show Results" })).toBeVisible();
  await page.getByRole("button", { name: "Show Results" }).click();
  await expect(page.getByRole("heading", { name: /Winner/ })).toBeVisible();
});

test("game layout avoids horizontal overflow at core viewports", async ({ page }) => {
  const viewports = [
    { width: 1075, height: 908 },
    { width: 1366, height: 768 },
    { width: 390, height: 844 }
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/jeopardy-game.html?test=viewport");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.getByRole("heading", { name: "Safe Food, Fast Thinking" })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
});

test("saved game prompt can start fresh", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=resume");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Food Safety Basics for 100 points" }).click();
  await page.getByRole("button", { name: "Reveal Response" }).click();
  await page.getByRole("button", { name: "No Score" }).click();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Resume or Start Fresh?" })).toBeVisible();
  await page.getByRole("button", { name: "Start Fresh" }).click();
  await expect(page.getByText("0/25")).toBeVisible();
});

test("host score sheet route renders print controls", async ({ page }) => {
  await page.goto("/host-score-sheet.html");
  await expect(page.getByRole("heading", { name: "Host Score Sheet" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Print Score Sheet" })).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
});

test("host score sheet reflects saved scores, used clues, wagers, and final results", async ({ page }) => {
  await page.goto("/host-score-sheet.html?test=saved-state");
  await page.evaluate((storageKey) => {
    localStorage.clear();
    localStorage.setItem(storageKey, JSON.stringify({
      version: 1,
      teams: [
        { name: "QA", score: 150 },
        { name: "Supply", score: -50 },
        { name: "Ops", score: 0 }
      ],
      activeTeam: 0,
      usedClues: ["0-0", "2-3"],
      seenCategoryPrompts: [],
      actionHistory: [],
      finalWagers: [50, 0, 0],
      finalWagersLocked: true,
      finalResponseRevealed: true,
      finalScoredTeams: [0, 1, 2],
      finalResults: [
        { result: "partial", label: "Half", delta: 25 },
        { result: "none", label: "Auto-reviewed", delta: 0 },
        { result: "none", label: "Auto-reviewed", delta: 0 }
      ],
      finalComplete: false,
      mobileCategoryIndex: 0,
      currentClue: null,
      openDialog: null
    }));
  }, GAME_STATE_STORAGE_KEY);
  await page.reload();
  await expect(page.locator("#scoreTeamGrid").getByText("QA")).toBeVisible();
  await expect(page.getByText("Score: $150")).toBeVisible();
  await expect(page.getByText("Score: -$50")).toBeVisible();
  await expect(page.locator(".used-clue")).toHaveCount(2);
  await expect(page.getByText("Wager: $50")).toBeVisible();
  await expect(page.getByText("Result: Half +25")).toBeVisible();
  await expect(page.getByText("Result: Auto-reviewed")).toHaveCount(2);
});
