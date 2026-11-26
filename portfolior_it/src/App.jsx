import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import Hero from './components/sections/Hero.jsx'
import TechMarquee from './components/sections/TechMarquee.jsx'
import About from './components/sections/About.jsx'
import SelectedWork from './components/sections/SelectedWork.jsx'
import Process from './components/sections/Process.jsx'
import Experience from './components/sections/Experience.jsx'
import Expertise from './components/sections/Expertise.jsx'
import FAQ from './components/sections/FAQ.jsx'
import Contact from './components/sections/Contact.jsx'
import EmailPopover from './components/layout/EmailPopover.jsx'
import PageLoader from './components/layout/PageLoader.jsx'
import ProjectDetail from './components/projects/ProjectDetail.jsx'
import { projects } from './data/projects.js'
import LanguageProvider from './i18n/LanguageProvider.jsx'
import { useLanguage } from './i18n/language.js'
import localizeProject from './i18n/localizeProject.js'
import './styles/portfolio.css'
import './styles/interactions.css'

function subscribe(callback) {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}

function getHash() {
  return window.location.hash.slice(1)
}

export default function App() {
  return <LanguageProvider><Portfolio /></LanguageProvider>
}

function Portfolio() {
  const { t } = useLanguage()
  const hash = useSyncExternalStore(subscribe, getHash)
  const project = projects.find(item => hash === `project-${item.id}`)
  const wasProject = useRef(false)

  useLayoutEffect(() => {
    if (project) {
      window.scrollTo({ top: 0, behavior: 'instant' })
    } else {
      const target = hash ? document.getElementById(hash) : null
      if (target) target.scrollIntoView({ behavior: 'instant' })
      else if (wasProject.current) window.scrollTo({ top: 0, behavior: 'instant' })
    }
    wasProject.current = Boolean(project)
  }, [hash, project])

  useLayoutEffect(() => {
    document.title = project ? `${t(project.title)} — Nguyen Tien Dat` : 'Nguyen Tien Dat — Software Engineer'
    const description = document.querySelector('meta[name="description"]')
    if (description) description.content = t('Java-focused software engineer in Ho Chi Minh City, building backend systems and deployed products. Open to internship and graduate roles.')
  }, [project, t])

  useEffect(() => {
    const elements = document.querySelectorAll('.rv')
    if (!('IntersectionObserver' in window)) {
      elements.forEach(element => element.classList.add('in'))
      return
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })
    elements.forEach(element => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  return (
    <PageLoader>
      <Navbar />
      <main id="home" hidden={Boolean(project)}>
        <span id="top"></span>
        <Hero />
        <TechMarquee />
        <About />
        <SelectedWork />
        <Process />
        <Experience />
        <Expertise />
        <FAQ />
        <Contact />
      </main>
      {projects.map(item => <ProjectDetail key={item.id} project={localizeProject(item, t)} hidden={project !== item} />)}
      <Footer />
      <EmailPopover />
    </PageLoader>
  )
}
