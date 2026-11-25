export default function Experience() {
  return (
<section id="experience"><div className="wrap">
 <div className="sh rv"><h2>Experience &amp; education</h2></div>
 <div className="exp rv">
  <article className="row"><time>Apr 2026 to Aug 2026</time><div className="xp"><span className="logo-t fill"><img src={import.meta.env.BASE_URL + "portfolio/viettel.webp"} alt="" decoding="async" /></span><div><h3>Viettel Digital Talent</h3><div className="role">Software Engineer Trainee</div><p>Developed a personal Dev/Test log-monitoring capstone under mentor guidance. Designed a Spring Boot modular monolith with RabbitMQ, ClickHouse, PostgreSQL, and Redis alert deduplication; built SSE monitoring and Telegram alerts. A 5-minute k6 measurement accepted about 1,000 logs/s with p95 end-to-end latency of 1.891s.</p></div></div></article>
  <article className="row"><time>Nov 2025 to Feb 2026</time><div className="xp"><span className="logo-t"><img src={import.meta.env.BASE_URL + "portfolio/iteach.webp"} alt="" decoding="async" /></span><div><h3>iTeach Online English</h3><div className="role">Fullstack Developer Intern</div><p>Worked in a three-person Agile/Scrum team with two-week sprints, pull requests, and code reviews. Built Spring Boot and MySQL REST APIs with RBAC for four roles using Spring Security and stateless JWT, contributed React features, and configured GitHub Actions and Docker deployment to Google Cloud Run.</p></div></div></article>
  <article className="row"><time>2022 to 2026</time><div className="xp"><span className="logo-t"><img src={import.meta.env.BASE_URL + "portfolio/open-university.webp"} alt="" decoding="async" /></span><div><h3>Ho Chi Minh City Open University</h3><div className="role">BSc, Computer Science · In progress</div><p>Expected program completion: December 2026. Certifications: TOEIC Listening &amp; Reading 760/990, IIG Vietnam (August 2025), and DevOps for Freshers, DEVOPSEDU.VN (October 2026).</p></div></div></article>
 </div>
</div></section>
  )
}
