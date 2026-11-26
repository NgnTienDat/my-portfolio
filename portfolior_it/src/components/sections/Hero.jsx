import { useLanguage } from '../../i18n/language.js'
import resume from '../../assets/NguyenTienDat_CV.pdf'

export default function Hero() {
  const { t } = useLanguage()
  return (
<div className="hero"><div className="wrap">
 <div>
  <div className="status"><i></i>{t("Software engineer: Java + full-stack")}</div>
  <h1>{t("I turn ")}<mark>{t("real problems")}</mark>{t(" into ")}<span className="b">{t("working ")}</span><span className="nw"><span className="b">{t("software.")}</span><span className="cur" aria-hidden="true"></span></span></h1>
  <p className="sub">{t("From problem → production, I handle the code.")}</p>
  <p className="lead">{t("Hi, I’m Nguyen Tien Dat, a Java-focused software engineer in Ho Chi Minh City. Available immediately for backend internships and graduate roles, onsite or hybrid.")}</p>
  <div className="cta"><a className="btn fill" href="#work">{t("See my work")}</a><a className="btn line" href={resume} download="NguyenTienDat_CV.pdf">{t("Download resume")}</a></div>
  <div className="social"><a href="https://github.com/NgnTienDat" target="_blank" rel="noopener">GitHub</a><a href="https://www.linkedin.com/in/dat-nguyen-964ntd/" target="_blank" rel="noopener">LinkedIn</a><a href="mailto:tie.dat2004@gmail.com" data-email="" aria-label={t("Email, copy address")}>Email</a></div>
 </div>
 <div className="stage">
  <div className="ide" role="img" aria-label={t("Decorative Java code snippet describing my focus")}>
   <div className="ide-bar"><span className="dots"><b></b><b></b><b></b></span><span className="tab">Dat.java</span></div>
   <div className="code">
<div><span className="n">1</span><span><span className="k">public class</span>{" Dat "}<span className="k">implements</span>{" Engineer {"}</span></div>
<div><span className="n">2</span><span>{"  String focus = "}<span className="s">"Java, Spring Boot"</span>;</span></div>
<div><span className="n">3</span><span>{"  String also  = "}<span className="s">"React, Docker, AWS"</span>;</span></div>
<div><span className="n">4</span><span> </span></div>
<div><span className="n">5</span><span>{"  Product "}<span className="m">build</span>(Problem p) {"{"}</span></div>
<div><span className="n">6</span><span>    <span className="k">return</span> <span className="m">design</span>(p).<span className="m">code</span>().<span className="m">deploy</span>();</span></div>
<div><span className="n">7</span><span>{"  }"}</span></div>
<div><span className="n">8</span><span>{"}"}</span></div>
   </div>
  </div>
  <div className="wd w1"><small>{t("Now building")}</small><b>TheOU</b><span><i></i>{t("Live at theou.tech")}</span></div>{' '}
  <div className="wd w2"><small>{t("Ships to")}</small><b>Azure + Docker</b></div>
 </div>
</div></div>
  )
}
