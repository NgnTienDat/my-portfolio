import { useLanguage } from '../../i18n/language.js'
export default function Expertise() {
  const { t } = useLanguage()
  return (
<section className="alt" id="expertise"><div className="wrap">
 <div className="sh rv"><h2>{t("Expertise")}</h2><p>{t("Tools I’ve used in internships and personal projects.")}</p></div>
 <div className="skills">
  <div className="skill rv"><h3>Backend &amp; APIs</h3><ul><li>Java</li><li>Spring Boot</li><li>Spring Security</li><li>Spring Data JPA</li><li>Hibernate</li><li>REST</li><li>JWT</li><li>Supabase</li></ul></div>
  <div className="skill rv"><h3>Data &amp; Messaging</h3><ul><li>MySQL</li><li>PostgreSQL</li><li>ClickHouse</li><li>RabbitMQ</li><li>Redis</li></ul></div>
  <div className="skill rv"><h3>Frontend</h3><ul><li>React</li><li>TypeScript</li><li>Next.js</li><li>JavaScript</li><li>HTML</li><li>CSS</li><li>Tailwind CSS</li></ul></div>
  <div className="skill rv"><h3>Delivery, Cloud &amp; Testing</h3><ul><li>Git</li><li>GitHub Actions</li><li>Docker</li><li>AWS EC2</li><li>Azure VM</li><li>Cloud Run</li><li>Nginx</li><li>Cloudflare</li><li>JUnit 5</li><li>Mockito</li><li>k6</li></ul></div>
  <div className="skill wide rv"><div className="sk-l"><h3>AI coding tools</h3><ul><li>ChatGPT</li><li>OpenAI Codex</li></ul></div><p>{t("I treat AI as a working partner. I talk through every problem and trade-off with ")}<strong>ChatGPT</strong>{t(", then ")}<strong>{t("make the decisions myself")}</strong>{t(". Most of the code is written by ")}<strong>OpenAI Codex</strong>{t("; my role is to ")}<strong>{t("find the solution, set the direction, and make the call")}</strong>.</p></div>
 </div>
</div></section>
  )
}
