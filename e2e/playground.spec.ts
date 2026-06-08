import { test, expect, type Page } from '@playwright/test';

// Navigate (via about:blank so a hash-only change still reloads) and wait for boot.
const open = async (page: Page, hash = '') => {
  await page.goto('about:blank');
  await page.goto(`/${hash}`);
  await expect(page.locator('#main')).toHaveClass(/ready/, { timeout: 90_000 });
};

const errorMarkers = (page: Page) => page.locator('.squiggly-error');

const sharedState = (rb: string, rbs: string) => `#${new URLSearchParams({ rb, rbs })}`;

test.describe('TypeProf.wasm playground', () => {
  test('boots and reports type errors in the default example', async ({ page }) => {
    const crashes: string[] = [];
    page.on('pageerror', (e) => crashes.push(e.message));

    await open(page);

    await expect(errorMarkers(page).first()).toBeVisible();
    expect(crashes).toEqual([]);
  });

  test('re-analyzes when the example changes', async ({ page }) => {
    await open(page);
    await expect(errorMarkers(page).first()).toBeVisible();

    await page.selectOption('#select-example', 'array');
    await expect(errorMarkers(page)).toHaveCount(0);

    await page.selectOption('#select-example', 'union');
    await expect(errorMarkers(page).first()).toBeVisible();
  });

  test('uses the RBS definitions when analyzing Ruby', async ({ page }) => {
    const ruby = 'user = User.new("Alice")\nuser.name\n';
    const rbsWithName = 'class User\n  def initialize: (String) -> void\n  def name: -> String\nend\n';
    const rbsWithoutName = 'class User\n  def initialize: (String) -> void\nend\n';

    await open(page, sharedState(ruby, rbsWithName));
    await expect(errorMarkers(page)).toHaveCount(0);

    await open(page, sharedState(ruby, rbsWithoutName));
    await expect(errorMarkers(page).first()).toBeVisible();
  });

  test('loads every built-in example without crashing', async ({ page }) => {
    const crashes: string[] = [];
    page.on('pageerror', (e) => crashes.push(e.message));

    await open(page);
    const names = await page
      .locator('#select-example option')
      .evaluateAll((options) => options.map((o) => (o as HTMLOptionElement).value));

    for (const name of names) {
      await page.selectOption('#select-example', name);
      await page.waitForTimeout(2_000);
      await expect(page.locator('#main')).toHaveClass(/ready/);
      await expect(page.locator('#error')).not.toHaveClass(/active/);
    }

    expect(crashes).toEqual([]);
  });

  test('restores rb and rbs shared via the URL hash', async ({ page }) => {
    await open(page, sharedState('shared_rb = 1 + "boom"\n', '# shared_rbs\n'));

    await expect(page.locator('#rb-editor')).toContainText('shared_rb');
    await expect(page.locator('#rbs-editor')).toContainText('shared_rbs');
    await expect(errorMarkers(page).first()).toBeVisible();
  });
});
