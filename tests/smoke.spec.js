import { expect, test } from "@playwright/test";

const GAME_STATE_STORAGE_KEY = "wfsd-jeopardy-game-state-v1";

test("root route opens directly to the gameboard and print packet route is stable", async ({ page }) => {
  await page.goto("/index.html");
  await expect(page).toHaveURL(/jeopardy-game\.html$/);
  await expect(page.getByRole("heading", { name: "Safe Food, Fast Thinking" })).toBeVisible();

  await page.goto("/print-kit.html");
  await expect(page).toHaveURL(/campaign-generator\.html#printPacket$/);
  await expect(page.getByRole("heading", { name: "Food Safety Passport Challenge" })).toBeVisible();
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

test("quiz requires an answer before advancing", async ({ page }) => {
  await page.goto("/digital-quiz.html");
  await expect(page.getByRole("button", { name: "Next" })).toBeDisabled();
  await page.getByRole("button", { name: "Myth" }).click();
  await expect(page.getByRole("button", { name: "Next" })).toBeEnabled();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByText("Question 2 of 6")).toBeVisible();
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
  await expect(page.getByRole("button", { name: "Show Results" })).toBeVisible();
  await page.getByRole("button", { name: "Show Results" }).click();
  await expect(page.getByRole("heading", { name: /Winner/ })).toBeVisible();
});

test("generator event config renders scannable QR canvas source", async ({ page }) => {
  await page.goto("/campaign-generator.html");
  await page.getByLabel("Feedback / event URL").fill("https://example.com/feedback");
  await page.getByLabel("Event time").fill("2 PM");
  await page.getByLabel("Event location").fill("Main Lobby");
  await expect(page.getByLabel("Generated material preview")).toBeVisible();
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
