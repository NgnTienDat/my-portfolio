const technologies = ['Java', 'Spring Boot', 'React', 'Next.js', 'PostgreSQL', 'MySQL', 'RabbitMQ', 'ClickHouse', 'Redis', 'Docker', 'GitHub Actions', 'AWS', 'Azure']

export default function TechMarquee() {
  return (
    <div className="mq" aria-label="Technologies I use">
      <div className="mq-t">
        {technologies.map(name => <span key={name}>{name}</span>)}
        {technologies.map(name => <span key={`repeat-${name}`} aria-hidden="true">{name}</span>)}
      </div>
    </div>
  )
}
