import { test, expect, type Page } from '@playwright/test';

async function start(page: Page) {
  await page.goto('/');
  await page.getByLabel('Language / Язык').selectOption('en');
  const created = page.waitForResponse((r) => r.url().endsWith('/documents/create'));
  await page.locator('.toolbar').getByRole('button', { name: /New scenario/ }).click();
  const doc = await (await created).json();
  const token = await page.locator('meta[name=war2-session]').getAttribute('content');
  return { id: doc.id, headers: { 'X-War2-Session': token! } };
}
async function choose(page: Page, opcode: number) {
  await page.locator('.toolbar').getByRole('button', { name: 'Command catalogue', exact: true }).click();
  await page.locator(`.catalog-item[data-opcode="${opcode}"]`).click();
}
async function newRule(page: Page) {
  await page.locator('.scenario-header').getByRole('button', { name: /New trigger/ }).click();
  await expect(page.locator('#condition-unit')).toHaveValue('107');
}

test('configure before adding; grouped action search, global search and byte-preserving view sorting', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const { id, headers } = await start(page);
  const search = page.getByRole('textbox', { name: 'Search triggers, settings and text…' });
  await search.fill('objective');
  await choose(page, 120);
  await page.getByLabel('Assignment text for the player').fill('Hold the bridge');
  await expect(page.locator('.scenario-card')).toHaveCount(0);
  await page.getByRole('button', { name: /Add setting/ }).click();
  await expect(page.locator('.scenario-card')).toHaveCount(1);
  await expect(page.locator('.scenario-card')).toContainText('Hold the bridge');
  await newRule(page);
  await page.getByLabel('What to check').selectOption('resources');
  await page.locator('#condition-player').selectOption('1');
  await page.locator('#condition-resource').selectOption('0');
  await page.locator('#condition-comparison').selectOption('2');
  await page.locator('#condition-amount').fill('50000');
  await expect(page.getByLabel('Switch number', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: /Add action/, exact: false }).first().click();
  await expect(page.getByRole('dialog', { name: 'Choose an action' })).toBeVisible();
  await page.getByLabel('Search names, groups and descriptions').fill('message');
  await page.locator('.catalog-item[data-opcode="37"]').click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.action-editor').last().locator('input').first()).toBeFocused();
  await page.locator('.action-editor').last().locator('textarea').fill('Victory achieved');
  await page.getByRole('button', { name: 'Move action up 2', exact: true }).click();
  await expect(page.locator('.action-editor').first()).toContainText('Show message');
  await page.screenshot({ path: '../../.local/builder-configured.png', fullPage: true });
  await page.getByRole('button', { name: /Add trigger/, exact: false }).click();
  await expect(page.locator('.scenario-card')).toHaveCount(2);
  await expect(page.locator('.scenario-card').last()).toContainText('50,000');
  await expect(page.locator('.scenario-card').last()).toContainText('Victory');
  const before = await (await page.request.get(`/api/v1/documents/${id}/export`, { headers })).body();
  await page.locator('.scenario-controls select').selectOption('groups');
  await page.locator('.scenario-controls select').selectOption('alphabet');
  const after = await (await page.request.get(`/api/v1/documents/${id}/export`, { headers })).body();
  expect(after.equals(before)).toBe(true);
  await search.fill('hold bridge');
  await expect(page.locator('.scenario-card')).toHaveCount(1);
  await expect(page.locator('.scenario-card')).toContainText('Hold the bridge');
  await search.fill('50000');
  await expect(page.locator('.scenario-card')).toHaveCount(1);
  await search.clear();
  await page.locator('.toolbar').getByRole('button', { name: 'Command catalogue', exact: true }).click();
  const names = await page.locator('.catalog-item-name').allTextContents();
  expect(names).toEqual([...names].sort(new Intl.Collator('en', { numeric: true, sensitivity: 'base' }).compare));
  await page.keyboard.press('Escape');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByLabel('Import file', { exact: true }).setInputFiles({ name: 'built.w2tr', mimeType: 'application/octet-stream', buffer: before });
  await expect(page.getByRole('heading', { name: 'built.w2tr', exact: true })).toBeVisible();
  await page.locator('.scenario-card-main').filter({ hasText: '50,000' }).click();
  await expect(page.locator('#condition-amount')).toHaveValue('50000');
  await expect(page.locator('.action-editor')).toHaveCount(2);
  await page.getByLabel('Language / Язык').selectOption('ru');
  await page.screenshot({ path: '../../.local/builder-scenario.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('manual switches explain their meaning and configure a real boolean condition', async ({ page }) => {
  await start(page);
  await newRule(page);
  await expect(page.locator('#condition-unit option:checked')).toHaveText('Any Unit');
  await page.getByLabel('What to check').selectOption('flag');
  await expect(page.getByText('A switch remembers yes or no', { exact: false })).toBeVisible();
  await page.getByLabel('Switch number', { exact: true }).fill('7');
  await page.locator('#condition-flag-value').selectOption('0');
  await page.getByRole('button', { name: /Add trigger/, exact: false }).click();
  await expect(page.locator('.scenario-card')).toContainText('Switch 7');
  await page.locator('.scenario-card-main').click();
  await expect(page.locator('#condition-flag-value')).toHaveValue('0');
});

test('legacy player flags are named choices and coloured player checkboxes', async ({ page }) => {
  const { id, headers } = await start(page);
  await choose(page, 7);
  await page.getByRole('checkbox', { name: 'Blue', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Red', exact: true }).check();
  await page.getByLabel('Additional players', { exact: true }).selectOption('3');
  await page.getByRole('button', { name: /Add command/, exact: false }).click();
  await expect(page.locator('.scenario-card')).toHaveCount(1);
  const doc = await (await page.request.get(`/api/v1/documents/${id}`, { headers })).json();
  expect(doc.program.instructions[0].bytes.slice(0, 4)).toEqual([7, 0, 3, 3]);
  await expect(page.getByLabel('Additional players', { exact: true })).toHaveValue('3');
});

test('wide editor keeps condition and actions together and submit visible at 900 by 600', async ({ page }) => {
  await start(page);
  await newRule(page);
  const condition = (await page.locator('.condition-section').boundingBox())!;
  const actions = (await page.locator('.actions-section').boundingBox())!;
  expect(actions.x).toBeGreaterThan(condition.x + condition.width);
  expect(Math.abs(actions.y - condition.y)).toBeLessThan(2);
  for (const viewport of [{ width: 1000, height: 800 }, { width: 900, height: 600 }]) {
    await page.setViewportSize(viewport);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const apply = page.locator('.builder-submit').getByRole('button', { name: /Add trigger/ });
    await expect(apply).toBeInViewport();
    await apply.click({ trial: true });
    const before = (await apply.boundingBox())!;
    await page.locator('.builder-scroll').evaluate((element) => { element.scrollTop = element.scrollHeight; });
    const after = (await apply.boundingBox())!;
    expect(after.y).toBe(before.y);
    await expect(apply).toBeInViewport();
  }
});

test('catalogue supports group filtering, keyboard selection, Escape and focus restoration', async ({ page }) => {
  await start(page);
  await newRule(page);
  const add = page.getByRole('button', { name: /Add action/, exact: false }).first();
  await add.click();
  const dialog = page.getByRole('dialog', { name: 'Choose an action' });
  const query = dialog.getByLabel('Search names, groups and descriptions');
  await expect(query).toBeFocused();
  await dialog.getByRole('button', { name: /Mission and victory/ }).first().click();
  await expect(dialog.locator('.catalog-item[data-opcode="24"]')).toBeVisible();
  await expect(dialog.locator('.catalog-item[data-opcode="37"]')).toHaveCount(0);
  await query.fill('message');
  await query.press('ArrowDown');
  await expect(dialog.locator('.catalog-item').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(add).toBeFocused();
});
