import { useLanguage } from '../../i18n/language.js'
import { useEffect, useState } from 'react'
import resume from '../../assets/NguyenTienDat_CV.pdf'

export default function Navbar() {
  const { t } = useLanguage()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    let last = window.scrollY || 0
    let frame = 0
    function update() {
      const y = window.scrollY || 0
      const delta = y - last
      if (y < 60) {
        setCollapsed(false)
        last = y
      } else if (delta >= 6) {
        setCollapsed(true)
        last = y
      } else if (delta <= -6) {
        setCollapsed(false)
        last = y
      }
      frame = 0
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
<div className="navw"><nav className={`pnav${collapsed ? ' min' : ''}`} id="pnav" aria-label={t("Main")}>
 <a className="mono" href="#top" aria-label={t("Nguyen Tien Dat, home")}>DN</a>
 <span className="nm" aria-hidden="true"><span><b>Nguyen Tien Dat</b></span></span>
 <div className="lk"><div className="lk-in">
  <a href="#about">{t("About")}</a><a href="#work">{t("Work")}</a><a href="#process">{t("Process")}</a><a href="#experience">{t("Experience")}</a>
  <a className="cv" href={resume} download="NguyenTienDat_CV.pdf">{t("Resume")}</a>
 </div></div>
</nav></div>
  )
}
