// Single source of truth for every fact on the site.
// Everything here comes from the previous version of the portfolio — keep it verifiable.
// Edit this file, then run `node scripts/build.mjs`.

export const site = {
  url: 'https://divine-ajayi.vercel.app',
  name: 'Divine Ajayi',
  fullName: 'Ajayi Divine Iretomiwa',
  role: 'Mobile Engineer — Kotlin, Jetpack Compose, Flutter & Dart',
  title: 'Divine Ajayi — Mobile Engineer, Flutter & Dart',
  // Used for link previews (Open Graph / Twitter); the browser-tab title stays short.
  shareTitle: 'Divine Ajayi — Mobile Engineer, Kotlin, Jetpack Compose, Flutter & Dart',
  description:
    'Divine Ajayi is a Flutter and Dart mobile engineer who takes production apps from architecture to the App Store and Google Play — payments, real-time features, offline-ready data layers and release engineering.',
  location: 'Akure, Nigeria',
  timezone: 'Africa/Lagos',
  availability: 'Open to international roles',
  email: 'divineajayi179@gmail.com',
  phone: { display: '+234 701 768 8976', href: 'tel:+2347017688976' },
  resume: '/divine-ajayi-cv.pdf',
  links: [
    { label: 'LinkedIn', handle: 'ajayi-divine', href: 'https://linkedin.com/in/ajayi-divine' },
    { label: 'GitHub', handle: 'Justdivine7', href: 'https://github.com/Justdivine7' },
  ],
  // n = the highlighted figure (set in the tech display face), v = supporting text
  facts: [
    { k: 'Live apps', n: '4', v: 'on the App Store & Google Play' },
    { k: 'Installs', n: '10,000+', v: 'for Midddleman on Google Play' },
    { k: 'Based in', n: 'Akure', v: 'Nigeria · open to remote' },
  ],
};

const S = (dir, file, alt, caption) => ({ src: `assets/${dir}/${file}.webp`, alt, caption });

// ---------------------------------------------------------------------------
// Case-study projects (ordered as they appear in Selected Work)
// ---------------------------------------------------------------------------
export const projects = [
  {
    slug: 'midddleman',
    name: 'Midddleman',
    category: 'Fintech · Procurement · Marketplace',
    tagline: 'China sourcing for Nigerian importers.',
    summary:
      'A naira wallet, RMB payments to suppliers on Alipay and WeChat, a 1688 marketplace and procurement agents in China — in one app.',
    layout: 'posters',
    kind: 'poster',
    theme: { bg: '#0F2419', fg: '#EEF2E6', muted: '#A9B8A4', accent: '#B9E35C', panel: '#183527' },
    status: 'Live',
    statusNote: '10k+ installs on Google Play',
    role: 'Lead Mobile Developer',
    context: 'Midddleman Technologies · team-built product',
    timeline: 'Sep 2026 — Present',
    platforms: 'iOS & Android',
    links: [
      { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.app.midddleman' },
      { label: 'App Store', href: 'https://apps.apple.com/us/app/midddleman/id6744252874' },
    ],
    owned: [
      'Connectivity and offline layer for unreliable networks',
      'Session timeouts, iOS push and app-icon badging',
      'Release configuration for both stores',
    ],
    stack: ['Flutter', 'Dart', 'Offline handling', 'Session management', 'iOS push', 'Shorebird OTA'],
    overview: [
      'Paying a supplier in China, finding products and getting someone to source them usually means juggling several services. Midddleman puts the wallet, the currency purchase, the 1688 marketplace and the agent network in one app.',
    ],
    problem: 'It sits on top of people’s money and orders, so it has to be dependable.',
    team:
      'Midddleman is a team product. I lead mobile development of the customer and agent apps, set technical direction and work with QA to validate builds. What follows is the part I personally own.',
    challenges: [
      {
        title: 'Staying usable on unreliable networks',
        body: 'I built the connectivity and offline layer that keeps the app usable instead of failing on every dropped request.',
      },
      {
        title: 'Sessions and notifications',
        body: 'Session-timeout handling for a wallet app, plus iOS push notifications and app-icon badging so updates reach people outside the app.',
      },
      {
        title: 'Owning the release pipeline',
        body: 'Release configuration and the pipeline across App Store Connect, TestFlight, Play Console and Shorebird OTA patches.',
      },
    ],
    architecture: [
      { k: 'Client', v: 'Flutter & Dart, shipped to iOS and Android' },
      { k: 'Delivery', v: 'App Store Connect, TestFlight, Play Console, Shorebird OTA' },
    ],
    screens: [
      {
        title: 'Wallet & payments',
        items: [
          S('midddleman', '01-home-wallet', 'Midddleman home with wallet balance, Fund Wallet and Buy RMB', 'Wallet home'),
          S('midddleman', '02-buy-rmb', 'Buy RMB screen with today’s exchange rate and naira amount', 'Buy RMB'),
          S('midddleman', '05-activity-feed', 'Activity feed of RMB purchases, wallet funding and withdrawals with statuses', 'Activity'),
        ],
      },
      {
        title: 'Sourcing & agents',
        items: [
          S('midddleman', '03-1688-marketplace', 'Marketplace for browsing 1688 products in local currency', '1688 marketplace'),
          S('midddleman', '04-ai-assistant', 'Midddleman AI answering a shipping cost question', 'AI assistant'),
          S('midddleman', '06-hire-agents', 'Procurement orders list with agent quotes', 'Hire agents'),
        ],
      },
    ],
    outcome: ['Live on both stores, with 10,000+ installs on Google Play.'],
  },

  {
    slug: 'midddleman-agent',
    name: 'Midddleman Agent',
    category: 'Procurement · Business operations',
    tagline: 'The other side of the marketplace.',
    summary:
      'Where procurement agents in China run their side of Midddleman: accept orders, move them from quote to sourcing, and withdraw earnings.',
    layout: 'companion',
    kind: 'poster',
    theme: { bg: '#E4EBD2', fg: '#13241A', muted: '#4D5E4F', accent: '#2F6B3E', panel: '#D5E1BC' },
    status: 'Live',
    statusNote: 'On the App Store and Google Play',
    role: 'Lead Mobile Developer',
    context: 'Midddleman Technologies · team-built product',
    timeline: 'Sep 2026 — Present',
    platforms: 'iOS & Android',
    links: [
      { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.midddleman.procurement' },
      { label: 'App Store', href: 'https://apps.apple.com/us/app/midddleman-agent/id6756414848' },
    ],
    owned: [
      'Procurement chat',
      'Survey system',
      'Offline, caching and session-security layers',
    ],
    stack: ['Flutter', 'Dart', 'Chat', 'Offline-first', 'Caching', 'Session security'],
    overview: [
      'Every Midddleman order is fulfilled by an agent in China. In this app they accept or decline requests, move each order through quoting, awaiting payment and sourcing, and withdraw earnings to a bank account or Alipay.',
    ],
    problem: 'Agents run a business from their phone, whatever the connection.',
    team:
      'A team product. I set mobile direction for both Midddleman apps; below is what I own in this one.',
    challenges: [
      {
        title: 'Conversations around every order',
        body: 'I built the procurement chat, so the conversation about an order lives alongside the order. I also built the in-app survey system.',
      },
      {
        title: 'Offline, caching and session security',
        body: 'The layers that decide what the app does when the network drops, what it remembers, and how long a signed-in session is trusted.',
      },
      {
        title: 'Release engineering',
        body: 'I ship it to both stores through App Store Connect, TestFlight, Play Console and Shorebird OTA patches.',
      },
    ],
    architecture: [
      { k: 'Client', v: 'Flutter & Dart, shipped to iOS and Android' },
      { k: 'Delivery', v: 'App Store Connect, TestFlight, Play Console, Shorebird OTA' },
    ],
    screens: [
      {
        title: 'Orders',
        items: [
          S('midddleman-agent', '01-earnings-dashboard', 'Agent home with total procurement value and order shortcuts', 'Agent home'),
          S('midddleman-agent', '02-accept-or-decline-order', 'Confirm procurement screen with Accept order and Decline order buttons', 'Accept or decline'),
          S('midddleman-agent', '03-order-tracking', 'Procurement orders filtered by stage: Pending, Quoting, Awaiting Payment', 'Order stages'),
        ],
      },
      {
        title: 'Earnings',
        items: [
          S('midddleman-agent', '04-earnings-and-kyc', 'Settings with total earnings, withdraw funds and KYC', 'Earnings & KYC'),
          S('midddleman-agent', '05-withdrawal-accounts', 'Withdrawal accounts for bank and Alipay', 'Withdrawal accounts'),
        ],
      },
    ],
    outcome: ['Live on both stores.'],
  },

  {
    slug: 'pawshauz',
    name: 'Pawshauz',
    category: 'Pet services marketplace',
    tagline: 'Two apps, one pet-care marketplace.',
    summary:
      'A customer app for pet owners and a merchant app that vets use too. I built both from scratch as the sole mobile engineer.',
    layout: 'triptych',
    kind: 'device',
    theme: { bg: '#F2E6D6', fg: '#1E1712', muted: '#6C5D50', accent: '#D9581E', panel: '#E8D7C2' },
    status: 'Live',
    statusNote: 'About 1,000 users on both stores',
    role: 'Flutter Mobile Engineer — sole mobile engineer',
    context: 'Jamforte Technologies · Abuja, Nigeria',
    timeline: 'Jul 2025 — Jul 2026',
    platforms: 'iOS & Android',
    links: [
      { label: 'Google Play · Customer', href: 'https://play.google.com/store/apps/details?id=com.pawshauz.app' },
      { label: 'App Store · Customer', href: 'https://apps.apple.com/ng/app/pawshauz/id6768559120' },
      { label: 'Google Play · Merchant', href: 'https://play.google.com/store/apps/details?id=com.pawshauz.business' },
      { label: 'App Store · Merchant', href: 'https://apps.apple.com/ng/app/pawshauz-business/id6768560243' },
    ],
    owned: [
      'PawsAI, a streaming pet-care assistant',
      'Merchant dashboard, inventory and orders',
      'Vet consultations across multiple clinics',
      'Chat with optimistic UI',
      'Releases to both stores',
    ],
    stack: ['Flutter', 'BLoC', 'Flutterwave', 'Google Places SDK', 'OneSignal', 'Shorebird', 'App Store Connect', 'Play Console'],
    overview: [
      'Pawshauz connects pet owners with the businesses and vets that look after their pets. The customer app is for shopping, finding vets and asking PawsAI; the merchant app runs a pet business, and vets use it for consultations.',
    ],
    problem: 'Customers, merchants and vets all need it to work at once.',
    team:
      'I was the sole mobile engineer at Jamforte Technologies. Architecture, features and releases for both apps were mine, built against the company’s backend.',
    challenges: [
      {
        title: 'An AI assistant that behaves like a product feature',
        body: 'PawsAI streams responses letter by letter, persists the session so conversations survive, and exits cleanly when a user leaves mid-response.',
      },
      {
        title: 'Inventory that stays fresh without hammering the API',
        body: 'The merchant dashboard pairs an earnings chart and the order pipeline with inventory backed by TTL caching.',
      },
      {
        title: 'Vets who work across clinics',
        body: 'Consultation requests and emergency alerts inside the merchant app, with switching between clinics.',
      },
      {
        title: 'Chat that feels instant',
        body: 'Optimistic UI so messages appear immediately, with multi-image bubbles.',
      },
      {
        title: 'Payments and releases',
        body: 'Flutterwave subscriptions, wallet top-up and withdrawal, and the release pipeline from code signing to TestFlight and the Play Store.',
      },
    ],
    architecture: [
      { k: 'Structure', v: 'Clean Architecture — BLoC, repository pattern over Dio, GetIt injection' },
      { k: 'Services', v: 'Flutterwave, Google Places SDK, OneSignal' },
      { k: 'Delivery', v: 'Shorebird, App Store Connect, Google Play Console' },
    ],
    screens: [
      {
        title: 'Customer app',
        items: [
          S('pawshauz', 'customer-01-home', 'Pawshauz customer home', 'Home'),
          S('pawshauz', 'customer-02-shop', 'Pawshauz shop', 'Shop'),
          S('pawshauz', 'customer-03-vets', 'Pawshauz vets near you', 'Vets'),
          S('pawshauz', 'customer-04-pawsai', 'PawsAI chat answering a pet-care question', 'PawsAI'),
        ],
      },
      {
        title: 'Merchant app',
        items: [
          S('pawshauz', 'merchant-01-home', 'Merchant dashboard with products, orders and earnings chart', 'Dashboard'),
          S('pawshauz', 'merchant-02-inventory', 'Merchant inventory', 'Inventory'),
          S('pawshauz', 'merchant-03-orders', 'Merchant orders', 'Orders'),
        ],
      },
      {
        title: 'Merchant app · Vets',
        items: [
          S('pawshauz', 'vet-01-dashboard', 'Vet dashboard', 'Dashboard'),
          S('pawshauz', 'vet-02-clinics', 'Vet clinic switching', 'Clinics'),
        ],
      },
    ],
    outcome: [
      'Both apps live on both stores, with about 1,000 users.',
    ],
  },

  {
    slug: 'shmood',
    name: 'Shmood',
    category: 'AI · Music discovery',
    tagline: 'Describe your mood. Get a queue built for it.',
    summary:
      'Say how you feel, by text or voice, and get a queue that fits the feeling rather than a genre.',
    layout: 'spotlight',
    kind: 'device',
    theme: { bg: '#0A0E18', fg: '#E8EAF2', muted: '#9298AE', accent: '#9DB0FF', panel: '#131A2B' },
    status: 'In development',
    statusNote: 'Android APK available',
    role: 'Sole engineer',
    context: 'Personal project, built alongside full-time work',
    timeline: 'Ongoing',
    platforms: 'iOS & Android',
    links: [{ label: 'Download APK', href: 'https://drive.google.com/file/d/1fVji1VodpwjVkbkJnxmXP4C5mXJMI1pf/view?usp=drive_link' }],
    owned: [
      'Live voice input over WebRTC',
      'A resolver that blocks hallucinated songs',
      'Moments: replay past check-ins',
    ],
    stack: ['Flutter', 'BLoC', 'Clean Architecture', 'OpenAI Realtime API', 'WebRTC', 'iTunes Search API'],
    overview: [
      'Most music apps make you translate a feeling into a genre, artist or playlist. Shmood takes the feeling directly: tap a chip, type a sentence or just talk, and it builds a queue around it.',
    ],
    problem: 'Language models confidently recommend songs that don’t exist, so every suggestion has to be checked before it plays.',
    team: 'A personal project I build on my own, alongside full-time work. It’s where I push on AI-native interaction.',
    challenges: [
      {
        title: 'Talking to the app, live',
        body: 'Quick-select chips, free text, or live voice streamed over WebRTC through OpenAI’s Realtime API.',
      },
      {
        title: 'Never queue a song that doesn’t exist',
        body: 'Normalized containment matching with edit-distance-1 tolerance, gated by an iTunes Search check, catches hallucinated recommendations before they reach the queue.',
      },
      {
        title: 'Architecture that paid for itself',
        body: 'Swapping the audio layer surfaced an AVAudioSession / ReplayKit conflict. The Clean Architecture boundaries kept the problem, and the fix, inside one layer.',
      },
    ],
    architecture: [
      { k: 'Structure', v: 'Clean Architecture with BLoC' },
      { k: 'Voice', v: 'OpenAI Realtime API over WebRTC' },
      { k: 'Verification', v: 'iTunes Search API' },
      { k: 'Playback', v: 'Synced lyrics with offset control' },
    ],
    screens: [
      {
        title: 'Mood input',
        items: [
          S('shmood', '01-tap-in', 'Shmood prompt to tap in and describe your mood', 'Tap in'),
          S('shmood', '02-mood-input', 'Shmood mood chips and free text input', 'Chips & text'),
          S('shmood', '03-voice', 'Shmood voice listening state', 'Voice'),
        ],
      },
      {
        title: 'Discovery',
        items: [
          S('shmood', '04-for-you', 'Shmood For You mood-based mix', 'For You'),
          S('shmood', '05-for-you-more', 'Shmood For You, second row of mixes', 'More mixes'),
          S('shmood', '06-moments', 'Shmood Moments — past mood check-ins', 'Moments'),
        ],
      },
      {
        title: 'Now playing',
        items: [
          S('shmood', '07-now-playing', 'Shmood now playing screen', 'Now playing'),
          S('shmood', '08-lyrics', 'Shmood synced lyrics with offset control', 'Synced lyrics'),
        ],
      },
    ],
    outcome: ['In development. The Android build is available to download.'],
  },

  {
    slug: 'sanah',
    name: 'Sanah',
    category: 'AI · Nutrition',
    tagline: 'Snap a plate. Understand it.',
    summary:
      'Snap a plate, confirm what the AI saw, and get a health score with the reasons behind it, not just a calorie count.',
    layout: 'pipeline',
    kind: 'device',
    theme: { bg: '#EDE0CF', fg: '#23170F', muted: '#6E5A49', accent: '#C2501F', panel: '#E2D0BA' },
    status: 'In development',
    statusNote: 'Android APK available',
    role: 'Sole engineer',
    context: 'Personal project',
    timeline: 'Ongoing',
    platforms: 'iOS & Android',
    links: [{ label: 'Download APK', href: 'https://drive.google.com/file/d/1p7HHtEEyHIUmA6oTO6kjm90uzz_F2qFX/view?usp=drive_link' }],
    pipeline: [
      { k: 'See', v: 'Vision reads the plate.' },
      { k: 'Resolve', v: 'Nigerian dish library, then USDA, then AI estimate.' },
      { k: 'Score', v: 'Deterministic, so the same meal scores the same.' },
      { k: 'Explain', v: 'The model explains the score; it doesn’t invent it.' },
    ],
    owned: [
      'A four-stage AI pipeline',
      'Nigerian-first nutrition data',
      'Personal calorie and macro targets',
    ],
    stack: ['Flutter', 'BLoC', 'Clean Architecture', 'Firebase Cloud Functions', 'Firestore', 'Anthropic API'],
    overview: [
      'Nutrition data is usually built around Western foods, which leaves Nigerian dishes poorly covered. Sanah resolves meals against a Nigerian dish library first, with USDA’s global database underneath.',
    ],
    problem: 'A calorie number alone doesn’t tell you whether a meal was good for you, or what to change.',
    team: 'A personal project I build on my own.',
    challenges: [
      {
        title: 'Data that works beyond one region',
        body: 'The West African Food Composition Table covers Nigerian dishes, with USDA underneath for everything else, so it’s accurate for Nigerian meals without being locked to them.',
      },
      {
        title: 'Personal targets, live',
        body: 'Onboarding computes calorie and macro targets with Mifflin-St Jeor BMR/TDEE for the user’s goal. Firestore listeners keep the calorie ring and recent meals in sync.',
      },
    ],
    architecture: [
      { k: 'Structure', v: 'Clean Architecture with BLoC' },
      { k: 'Backend', v: 'Firebase Cloud Functions, Firestore' },
      { k: 'AI', v: 'Anthropic API' },
      { k: 'Nutrition data', v: 'West African Food Composition Table → USDA → AI estimate' },
    ],
    screens: [
      {
        title: 'Nutrition score',
        items: [
          S('sanah', '01-health-score', 'Sanah AI health score and personalized explanation', 'Health score'),
          S('sanah', '02-meal-breakdown', 'Sanah meal breakdown with verified nutrition badge', 'Meal breakdown'),
        ],
      },
      {
        title: 'Scan & confirm',
        items: [
          S('sanah', '03-launch', 'Sanah launch screen', 'Launch'),
          S('sanah', '04-detected-meal', 'Sanah AI-detected meal from photo', 'Detected meal'),
          S('sanah', '05-confirm', 'Sanah editable ingredient confirmation screen', 'Confirm ingredients'),
        ],
      },
      {
        title: 'Home & profile',
        items: [
          S('sanah', '06-home', 'Sanah home dashboard with daily calorie ring', 'Home'),
          S('sanah', '07-profile', 'Sanah profile with daily macro plan', 'Profile'),
        ],
      },
    ],
    outcome: ['In development. The Android build is available to download.'],
  },

  {
    slug: 'ofxpress',
    name: 'Ofast / Ofxpress',
    shortName: 'Ofxpress',
    category: 'Food · Logistics',
    tagline: 'One basket, many restaurants.',
    summary:
      'Food, groceries, pharmacy and logistics in one delivery platform. I built the customer app from scratch and rebuilt the rider app.',
    layout: 'strip',
    kind: 'device',
    theme: { bg: '#ECE6F2', fg: '#1C1524', muted: '#62566F', accent: '#6D3FB0', panel: '#E0D7EA' },
    status: 'In internal testing',
    statusNote: 'Customer and rider apps, ahead of launch',
    role: 'Contract Flutter Mobile Engineer',
    context: 'Ofast · Remote contract',
    timeline: 'Sep 2025 — Present',
    platforms: 'iOS & Android',
    links: [],
    owned: [
      'Multi-vendor cart, one checkout',
      'Live rider orders over WebSockets',
      'Paystack with every outcome handled',
    ],
    stack: ['Flutter', 'BLoC', 'Paystack', 'WebSockets', 'Dio'],
    overview: [
      'Customers browse every category from one home screen and can order from several restaurants in one basket; riders receive orders in real time.',
    ],
    problem: 'A lot on one screen, a lot in one checkout, and riders who need to know the moment an order lands.',
    team:
      'On contract with Ofast, I built the customer app from scratch and took over the existing rider app, overhauling its architecture, state management and UI.',
    challenges: [
      {
        title: 'A home screen that loads in pieces',
        body: 'Every section resolves from a single endpoint, and each vendor section loads independently and lazily.',
      },
      {
        title: 'Multiple restaurants, one checkout',
        body: 'The multi-vendor cart takes orders from several restaurants in a single checkout, paid through Paystack with success, failure and cancellation handled.',
      },
      {
        title: 'Riders in real time',
        body: 'Order notifications arrive over WebSockets, so riders see new orders and delivery updates as they happen.',
      },
    ],
    architecture: [
      { k: 'State', v: 'BLoC' },
      { k: 'Networking', v: 'Dio, single-endpoint lazy section loading' },
      { k: 'Real-time', v: 'WebSockets for rider notifications' },
      { k: 'Payments', v: 'Paystack' },
    ],
    screens: [
      {
        title: 'Customer app',
        items: [
          S('ofxpress', 'customer-01-home', 'Ofxpress multi-category home', 'Multi-category home'),
          S('ofxpress', 'customer-02-restaurant', 'Ofxpress restaurant page', 'Restaurant'),
          S('ofxpress', 'customer-03-basket', 'Ofxpress multi-vendor basket', 'Multi-vendor basket'),
          S('ofxpress', 'customer-04-profile', 'Ofxpress profile', 'Profile'),
        ],
      },
      {
        title: 'Rider app',
        items: [S('ofxpress', 'rider-01-orders', 'Ofxpress rider orders', 'Live orders')],
      },
    ],
    outcome: ['Both apps are in internal testing ahead of launch.'],
  },
];

// Smaller, shipped projects without full case studies
export const moreWork = [
  {
    slug: 'difamer',
    name: 'Difamer',
    category: 'Agri-tech marketplace',
    where: 'Jamforte Technologies',
    status: 'In internal testing',
    summary:
      'The farmer-facing app of an agri-marketplace: list produce, manage stock, track orders and get paid.',
    points: [
      'Flutterwave wallet with top-up and withdrawal',
      'Several businesses from one account',
      'Video onboarding for first-time farmers',
    ],
    stack: ['Flutter', 'BLoC', 'Flutterwave', 'Clean Architecture', 'GetIt'],
    screens: [
      S('difamer', '01-home', 'Difamer home with earnings and business switcher', 'Home'),
      S('difamer', '02-produce', 'Difamer produce listings', 'Produce'),
      S('difamer', '03-orders', 'Difamer orders', 'Orders'),
      S('difamer', '04-product', 'Difamer product detail', 'Product'),
    ],
  },
  {
    slug: 'nextkick',
    name: 'NextKick',
    category: 'Sports technology',
    where: 'Freelance',
    status: 'In internal testing',
    summary:
      'An amateur football platform: a player app and an admin app, built from scratch for a private client.',
    points: [
      'Drill uploads with admin review',
      'Tournament registration with Monnify payments',
      'Live match updates over WebSockets',
    ],
    stack: ['Flutter', 'BLoC', 'Monnify', 'WebSockets'],
    screens: [S('nextkick', '01-signup', 'NextKick sign-up choosing Player or Team', 'Sign-up')],
  },
];

// ---------------------------------------------------------------------------
export const experience = [
  {
    role: 'Lead Mobile Developer',
    company: 'Midddleman Technologies',
    meta: 'Full-time',
    scope: 'Lead',
    start: '2026-09',
    end: null,
    dates: 'Sep 2026 — Present',
    projects: ['midddleman', 'midddleman-agent'],
    points: [
      'Lead mobile for the Midddleman customer and agent apps (10,000+ installs on Google Play): technical direction, delivery and the release pipeline',
    ],
  },
  {
    role: 'Flutter Mobile Engineer',
    company: 'Jamforte Technologies',
    meta: 'Abuja, Nigeria · Full-time',
    scope: 'Full-time',
    start: '2025-07',
    end: '2026-07',
    dates: 'Jul 2025 — Jul 2026',
    projects: ['pawshauz'],
    points: [
      'Sole mobile engineer: shipped both Pawshauz apps to both stores (about 1,000 users) and built Difamer Business',
      'Set up Clean Architecture across every codebase (BLoC, repositories over Dio, GetIt)',
    ],
  },
  {
    role: 'Contract Flutter Mobile Engineer',
    company: 'Ofast',
    meta: 'Remote · Contract',
    scope: 'Contract',
    start: '2025-09',
    end: null,
    dates: 'Sep 2025 — Present',
    projects: ['ofxpress'],
    points: [
      'Built the Ofxpress customer app from scratch and overhauled the rider app; both in internal testing',
    ],
  },
  {
    role: 'Flutter Engineering Mentor',
    company: 'HNG Internship',
    meta: 'Remote · Volunteer',
    scope: 'Mentor',
    start: '2026-04',
    end: '2026-06',
    dates: 'Apr — Jun 2026',
    projects: [],
    points: [
      'Mentored interns building the Telex desktop app, 10 at the start and 4 by the final stage, through 1:1 guidance and code reviews',
    ],
  },
  {
    role: 'Flutter Mobile Engineer',
    company: 'NextKick',
    meta: 'Remote · Freelance',
    scope: 'Freelance',
    start: '2025-08',
    end: '2025-11',
    dates: 'Aug — Nov 2025',
    projects: [],
    points: [
      'Built the NextKick player and admin apps from scratch for an amateur football platform (in internal testing)',
    ],
  },
  {
    role: 'Flutter Engineer',
    company: 'HNG Internship',
    meta: 'Remote · Internship',
    scope: 'Internship',
    start: '2025-02',
    end: '2025-04',
    dates: 'Feb — Apr 2025',
    projects: [],
    points: [
      'Built desktop UI for Telex in a 35-engineer team and finished as one of 19 finalists',
    ],
  },
];

export const education = [
  { what: 'BSc, Plant Science and Biotechnology', where: 'Adekunle Ajasin University, Ondo, Nigeria', when: '2019 — 2023' },
  { what: 'Mobile App Development', where: 'Complete Computer Institute, Akure, Nigeria', when: 'Aug — Dec 2024' },
];

export const principles = [
  {
    title: 'Boundaries before features',
    body: 'Clean layers aren’t ceremony. They keep a fix inside the layer that broke.',
  },
  {
    title: 'Real networks are the main path',
    body: 'Offline handling and caching are core features for people on unreliable connections.',
  },
  {
    title: 'Every state gets designed',
    body: 'Payments fail and streams get interrupted. I build for every outcome, not just the happy path.',
  },
  {
    title: 'Shipping is part of the job',
    body: 'An app isn’t finished until it’s in people’s hands, and can be patched fast once it is.',
  },
];

export const expertise = [
  { group: 'Mobile', items: ['Flutter', 'Dart', 'Kotlin', 'Native Android', 'Flutter desktop'] },
  { group: 'Architecture', items: ['Clean Architecture', 'Repository pattern', 'BLoC', 'Riverpod', 'GetIt'] },
  { group: 'Testing', items: ['Unit tests', 'Widget tests', 'QA handoff'] },
  { group: 'Networking & data', items: ['Dio', 'REST APIs', 'WebSockets', 'Firebase', 'Hive', 'GetStorage'] },
  { group: 'Payments & services', items: ['Paystack', 'Flutterwave', 'Monnify', 'Apple IAP', 'OneSignal', 'Google Places SDK'] },
  { group: 'AI & real-time', items: ['OpenAI APIs', 'OpenAI Realtime', 'Anthropic API', 'WebRTC'] },
  { group: 'Delivery', items: ['App Store Connect', 'TestFlight', 'Xcode signing', 'Google Play Console', 'Gradle', 'Shorebird OTA'] },
];
