import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

await mkdir('.portfolio-checks', { recursive: true })
await writeFile('.portfolio-checks/lifecycle.html', `<!doctype html>
<html><head><meta charset="utf-8"></head><body><div id="root"></div>
<script type="module">
import { StrictMode, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import App from '/src/App.jsx'
window.mountPortfolio = () => {
  window.testRoot = createRoot(document.getElementById('root'))
  window.testRoot.render(createElement(StrictMode, null, createElement(App)))
}
window.mountPortfolio()
</script></body></html>`)
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true })
try {
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.addInitScript(() => {
    const observers = new Set()
    const listeners = new Set()
    const frames = new Set()
    const timers = new Set()
    const NativeObserver = window.IntersectionObserver
    window.IntersectionObserver = class extends NativeObserver {
      constructor(...args) { super(...args); observers.add(this) }
      disconnect() { observers.delete(this); super.disconnect() }
    }
    const add = EventTarget.prototype.addEventListener
    const remove = EventTarget.prototype.removeEventListener
    EventTarget.prototype.addEventListener = function (type, listener, options) {
      if ((this === window && ['scroll', 'hashchange', 'resize'].includes(type)) ||
          (this === document && ['click', 'keydown'].includes(type)) ||
          this.matches?.('.gal, [data-email], .eb, .eb button')) listeners.add({ target: this, type, listener })
      return add.call(this, type, listener, options)
    }
    EventTarget.prototype.removeEventListener = function (type, listener, options) {
      for (const record of listeners) if (record.target === this && record.type === type && record.listener === listener) listeners.delete(record)
      return remove.call(this, type, listener, options)
    }
    const request = window.requestAnimationFrame.bind(window)
    const cancel = window.cancelAnimationFrame.bind(window)
    window.requestAnimationFrame = callback => {
      const id = request(time => { frames.delete(id); callback(time) })
      frames.add(id)
      return id
    }
    window.cancelAnimationFrame = id => { frames.delete(id); cancel(id) }
    const timeout = window.setTimeout.bind(window)
    const clear = window.clearTimeout.bind(window)
    window.setTimeout = (callback, delay, ...args) => {
      const id = timeout(() => { timers.delete(id); callback(...args) }, delay)
      if ([220, 1600, 8000].includes(delay)) timers.add(id)
      return id
    }
    window.clearTimeout = id => { timers.delete(id); clear(id) }
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => {} } })
    Object.defineProperty(document.fonts, 'ready', { configurable: true, get: () => new Promise(() => {}) })
    window.lifecycleCounts = () => ({ observers: observers.size, listeners: listeners.size, frames: frames.size, timers: timers.size })
  })
  await page.goto(`${process.env.PORTFOLIO_URL || 'http://127.0.0.1:5173'}/.portfolio-checks/lifecycle.html`)
  await page.waitForFunction(() => window.lifecycleCounts().observers === 1 && window.lifecycleCounts().listeners === 29)
  const loading = await page.evaluate(() => {
    const pending = window.lifecycleCounts()
    window.testRoot.unmount()
    return { pending, unmounted: window.lifecycleCounts(), overflow: document.body.style.overflow }
  })
  assert.equal(loading.pending.frames, 1, 'Expected pending loader animation frame')
  assert.equal(loading.pending.timers, 1, 'Expected loader readiness deadline')
  assert.deepEqual(loading.unmounted, { observers: 0, listeners: 0, frames: 0, timers: 0 })
  assert.equal(loading.overflow, '')
  await page.evaluate(() => { delete document.fonts.ready; window.mountPortfolio() })
  await page.waitForFunction(() => !document.querySelector('.page-loader') && window.lifecycleCounts().listeners === 29)
  await page.evaluate(() => { location.hash = 'project-theou' })
  await page.locator('#v-theou .shot-open').first().click()
  await page.waitForFunction(() => window.lifecycleCounts().listeners === 30)
  const counts = await page.evaluate(async () => {
    window.dispatchEvent(new Event('scroll'))
    document.querySelectorAll('.gal').forEach(gallery => gallery.dispatchEvent(new Event('scroll')))
    const email = document.querySelector('[data-email]')
    email.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    await Promise.resolve()
    await Promise.resolve()
    email.dispatchEvent(new MouseEvent('mouseleave'))
    const pending = window.lifecycleCounts()
    window.testRoot.unmount()
    return { pending, unmounted: window.lifecycleCounts(), overflow: document.body.style.overflow, dialogs: document.querySelectorAll('dialog[open]').length }
  })
  assert.equal(counts.pending.frames, 4, 'Expected scheduled navbar/gallery frames')
  assert.equal(counts.pending.timers, 2, 'Expected pending email hide/reset timers')
  assert.deepEqual(counts.unmounted, { observers: 0, listeners: 0, frames: 0, timers: 0 })
  assert.equal(counts.overflow, '')
  assert.equal(counts.dialogs, 0)
  assert.deepEqual(errors, [])
  console.log('StrictMode unmount during loading and an open modal: all observers, listeners, animation frames, timers, dialogs, and scroll locks cleaned up.')
} finally {
  await browser.close()
}
