import { useLanguage } from '../../i18n/language.js'
import { useEffect, useLayoutEffect, useState } from 'react'

export default function PageLoader({ children }) {
  const { t } = useLanguage()
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState('loading')
  const loading = phase !== 'complete'

  useLayoutEffect(() => {
    if (!loading) return
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = overflow }
  }, [loading])

  useEffect(() => {
    let disposed = false, target = 0, value = 0, completed = 0, ready = false, frame, exitTimer
    const started = performance.now()
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches
    const resources = [...document.images].map(image => image.decode())
    resources.push(document.fonts?.ready || Promise.resolve())
    resources.forEach(resource => Promise.resolve(resource).catch(() => {}).then(() => {
      if (disposed || ready) return
      completed++
      target = Math.round(completed / resources.length * 100)
      ready = completed === resources.length
    }))
    // A stalled third-party font must not keep the portfolio inaccessible.
    const deadline = setTimeout(() => { ready = true; target = 100 }, 8000)
    function tick(now) {
      value = calm ? target : Math.min(target, value + Math.max(1, (target - value) * 0.08))
      setProgress(Math.floor(value))
      if (ready && value === 100 && now - started >= 650) {
        clearTimeout(deadline)
        setPhase('leaving')
        exitTimer = setTimeout(() => setPhase('complete'), calm ? 0 : 220)
      } else {
        frame = requestAnimationFrame(tick)
      }
    }
    frame = requestAnimationFrame(tick)
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      clearTimeout(deadline)
      clearTimeout(exitTimer)
    }
  }, [])

  return (
    <>
      <div className="portfolio-content" inert={loading} aria-busy={loading}>{children}</div>
      {loading && <div className={`page-loader${phase === 'leaving' ? ' leaving' : ''}`}>
        <div className="loader-content" role="progressbar" aria-label={t("Loading portfolio")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <div className="loader-number" aria-hidden="true"><b>{progress}</b><span>%</span></div>
          <div className="loader-track" aria-hidden="true"><span style={{ transform: `scaleX(${progress / 100})` }} /></div>
          <p>{t("Crafting your experience")}</p>
        </div>
      </div>}
    </>
  )
}
