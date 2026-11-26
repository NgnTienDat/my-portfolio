# Nguyen Tien Dat portfolio

The Vite root renders the portfolio through React JSX. The November 26 Neo-Brutalist redesign follows the supplied `public/portfolio.html` prototype. This prototype and the older `public/Update-portfolior.html` are read-only references; neither was edited during the redesign. Existing application content takes precedence over prototype copy. Selected work retains its cards, project content, screenshots, metrics, links, and enlarged image viewing.

Run `npm run dev`, `npm run build`, or `npm run preview`. In PowerShell with script execution disabled, use `npm.cmd` in place of `npm`.

The components follow the original markup:

- `src/components/layout/`: Navbar, Footer, the shared EmailPopover, and PageLoader.
- `src/components/sections/`: Hero, TechMarquee, About, SelectedWork, Process, Experience, Expertise, FAQ, and Contact.
- `src/components/projects/`: reusable ProjectCard, ProjectDetail, ProjectGallery, and ProjectImageModal.
- `src/data/projects.js`: all three projects and their screenshot metadata.
- `src/i18n/`: the language context/provider, Vietnamese copy, and project display translations.
- `src/styles/portfolio.css`: the exact stylesheet extracted from the read-only Neo-Brutalist HTML prototype.
- `src/styles/interactions.css`: matching loading screen, image buttons, and enlarged gallery modal styles.
- `src/assets/`: the supplied portrait (`my_pic.png`), CV, and eleven product screenshots, bundled without recompression.
- `public/portfolio/`: the original extracted WebP assets, including the experience logos.

Hash navigation keeps the homepage and details mounted, preserving FAQ and gallery state. React effects retain the original scroll thresholds, reveal observer, document titles, and scroll positioning. Gallery controls use native scrolling. Effects remove their listeners, disconnect observers, and cancel pending animation frames and email timers on unmount.

The updated About section uses the owner's supplied portrait, location tag, social icons, and revised text. Expertise includes the AI coding tools card. The hero keeps the cursor beside “software.” and uses AWS in the decorative code snippet. All five email links, including both footer entries, show the shared copy bubble on hover/focus and copy on click/Enter. Clipboard denial or unavailability falls back to the browser's copy command; a failed copy never displays “Copied!”. Escape, outside click, scroll, and resize dismiss the bubble. Hidden controls are inert.

The loading screen appears on every document visit/reload, including direct project URLs, and stays dismissed during hash navigation. Its percentage follows image decoding and font readiness, with an eased counter, a short minimum display time, and an eight-second deadline so stalled assets cannot block the page. Background content is inert and scrolling is locked until the screen leaves. Reduced motion disables the animated counter and fade.

Click or press Enter on a project screenshot to open its image, title, and full description in a native modal dialog. Buttons and the left/right arrow keys browse that project's images. Tall screenshots fill the modal width and scroll within the image area; captions remain below. Close with Escape, the close button, or the backdrop. Keyboard focus remains inside the modal and returns to the image button on dismissal; hash navigation closes it.

The EN/VI button is removed and the portfolio is locked to English, including document language and metadata. Previously saved language preferences are ignored. The existing translation bindings and Vietnamese dictionary remain inactive; project data, screenshots, and the supplied PDF are unchanged.

Validation commands:

```sh
npm run lint
npm run build
npm test
npm run test:cleanup
npm run test:interactions
npm run test:language
```

Browser checks use Playwright and an installed Microsoft Edge. Set `BROWSER_CHANNEL` to use another installed Chromium channel.

Run the build before browser checks and start the Vite dev or preview server. `npm test` expects `http://127.0.0.1:5173`; set `PORTFOLIO_URL` to test the production preview at `http://127.0.0.1:4173`. It checks widths 1440, 820, 390, and 320: content, metadata, working CV downloads, production asset integrity, email copying and keyboard access, navigation history, navbar behavior, galleries, FAQ, reduced motion, and absence of horizontal overflow. Clipboard success, fallback, and failure paths use browser stubs. Screenshots and the report are written to the ignored `.portfolio-checks/redesign/` directory.

`npm run test:cleanup` uses the development server to mount and unmount the application in StrictMode during loading and while a modal is open. It checks for leftover observers, event listeners, animation frames, timers, open dialogs, and scroll locks. It creates an ignored HTML harness in `.portfolio-checks/`.

`npm run test:interactions` checks entry/reload loading, monotonic progress, direct project URLs, hash navigation, all modal images and captions, tall-image scrolling, arrow/button navigation, keyboard focus, dismissal, and viewport fit at the same four widths. It also checks failed images, stalled font readiness, and reduced motion. Screenshots are saved in `.portfolio-checks/interactions/`.

`npm run test:language` checks that the switch is absent and English remains active on entry and reload, even with a saved Vietnamese preference.

Tests protect both reference hashes and the Selected work component/data hashes in `scripts/selected-work.sha256.json`. The full pre-redesign text, links (including download targets and accessibility labels), and image sources/alts are recorded in `scripts/portfolio-content.json`. Browser checks project the existing content out of the new marquee/footer structure and compare it with that unchanged snapshot, normalizing Vite's asset filenames. The stylesheet itself must exactly match the reference HTML. Shared surfaces are compared for font family/size/weight, line height, spacing, colors, borders, corner radius, shadows, alignment, and positioning. Decoration sizes, marquee content/loop duration, and reduced motion are also checked at all four widths.

The reference's original typography, padding, gaps, IDE dimensions, buttons, gallery controls, image fitting, colors, shadows, and breakpoints are used directly instead of a visual reinterpretation. Existing Navbar, ProjectCard, ProjectGallery, ProjectImageModal, and EmailPopover remain shared components. `interactions.css` retains the loader and modal, supplies their shared tokens, and allows narrow responsive grids to shrink. No dependencies or application logic were added for the visual changes.

The latest supplied hero screenshot overrides two desktop dimensions: the heading caps at 50px so it occupies three lines, and the IDE has a 330px minimum height. This brings the CTA and social links upward to match the screenshot. The subtitle and introduction retain their matching 17px and 15px sizes and existing copy. The hero badge and TheOU status now use the screenshot's labels. Visual checks apply these two approved dimensions to the read-only reference in browser memory; the HTML file remains unchanged.

TechMarquee now follows the prototype: thirteen technologies, a second visual-only copy for the seamless 45-second loop, and square separators on a dark strip immediately below the hero. Reduced motion stops the loop. Footer uses the prototype's four-column layout, social icons, navigation, resume download, contact entries, and bottom copyright/back-to-top row. It reuses the owner's current name, role, location, and links. Existing homepage copy, project descriptions/metrics, and modal captions remain unchanged. The English language lock remains in place.

In environments that block Google Fonts, set `PORTFOLIO_FONT_CACHE` to a directory containing the original Google Fonts response as `jetbrains-mono.css` and each referenced font URL's unchanged bytes as `font-0.ttf`, `font-1.ttf`, etc., in stylesheet order. The tests serve these responses at the original URLs and require JetBrains Mono to be loaded. The application's font links remain unchanged.

Responsive fixes let the hero and project detail grid columns shrink below their intrinsic content width. This removes page-level horizontal overflow while keeping the gallery's intentional horizontal scrolling. Gallery previews use the prototype's image fitting; the modal still displays each complete source image at full width with its unchanged caption.

Content reflects the supplied November 24, 2026 update: Java Backend internship/graduate focus, immediate availability in Ho Chi Minh City, expected program completion in December 2026, PostgreSQL/Neon for TN1983, and ClickHouse for the VaniOAK/Viettel capstone. Benchmark figures are explicitly local load-test results; TheOU is described as in development/testing. TN1983 customer/order screenshots were confirmed by the owner to contain demo data. VaniOAK's interface images are labeled as prototypes with simulated data.

The linked `src/assets/NguyenTienDat_CV.pdf` is the supplied file, unchanged. It still lists MySQL for TN1983; the website uses PostgreSQL/Neon according to the newer information. Update the PDF separately to make both consistent. No new dependencies or hosting configuration were needed for this update; the production output remains `dist/`.
