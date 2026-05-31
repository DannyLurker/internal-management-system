import { test as setup } from "@playwright/test";
import { MANAGER_STATE } from "./auth.constants";

setup("Manager authenticate", async ({ page }) => {
  await page.goto("http://localhost:3000/sign-in");

  await page.locator('input[name="email"]').fill("manager@hotel.com");
  await page.locator('input[name="password"]').fill("manager123");
  await page.locator('button[type="submit"]').click();

  await page.waitForURL((url) => !url.pathname.includes("sign-in"), {
    timeout: 10000,
  });

  await page.context().storageState({ path: MANAGER_STATE });
});
