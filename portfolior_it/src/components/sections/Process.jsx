import { useLanguage } from '../../i18n/language.js'
export default function Process() {
  const { t } = useLanguage()
  return (
<section className="alt" id="process"><div className="wrap">
 <div className="sh rv"><h2>{t("From problem to production")}</h2><p>{t("Three habits I bring to every project.")}</p></div>
 <div className="steps3">
  <article className="step rv"><div className="no">01</div><h3>{t("Understand the problem")}</h3><p>{t("Before choosing any technology, I clarify who will use it, what they need, and what done looks like.")}</p></article>
  <article className="step rv"><div className="no">02</div><h3>{t("Design for reliability")}</h3><p>{t("I plan the data model and the flow between components so the system copes with slow services, retries, and failures.")}</p></article>
  <article className="step rv"><div className="no">03</div><h3>{t("Ship and improve")}</h3><p>{t("I deploy early with Docker and CI/CD, watch how the system behaves, and keep refining it.")}</p></article>
 </div>
</div></section>
  )
}
