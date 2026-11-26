export default function localizeProject(project, t) {
  return {
    ...project,
    description: t(project.description),
    category: t(project.category),
    title: t(project.title),
    tagline: t(project.tagline),
    problem: t(project.problem),
    solution: t(project.solution),
    note: t(project.note),
    galleryLabel: t(project.galleryLabel),
    galleryHint: t(project.galleryHint),
    metric: { ...project.metric, description: t(project.metric.description) },
    live: project.live ? { ...project.live, label: t(project.live.label) } : null,
    deliverables: project.deliverables.map(t),
    stats: project.stats.map(stat => ({ ...stat, label: t(stat.label) })),
    links: project.links.map(link => ({ ...link, label: t(link.label) })),
    slides: project.slides.map(slide => ({ ...slide, title: t(slide.title), description: t(slide.description) })),
  }
}
