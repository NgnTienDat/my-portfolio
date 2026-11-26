import { useLanguage } from '../../i18n/language.js'
export default function FAQ() {
  const { t } = useLanguage()
  return (
<section id="faq"><div className="wrap">
 <div className="sh rv"><h2>{t("Questions")}</h2></div>
 <div className="faq rv">
  <details><summary>{t("What do you work with most?")}</summary><p>{t("Java and Spring Boot on the backend, with React or Next.js when a project needs a frontend. I deploy with Docker and GitHub Actions to Azure, AWS, or Google Cloud Run.")}</p></details>
  <details><summary>{t("Can you work across the whole stack?")}</summary><p>{t("Yes. I worked on full-stack features at iTeach, and TN1983 is a full-stack project from data model to deployment.")}</p></details>
  <details><summary>{t("What are you building now?")}</summary><p>{t("TheOU, a campus platform deployed for development and testing, and TN1983, a production system for a family coffee roastery. TheOU is an independent project and is not an official university product.")}</p></details>
  <details><summary>{t("What opportunities are you looking for?")}</summary><p>{t("Java Backend internships, fresher, and graduate software engineering roles in Ho Chi Minh City. I’m available immediately for onsite or hybrid work and also consider full-stack opportunities. Email is the fastest way to reach me.")}</p></details>
 </div>
</div></section>
  )
}
