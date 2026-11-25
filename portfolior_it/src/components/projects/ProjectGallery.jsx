import { useCallback, useEffect, useRef, useState } from 'react'
import ProjectImageModal from './ProjectImageModal.jsx'

export default function ProjectGallery({ label, slides }) {
  const gallery = useRef(null)
  const count = slides.length
  const [index, setIndex] = useState(0)
  const [expanded, setExpanded] = useState(null)
  const closeModal = useCallback(() => setExpanded(null), [])
  const [calm] = useState(() => matchMedia('(prefers-reduced-motion:reduce)').matches)

  useEffect(() => {
    const element = gallery.current
    let frame = 0
    function sync() {
      const width = element.clientWidth || 1
      setIndex(Math.max(0, Math.min(count - 1, Math.round(element.scrollLeft / width))))
    }
    function onScroll() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(sync)
    }
    element.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      element.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [count])

  function go(next) {
    next = Math.max(0, Math.min(count - 1, next))
    gallery.current.scrollTo({
      left: next * gallery.current.clientWidth,
      behavior: calm ? 'auto' : 'smooth',
    })
  }

  return (
    <div className="car">
      <div className="car-nav">
        <button type="button" className={`car-btn prev${index === 0 ? ' off' : ''}`} aria-label="Previous image" tabIndex={index === 0 ? -1 : 0} onClick={() => go(index - 1)}></button>
        <button type="button" className={`car-btn next${index === count - 1 ? ' off' : ''}`} aria-label="Next image" tabIndex={index === count - 1 ? -1 : 0} onClick={() => go(index + 1)}></button>
      </div>
      <div className="gal" role="region" aria-label={label} tabIndex="0" ref={gallery}>
        {slides.map((slide, i) => <figure key={slide.image}>
          <button type="button" className="shot real shot-open" aria-label={`Enlarge ${slide.title}`} onClick={() => setExpanded(i)}>
            <img src={slide.image} alt={slide.title} />
          </button>
          <figcaption><b>{slide.title}</b>{slide.description}</figcaption>
        </figure>)}
      </div>
      <div className="car-dots">
        {slides.map((slide, i) => <button key={slide.image} type="button" className={i === index ? 'on' : undefined} aria-label={`Go to image ${i + 1}`} aria-current={i === index ? 'true' : undefined} onClick={() => go(i)}></button>)}
      </div>
      {expanded !== null && <ProjectImageModal label={label} slides={slides} index={expanded} onChange={setExpanded} onClose={closeModal} />}
    </div>
  )
}
