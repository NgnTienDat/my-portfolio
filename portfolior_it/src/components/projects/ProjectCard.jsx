import { useLanguage } from '../../i18n/language.js'
export default function ProjectCard({ project }) {
  const { t } = useLanguage()
  const href = `#project-${project.id}`
  return (
    <article className={`pcard${project.wide ? ' wide' : ''} rv`}>
      <a className="card-link" href={href} tabIndex="-1" aria-hidden="true"></a>
      <div className="p-thumb" aria-hidden="true"><img src={project.thumbnail} alt="" decoding="async" /></div>
      <div className="p-body">
        <div className="p-top"><div className="p-ic" aria-hidden="true">{project.icon}</div><div><h3>{project.name}</h3><p>{project.description}</p></div></div>
        <div className="chips">{project.technologies.map(technology => <span key={technology}>{technology}</span>)}</div>
        <div className="p-metric"><b>{project.metric.value}</b><span>{project.metric.description}</span></div>
        <div className="p-btns"><a className="btn fill" href={href}>{t("View case study")}</a>{project.live && <a className="p-live" href={project.live.href} target="_blank" rel="noopener">{project.live.label}</a>}</div>
      </div>
    </article>
  )
}
