import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const base = process.env.PORTFOLIO_URL || 'http://127.0.0.1:5173'
const output = '.portfolio-checks/redesign'
await mkdir(output, { recursive: true })
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const reference = await readFile('public/portfolio.html')
assert.equal(hash(reference), 'e6f924c700a0e3d5bd7d48be5bdb66f8c6c554f4f400fefb28119a10e2c8da1b', 'Neo-Brutalist reference HTML changed')

const update = await readFile('public/Update-portfolior.html')
assert.equal(hash(update), '860a070b936b10b5a3b368a04b3980b3fdee3928818ba401e424ed83fe1c5bf5', 'Updated reference HTML changed')
const protectedFiles = JSON.parse(await readFile('scripts/selected-work.sha256.json', 'utf8'))
for (const [file, expected] of Object.entries(protectedFiles)) {
  assert.equal(hash(await readFile(file)), expected, `Selected work source changed: ${file}`)
}

const originalContent = JSON.parse(await readFile('scripts/portfolio-content.json', 'utf8'))
assert.equal((await readFile('src/styles/portfolio.css', 'utf8')).replace(/\r\n/g, '\n'), reference.toString().match(/<style>([\s\S]*?)<\/style>/)[1].replace(/\r\n/g, '\n'), 'Reference stylesheet must be used without visual reinterpretation')
function normalizeAssets(content) {
  function asset(url) {
    if (url?.startsWith('/src/assets/')) return `/asset/${url.split('/').at(-1)}`
    if (url?.startsWith('/assets/')) return `/asset/${url.split('/').at(-1).replace(/-[\w-]{8}(?=\.[^.]+$)/, '')}`
    return url
  }
  return {
    ...content,
    links: content.links.map(([text, href, ...attributes]) => [text, asset(href), ...attributes]),
    images: content.images.map(([src, alt]) => [asset(src), alt]),
  }
}

const resume = await readFile('src/assets/NguyenTienDat_CV.pdf')
const assetHashes = new Set(await Promise.all((await readdir('dist/assets')).map(async name => hash(await readFile(`dist/assets/${name}`)))))
for (const folder of ['theou', 'tn1983', 'vanioak']) {
  for (const name of await readdir(`src/assets/${folder}`)) {
    assert(assetHashes.has(hash(await readFile(`src/assets/${folder}/${name}`))), `Asset changed or missing in production: ${folder}/${name}`)
  }
}
assert(assetHashes.has(hash(resume)), 'CV changed or missing in production')
assert(assetHashes.has(hash(await readFile('src/assets/my_pic.png'))), 'Supplied portrait changed or missing in production')

const fontCache = process.env.PORTFOLIO_FONT_CACHE
const fontCss = fontCache ? await readFile(`${fontCache}/jetbrains-mono.css`, 'utf8') : null
const fontFiles = fontCss ? new Map(await Promise.all([...fontCss.matchAll(/url\((https:[^)]+)\)/g)].map(async (match, i) =>
  [match[1], await readFile(`${fontCache}/font-${i}.ttf`)]))) : null
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true })
const errors = []
const designComparisons = []
const responsive = []
const projects = [{ id: 'theou', slides: 3 }, { id: 'tn1983', slides: 5 }, { id: 'log-monitoring', slides: 3 }]

async function newPage(width) {
  const page = await browser.newPage({ viewport: { width, height: 900 } })
  if (fontCache) {
    await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ contentType: 'text/css', body: fontCss }))
    await page.route('https://fonts.gstatic.com/**', route => {
      const font = fontFiles.get(route.request().url())
      assert(font, 'Font URL missing from cache')
      return route.fulfill({ contentType: 'font/ttf', body: font })
    })
  }
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error' && !message.text().startsWith('Failed to load resource:')) errors.push(message.text())
  })
  page.on('requestfailed', request => {
    // Chromium can report navigation as aborted when it hands the PDF to the download manager.
    if (request.failure().errorText === 'net::ERR_ABORTED' && new URL(request.url()).pathname.endsWith('.pdf')) return
    errors.push(`${request.url()} ${request.failure().errorText}`)
  })
  page.on('response', response => {
    // The approved reference has no favicon.
    if (response.status() >= 400 && new URL(response.url()).pathname !== '/favicon.ico') errors.push(`HTTP ${response.status()} ${response.url()}`)
  })
  return page
}

async function settle(page) {
  await page.waitForFunction(() => !document.querySelector('.page-loader'))
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all([...document.images].map(image => image.decode()))
  })
  await page.waitForTimeout(750)
}

async function checkOverflow(page, width, state) {
  const actual = await page.evaluate(() => document.documentElement.scrollWidth)
  responsive.push({ width, state, documentWidth: actual })
  assert(actual <= width, `Horizontal overflow at ${width}px: ${state} is ${actual}px wide`)
}

async function screenshot(page, width, state, fullPage = false) {
  await settle(page)
  await checkOverflow(page, width, state)
  await page.screenshot({ path: `${output}/${width}-${state}.png`, fullPage, animations: 'disabled' })
}

async function compareDesignReference(width) {
  const pages = [await newPage(width), await newPage(width)]
  try {
    for (let i = 0; i < pages.length; i++) {
      await pages[i].emulateMedia({ reducedMotion: 'reduce' })
      await pages[i].goto(`${base}/${i === 0 ? 'portfolio.html' : ''}`)
      // The latest screenshot supersedes the HTML's desktop hero sizes.
      if (i === 0) await pages[i].addStyleTag({ content: '@media(min-width:961px){.hero h1{font-size:clamp(32px,4vw,50px)}.hero .ide{min-height:330px}}' })
      await settle(pages[i])
    }
    for (const selector of ['body', '.wrap', '.pnav', '.pnav .mono', '.pnav .cv', '.hero', '.hero .wrap', '.hero h1', '.hero mark', '.hero .nw .b', '.status', '.sub', '.lead', '.cta', '.social', '.ide', '.ide-bar', '.code', '.wd', '.mq', '.mq-t span', '.sh', '.sh h2', '.about', '.me-frame', '.me-tag', '.me-soc a', '.me-cap', '.about-r .big', '.about-r .stmt', '.pcard', '.p-body', '.p-ic', '.chips span', '.p-metric', '.p-btns', '.p-live', '#process', '.steps3', '.step', '.step .no', '.step p', '#experience', '.exp', '.row', '.row time', '.logo-t', '.row .role', '.row p', '#expertise', '.skill', '.skill li', '.skill.wide', '.faq details', '.faq summary', '.faq details p', '#contact', '.contact', '.contact h2', '.contact p', '.contact .btn', '.contact .soc a', '.detail', '.det-l', '.back', '.chip', '.det-title', '.det-tag', '.det-r h4', '.det-sec p', '.stats div', '.stats small', '.hint', '.gal', '.gal figcaption', '.gal figcaption b', '.car-btn', '.car-dots', '.car-dots button', 'footer', '.fgrid', '.flogo', '.fs a', '.fbot', '.eb', '.eb button']) {
      const styles = []
      for (const page of pages) {
        styles.push(await page.locator(selector).first().evaluate((element, selector) => {
          const style = getComputedStyle(element)
          const properties = [
            'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'color',
            'backgroundColor', 'backgroundImage', 'backgroundSize', 'borderTopWidth', 'borderTopColor', 'borderRadius', 'boxShadow',
            'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
            'gap', 'display', 'position', 'textAlign', 'alignItems', 'justifyContent',
          ]
          if (['.pnav .mono', '.step .no', '.logo-t', '.car-btn', '.car-dots button', '.fs a'].includes(selector)) properties.push('width', 'height')
          return Object.fromEntries(properties.map(property => [property, style[property]]))
        }, selector))
      }
      assert.deepEqual(styles[1], styles[0], `Neo-Brutalist reference differs: ${width}px ${selector}`)
      designComparisons.push({ width, selector, styles: styles[1] })
    }
    if (width >= 390) {
      const heights = await Promise.all(pages.map(page => page.locator('.hero').evaluate(element => element.getBoundingClientRect().height)))
      assert.equal(heights[1], heights[0], `Hero height differs from HTML at ${width}px`)
    }
    if (width >= 1350) {
      const hero = await pages[1].locator('.hero').evaluate(element => {
        const title = element.querySelector('h1')
        return {
          lines: Math.round(title.getBoundingClientRect().height / parseFloat(getComputedStyle(title).lineHeight)),
          ideHeight: element.querySelector('.ide').getBoundingClientRect().height,
          linksBottom: element.querySelector('.social').getBoundingClientRect().bottom,
        }
      })
      assert.equal(hero.lines, 3, 'Desktop title must fit three lines as in the supplied screenshot')
      assert.equal(hero.ideHeight, 330)
      assert(hero.linksBottom < 744, 'Social links must remain visible in the screenshot-sized viewport')
    }
    for (const [selector, pseudo] of [['.hero .cur', null], ['.mq-t span', '::after'], ['.sh h2', '::before'], ['.faq summary', '::after'], ['.car-dots button', '::before']]) {
      const styles = await Promise.all(pages.map(page => page.locator(selector).first().evaluate((element, pseudo) => {
        const style = getComputedStyle(element, pseudo)
        return Object.fromEntries(['width', 'height', 'color', 'backgroundColor', 'borderRadius', 'borderTopWidth', 'borderTopColor', 'fontSize', 'marginLeft'].map(property => [property, style[property]]))
      }, pseudo)))
      assert.deepEqual(styles[1], styles[0], `Reference decoration differs: ${width}px ${selector}${pseudo || ''}`)
      designComparisons.push({ width, selector: `${selector}${pseudo || ''}`, styles: styles[1] })
    }
    assert.deepEqual(await pages[1].locator('.mq-t span').allTextContents(), await pages[0].locator('.mq-t span').allTextContents(), 'Marquee technologies or duplicate loop changed')
    assert.equal(await pages[1].locator('.mq-t [aria-hidden="true"]').count(), 13)
    await pages[1].emulateMedia({ reducedMotion: 'no-preference' })
    assert.equal(await pages[1].locator('.mq-t').evaluate(element => getComputedStyle(element).animationDuration), '45s')
    await pages[1].emulateMedia({ reducedMotion: 'reduce' })
    assert.equal(await pages[1].locator('.mq-t').evaluate(element => getComputedStyle(element).animationName), 'none')
    const violations = await pages[1].evaluate(() => [...document.querySelectorAll('*')].flatMap(element => {
      const style = getComputedStyle(element)
      const issues = []
      if (style.backdropFilter !== 'none') issues.push('backdrop blur')
      if (style.backgroundImage.includes('gradient') && !['hero', 'contact'].includes(element.id) && !element.classList.contains('hero')) issues.push('gradient')
      for (const shadow of style.boxShadow.matchAll(/rgba?\([^)]+\)\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+([\d.]+)px/g)) {
        if (Number(shadow[3]) !== 0) issues.push('soft shadow')
      }
      return issues.map(issue => `${element.tagName}.${element.className}: ${issue}`)
    }))
    assert.deepEqual(violations, [], 'Forbidden visual effects')
  } finally {
    await Promise.all(pages.map(page => page.close()))
  }
}

async function verifyEmail(page, width) {
  // Keep reveal/hover motion from shifting links during clipboard assertions.
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.evaluate(() => {
    window.copiedEmails = []
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async value => window.copiedEmails.push(value),
    } })
  })
  for (const link of await page.locator('[data-email]').all()) {
    // Start outside the target so scrolling cannot consume the hover's mouseenter.
    await page.mouse.move(0, 0)
    await link.evaluate(element => {
      element.scrollIntoView({ block: 'center', behavior: 'instant' })
      element.focus({ preventScroll: true })
    })
    await settle(page)
    await link.hover()
    await page.waitForFunction(() => document.querySelector('.eb').classList.contains('on'))
    await page.locator('.eb').evaluate(bubble => {
      const rect = bubble.getBoundingClientRect()
      if (rect.left < 0 || rect.right > innerWidth) throw new Error('Email bubble overflows viewport')
    })
    await link.click()
    await page.waitForFunction(() => document.querySelector('.eb').classList.contains('ok'))
    assert.equal(await page.locator('.eb [role="status"]').textContent(), 'Copied!', `Email confirmation: ${width}px ${await link.getAttribute('aria-label')}`)
    assert.equal(new URL(page.url()).hash, '')
    await page.keyboard.press('Escape')
    assert.equal(await page.locator('.eb').getAttribute('inert'), '')
    await link.evaluate(element => element.blur())
    await link.evaluate(element => element.focus({ preventScroll: true }))
    await page.locator('.eb button').evaluate(element => element.focus({ preventScroll: true }))
    assert(await page.locator('.eb button').evaluate(element => element === document.activeElement))
    await page.keyboard.press('Enter')
    await page.waitForFunction(() => document.querySelector('.eb').classList.contains('ok'))
    await page.keyboard.press('Escape')
    assert(await link.evaluate(element => element === document.activeElement))
    await link.evaluate(element => element.blur())
  }
  assert.deepEqual(await page.evaluate(() => window.copiedEmails), Array(10).fill('tie.dat2004@gmail.com'))
  if (width === 1440) {
    const link = page.locator('.social [data-email]')
    await link.evaluate(element => {
      element.scrollIntoView({ block: 'center', behavior: 'instant' })
      element.focus({ preventScroll: true })
    })
    await settle(page)
    await page.evaluate(() => {
      navigator.clipboard.writeText = async () => { throw new Error('Clipboard permission denied') }
      document.execCommand = command => command === 'copy'
    })
    await link.click()
    await page.waitForFunction(() => document.querySelector('.eb').classList.contains('ok'))
    await page.waitForFunction(() => document.querySelector('.eb span').textContent === 'tie.dat2004@gmail.com')
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined })
      document.execCommand = () => false
    })
    await link.click()
    await page.waitForFunction(() => document.querySelector('.eb span').textContent === 'Could not copy')
    assert(!await page.locator('.eb').evaluate(bubble => bubble.classList.contains('ok')), 'Failed copy must not claim success')
    await page.locator('.hero h1').click()
    assert.equal(await page.locator('.eb').getAttribute('inert'), '')
    await link.hover()
    await page.mouse.move(0, 0)
    await page.waitForFunction(() => !document.querySelector('.eb').classList.contains('on'))
    await link.focus()
    await page.evaluate(() => window.dispatchEvent(new Event('resize')))
    assert.equal(await page.locator('.eb').getAttribute('inert'), '')
    await link.evaluate(element => element.blur())
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.emulateMedia({ reducedMotion: 'no-preference' })
}

async function verify(width) {
  const page = await newPage(width)
  try {
    await page.goto(base)
    await settle(page)
    assert(await page.evaluate(() => [...document.fonts].some(face => face.family.includes('JetBrains Mono') && face.status === 'loaded')), 'JetBrains Mono failed to load')
    assert.equal(await page.title(), 'Nguyen Tien Dat — Software Engineer')
    assert.equal(await page.locator('.hero h1').innerText(), 'I turn real problems into working software.')
    assert.equal(await page.locator('html').getAttribute('lang'), 'en')
    assert.equal(await page.locator('meta[name="theme-color"]').getAttribute('content'), '#F6F8FD')
    assert.deepEqual(await page.locator('#home section').evaluateAll(sections => sections.map(section => section.id)), ['about', 'work', 'process', 'experience', 'expertise', 'faq', 'contact'])
    const text = await page.locator('body').textContent()
    const content = await page.evaluate(() => {
      const home = document.querySelector('#home').cloneNode(true)
      home.querySelector('.mq').remove()
      const footer = document.querySelector('footer')
      const footerLinks = [...footer.querySelectorAll('.fgrid>div:nth-child(3)>a')].slice(0, 2).concat(footer.querySelector('.fbot>a'))
      return {
        text: [home, ...document.querySelectorAll('main.detail')].map(element => element.textContent.replace(/\s+/g, ' ').trim()).concat(footer.querySelector('.fbot span').textContent + footerLinks.map(element => element.textContent).join('')),
        links: [...document.querySelectorAll('a')].filter(element => !element.closest('footer')).concat(footerLinks).map(element => [element.textContent, element.getAttribute('href'), element.getAttribute('download'), element.getAttribute('target'), element.getAttribute('aria-label')]),
        images: [...document.images].map(element => [element.getAttribute('src'), element.getAttribute('alt')]),
      }
    })
    assert.deepEqual(normalizeAssets(content), normalizeAssets(originalContent), 'Existing content, links, image sources, or accessibility labels changed')
    assert(!/406|Replace with|Use post-detail\.png|Elasticsearch/.test(text), 'Stale or draft content remains')
    assert(text.includes('December 2026') && text.includes('Available immediately'))
    assert.equal(await page.locator('.pcard').count(), 3)
    assert.equal(await page.locator('.hero h1 .nw').textContent(), 'software.')
    assert((await page.locator('.code').textContent()).includes('React, Docker, AWS'))
    assert.equal(await page.locator('.me-frame img').getAttribute('alt'), 'Portrait of Nguyen Tien Dat')
    assert.equal(await page.locator('.me-soc a').count(), 3)
    assert.equal(await page.locator('.me-cap b').textContent(), 'Nguyen Tien Dat')
    assert((await page.locator('.about-r').textContent()).includes('Shipping is a milestone, not the finish line.'))
    assert.equal(await page.locator('.skill.wide h3').textContent(), 'AI coding tools')
    assert.equal(await page.locator('.skill.wide li').allTextContents().then(items => items.join(', ')), 'ChatGPT, OpenAI Codex')
    assert.equal(await page.locator('[data-email]').count(), 5)
    await verifyEmail(page, width)
    const downloads = page.locator('a[download="NguyenTienDat_CV.pdf"]')
    assert.equal(await downloads.count(), 3)
    assert.equal(await downloads.nth(0).getAttribute('href'), await downloads.nth(1).getAttribute('href'))
    assert.equal(await downloads.nth(0).getAttribute('href'), await downloads.nth(2).getAttribute('href'))
    if (width === 1440) {
      const downloadReady = page.waitForEvent('download')
      await downloads.nth(1).click()
      const download = await downloadReady
      const file = `${output}/downloaded-cv.pdf`
      await download.saveAs(file)
      assert.deepEqual(await readFile(file), resume, 'Downloaded CV differs from supplied PDF')
    }
    assert.equal(await page.locator('#v-tn1983 .det-btns a').last().getAttribute('href'), 'https://github.com/NgnTienDat/tn1983-crm-system')
    assert((await page.locator('#v-tn1983 .foundation').textContent()).includes('PostgreSQL/Neon'))
    assert((await page.locator('#v-log-monitoring .foundation').textContent()).includes('ClickHouse'))
    assert((await page.locator('#v-log-monitoring .det-note').textContent()).includes('300s measurement'))
    assert((await page.locator('#v-theou .det-note').textContent()).includes('not an official product'))
    for (const element of await page.locator('#home .rv').all()) {
      await element.evaluate(reveal => reveal.scrollIntoView({ behavior: 'instant' }))
      await page.waitForFunction(reveal => reveal.classList.contains('in'), await element.elementHandle())
    }
    assert.equal(await page.locator('#home .rv.in').count(), await page.locator('#home .rv').count(), 'A homepage element did not reveal')
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await screenshot(page, width, 'home', true)
    await page.locator('#work').evaluate(element => element.scrollIntoView({ behavior: 'instant' }))
    await screenshot(page, width, 'work-collapsed')
    assert(await page.locator('#pnav').evaluate(nav => nav.classList.contains('min')))
    assert(await page.locator('.rv.in').count() > 0)
    await page.locator('#pnav').hover()
    await screenshot(page, width, 'nav-hover')
    await page.mouse.move(0, 0)
    await page.locator('#pnav .mono').focus()
    await screenshot(page, width, 'nav-focus')
    await page.locator('#pnav .mono').evaluate(link => link.blur())
    await page.evaluate(() => window.scrollBy({ top: -100, behavior: 'instant' }))
    await settle(page)
    assert(!await page.locator('#pnav').evaluate(nav => nav.classList.contains('min')))
    await page.locator('#faq summary').first().click()
    assert.notEqual(await page.locator('#faq details').first().getAttribute('open'), null)
    await page.mouse.move(0, 0)
    await screenshot(page, width, 'faq-open')

    for (const project of projects) {
      await page.goto(`${base}/?project-check=${project.id}#project-${project.id}`)
      await settle(page)
      const detail = page.locator(`#v-${project.id}`)
      assert(await detail.isVisible())
      assert(await page.locator('#home').evaluate(home => home.hidden))
      assert.equal(await page.evaluate(() => scrollY), 0)
      assert((await page.title()).endsWith(' — Nguyen Tien Dat'))
      assert.equal(await detail.locator('figure').count(), project.slides)
      assert.equal(await detail.locator('.car-dots button').count(), project.slides)
      assert.equal(await detail.locator('.prev').getAttribute('tabindex'), '-1')
      await screenshot(page, width, `${project.id}-first`, true)
      await detail.locator('.next').click()
      await page.mouse.move(0, 0)
      await screenshot(page, width, `${project.id}-second`)
      assert.equal(await detail.locator('[aria-current]').getAttribute('aria-label'), 'Go to image 2')
      await detail.locator('.car-dots button').last().click()
      await page.mouse.move(0, 0)
      await screenshot(page, width, `${project.id}-last`)
      assert.equal(await detail.locator('[aria-current]').getAttribute('aria-label'), `Go to image ${project.slides}`)
      assert.equal(await detail.locator('.next').getAttribute('tabindex'), '-1')
      await detail.locator('.prev').click()
      await settle(page)
      assert.equal(await detail.locator('[aria-current]').getAttribute('aria-label'), `Go to image ${project.slides - 1}`)
      await detail.locator('.back').click()
      await settle(page)
      assert.equal(new URL(page.url()).hash, '#work')
      assert(await page.locator('#home').isVisible())
      await page.goBack()
      await settle(page)
      assert(await detail.isVisible())
      await page.goForward()
      await settle(page)
      assert(await page.locator('#home').isVisible())
      await page.locator(`.card-link[href="#project-${project.id}"]`).click({ position: { x: 20, y: 20 } })
      await settle(page)
      assert(await detail.isVisible())
    }
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(`${base}/?reduced-motion#project-theou`)
    await page.locator('#v-theou .next').click()
    await screenshot(page, width, 'reduced-motion')
    assert.equal(await page.locator('#v-theou [aria-current]').getAttribute('aria-label'), 'Go to image 2')
    await page.locator('#v-theou .back').click()
    await page.locator('#pnav .mono').click()
    await settle(page)
    assert.equal(await page.evaluate(() => scrollY), 0)
    console.log(`${width}px: content, assets, responsive layout, galleries, history, navbar, FAQ, and reduced motion passed`)
  } finally {
    await page.close()
  }
}

try {
  for (const width of [1440, 820, 390, 320]) {
    await compareDesignReference(width)
    await verify(width)
  }
  await writeFile(`${output}/report.json`, JSON.stringify({ designComparisons, responsive, errors }, null, 2))
  assert.deepEqual(errors, [], 'Browser errors')
  console.log(`${designComparisons.length} Neo-Brutalist reference comparisons and ${responsive.length} overflow checks passed. Existing content, links, reference HTML, and supplied asset bytes are preserved.`)
} finally {
  await browser.close()
}
