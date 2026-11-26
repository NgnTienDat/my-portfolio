import { useLanguage } from '../../i18n/language.js'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

const email = 'tie.dat2004@gmail.com'

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(email)
    return true
  } catch {
    const field = document.createElement('textarea')
    const focused = document.activeElement
    field.value = email
    field.readOnly = true
    field.style.cssText = 'position:fixed;opacity:0;top:0;left:0'
    document.body.appendChild(field)
    field.select()
    try {
      return document.execCommand('copy')
    } catch {
      return false
    } finally {
      field.remove()
      focused?.focus({ preventScroll: true })
    }
  }
}

export default function EmailPopover() {
  const { t } = useLanguage()
  const bubble = useRef(null)
  const [notice, setNotice] = useState(null)

  useLayoutEffect(() => {
    if (!notice) return
    const element = bubble.current
    const rect = notice.anchor.getBoundingClientRect()
    const center = rect.left + rect.width / 2
    const left = Math.max(8, Math.min(innerWidth - element.offsetWidth - 8, center - element.offsetWidth / 2))
    const above = rect.top - element.offsetHeight - 12
    element.classList.toggle('below', above < 8)
    element.style.left = `${left}px`
    element.style.top = `${above < 8 ? rect.bottom + 12 : above}px`
    element.style.setProperty('--tx', `${center - left}px`)
  }, [notice, t])

  useEffect(() => {
    const element = bubble.current
    const links = [...document.querySelectorAll('[data-email]')]
    let anchor, hideTimer, resetTimer, request = 0, disposed = false
    const cancelHide = () => clearTimeout(hideTimer)
    function hide() {
      cancelHide()
      clearTimeout(resetTimer)
      request++
      anchor = null
      setNotice(null)
    }
    const delayHide = () => { cancelHide(); hideTimer = setTimeout(hide, 220) }
    function show(event) {
      cancelHide()
      if (event.type === 'focus' && anchor === event.currentTarget) return
      clearTimeout(resetTimer)
      request++
      anchor = event.currentTarget
      setNotice({ anchor, message: email })
    }
    async function copy(event) {
      event.preventDefault()
      if (event.currentTarget !== element.querySelector('button')) show(event)
      const current = ++request
      const copied = await copyEmail()
      if (disposed || current !== request || !anchor) return
      setNotice({ anchor, message: copied ? 'Copied!' : 'Could not copy' })
      clearTimeout(resetTimer)
      resetTimer = setTimeout(() => setNotice({ anchor, message: email }), 1600)
    }
    const outside = event => {
      if (!element.contains(event.target) && !event.target.closest('[data-email]')) hide()
    }
    const escape = event => {
      if (event.key !== 'Escape') return
      if (element.contains(document.activeElement)) anchor?.focus({ preventScroll: true })
      hide()
    }
    const bindings = links.flatMap(link => [
      [link, 'mouseenter', show], [link, 'mouseleave', delayHide],
      [link, 'focus', show], [link, 'blur', delayHide], [link, 'click', copy],
    ])
    bindings.push(
      [element, 'mouseenter', cancelHide], [element, 'mouseleave', delayHide],
      [element, 'focusin', cancelHide], [element, 'focusout', delayHide],
      [element.querySelector('button'), 'click', copy],
      [document, 'click', outside], [document, 'keydown', escape],
      [window, 'scroll', hide], [window, 'resize', hide],
    )
    bindings.forEach(([target, type, listener]) => target.addEventListener(type, listener))
    return () => {
      disposed = true
      clearTimeout(hideTimer)
      clearTimeout(resetTimer)
      bindings.forEach(([target, type, listener]) => target.removeEventListener(type, listener))
    }
  }, [])

  const copied = notice?.message === 'Copied!'
  return (
    <div ref={bubble} className={`eb${notice ? ' on' : ''}${copied ? ' ok' : ''}`} inert={!notice} aria-hidden={!notice}>
      <span role="status">{t(notice?.message || email)}</span>
      <button type="button" aria-label={t("Copy email address")}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {copied ? <path d="m5 12.5 4.5 4.5L19 7.5" /> : <><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15" /></>}
        </svg>
      </button>
    </div>
  )
}
