import { useLanguage } from '../../i18n/language.js'
import { projects } from '../../data/projects.js'
import localizeProject from '../../i18n/localizeProject.js'
import ProjectCard from '../projects/ProjectCard.jsx'

export default function SelectedWork() {
  const { t } = useLanguage()
  return (
<section id="work"><div className="wrap">
 <div className="sh rv"><h2>{t("Selected work")}</h2><p>{t("Projects I designed, built, and deployed.")}</p></div>
 <div className="work">{projects.map(project => <ProjectCard key={project.id} project={localizeProject(project, t)} />)}</div>
</div></section>
  )
}
