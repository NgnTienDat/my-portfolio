import { projects } from '../../data/projects.js'
import ProjectCard from '../projects/ProjectCard.jsx'

export default function SelectedWork() {
  return (
<section id="work"><div className="wrap">
 <div className="sh rv"><h2>Selected work</h2><p>Projects I designed, built, and deployed.</p></div>
 <div className="work">{projects.map(project => <ProjectCard key={project.id} project={project} />)}</div>
</div></section>
  )
}
