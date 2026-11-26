import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge' })
const page = await browser.newPage({ reducedMotion: 'reduce' })
const errors = []
page.on('pageerror', error => errors.push(error.message))
await page.addInitScript(() => localStorage.setItem('portfolio-language', 'vi'))
await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ contentType: 'text/css', body: '' }))

async function assertEnglish() {
  await page.waitForFunction(() => !document.querySelector('.page-loader'))
  assert.equal(await page.locator('html').getAttribute('lang'), 'en')
  assert.equal(await page.locator('.language-toggle').count(), 0)
  assert.equal(await page.locator('#pnav a[href="#about"]').textContent(), 'About')
  assert.equal(await page.title(), 'Nguyen Tien Dat — Software Engineer')
}

try {
  await page.goto(process.env.PORTFOLIO_URL || 'http://127.0.0.1:5173')
  await assertEnglish()
  await page.reload()
  await assertEnglish()
  assert.deepEqual(errors, [], 'Browser runtime errors')
  console.log('Language switch absent; saved Vietnamese preference ignored on entry and reload.')
} finally {
  await browser.close()
}
