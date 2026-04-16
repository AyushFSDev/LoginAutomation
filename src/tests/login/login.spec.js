import { test, expect } from "@playwright/test";
import { CONFIG } from "../../utils/config";

// ─── Base URL and user credentials from config ───────────────
const BASE_URL = CONFIG.BASE_URL;

const USERS = {
  invalid: { email: "wrong@mail.com", password: "wrong" },
  noInstitute: { email: CONFIG.NO_INST_EMAIL, password: CONFIG.PASSWORD },
  singleRole: { email: CONFIG.SINGLE_ROLE_EMAIL, password: CONFIG.PASSWORD },
  multiRole: { email: CONFIG.MULTI_ROLE_EMAIL, password: CONFIG.PASSWORD },
  multiInstMultiRole: {
    email: CONFIG.MULTI_INST_MULTI_ROLE_EMAIL,
    password: CONFIG.PASSWORD,
  },
  multiInstSingleRole: {
    email: CONFIG.MULTI_INST_SINGLE_ROLE_EMAIL,
    password: CONFIG.PASSWORD,
  },
};

// ─── Helper: fills email and password, then clicks submit ────
async function login(page, email, password) {
  await page.goto(BASE_URL);
  await page.fill('input[placeholder="Enter phone or email"]', email);
  await page.fill('input[placeholder="Password"]', password);
  await page.click('button[class*="submitBtn"]');
}

// ─── Helper: waits for network to settle after an action ─────
async function waitForNavOrError(page) {
  await page.waitForLoadState("networkidle", { timeout: 10000 });
}


// TC_01 — Wrong email and password should show an error banner
test("TC_01 - Invalid Credentials", async ({ page }) => {
  await login(page, USERS.invalid.email, USERS.invalid.password);
  await waitForNavOrError(page);

  await expect(page.locator('[class*="errorBanner"]')).toBeVisible({
    timeout: 10000,
  });
});

// TC_02 — Valid credentials but user has no institute should show an error
test("TC_02 - No Institute Associated", async ({ page }) => {
  await login(page, USERS.noInstitute.email, USERS.noInstitute.password);
  await waitForNavOrError(page);

  await expect(page.locator('[class*="errorBanner"]')).toBeVisible({
    timeout: 10000,
  });
});

// TC_04 — Single institute + single role should land directly on dashboard
test("TC_04 - Single Institute Single Role", async ({ page }) => {
  await login(page, USERS.singleRole.email, USERS.singleRole.password);

  await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
});

// TC_06 — Single institute + multiple roles should show role selection,
//          then go to dashboard after picking a role
test("TC_06 - Single Institute Multiple Roles", async ({ page }) => {
  await login(page, USERS.multiRole.email, USERS.multiRole.password);

  await expect(page).toHaveURL(/role/, { timeout: 15000 });

  await page.locator('[class*="list"] > *').first().click();

  await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
});

// TC_07 — Multiple institutes + multiple roles should show institute selection,
//          then role selection, then dashboard
test("TC_07 - Multiple Institute Multiple Roles", async ({ page }) => {
  await login(
    page,
    USERS.multiInstMultiRole.email,
    USERS.multiInstMultiRole.password,
  );

  await expect(page).toHaveURL(/institute/, { timeout: 15000 });

  await page.locator('[class*="list"] > *').first().click();

  await expect(page).toHaveURL(/role/, { timeout: 15000 });

  await page.locator('[class*="list"] > *').first().click();

  await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
});

// TC_08 — Multiple institutes + single role per institute should show institute
//          selection, then skip role selection and go directly to dashboard
test("TC_08 - Multiple Institute Single Role", async ({ page }) => {
  await login(
    page,
    USERS.multiInstSingleRole.email,
    USERS.multiInstSingleRole.password,
  );

  await expect(page).toHaveURL(/institute/, { timeout: 15000 });

  await page.locator('[class*="list"] > *').first().click();

  await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
});

// ─────────────────────────────────────────────────────────────
// VALIDATION TESTS
// ─────────────────────────────────────────────────────────────

// TC_11 — Submitting with no email should keep the email field visible (no navigation)
test("TC_11 - Empty Email", async ({ page }) => {
  await page.goto(BASE_URL);
  await page.fill('input[placeholder="Password"]', "1234");
  await page.click('button[class*="submitBtn"]');

  await expect(
    page.locator('input[placeholder="Enter phone or email"]'),
  ).toBeVisible();
});

// TC_12 — Submitting with no password should keep the password field visible (no navigation)
test("TC_12 - Empty Password", async ({ page }) => {
  await page.goto(BASE_URL);
  await page.fill(
    'input[placeholder="Enter phone or email"]',
    USERS.singleRole.email,
  );
  await page.click('button[class*="submitBtn"]');

  await expect(page.locator('input[placeholder="Password"]')).toBeVisible();
});

// TC_13 — Submitting with both fields empty should show an error or browser validation
test("TC_13 - Both Fields Empty", async ({ page }) => {
  await page.goto(BASE_URL);
  await page.click('button[class*="submitBtn"]');

  await expect(
    page.locator('[class*="errorBanner"], input:invalid').first(),
  ).toBeVisible();
});

// TC_14 — Malformed email like "abc@" should result in an error banner after submit
test("TC_14 - Invalid Email Format", async ({ page }) => {
  await page.goto(BASE_URL);
  await page.fill('input[placeholder="Enter phone or email"]', "abc@");
  await page.fill('input[placeholder="Password"]', "1234");
  await page.click('button[class*="submitBtn"]');
  await waitForNavOrError(page);

  await expect(page.locator('[class*="errorBanner"]')).toBeVisible({
    timeout: 10000,
  });
});

// TC_15 — Email with leading and trailing spaces should be trimmed before sending,
//          and login should succeed just like a clean email would
test("TC_15 - Trim Spaces", async ({ page }) => {
  await login(page, `  ${USERS.singleRole.email}  `, USERS.singleRole.password);

  await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
});

// ─────────────────────────────────────────────────────────────
// UI BEHAVIOUR TESTS
// ─────────────────────────────────────────────────────────────

// TC_16 — Loading wrapper should appear immediately after clicking submit
test("TC_16 - Loader Visible on Login", async ({ page }) => {
  await page.goto(BASE_URL);
  await page.fill(
    'input[placeholder="Enter phone or email"]',
    USERS.singleRole.email,
  );
  await page.fill('input[placeholder="Password"]', USERS.singleRole.password);
  await page.click('button[class*="submitBtn"]');

  await expect(page.locator('[class*="loaderWrapper"]')).toBeVisible({
    timeout: 5000,
  });
});

// TC_17 — Submit button should be disabled while the login request is in progress
test("TC_17 - Button Disabled", async ({ page }) => {
  await page.goto(BASE_URL);

  const button = page.locator('button[class*="submitBtn"]');

  await page.fill(
    'input[placeholder="Enter phone or email"]',
    USERS.singleRole.email,
  );
  await page.fill('input[placeholder="Password"]', USERS.singleRole.password);

  await button.click();

  await expect(button).toBeDisabled({ timeout: 3000 });
});

// TC_18 — Progress bar fill element should be visible during login
test("TC_18 - Progress Bar", async ({ page }) => {
  await page.goto(BASE_URL);
  await page.fill(
    'input[placeholder="Enter phone or email"]',
    USERS.singleRole.email,
  );
  await page.fill('input[placeholder="Password"]', USERS.singleRole.password);
  await page.click('button[class*="submitBtn"]');

  await expect(page.locator('[class*="loaderFill"]')).toBeVisible({
    timeout: 5000,
  });
});

// TC_19 — Invalid credentials should display the error banner
test("TC_19 - Error Message Visible", async ({ page }) => {
  await login(page, USERS.invalid.email, USERS.invalid.password);
  await waitForNavOrError(page);

  await expect(page.locator('[class*="errorBanner"]')).toBeVisible({
    timeout: 10000,
  });
});

// TC_19b — Error banner should remain visible even after the user starts typing again
// This is the intended app behavior — Login.js only clears the error on a new submit,
// not on every keystroke
test("TC_19b - Error stays on Typing (App Behavior)", async ({ page }) => {
  await login(page, USERS.invalid.email, USERS.invalid.password);
  await waitForNavOrError(page);

  await expect(page.locator('[class*="errorBanner"]')).toBeVisible({
    timeout: 10000,
  });

  await page
    .locator('input[placeholder="Enter phone or email"]')
    .fill("new@mail.com");

  // Error is not cleared by typing — this is correct and expected behavior
  await expect(page.locator('[class*="errorBanner"]')).toBeVisible();
});

// TC_20 — Password field should default to masked (type="password")
test("TC_20 - Password Hidden Default", async ({ page }) => {
  await page.goto(BASE_URL);

  await expect(page.locator('input[placeholder="Password"]')).toHaveAttribute(
    "type",
    "password",
  );
});

// TC_20b — Eye icon button should toggle the password field between hidden and visible
// Locate by class because the button title attribute changes with each toggle
test("TC_20b - Password Show/Hide", async ({ page }) => {
  await page.goto(BASE_URL);

  const passwordInput = page.locator('input[placeholder="Password"]');
  const toggleBtn = page.locator('button[class*="eyeBtn"]');

  await passwordInput.fill("1234");

  await toggleBtn.click();
  await expect(passwordInput).toHaveAttribute("type", "text");

  await toggleBtn.click();
  await expect(passwordInput).toHaveAttribute("type", "password");
});

// TC_21 — Pressing Enter on the password field should trigger login
// Login.js has an onKeyDown handler on the password input for this
test("TC_21 - Login using Enter Key", async ({ page }) => {
  await page.goto(BASE_URL);

  await page.fill(
    'input[placeholder="Enter phone or email"]',
    USERS.singleRole.email,
  );
  await page.fill('input[placeholder="Password"]', USERS.singleRole.password);

  await page.locator('input[placeholder="Password"]').press("Enter");

  await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
});

// ─────────────────────────────────────────────────────────────
// EDGE CASES
// ─────────────────────────────────────────────────────────────

// TC_22 — Submitting 200-character strings should not crash the app
test("TC_22 - Long Input", async ({ page }) => {
  await page.goto(BASE_URL);

  const longText = "a".repeat(200);

  await page.fill('input[placeholder="Enter phone or email"]', longText);
  await page.fill('input[placeholder="Password"]', longText);
  await page.click('button[class*="submitBtn"]');

  await expect(page.locator("body")).toBeVisible();
});

// TC_23 — Email with special characters should fail gracefully with an error banner
test("TC_23 - Special Characters", async ({ page }) => {
  await login(page, "test@#$%.com", "1234");
  await waitForNavOrError(page);

  await expect(page.locator('[class*="errorBanner"]')).toBeVisible({
    timeout: 10000,
  });
});

// TC_24 — Going offline after page load and then submitting should show an error
// Login.js checks navigator.onLine before making any API call
test("TC_24 - Offline Mode", async ({ page, context }) => {
  await page.goto(BASE_URL); // Load the page while online
  await context.setOffline(true); // Then simulate going offline

  await page.fill(
    'input[placeholder="Enter phone or email"]',
    USERS.singleRole.email,
  );
  await page.fill('input[placeholder="Password"]', USERS.singleRole.password);
  await page.click('button[class*="submitBtn"]');

  await expect(page.locator('[class*="errorBanner"]')).toBeVisible({
    timeout: 5000,
  });

  await context.setOffline(false);
});

// TC_25 — Clicking submit once should disable the button, preventing duplicate requests
test("TC_25 - Multiple Clicks", async ({ page }) => {
  await page.goto(BASE_URL);

  const button = page.locator('button[class*="submitBtn"]');

  await page.fill(
    'input[placeholder="Enter phone or email"]',
    USERS.singleRole.email,
  );
  await page.fill('input[placeholder="Password"]', USERS.singleRole.password);

  await button.click();

  await expect(button).toBeDisabled({ timeout: 3000 });
});

// TC_26 — After logging in, pressing browser back should not return to the login page
// This works because Login.js uses navigate({ replace: true }) to avoid stacking history
test("TC_26 - Back Navigation", async ({ page }) => {
  await login(page, USERS.singleRole.email, USERS.singleRole.password);

  await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });

  await page.goBack();

  await expect(page).not.toHaveURL(/login/);
});
