import { expect, test as setup } from "@playwright/test";
import env from "dotenv";
env.config();

setup("Manager authenticate", async ({ page }) => {
  await page.goto("/sign-in");

  await page.getByLabel("Email").fill(process.env.MANAGER_EMAIL!);
  await page.getByLabel("Password").fill(process.env.MANAGER_PASSWORD!);

  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/dashboard/);
});
