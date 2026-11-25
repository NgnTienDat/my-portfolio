import theouFeed from '../assets/theou/feed.png'
import theouPost from '../assets/theou/post-detail.png'
import theouCreate from '../assets/theou/create-post.png'
import tnStorefront from '../assets/tn1983/storefront.png'
import tnDashboard from '../assets/tn1983/admin-dashboard.png'
import tnOrders from '../assets/tn1983/order-management.png'
import tnCustomers from '../assets/tn1983/customer-management.png'
import tnTracking from '../assets/tn1983/order-research.png'
import vanioakDashboard from '../assets/vanioak/dashboard.png'
import vanioakLogs from '../assets/vanioak/log-search.png'
import vanioakAlert from '../assets/vanioak/alert.png'

export const projects = [
  {
    id: 'theou',
    wide: true,
    thumbnail: theouFeed,
    icon: 'OU',
    name: 'TheOU',
    description: 'Anonymous campus platform, in development and testing.',
    technologies: ['React', 'TypeScript', 'Supabase', 'PostgreSQL'],
    metric: { value: '100 → 1', description: 'concurrent retries with one idempotency key create exactly one row' },
    live: { href: 'https://theou.tech', label: 'Visit website' },
    category: 'Personal project · Nov 2026–present',
    title: 'TheOU: Anonymous Campus Platform',
    tagline: 'A campus community platform gated by verified @ou.edu.vn email.',
    problem: 'Students need a dedicated place to share stories, ask questions, and discuss campus life without necessarily revealing their identity.',
    solution: 'I designed and built the frontend, database, authentication, and Edge Function APIs. Idempotency keys and PostgreSQL unique constraints prevent duplicate writes; triggers and atomic updates keep vote counts consistent under concurrent requests.',
    deliverables: [
      'React and TypeScript frontend, verified student-email registration, and session management',
      'Post, comment, and voting APIs with idempotency and database-level consistency',
      'Deployment on a custom domain and concurrency testing of retries and upvotes',
    ],
    stats: [
      { label: 'Retries to rows', value: '100 → 1' },
      { label: 'Concurrent upvotes', value: '200' },
      { label: 'Vote count drift', value: '0' },
    ],
    foundation: 'React • TypeScript • Supabase Auth • PostgreSQL • Edge Functions • Cloudflare',
    note: 'The idempotency test recorded one row from 100 retries. A separate k6 test recorded 200 vote rows from 200 concurrent upvotes with no count drift. Currently in development and testing. Independent project, not an official product of Ho Chi Minh City Open University.',
    links: [
      { href: 'https://theou.tech', label: 'Visit website', className: 'btn fill' },
      { href: 'https://github.com/NgnTienDat/TheOU', label: 'Source', className: 'btn line' },
    ],
    galleryLabel: 'TheOU screenshots',
    galleryHint: 'Development screenshots with test content.',
    slides: [
      { image: theouFeed, title: 'Campus feed', description: 'Topic filters, posts, and voting in the development environment.' },
      { image: theouPost, title: 'Post detail', description: 'Discussion, upvotes, and the Chủ bài label for the post author.' },
      { image: theouCreate, title: 'Create a post', description: 'Anonymous or nickname mode, image attachments, and campus topics.' },
    ],
  },
  {
    id: 'tn1983',
    wide: false,
    thumbnail: tnStorefront,
    icon: 'TN',
    name: 'TN1983',
    description: 'Production storefront and management tools for a family coffee roastery.',
    technologies: ['Spring Boot', 'React', 'PostgreSQL', 'Azure'],
    metric: { value: 'Live', description: 'centralized products, customers, and order status for a family business' },
    live: { href: 'https://www.trongnhamcoffee.me/', label: 'Live site' },
    category: 'Personal project · Sep 2026–present',
    title: 'TN1983: Coffee Roastery Management',
    tagline: 'From phone and Zalo orders to a centralized business workflow.',
    problem: 'A family coffee roastery received orders by phone, Zalo, and in person. Product, customer, and order information needed one place for tracking progress.',
    solution: 'I gathered the business requirements and built the database, REST APIs, storefront, and admin dashboard. Order states and history make progress explicit; JWT refresh-token rotation and reuse detection protect administrator sessions.',
    deliverables: [
      'Product, customer, and order management with status history and customer-facing order tracking',
      'Spring Security authentication, refresh-token rotation, and reuse detection, tested with JUnit 5 and Mockito',
      'GitHub Actions and Docker deployment to Azure VM, served through Nginx and Cloudflare',
    ],
    stats: [
      { label: 'In production', value: 'Live' },
      { label: 'Order tracking', value: 'Status flow' },
      { label: 'Automated deploys', value: 'CI/CD' },
    ],
    foundation: 'Java • Spring Boot • Spring Security • React • Next.js • PostgreSQL/Neon • Docker • Azure',
    note: 'Developed independently for a family business and still being improved. Screenshots use demo customer and order data.',
    links: [
      { href: 'https://www.trongnhamcoffee.me/', label: 'Live site', className: 'btn fill' },
      { href: 'https://github.com/NgnTienDat/tn1983-crm-system', label: 'Source', className: 'btn line' },
    ],
    galleryLabel: 'TN1983 screenshots',
    galleryHint: 'Storefront and admin screenshots. Customer and order data are demo data.',
    slides: [
      { image: tnStorefront, title: 'Storefront', description: 'The coffee roastery website and its product introduction.' },
      { image: tnDashboard, title: 'Admin dashboard', description: 'An overview of the order workflow and business reporting interface.' },
      { image: tnOrders, title: 'Order management', description: 'Order filters and processing statuses, shown with demo records.' },
      { image: tnCustomers, title: 'Customer management', description: 'Centralized customer information, shown with demo contact details.' },
      { image: tnTracking, title: 'Order tracking', description: 'Customer-facing order progress and status history, using a demo order.' },
    ],
  },
  {
    id: 'log-monitoring',
    wide: false,
    thumbnail: vanioakDashboard,
    icon: 'VO',
    name: 'VaniOAK',
    description: 'Dev/Test log monitoring and alerting, built as a mentored capstone.',
    technologies: ['Spring Boot', 'RabbitMQ', 'ClickHouse', 'Redis'],
    metric: { value: '~1k/s', description: 'accepted logs in a 5-minute k6 test; p95 end-to-end latency 1.891s' },
    live: null,
    category: 'Mentored capstone · Apr–Aug 2026',
    title: 'VaniOAK: Log Monitoring & Alerting',
    tagline: 'Centralized logs, live monitoring, and deduplicated Dev/Test alerts.',
    problem: 'Developers needed one place to search logs from multiple backend services, follow errors in real time, and receive alerts in a Dev/Test environment.',
    solution: 'I designed a Spring Boot modular monolith under mentor guidance. RabbitMQ buffers ingestion and separates processing responsibilities, ClickHouse stores logs for querying, and Redis deduplicates alerts before Telegram delivery.',
    deliverables: [
      'Asynchronous log ingestion and processing with RabbitMQ, ClickHouse, and PostgreSQL',
      'Real-time monitoring over SSE and Telegram alerts with Redis-based deduplication',
      'k6 load testing with downstream reconciliation; subsequent personal development of alert-rule CRUD and soft deletion',
    ],
    stats: [
      { label: 'Accepted logs/s', value: '999.67' },
      { label: 'p95 end-to-end', value: '1.891s' },
      { label: 'Reconciled after drain', value: '100%' },
    ],
    foundation: 'Java • Spring Boot • RabbitMQ • ClickHouse • PostgreSQL • Redis • SSE • Docker',
    note: 'Local k6 test: 20s warm-up and 300s measurement, with 100 INFO logs per request. All 320,000 accepted logs were reconciled after drain. Windows and Java 21; backend heap 512 MiB. Personal capstone during Viettel Digital Talent with mentor guidance, not an official Viettel product. Repository currently private.',
    links: [],
    galleryLabel: 'VaniOAK screenshots',
    galleryHint: 'Prototype screenshots with simulated logs and incidents.',
    slides: [
      { image: vanioakDashboard, title: 'Overview dashboard', description: 'Application health, log activity, and incident summaries using simulated data.' },
      { image: vanioakLogs, title: 'Log search', description: 'The log explorer and live-stream interface, shown with synthetic events.' },
      { image: vanioakAlert, title: 'Incident detail', description: 'Incident information and activity history in the interactive prototype.' },
    ],
  },
]
