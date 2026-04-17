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


//--------------------------------------------------------------
// UI TESTS
//--------------------------------------------------------------


// TC_01 — Empty email should show inline field error (no navigation)
test("TC_01 - Empty Email", async ({ page }) => {
  await page.goto(BASE_URL);
  await page.fill('input[placeholder="Password"]', "1234");
  await page.click('button[class*="submitBtn"]');

  // Field-level error message should appear below email input
  await expect(page.locator('[class*="errorMsg"]').first()).toBeVisible();
  // Should NOT navigate away
  await expect(
    page.locator('input[placeholder="Enter phone or email"]'),
  ).toBeVisible();
});


// TC_02 — Empty password should show inline field error (no navigation)
test("TC_02 - Empty Password", async ({ page }) => {
  await page.goto(BASE_URL);
  await page.fill(
    'input[placeholder="Enter phone or email"]',
    USERS.singleRole.email,
  );
  await page.click('button[class*="submitBtn"]');

  // Field-level error message should appear below password input
  await expect(page.locator('[class*="errorMsg"]').last()).toBeVisible();
  // Should NOT navigate away
  await expect(page.locator('input[placeholder="Password"]')).toBeVisible();
});


// TC_03 — Both fields empty should show two inline field errors
test("TC_03 - Both Fields Empty", async ({ page }) => {
  await page.goto(BASE_URL);
  await page.click('button[class*="submitBtn"]');

  // Both field-level errors should appear
  const errorMsgs = page.locator('[class*="errorMsg"]');
  await expect(errorMsgs).toHaveCount(2);
});


// TC_04 — Malformed email like "abc@" should result in an error banner after submit
test("TC_04 - Invalid Email Format", async ({ page }) => {
  await page.goto(BASE_URL);
  await page.fill('input[placeholder="Enter phone or email"]', "abc@");
  await page.fill('input[placeholder="Password"]', "1234");
  await page.click('button[class*="submitBtn"]');
  await expect(page.getByText(/invalid/i)).toBeVisible();
});


// TC_05 — Invalid credentials should display the error banner
test("TC_05 - Error Message Visible", async ({ page }) => {
  await login(page, USERS.invalid.email, USERS.invalid.password);
  await expect(page.getByText(/invalid email or password/i)).toBeVisible();
});


// TC_06a — Password field should default to masked (type="password")
test("TC_06a - Password Hidden Default", async ({ page }) => {
  await page.goto(BASE_URL);

  await expect(page.locator('input[placeholder="Password"]')).toHaveAttribute(
    "type",
    "password",
  );
});


// TC_06b — Eye icon button should toggle the password field between hidden and visible
test("TC_06b - Password Show/Hide", async ({ page }) => {
  await page.goto(BASE_URL);

  const passwordInput = page.locator('input[placeholder="Password"]');
  const toggleBtn = page.locator('button[class*="eyeBtn"]');

  await passwordInput.fill("1234");

  await toggleBtn.click();
  await expect(passwordInput).toHaveAttribute("type", "text");

  await toggleBtn.click();
  await expect(passwordInput).toHaveAttribute("type", "password");
});


//--------------------------------------------------------------
// UX TESTS
//--------------------------------------------------------------


// TC_07 — Select Institute
test("TC_07 - Select Institute", async ({ page }) => {
  await page.goto(BASE_URL);

  await page.fill(
    'input[placeholder="Enter phone or email"]',
    "sarah.parker@scos.com",
  );
  await page.fill('input[placeholder="Password"]', "1234");
  await page.click('button:has-text("Continue")');

  await expect(page).toHaveURL(/institute/);

  const institutes = await page.locator('[class *= "list"]>*');
  await institutes.nth(0).click();

  await page.waitForTimeout(5000);
});


// TC_08 — Select Role
test("TC_08 - Select Role", async ({ page }) => {
  await page.goto(BASE_URL);

  await page.fill(
    'input[placeholder="Enter phone or email"]',
    "emily.davis@scos.com",
  );
  await page.fill('input[placeholder="Password"]', "1234");
  await page.click('button:has-text("Continue")');

  await expect(page).toHaveURL(/role/);

  const roles = await page.locator('[class *= "list"]>*');
  await roles.nth(0).click();

  await page.waitForTimeout(5000);
});

// TC_09 — Email with leading and trailing spaces should be trimmed before sending
test("TC_09 - Trim Spaces", async ({ page }) => {
  await login(page, `  ${USERS.singleRole.email}  `, USERS.singleRole.password);

  await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
});


// TC_10 — Field-level errors (emailError / passwordError) should clear as soon as
//          the user starts typing in that field. API errorBanner stays until next submit.
test("TC_10 - Field Error Clears on Typing", async ({ page }) => {
  await page.goto(BASE_URL);

  await page.click('button[class*="submitBtn"]');

  const emailInput = page.locator('input[placeholder="Enter phone or email"]');
  const passwordInput = page.locator('input[placeholder="Password"]');

  const emailErrorMsg = page.getByText(/email/i);
  const passwordErrorMsg = page.getByText(/password/i);

  await expect(emailErrorMsg).toBeVisible();
  await expect(passwordErrorMsg).toBeVisible();

  // Type in email
  await emailInput.fill("a");

  // Email error should disappear
  await expect(emailErrorMsg).not.toBeVisible();

  // Password error should still exist
  await expect(passwordErrorMsg).toBeVisible();

  // Type in password
  await passwordInput.fill("a");

  // Now password error should disappear
  await expect(passwordErrorMsg).not.toBeVisible();
});


// TC_11 — Submitting 200-character strings should not crash the app
test("TC_11 - Long Input", async ({ page }) => {
  await page.goto(BASE_URL);

  const longText = "a".repeat(200);

  await page.fill('input[placeholder="Enter phone or email"]', longText);
  await page.fill('input[placeholder="Password"]', longText);
  await page.click('button[class*="submitBtn"]');

  await expect(page.locator("body")).toBeVisible();
});


// TC_12 — Dark mode should persist across login and navigation
test("TC_12 - Dark Mode Persistence", async ({ page }) => {
  await page.goto(BASE_URL);

  await page.getByRole("button", { name: "dark_mode" }).click();

  const bgColor = await page
    .locator("body")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bgColor).not.toBe("rgb(255, 255, 255)");

  await page.fill(
    'input[placeholder="Enter phone or email"]',
    USERS.multiInstMultiRole.email,
  );
  await page.fill(
    'input[placeholder="Password"]',
    USERS.multiInstMultiRole.password,
  );
  await page.click('button:has-text("Continue")');

  const bgAfterLogin = await page
    .locator("body")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bgAfterLogin).not.toBe("rgb(255, 255, 255)");
});


//--------------------------------------------------------------
// LOGICAL TESTS
//--------------------------------------------------------------


// TC_13 — Single institute + single role should land directly on dashboard
test("TC_13 - Single Institute Single Role", async ({ page }) => {
  await login(page, USERS.singleRole.email, USERS.singleRole.password);

  await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
});


// TC_14 — Valid credentials but user has no institute should show an error
test("TC_14 - No Institute Associated", async ({ page }) => {
  await login(page, USERS.noInstitute.email, USERS.noInstitute.password);
  await waitForNavOrError(page);

  await expect(page.locator('[class*="errorBanner"]')).toBeVisible({
    timeout: 10000,
  });
});

// TC_15 — Single institute + multiple roles should show role selection
test("TC_15 - Single Institute Multiple Roles", async ({ page }) => {
  await login(page, USERS.multiRole.email, USERS.multiRole.password);

  await expect(page).toHaveURL(/role/, { timeout: 15000 });

  await page.locator('[class*="list"] > *').first().click();

  await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
});


// TC_16 — Multiple institutes + multiple roles: Institute → Role → Dashboard
test("TC_16 - Multiple Institute Multiple Roles", async ({ page }) => {
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


// TC_17 — Multiple institutes + single role: Institute → Dashboard (skip role screen)
test("TC_17 - Multiple Institute Single Role", async ({ page }) => {
  await login(
    page,
    USERS.multiInstSingleRole.email,
    USERS.multiInstSingleRole.password,
  );

  await expect(page).toHaveURL(/institute/, { timeout: 15000 });

  await page.locator('[class*="list"] > *').first().click();

  await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
});


// TC_18 — After logging in, pressing browser back should not return to the login page
test("TC_18 - Back Navigation", async ({ page }) => {
  await login(page, USERS.singleRole.email, USERS.singleRole.password);

  await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });

  await page.goBack();

  await expect(page).not.toHaveURL(/login/);
});


// TC_19 — Change Institute from Role Screen
test("TC_19 - Change Institute from Role Screen", async ({ page }) => {
  await page.goto(BASE_URL);

  await page.fill(
    'input[placeholder="Enter phone or email"]',
    USERS.multiInstMultiRole.email,
  );
  await page.fill(
    'input[placeholder="Password"]',
    USERS.multiInstMultiRole.password,
  );
  await page.click('button:has-text("Continue")');

  await expect(page).toHaveURL(/institute/);
  const institutes = page.locator('[class*="list"] > *');
  await institutes.nth(0).click();

  await expect(page).toHaveURL(/role/);

  await page.click("text=Change Institute");

  await expect(page).toHaveURL(/institute/);

  await institutes.nth(1).click();

  await expect(page).toHaveURL(/role/);

  await page.locator('[class*="list"] > *').first().click();

  await expect(page).toHaveURL(/dashboard/);
});


//--------------------------------------------------------------
// PERFORMANCE TESTS
//--------------------------------------------------------------


// TC_20 — Loading wrapper should appear immediately after clicking submit
test("TC_20 - Loader Visible on Login", async ({ page }) => {
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


// TC_21 — Submit button should be disabled while the login request is in progress
test("TC_21 - Button Disabled During Login", async ({ page }) => {
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


// TC_22 — Going offline after page load and then submitting should show an error
test("TC_22 - Offline Mode", async ({ page, context }) => {
  await page.goto(BASE_URL);
  await context.setOffline(true);

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


// TC_23 — Clicking submit once should disable the button, preventing duplicate requests
test("TC_23 - Multiple Clicks Prevented", async ({ page }) => {
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

//--------------------------------------------------------------
// SECURITY TESTS
//--------------------------------------------------------------


// TC_24 — Email with special characters should fail gracefully with an error banner
test("TC_24 - Special Characters", async ({ page }) => {
  await login(page, "test@#$%.com", "1234");
  await waitForNavOrError(page);

  await expect(page.locator('[class*="errorBanner"]')).toBeVisible({
    timeout: 10000,
  });
});


// TC_25 — Wrong email and password should show an error banner
test("TC_25 - Invalid Credentials", async ({ page }) => {
  await login(page, USERS.invalid.email, USERS.invalid.password);
  await waitForNavOrError(page);

  await expect(page.locator('[class*="errorBanner"]')).toBeVisible({
    timeout: 10000,
  });
});


// TC_26 — Invalid email with valid password should show an error banner
test("TC_26 - Invalid Email Valid Password", async ({ page }) => {
  await login(page, "wrong@test.com", CONFIG.PASSWORD);
  await waitForNavOrError(page);

  await expect(page.locator('[class*="errorBanner"]')).toBeVisible({
    timeout: 10000,
  });
});


// TC_27 — Valid email with invalid password should show an error banner
test("TC_27 - Valid Email Invalid Password", async ({ page }) => {
  await login(page, USERS.singleRole.email, "wrongpassword");
  await waitForNavOrError(page);

  await expect(page.locator('[class*="errorBanner"]')).toBeVisible({
    timeout: 10000,
  });
});


// TC_28 — Progress bar fill element should be visible during login
test("TC_28 - Progress Bar Visible", async ({ page }) => {
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


// TC_29 — Pressing Enter on the password field should trigger login
test("TC_29 - Login using Enter Key", async ({ page }) => {
  await page.goto(BASE_URL);

  await page.fill(
    'input[placeholder="Enter phone or email"]',
    USERS.singleRole.email,
  );
  await page.fill('input[placeholder="Password"]', USERS.singleRole.password);

  await page.locator('input[placeholder="Password"]').press("Enter");

  await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
});
