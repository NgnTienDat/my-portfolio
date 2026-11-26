import { useLanguage } from '../../i18n/language.js'
import ProjectGallery from './ProjectGallery.jsx'

export default function ProjectDetail({ project, hidden }) {
  const { t } = useLanguage()
  return (
    <main className="detail" id={`v-${project.id}`} hidden={hidden}>
      <div className="wrap">
        <a className="back" href="#work">{t("‹ Back to work")}</a>
        <div className="det-grid">
          <div className="det-l"><div><p className="hint">{project.galleryHint}</p>
            <ProjectGallery label={project.galleryLabel} slides={project.slides} />
          </div></div>
          <div className="det-r">
            <span className="chip">{project.category}</span>
            <h1 className="det-title">{project.title}</h1>
            <p className="det-tag">{project.tagline}</p>
            <div className="det-sec"><h4>{t("The problem")}</h4><p>{project.problem}</p></div>
            <div className="det-sec"><h4>{t("Decision & solution")}</h4><p>{project.solution}</p></div>
            <div className="det-sec"><h4>{t("What I delivered")}</h4><ul className="dl">{project.deliverables.map(item => <li key={item}>{item}</li>)}</ul></div>
            <div className="det-sec"><h4>{t("Result")}</h4><div className="stats">{project.stats.map(stat => <div key={stat.label}><small>{stat.label}</small><b>{stat.value}</b></div>)}</div></div>
            <div className="det-sec rule"><h4>{t("Technical foundation")}</h4><p className="foundation">{project.foundation}</p></div>
            {project.note && <p className="det-note">{project.note}</p>}
            {project.links.length > 0 && <div className="det-btns">{project.links.map(link => <a key={link.href} className={link.className} href={link.href} target="_blank" rel="noopener">{link.label}</a>)}</div>}
          </div>
        </div>
      </div>
    </main>
  )
}
