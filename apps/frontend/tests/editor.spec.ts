import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';
import { writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const source = resolve('../../legacy-audit/source/tr/ex/1.w2tr');

test('open, edit, preview, apply, undo and change language through the real API', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByText('Создайте логику вашей миссии')).toBeVisible();
  await page.screenshot({ path: '../../.local/welcome.png', fullPage: true });
  await page.getByLabel('Language / Язык').selectOption('en');
  await page.getByLabel('Import file', { exact: true }).setInputFiles(source);
  await expect(page.getByRole('heading', { name: '1.w2tr' })).toBeVisible();
  await expect(page.getByText('No structural errors found')).toBeVisible();
  await page.locator('.scenario-card-main').first().click();
  const fields = page.locator('.builder-pane input[type=number]');
  await expect(fields).toHaveCount(2);
  await fields.nth(1).fill('2');
  await page.locator('.builder-pane').getByRole('button', { name: 'Preview', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByText('Value: 2', { exact: false })).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Apply changes' }).click();
  await expect(page.getByText('Unsaved changes', { exact: true })).toBeVisible();
  await expect(fields.nth(1)).toHaveValue('2');
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(fields.nth(1)).toHaveValue('0');
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  await expect(fields.nth(1)).toHaveValue('2');
  await page.screenshot({ path: '../../.local/editor.png', fullPage: true });
  await page.getByLabel('Language / Язык').selectOption('ru');
  await expect(page.locator('.builder-heading').getByRole('heading', { name: 'Установить значение' })).toBeVisible();
  await page.setViewportSize({ width: 1000, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('API rejects missing credentials and foreign origins; unknown bytes open read only', async ({ page, request }) => {
  await page.goto('/');
  expect((await request.get('/api/v1/health')).status()).toBe(403);
  const token = await page.locator('meta[name=war2-session]').getAttribute('content');
  const headers = { 'X-War2-Session': token! };
  expect((await request.get('/api/v1/health', { headers })).status()).toBe(200);
  expect((await request.post('/api/v1/documents/create', { headers: { ...headers, Origin: 'https://untrusted.example' }, data: {} })).status()).toBe(403);
  const result = await request.post('/api/v1/documents/import', { headers, data: { name: 'unknown.w2tr', bytes: [128, 254, 255] } });
  const document = await result.json();
  expect(document.writable).toBe(false);
  expect(document.program.diagnostics[0].code).toBe('trigger.unknown_opcode');
  const response = await request.get(`/api/v1/documents/${document.id}/export`, { headers });
  expect(Array.from(await response.body())).toEqual([128, 254, 255]);
});

test('CLI inspect, validate and byte-identical roundtrip use the same authenticated API', async ({ page }) => {
  await page.goto('/');
  const token = await page.locator('meta[name=war2-session]').getAttribute('content');
  const session = resolve('../../.local/cli-session.json');
  writeFileSync(session, JSON.stringify({ url: 'http://127.0.0.1:47862', token }));
  const executable = resolve('../../target/debug/war2-cli.exe');
  for (const command of ['inspect', 'validate', 'roundtrip']) {
    const result = spawnSync(executable, [session, command, source], { encoding: 'utf8', timeout: 15000 });
    expect(result.status, result.stderr).toBe(0);
    const response = JSON.parse(result.stdout);
    if (command === 'roundtrip') expect(response.identical).toBe(true);
    if (command === 'inspect') expect(response.writable).toBe(true);
  }
});
