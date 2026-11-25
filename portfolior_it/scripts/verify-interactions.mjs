import assert from 'node:assert/strict'
import { mkdir, readFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const base = process.env.PORTFOLIO_URL || 'http://127.0.0.1:5173'
const output = '.portfolio-checks/interactions'
await mkdir(output, { recursive: true })
const cache = process.env.PORTFOLIO_FONT_CACHE
const css = cache ? await readFile(`${cache}/jetbrains-mono.css`, 'utf8') : null
const fonts = css ? new Map(await Promise.all([...css.matchAll(/url\((https:[^)]+)\)/g)].map(async (m, i) => [m[1], await readFile(`${cache}/font-${i}.ttf`)]))) : null
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge' })
const errors = []

async function newPage(width) {
  const page = await browser.newPage({ viewport: { width, height: 900 } })
  if (cache) {
    await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ contentType: 'text/css', body: css }))
    await page.route('https://fonts.gstatic.com/**', route => route.fulfill({ contentType: 'font/ttf', body: fonts.get(route.request().url()) }))
  }
  page.on('pageerror', error => errors.push(error.message))
  return page
}

async function waitForPortfolio(page) {
  await page.waitForFunction(() => !document.querySelector('.page-loader'), null, { timeout: 12000 })
  assert.equal(await page.locator('.portfolio-content').getAttribute('inert'), null)
  assert.equal(await page.evaluate(() => document.body.style.overflow), '')
}

async function verifyLoading(page, width) {
  await page.route('**/*my_pic*.png', async route => {
    await new Promise(resolve => setTimeout(resolve, 800))
    await route.continue()
  })
  await page.goto(`${base}/#project-theou`, { waitUntil: 'domcontentloaded' })
  await page.locator('.page-loader').waitFor({ state: 'visible' })
  assert.equal(await page.locator('.portfolio-content').getAttribute('inert'), '')
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden')
  await page.evaluate(() => {
    const progress = document.querySelector('[role="progressbar"]')
    window.progressValues = [Number(progress.getAttribute('aria-valuenow'))]
    const observer = new MutationObserver(() => {
      window.progressValues.push(Number(progress.getAttribute('aria-valuenow')))
      if (window.progressValues.at(-1) === 100) observer.disconnect()
    })
    observer.observe(progress, { attributes: true, attributeFilter: ['aria-valuenow'] })
  })
  await page.waitForFunction(() => {
    const value = Number(document.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow'))
    return value > 0 && value < 100
  })
  await page.screenshot({ path: `${output}/${width}-loader.png` })
  await waitForPortfolio(page)
  const values = await page.evaluate(() => window.progressValues)
  assert(values.includes(100), 'Loading must finish at 100%')
  assert(values.every((value, i) => value >= 0 && value <= 100 && (i === 0 || value >= values[i - 1])), 'Loading progress must be monotonic')
  assert(await page.locator('#v-theou').isVisible(), 'Direct case-study URL must survive loading')
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('.page-loader').waitFor({ state: 'visible' })
  await waitForPortfolio(page)
}

async function verifyModal(page, width, id, slides) {
  await page.evaluate(project => { location.hash = `project-${project}` }, id)
  const detail = page.locator(`#v-${id}`)
  await detail.waitFor({ state: 'visible' })
  assert.equal(await page.locator('.page-loader').count(), 0, 'Hash navigation must not restart loading')
  const first = detail.locator('.shot-open').first()
  const captions = await detail.locator('.gal figcaption').allTextContents()
  await first.click()
  const modal = page.locator('.image-modal')
  await modal.waitFor({ state: 'visible' })
  assert(await modal.evaluate(dialog => dialog.matches(':modal')))
  assert.equal(await modal.locator('figcaption').textContent(), captions[0])
  assert.equal(await modal.locator('img').getAttribute('src'), await first.locator('img').getAttribute('src'))
  assert(await modal.locator('.prev').isDisabled())
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden')
  assert(await modal.evaluate(dialog => dialog.contains(document.activeElement)))
  if (id === 'tn1983') {
    await modal.locator('img').evaluate(image => image.decode())
    const viewport = modal.locator('.image-modal-viewport')
    if (width === 1440) assert(await viewport.evaluate(element => element.scrollHeight > element.clientHeight), 'Tall screenshots must be readable by scrolling at full modal width')
    await viewport.evaluate(element => { element.scrollTop = 100 })
    await page.screenshot({ path: `${output}/${width}-tn1983-tall-modal.png`, animations: 'disabled' })
  }
  for (let i = 1; i < slides; i++) {
    if (i % 2) await modal.locator('.next').click()
    else await page.keyboard.press('ArrowRight')
    assert.equal(await modal.locator('.image-modal-count').textContent(), `${i + 1} / ${slides}`)
    assert.equal(await modal.locator('figcaption').textContent(), captions[i])
    assert.equal(await modal.locator('.image-modal-viewport').evaluate(element => element.scrollTop), 0, 'Changing images must reset image scrolling')
    assert.equal(await modal.locator('img').getAttribute('src'), await detail.locator('.shot-open img').nth(i).getAttribute('src'))
  }
  assert(await modal.locator('.next').isDisabled())
  await page.keyboard.press('ArrowRight')
  assert.equal(await modal.locator('.image-modal-count').textContent(), `${slides} / ${slides}`)
  await modal.evaluate(async element => {
    await element.querySelector('img').decode()
    element.scrollTop = 0
  })
  const box = await modal.boundingBox()
  assert(box.x >= 0 && box.y >= 0 && box.x + box.width <= width && box.y + box.height <= 900, 'Modal must fit viewport')
  assert(await modal.evaluate(element => element.scrollWidth <= element.clientWidth), 'Modal must not overflow horizontally')
  assert((await modal.locator('figcaption').evaluate(element => parseFloat(getComputedStyle(element).fontSize))) >= 16)
  await page.screenshot({ path: `${output}/${width}-${id}-modal.png`, animations: 'disabled' })
  await page.keyboard.press('ArrowLeft')
  assert.equal(await modal.locator('figcaption').textContent(), captions[slides - 2])
  await modal.locator('.prev').click()
  await modal.locator('.image-modal-close').focus()
  await page.keyboard.press('Shift+Tab')
  assert(await modal.evaluate(dialog => dialog.contains(document.activeElement)), 'Focus must remain inside modal')
  await page.keyboard.press('Escape')
  assert.equal(await modal.count(), 0)
  assert(await first.evaluate(button => button === document.activeElement), 'Focus must return to clicked image')
  assert.equal(await page.evaluate(() => document.body.style.overflow), '')
  await first.focus()
  await page.keyboard.press('Enter')
  await modal.waitFor({ state: 'visible' })
  await modal.locator('.image-modal-close').click()
  assert.equal(await modal.count(), 0)
  await first.click()
  await page.mouse.click(2, 2)
  assert.equal(await modal.count(), 0, 'Backdrop click must close modal')
  await detail.locator('.car-dots button').last().click()
  await page.waitForFunction(project => document.querySelector(`#v-${project} .car-dots button:last-child`).hasAttribute('aria-current'), id)
  await detail.locator('.shot-open').last().click()
  assert.equal(await modal.locator('.image-modal-count').textContent(), `${slides} / ${slides}`, 'Click must open the selected image')
  await page.evaluate(() => { location.hash = 'work' })
  await page.locator('#home').waitFor({ state: 'visible' })
  assert.equal(await modal.count(), 0, 'Navigating away must dismiss modal')
  assert.equal(await page.evaluate(() => document.body.style.overflow), '')
}

try {
  for (const width of [1440, 820, 390, 320]) {
    const page = await newPage(width)
    try {
      await verifyLoading(page, width)
      for (const [id, slides] of [['theou', 3], ['tn1983', 5], ['log-monitoring', 3]]) await verifyModal(page, width, id, slides)
      console.log(`${width}px: visit/reload loading, no loading on hash navigation, all modal images/captions, controls, keyboard, focus, dismissal, and viewport fit passed.`)
    } finally { await page.close() }
  }
  const page = await newPage(390)
  try {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.addInitScript(() => Object.defineProperty(document.fonts, 'ready', { get: () => new Promise(() => {}) }))
    await page.route('**/portfolio/viettel.webp', route => route.abort())
    await page.route('**/*my_pic*.png', async route => {
      await new Promise(resolve => setTimeout(resolve, 8100))
      await route.continue()
    })
    await page.goto(base, { waitUntil: 'domcontentloaded' })
    await page.locator('.page-loader').waitFor({ state: 'visible' })
    await waitForPortfolio(page)
    await page.evaluate(() => { location.hash = 'project-theou' })
    await page.locator('#v-theou .shot-open').first().click()
    await page.keyboard.press('ArrowRight')
    assert.equal(await page.locator('.image-modal-count').textContent(), '2 / 3')
    await page.keyboard.press('Escape')
    console.log('Stalled fonts, a failed image, an image arriving after the deadline, and reduced motion: loading releases the page and the modal remains usable.')
  } finally { await page.close() }
  assert.deepEqual(errors, [], 'Browser runtime errors')
} finally { await browser.close() }
