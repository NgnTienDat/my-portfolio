import { useEffect, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export default function ProjectImageModal({ label, slides, index, onChange, onClose }) {
  const dialog = useRef(null)
  const slide = slides[index]

  useLayoutEffect(() => {
    const element = dialog.current
    const overflow = document.body.style.overflow
    element.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      element.close()
      document.body.style.overflow = overflow
    }
  }, [])

  useEffect(() => {
    window.addEventListener('hashchange', onClose)
    return () => window.removeEventListener('hashchange', onClose)
  }, [onClose])

  useLayoutEffect(() => {
    dialog.current.querySelector('.image-modal-viewport').scrollTop = 0
    // Disabling the last arrow can move browser focus to the page body.
    if (!dialog.current.contains(document.activeElement) || document.activeElement.disabled) dialog.current.querySelector('button').focus({ preventScroll: true })
  }, [index])

  function onKeyDown(event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return
    if (event.key === 'Tab') {
      const controls = [...dialog.current.querySelectorAll('button:not(:disabled), [tabindex="0"]')]
      const edge = event.shiftKey ? controls[0] : controls.at(-1)
      if (document.activeElement === edge) {
        event.preventDefault()
        const target = event.shiftKey ? controls.at(-1) : controls[0]
        target.focus()
      }
      return
    }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    onChange(Math.max(0, Math.min(slides.length - 1, index + (event.key === 'ArrowRight' ? 1 : -1))))
  }

  function onBackdrop(event) {
    if (event.target !== event.currentTarget) return
    const rect = event.currentTarget.getBoundingClientRect()
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose()
  }

  return createPortal(
    <dialog className="image-modal" ref={dialog} aria-label={label} onKeyDown={onKeyDown} onClick={onBackdrop} onCancel={event => { event.preventDefault(); onClose() }}>
      <div className="image-modal-header">
        <span>{label}</span>
        <span className="image-modal-count" aria-live="polite">{index + 1} / {slides.length}</span>
        <button type="button" className="image-modal-close" aria-label="Close enlarged image" onClick={onClose}>×</button>
      </div>
      <figure className="image-modal-figure">
        <div className="image-modal-media">
          <div className="image-modal-viewport" tabIndex={0} role="region" aria-label={`${slide.title} image, scroll to explore`}>
            <img src={slide.image} alt={slide.title} />
          </div>
          <button type="button" className={`car-btn prev${index === 0 ? ' off' : ''}`} aria-label="Previous enlarged image" disabled={index === 0} onClick={() => onChange(index - 1)} />
          <button type="button" className={`car-btn next${index === slides.length - 1 ? ' off' : ''}`} aria-label="Next enlarged image" disabled={index === slides.length - 1} onClick={() => onChange(index + 1)} />
        </div>
        <figcaption><b>{slide.title}</b>{slide.description}</figcaption>
      </figure>
    </dialog>, document.body,
  )
}
